import {
  Vault,
  type DispatchOptions,
  type HistoryResult,
  type HistoryState,
  type VaultAction,
  type VaultOptions,
  type VaultInteraction,
} from "@iiif/helpers/vault";
import { parseVaultMessage, stringifyVaultMessage } from "./wire";

const emptyHistory: HistoryState = Object.freeze({ undo: [], redo: [], canUndo: false, canRedo: false });

/** All mutable connection state is shared by helpers' Object.create() interaction scopes. */
export abstract class RemoteClientVault extends Vault {
  private transport = {
    lastActionId: "@genesis",
    sequence: 0,
    initialized: false,
    closed: false,
    ready: false,
    resetting: true,
    empty: false,
    pending: new Map<string, VaultAction>(),
    order: [] as string[],
    queued: [] as Array<() => void>,
    incoming: new WeakSet<object>(),
    protocol: 1,
    readOnly: false,
    epoch: "",
    revision: 0,
    serverHistory: emptyHistory,
    history: emptyHistory,
    error: undefined as string | undefined,
    listeners: new Set<() => void>(),
    groups: new Map<string, number>(),
    historyRequests: new Map<string, (result: HistoryResult) => void>(),
  };
  private stopCommits: () => void;
  private stopPreparation: () => void;

  constructor(options?: Partial<VaultOptions>) {
    // A remote client must never use a local history controller to reverse shared state.
    super({ ...options, history: false });
    this.stopPreparation = this.getStore().prepareCommit((commit) => {
      if (!this.transport.incoming.has(commit.action)) {
        if (this.transport.readOnly) throw new Error("Read-only Vault");
        if (!this.transport.ready) throw new Error("Vault not yet ready");
        if (commit.actions.some((action) => action.type === "@iiif/APPLY_HISTORY"))
          throw new Error("Remote history requires authority confirmation");
        // Validate transportability before the optimistic document is published.
        stringifyVaultMessage({
          actions: commit.actions.map(({ type, payload }) => ({ type, payload })),
          options: commit.options,
        });
      }
      return () => {};
    });
    this.stopCommits = this.subscribeCommits((commit) => {
      if (this.transport.incoming.delete(commit.action)) return;
      if (!this.transport.ready || this.transport.readOnly) return;
      const id = crypto.randomUUID();
      const action = {
        type: "@iiif/BATCH" as const,
        payload: { actions: commit.actions.map(({ type, payload }) => ({ type, payload }) as VaultAction) },
      };
      this.transport.pending.set(id, action);
      this.transport.order.push(id);
      this.sendMessage(
        stringifyVaultMessage({
          _type: "vault-action",
          _id: id,
          sequence: ++this.transport.sequence,
          _lastActionId: this.transport.lastActionId,
          action,
          options: commit.options,
          epoch: this.transport.epoch,
          revision: this.transport.revision + this.transport.pending.size - 1,
        })
      );
      this.notifyTransport();
    });
  }

  protected abstract sendMessage(message: string): void;
  get lastRejection() {
    return this.transport.error;
  }
  get historyEnabled() {
    return this.transport.protocol === 2 && !this.transport.readOnly;
  }
  get isReady() {
    return this.transport.ready;
  }
  get isResetting() {
    return this.transport.resetting;
  }
  get isEmpty() {
    return this.transport.empty;
  }
  get lastActionId() {
    return this.transport.lastActionId;
  }
  get pendingActions() {
    return this.transport.pending;
  }
  get pendingActionOrder() {
    return this.transport.order;
  }

  override beginInteraction(options: Pick<DispatchOptions, "label" | "history"> = {}): VaultInteraction<this> {
    const context = super.beginInteraction(options);
    this.transport.groups.set(context.id, (this.transport.groups.get(context.id) || 0) + 1);
    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      context.finish();
      const count = (this.transport.groups.get(context.id) || 1) - 1;
      if (count) this.transport.groups.set(context.id, count);
      else {
        this.transport.groups.delete(context.id);
        if (this.transport.ready && this.transport.protocol === 2)
          this.sendMessage(
            stringifyVaultMessage({
              _type: "group-finish",
              _id: crypto.randomUUID(),
              sequence: ++this.transport.sequence,
              groupId: context.id,
              epoch: this.transport.epoch,
            })
          );
      }
    };
    return { ...context, finish, cancel: finish };
  }

  override undo(): HistoryResult {
    return { ok: false, reason: "disabled" };
  }
  override redo(): HistoryResult {
    return { ok: false, reason: "disabled" };
  }

  getRemoteHistoryState = (): HistoryState => this.transport.history;
  subscribeRemoteHistory = (listener: () => void) => {
    this.transport.listeners.add(listener);
    return () => {
      this.transport.listeners.delete(listener);
    };
  };

  async requestHistory(direction: "undo" | "redo"): Promise<HistoryResult> {
    if (!this.transport.ready || this.transport.protocol !== 2 || this.transport.readOnly)
      return { ok: false, reason: "disabled" };
    if (this.transport.pending.size || this.transport.historyRequests.size) return { ok: false, reason: "busy" };
    const state = this.transport.history;
    const group = direction === "undo" ? state.undo.at(-1) : state.redo.at(-1);
    if (!group) return { ok: false, reason: "empty" };
    const id = crypto.randomUUID();
    return new Promise((resolve) => {
      this.transport.historyRequests.set(id, resolve);
      this.notifyTransport();
      this.sendMessage(
        stringifyVaultMessage({
          _type: "history-request",
          _id: id,
          sequence: ++this.transport.sequence,
          direction,
          groupId: group.id,
          epoch: this.transport.epoch,
        })
      );
    });
  }

  private notifyTransport() {
    const busy = !this.transport.ready || this.transport.pending.size > 0 || this.transport.historyRequests.size > 0;
    this.transport.history = {
      ...this.transport.serverHistory,
      canUndo: !busy && this.transport.serverHistory.canUndo,
      canRedo: !busy && this.transport.serverHistory.canRedo,
    };
    for (const listener of this.transport.listeners) listener();
  }

  waitUntilReady = async () => {
    if (this.isReady) return;
    if (this.transport.closed) throw new Error("Vault connection closed");
    await new Promise<void>((resolve, reject) => {
      const stop = this.subscribeRemoteHistory(() => {
        if (this.transport.closed) {
          stop();
          reject(new Error("Vault connection closed"));
        } else if (this.isReady) {
          stop();
          resolve();
        }
      });
    });
  };

  protected requestInitialState() {
    this.sendMessage(stringifyVaultMessage({ _type: "init-request", protocol: 2 }));
  }

  protected handleTransportClose = () => {
    this.transport.closed = true;
    this.transport.ready = false;
    this.transport.serverHistory = emptyHistory;
    for (const resolve of this.transport.historyRequests.values()) resolve({ ok: false, reason: "disabled" });
    this.transport.historyRequests.clear();
    this.notifyTransport();
  };

  protected handleTransportMessage = async (data: Blob | string | unknown) => {
    let parsed: any;
    try {
      parsed = parseVaultMessage(typeof Blob !== "undefined" && data instanceof Blob ? await data.text() : data);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object") return;
    if (parsed._type === "init-response") {
      for (const resolve of this.transport.historyRequests.values()) resolve({ ok: false, reason: "disabled" });
      this.transport.historyRequests.clear();
      this.transport.groups.clear();
      this.transport.readOnly = !!parsed.readOnly;
      this.getStore().setState(parsed.data);
      this.transport.lastActionId = parsed._lastActionId || "@genesis";
      this.transport.epoch = parsed.epoch || "";
      this.transport.revision = parsed.revision || 0;
      this.transport.protocol = parsed.protocol || 1;
      this.transport.readOnly = !!parsed.readOnly;
      this.transport.resetting = false;
      this.transport.ready = true;
      this.transport.initialized = true;
      this.transport.pending.clear();
      this.transport.order = [];
      this.transport.serverHistory = parsed.history || emptyHistory;
      this.notifyTransport();
      const queued = this.transport.queued.splice(0);
      if (!this.transport.readOnly)
        for (const dispatch of queued) {
          try {
            dispatch();
          } catch (error) {
            this.transport.error = error instanceof Error ? error.message : "stale-scope";
          }
        }
      this.notifyTransport();
      return;
    }
    if (parsed._type === "vault-action") {
      if (!parsed.action || typeof parsed.action !== "object") return;
      if (
        this.transport.protocol === 2 &&
        (parsed.epoch !== this.transport.epoch || parsed.revision !== this.transport.revision + 1)
      ) {
        this.requestInitialState();
        return;
      }
      // Accepted ordinary edits already exist in the author's optimistic view.
      // Stale ordering is rejected and resynchronized, never silently rebased.
      const pending = parsed.requestId && this.transport.pending.has(parsed.requestId);
      if (!pending) {
        this.transport.incoming.add(parsed.action);
        try {
          super.dispatch(parsed.action, { ...parsed.options, history: "ignore" });
        } catch {
          this.transport.incoming.delete(parsed.action);
          this.transport.error = "canonical-conflict";
          this.transport.resetting = true;
          this.transport.ready = false;
          this.notifyTransport();
          this.requestInitialState();
          return;
        }
      }
      if (pending) this.transport.error = undefined;
      if (parsed.requestId) {
        this.transport.pending.delete(parsed.requestId);
        this.transport.order = this.transport.order.filter((id) => id !== parsed.requestId);
      }
      this.transport.lastActionId = parsed._id;
      this.transport.revision = parsed.revision ?? this.transport.revision;
      if (parsed.history) this.transport.serverHistory = parsed.history;
      this.notifyTransport();
      return;
    }
    if (parsed._type === "empty-vault-response") this.transport.empty = true;
    if (parsed._type === "history-state") {
      this.transport.serverHistory = parsed.history;
      this.notifyTransport();
    }
    if (parsed._type === "history-result") {
      const resolve = this.transport.historyRequests.get(parsed._id);
      this.transport.historyRequests.delete(parsed._id);
      if (parsed.history) this.transport.serverHistory = parsed.history;
      this.notifyTransport();
      resolve?.(parsed.result);
    }
    if (parsed._type === "vault-action-confirmation") {
      const id = parsed.action || parsed._id;
      this.transport.pending.delete(id);
      this.transport.order = this.transport.order.filter((item) => item !== id);
      if (parsed.history) this.transport.serverHistory = parsed.history;
      this.notifyTransport();
    }
    if (parsed._type === "vault-action-rejection") {
      // Rejected positional/destructive edits must not be blindly replayed against a new snapshot.
      this.transport.error = parsed.reason || "rejected";
      this.transport.pending.clear();
      this.transport.order = [];
      this.transport.resetting = true;
      this.transport.ready = false;
      this.notifyTransport();
      this.requestInitialState();
    }
  };

  override dispatch(action: VaultAction, options?: DispatchOptions) {
    if (this.transport.readOnly) throw new Error("Read-only Vault");
    if (this.transport.resetting) {
      if (this.transport.initialized) {
        this.transport.error = "synchronizing";
        this.notifyTransport();
        return;
      }
      this.transport.queued.push(() => super.dispatch(action, options));
      return;
    }
    if (!this.transport.ready) throw new Error("Vault not yet ready");
    super.dispatch(action, options);
  }

  protected disposeTransport() {
    this.stopCommits();
    this.stopPreparation();
    this.handleTransportClose();
  }
}
