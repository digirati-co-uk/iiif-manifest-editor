// Server vault.
import { AllActions, BatchAction, IIIFStore, Vault } from "@iiif/vault";
import { Collection, Manifest } from "@iiif/presentation-3";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { v4 } from "uuid";

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

export class ServerVault {
  vault: Vault;
  ws: WebSocketServer;
  lastActionId: string = GenesisId;
  // initialised = false;
  constructor() {
    this.vault = new Vault();
    this.ws = new WebSocketServer({ noServer: true });
    this.ws.on("connection", (socket) => {
      console.log("Connection...");
      socket.on("message", this.handleMessage(socket));
      socket.on("close", this.handleClose(socket));
      // socket.on("open", this.handleOpen(socket));
      // socket.on("upgrade", this.handleOpen(socket));

      this.handleOpen(socket);
    });
  }

  handleMessage = (socket: WebSocket) => (data: RawData) => {
    console.log("Message received from client: ", data);
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
      this.rebroadcast(socket, data, parsed);
    }
  };

  send = (data: RawData) => {
    console.log("Sending to clients: ", data);
    this.ws.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: true });
      }
    });
  };

  rebroadcast = (source: WebSocket, data: RawData, action: RemoteAction) => {
    console.log("Rebroadcasting to clients: ", data);
    this.ws.clients.forEach((client) => {
      if (client !== source && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: true });
      } else {
        client.send(
          this.createMessage("vault-action-confirmation", {
            action: action._id,
          })
        );
      }
    });
  };

  handleClose = (socket: WebSocket) => (id: number) => {
    console.log("closed", id);
  };

  handleOpen = (socket: WebSocket) => {
    console.log("opened");
    socket.send(this.createMessage("init-response", { data: this.vault.getState() }));
  };

  createMessage = (type: string, message: any) => {
    return JSON.stringify({
      _id: v4(),
      _type: type,
      _lastActionId: this.lastActionId,
      ...message,
    });
  };

  // @todo support loading an initial
  async loadInitial(manifestOrCollection: Manifest | Collection) {
    await this.vault.load(manifestOrCollection.id, manifestOrCollection);
    // this.initialised = true;
  }

  //
}
