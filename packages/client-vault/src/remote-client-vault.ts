import { AllActions, Vault, VaultOptions } from "@iiif/helpers/vault";
import { BatchAction } from "@iiif/helpers/vault/actions";
import type {
  RemoteVaultAction,
  RemoteVaultServerMessage,
} from "./protocol";

function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export abstract class RemoteClientVault extends Vault {
  lastActionId = "@genesis";
  lastInitActionId = "@genesis";
  pendingActions = new Map<string, AllActions | BatchAction>();
  pendingActionOrder: Array<string> = [];
  isReady = false;
  isResetting = true;
  isEmpty = false;
  queuedActions: Array<AllActions | BatchAction> = [];

  constructor(options?: Partial<VaultOptions>) {
    super(options);
  }

  protected abstract sendMessage(message: string): void;

  waitUntilReady = async () => {
    if (this.isReady) {
      return;
    }
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.isReady) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  protected requestInitialState() {
    this.sendMessage(JSON.stringify({ _type: "init-request" }));
  }

  protected handleTransportClose = () => {
    this.isReady = false;
  };

  protected handleTransportMessage = async (data: Blob | string | unknown) => {
    if (!data) {
      return;
    }

    const parsed = await this.parseMessage(data);
    if (!parsed) {
      return;
    }

    if (parsed._type === "init-response") {
      this.getStore().setState(parsed.data);
      this.isResetting = false;
      this.isReady = true;
      this.queuedActions.forEach((action) => this.dispatch(action));
      this.queuedActions = [];
    }

    if (parsed._type === "vault-action") {
      super.dispatch(parsed.action);
      this.lastActionId = parsed._id;
    }

    if (parsed._type === "empty-vault-response") {
      this.isEmpty = true;
    }

    if (parsed._type === "vault-action-confirmation") {
      const action = this.pendingActions.get(parsed._id);
      if (action) {
        this.pendingActions.delete(parsed._id);
        this.pendingActionOrder = this.pendingActionOrder.filter(
          (id) => id !== parsed._id,
        );
      }
    }

    if (parsed._type === "vault-action-rejection") {
      this.sendMessage(JSON.stringify({ _type: "init-request" }));
      this.isResetting = true;
      this.isReady = false;

      const action = this.pendingActions.get(parsed._id);
      if (action) {
        this.queuedActions = [action, ...this.queuedActions];
      }

      const rejectedActionIndex = this.pendingActionOrder.indexOf(parsed._id);
      if (rejectedActionIndex !== -1) {
        const actionsToQueue = this.pendingActionOrder
          .slice(rejectedActionIndex)
          .map((id) => this.pendingActions.get(id))
          .filter((a) => a) as Array<AllActions | BatchAction>;

        this.queuedActions = [...actionsToQueue, ...this.queuedActions];
      }

      this.pendingActions = new Map();
      this.pendingActionOrder = [];
    }
  };

  private async parseMessage(
    data: Blob | string | unknown,
  ): Promise<RemoteVaultServerMessage | null> {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      return JSON.parse(await data.text());
    }
    if (typeof data === "object" && data) {
      return data as RemoteVaultServerMessage;
    }
    return null;
  }

  dispatch(action: AllActions | BatchAction) {
    if (this.isResetting) {
      this.queuedActions.push(action);
      return;
    }
    if (!this.isReady) {
      throw new Error("Vault not yet ready");
    }

    const wrappedAction: RemoteVaultAction = {
      _id: randomId(),
      _type: "vault-action",
      _lastActionId: this.lastInitActionId,
      action,
    };

    this.lastInitActionId = wrappedAction._id;

    super.dispatch(action);

    this.pendingActions.set(wrappedAction._id, action);
    this.pendingActionOrder.push(wrappedAction._id);

    this.sendMessage(JSON.stringify(wrappedAction));
  }
}
