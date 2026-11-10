import { Vault, VaultHistory, type HistoryState, type VaultAction, type VaultCommit } from "@iiif/helpers/vault";
import * as actions from "@iiif/helpers/vault/actions";
import { EDITOR_HISTORY_METADATA, parseVaultMessage, stringifyVaultMessage } from "@manifest-editor/client-vault";

/** Supplied by the host after authentication, never read from a client message. */
export type VaultIdentity = { actorId: string; sessionId: string };
type Connection = {
  identity: VaultIdentity;
  history: VaultHistory;
  send(message: string): void;
  groups: Map<string, string | null>;
  seen: Set<string>;
  replies: Map<string, object>;
  sequence: number;
};
const allowed = new Set(
  Object.values(actions).filter((value) => typeof value === "string" && value !== actions.APPLY_HISTORY)
);
function validateAction(action: any, depth = 0): asserts action is VaultAction {
  if (!action || typeof action !== "object" || !allowed.has(action.type) || depth > 100)
    throw new Error("Invalid action");
  if (action.type === actions.BATCH_ACTIONS) {
    if (!Array.isArray(action.payload?.actions)) throw new Error("Invalid batch");
    for (const item of action.payload.actions) validateAction(item, depth + 1);
  }
}
function summary(history: VaultHistory): HistoryState {
  const state = history.getState();
  const group = (item: HistoryState["undo"][number]) => ({ ...item, commits: [] });
  return { ...state, undo: state.undo.map(group), redo: state.redo.map(group) };
}

/** One document authority, shared by WebSocket and MessagePort transports. */
export class VaultAuthority {
  readonly vault: Vault;
  private currentEpoch = crypto.randomUUID();
  get epoch() {
    return this.currentEpoch;
  }
  revision = 0;
  lastActionId = "@genesis";
  private connections = new Set<Connection>();
  private active?: { connection: Connection; requestId: string };
  private stop: () => void;
  private stopReset: () => void;
  private stopAttribution: () => void;

  constructor(existing?: Vault) {
    const vault = new Vault(
      {
        history: {
          actorId: "@vault-authority",
          sessionId: this.epoch,
          maxGroups: 0,
          metadata: EDITOR_HISTORY_METADATA,
        },
      },
      existing?.getStore()
    );
    this.vault = vault;
    this.stopAttribution = vault.getStore().prepareCommit((commit) => {
      if (this.connections.size && (!commit.options.actorId || !commit.options.sessionId))
        throw new Error("Authority mutations require actor attribution");
      stringifyVaultMessage({
        actions: commit.actions.map(({ type, payload }) => ({ type, payload })),
        options: commit.options,
      });
      return () => {};
    });
    this.stop = vault.subscribeCommits((commit) => this.publish(commit));
    this.stopReset = vault.getStore().onReset((phase) => {
      if (phase === "before") {
        this.currentEpoch = crypto.randomUUID();
        this.revision = 0;
        this.lastActionId = "@genesis";
        for (const connection of this.connections) connection.groups.clear();
      } else
        for (const connection of this.connections)
          connection.send(
            stringifyVaultMessage({
              _type: "init-response",
              protocol: 2,
              epoch: this.epoch,
              revision: this.revision,
              _lastActionId: this.lastActionId,
              data: { iiif: vault.getState().iiif },
              history: summary(connection.history),
            })
          );
    });
  }

  connect(identity: VaultIdentity, send: (message: string) => void) {
    if (!identity.actorId || !identity.sessionId) throw new Error("Missing trusted Vault identity");
    // A live session is exclusive: two controllers must not claim the same writes.
    if (
      [...this.connections].some(
        (item) => item.identity.actorId === identity.actorId && item.identity.sessionId === identity.sessionId
      )
    )
      throw new Error("Vault session already connected");
    const history = new VaultHistory(this.vault.getStore(), { ...identity, metadata: EDITOR_HISTORY_METADATA });
    const connection: Connection = {
      identity: { ...identity },
      history,
      send: (wire) => {
        try {
          send(wire);
        } catch {
          // A lost peer cannot turn an accepted document commit into a rejection.
          this.connections.delete(connection);
          history.dispose();
        }
      },
      groups: new Map(),
      seen: new Set(),
      replies: new Map(),
      sequence: 0,
    };
    this.connections.add(connection);
    const reply = (message: any) => {
      if (message._id) connection.replies.set(message._id, message);
      connection.send(stringifyVaultMessage(message));
    };
    const init = () =>
      reply({
        _type: "init-response",
        protocol: 2,
        epoch: this.epoch,
        revision: this.revision,
        _lastActionId: this.lastActionId,
        data: { iiif: this.vault.getState().iiif },
        history: summary(history),
      });
    return {
      receive: (wire: unknown) => {
        let message: any;
        try {
          message = parseVaultMessage(wire);
        } catch {
          return;
        }
        if (!message || typeof message !== "object" || !this.connections.has(connection)) return;
        if (message._type === "init-request") {
          init();
          return;
        }
        if (typeof message._id !== "string" || message._id.length > 200) return;
        if (connection.seen.has(message._id)) {
          reply({
            ...(connection.replies.get(message._id) || {
              _type: "vault-action-confirmation",
              _id: message._id,
              action: message._id,
            }),
            history: summary(history),
          });
          return;
        }
        // Keep a bounded retry window. Monotonic client sequences reject retries that
        // outlive that window without making a long-lived connection unusable.
        if (message.sequence !== undefined) {
          if (!Number.isSafeInteger(message.sequence) || message.sequence <= connection.sequence) {
            reply({
              _type: "vault-action-rejection",
              _id: message._id,
              action: message._id,
              reason: "expired-request",
            });
            connection.replies.delete(message._id);
            return;
          }
          connection.sequence = message.sequence;
        }
        if (connection.seen.size >= 10_000) {
          const oldest = connection.seen.values().next().value!;
          connection.seen.delete(oldest);
          connection.replies.delete(oldest);
        }
        connection.seen.add(message._id);
        try {
          if (message.epoch !== this.epoch) throw new Error("epoch");
          if (message._type === "group-finish") {
            const id = connection.groups.get(message.groupId);
            if (id) history.closeGroup(id);
            connection.groups.set(message.groupId, null);
            for (const [key, value] of connection.groups) {
              if (connection.groups.size <= 10_000) break;
              if (value === null) connection.groups.delete(key);
            }
            this.publishHistory();
            return;
          }
          if (message._type === "history-request") {
            const state = history.getState();
            const latest =
              message.direction === "undo"
                ? state.undo.at(-1)
                : message.direction === "redo"
                  ? state.redo.at(-1)
                  : undefined;
            const result =
              !latest || latest.id !== message.groupId
                ? { ok: false, reason: "conflict" }
                : (() => {
                    this.active = { connection, requestId: message._id };
                    return history[message.direction as "undo" | "redo"]();
                  })();
            reply({ _type: "history-result", _id: message._id, result, history: summary(history) });
            return;
          }
          if (message._type !== "vault-action" || message.revision !== this.revision) throw new Error("revision");
          validateAction(message.action);
          const options = message.options || {};
          let groupId: string | undefined;
          if (options.groupId) {
            if (typeof options.groupId !== "string" || options.groupId.length > 200) throw new Error("group");
            const existing = connection.groups.get(options.groupId);
            if (existing === null) throw new Error("closed-group");
            groupId =
              existing ||
              history.openGroup({ label: typeof options.label === "string" ? options.label.slice(0, 500) : undefined });
            connection.groups.set(options.groupId, groupId);
          }
          this.active = { connection, requestId: message._id };
          const beforeRevision = this.revision;
          this.vault.dispatch(message.action, {
            ...connection.identity,
            groupId,
            label: typeof options.label === "string" ? options.label.slice(0, 500) : undefined,
            origin: options.origin === "load" ? "load" : "user",
            history: options.history === "ignore" ? "ignore" : undefined,
          });
          if (this.revision === beforeRevision)
            reply({
              _type: "vault-action-confirmation",
              _id: message._id,
              action: message._id,
              history: summary(history),
            });
        } catch (error) {
          if (message._type === "history-request")
            reply({
              _type: "history-result",
              _id: message._id,
              result: { ok: false, reason: "conflict" },
              history: summary(history),
            });
          else
            reply({
              _type: "vault-action-rejection",
              _id: message._id,
              action: message._id,
              reason: error instanceof Error ? error.message : "invalid",
            });
        } finally {
          this.active = undefined;
        }
      },
      disconnect: () => {
        this.connections.delete(connection);
        history.dispose();
      },
    };
  }

  private publish(commit: VaultCommit) {
    this.revision++;
    this.lastActionId = commit.id;
    const active = this.active;
    this.active = undefined;
    for (const connection of this.connections)
      connection.send(
        stringifyVaultMessage({
          _type: "vault-action",
          _id: commit.id,
          revision: this.revision,
          epoch: this.epoch,
          requestId: active?.connection === connection ? active.requestId : undefined,
          options: commit.options,
          action: {
            type: actions.BATCH_ACTIONS,
            payload: { actions: commit.actions.map(({ type, payload }) => ({ type, payload })) },
          },
          history: summary(connection.history),
        })
      );
  }
  private publishHistory() {
    for (const connection of this.connections)
      connection.send(stringifyVaultMessage({ _type: "history-state", history: summary(connection.history) }));
  }
  dispose() {
    this.stop();
    this.stopReset();
    this.stopAttribution();
    this.vault.history?.dispose();
    for (const connection of this.connections) connection.history.dispose();
    this.connections.clear();
  }
}
