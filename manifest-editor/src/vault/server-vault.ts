// Server vault.
import { AllActions, BatchAction, IIIFStore, Vault } from "@iiif/vault";
import { Collection, Manifest } from "@iiif/presentation-3";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { v4 } from "uuid";
import { clearInterval, setInterval } from "timers";

type RemoteAction = {
  _id: string;
  _type: "vault-action";
  _lastActionId: string;
  action: AllActions | BatchAction;
};

const GenesisId = "@genesis";

type ClientInitAction = {
  _id: string;
  _type: "init-response";
  _lastActionId: string;
  data: IIIFStore;
};

type ClientInitRequestAction = {
  _type: "init-request";
};

type RemoteActionConfirmation = {
  _id: string;
  _type: "vault-action-confirmation";
  _lastActionId: string;
  action: string;
};

type RemoteActionRejection = {
  _id: string;
  _type: "vault-action-rejection";
  _lastActionId: string;
  action: string;
};

type InitialiseWithResourceAction = {
  _id: string;
  _type: "initialise-with-resource";
  _lastActionId: string;
  resource: Collection | Manifest;
};

type EmptyVaultResponse = {
  _id: string;
  _type: "empty-vault-response";
  _lastActionId: string;
};

export type ClientAction = RemoteAction | ClientInitRequestAction | InitialiseWithResourceAction;

export type ServerAction =
  | RemoteAction
  | RemoteActionConfirmation
  | RemoteActionRejection
  | ClientInitAction
  | EmptyVaultResponse;

// Extend ws module interface WebSocket.WebSocket with custom typescript property
declare module "ws" {
  interface WebSocket {
    isAlive: boolean;
  }
}

export interface ServerVaultOptions {
  pingTimeout?: number;
  onClose?: () => void;
}

export class ServerVault {
  vault: Vault;
  ws: WebSocketServer;
  lastActionId: string = GenesisId;
  pingInterval: NodeJS.Timeout;

  private _handleMessage = new Map();
  private _handleOpen = new Map();
  private _handleClose = new Map();

  constructor(options: ServerVaultOptions = {}) {
    this.vault = new Vault();
    this.ws = new WebSocketServer({ noServer: true });

    this.ws.on("connection", this.setupWebSocket);

    this.pingInterval = setInterval(() => {
      this.ws.clients.forEach((socket) => {
        if (socket.isAlive === false) {
          return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping();
      });
    }, options.pingTimeout || 30000);

    this.ws.on("close", () => {
      clearInterval(this.pingInterval);

      if (options.onClose) {
        options.onClose();
      }
    });

    this.ws.on("error", (err) => {
      // @todo error handling.
    });
  }

  async close() {
    clearTimeout(this.pingInterval);

    return new Promise<void>((resolve, error) => {
      this.ws.close((err) => {
        if (err) {
          error(err);
        }
        resolve();
      });
    });
  }

  setupWebSocket = (socket: WebSocket.WebSocket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.on("open", this.handleOpen(socket));
    socket.on("message", this.handleMessage(socket));
    socket.on("close", this.handleClose(socket));
    // Send the initial state to the client.
    socket.send(this.createMessage("init-response", { data: this.vault.getState() }));
  };

  handleMessage = (socket: WebSocket) => {
    if (this._handleMessage.has(socket)) {
      return this._handleMessage.get(socket);
    }
    const handler = (data: RawData, isBinary: boolean) => {
      const parsed: ClientAction = JSON.parse(data.toString());

      if (parsed._type === "init-request") {
        socket.send(this.createMessage("init-response", { data: this.vault.getState() }));
      }

      if (parsed._type === "vault-action") {
        try {
          this.vault.dispatch(parsed.action);
        } catch (e) {
          // @todo error handling.
          socket.send(
            this.createMessage("vault-action-rejection", {
              action: parsed._id,
            })
          );
          return;
        }

        this.lastActionId = parsed._id;
        this.rebroadcast(socket, data, parsed, isBinary);
      }
    };

    this._handleMessage.set(socket, handler);

    return handler;
  };

  send = (data: RawData) => {
    this.ws.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: true });
      }
    });
  };

  rebroadcast = (source: WebSocket, data: RawData, action: RemoteAction, isBinary = true) => {
    this.ws.clients.forEach((client) => {
      if (client !== source && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      } else {
        client.send(
          this.createMessage("vault-action-confirmation", {
            action: action._id,
          })
        );
      }
    });
  };

  handleOpen = (socket: WebSocket) => {
    if (this._handleOpen.has(socket)) {
      return this._handleOpen.get(socket);
    }
    const handler = () => {
      // Handle open.
    };

    this._handleOpen.set(socket, handler);

    return handler;
  };

  handleClose = (socket: WebSocket) => {
    if (this._handleClose.has(socket)) {
      return this._handleClose.get(socket);
    }
    const handler = () => {
      // Close handler.
    };

    this._handleClose.set(socket, handler);

    return handler;
  };

  createMessage = (type: string, message: any) => {
    return JSON.stringify({
      _id: v4(),
      _type: type,
      _lastActionId: this.lastActionId,
      ...message,
    });
  };
}
