import { AllActions, Vault, VaultOptions } from "@iiif/helpers/vault";
import { BatchAction } from "@iiif/helpers/vault/actions";

// @todo make this a dev dependency?
type ServerAction = any;

function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export class ClientVault extends Vault {
  ws: WebSocket;
  lastActionId = "@genesis";
  lastInitActionId = "@genesis";
  pendingActions = new Map<string, AllActions | BatchAction>();
  pendingActionOrder: Array<string> = [];
  isReady = false;
  isResetting = true;
  isEmpty = false;
  queuedActions: Array<AllActions | BatchAction> = [];

  constructor(url: string, options?: Partial<VaultOptions>) {
    super(options);

    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.addEventListener("open", this.handleOpen);
  }

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

  handleOpen = () => {
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
  };

  handleMessage = async (e: MessageEvent<Blob>) => {
    const data = e.data;
    if (!data) {
      return;
    }
    const parsed: ServerAction = JSON.parse(typeof data === "string" ? data : await data.text());
    if (parsed._type === "init-response") {
      this.getStore().setState(parsed.data);
      this.isResetting = false;
      this.isReady = true;
      // Dispatch any queued actions.
      this.queuedActions.forEach((action) => this.dispatch(action));
      this.queuedActions = [];
    }

    if (parsed._type === "vault-action") {
      // Directly dispatch the action.
      super.dispatch(parsed.action);
      this.lastActionId = parsed._id;
    }

    if (parsed._type === "empty-vault-response") {
      this.isEmpty = true;
    }

    if (parsed._type === "vault-action-confirmation") {
      // @todo detect if the any other client actions came before this one
      //    and dispatch them in order. This may require undoing actions.

      // Confirm pending action.
      const action = this.pendingActions.get(parsed._id);
      if (action) {
        this.pendingActions.delete(parsed._id);
        this.pendingActionOrder = this.pendingActionOrder.filter((id) => id !== parsed._id);
      }
    }

    if (parsed._type === "vault-action-rejection") {
      // We need to request the state from the websocket.
      this.ws.send(JSON.stringify({ _type: "init-request" }));
      this.isResetting = true;
      this.isReady = false;
      // We also want to retry the action that was rejected.
      const action = this.pendingActions.get(parsed._id);
      if (action) {
        this.queuedActions = [action, ...this.queuedActions];
      }
      // Any actions that were sent after the rejected action should also be added to the queue.
      const rejectedActionIndex = this.pendingActionOrder.indexOf(parsed._id);
      if (rejectedActionIndex !== -1) {
        const actionsToQueue = this.pendingActionOrder
          .slice(rejectedActionIndex)
          .map((id) => this.pendingActions.get(id))
          .filter((a) => a) as Array<AllActions | BatchAction>;

        this.queuedActions = [...actionsToQueue, ...this.queuedActions];
      }

      // We can reset the pending actions.
      this.pendingActions = new Map();
      this.pendingActionOrder = [];

      // @todo undo the actions that were rejected.
    }
  };

  handleClose = () => {
    this.isReady = false;
  };

  dispatch(action: AllActions | BatchAction) {
    if (this.isResetting) {
      this.queuedActions.push(action);
      return;
    }
    if (!this.isReady) {
      throw new Error("Vault not yet ready");
    }

    const wrappedAction = {
      _id: randomId(),
      _type: "vault-action",
      _lastActionId: this.lastInitActionId,
      action,
    };

    this.lastInitActionId = wrappedAction._id;

    // Eagerly send the action.
    super.dispatch(action);

    // Store the action in the pending actions.
    this.pendingActions.set(wrappedAction._id, action);
    this.pendingActionOrder.push(wrappedAction._id);

    // Send the action.
    this.ws.send(JSON.stringify(wrappedAction));
  }
}
