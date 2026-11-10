import type { IncomingMessage } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { VaultAuthority, type VaultIdentity } from "./authority";

export type {
  RemoteVaultClientMessage as ClientAction,
  RemoteVaultServerMessage as ServerAction,
} from "@manifest-editor/client-vault";
export interface ServerVaultOptions {
  pingTimeout?: number;
  onClose?: () => void;
}

export class ServerVault {
  readonly authority = new VaultAuthority();
  readonly vault = this.authority.vault;
  readonly ws = new WebSocketServer({ noServer: true });
  readonly pingInterval: ReturnType<typeof setInterval>;
  get lastActionId() {
    return this.authority.lastActionId;
  }

  constructor(options: ServerVaultOptions = {}) {
    this.ws.on("connection", this.setupWebSocket);
    const alive = new WeakSet<WebSocket>();
    this.ws.on("connection", (socket) => {
      alive.add(socket);
      socket.on("pong", () => alive.add(socket));
    });
    this.pingInterval = setInterval(() => {
      for (const socket of this.ws.clients) {
        if (!alive.has(socket)) {
          socket.terminate();
          continue;
        }
        alive.delete(socket);
        socket.ping();
      }
    }, options.pingTimeout || 30000);
    this.ws.on("close", () => {
      clearInterval(this.pingInterval);
      this.authority.dispose();
      options.onClose?.();
    });
  }

  /** Identity is supplied by the HTTP upgrade host, never by a message. */
  setupWebSocket = (socket: WebSocket, _request?: IncomingMessage, identity?: VaultIdentity) => {
    let connection: ReturnType<VaultAuthority["connect"]>;
    try {
      connection = this.authority.connect(
        identity || { actorId: crypto.randomUUID(), sessionId: crypto.randomUUID() },
        (message) => {
          if (socket.readyState === WebSocket.OPEN) socket.send(message);
        }
      );
    } catch {
      socket.close(1008, "Vault session unavailable");
      return;
    }
    socket.on("message", (data) => connection.receive(data.toString()));
    socket.on("close", connection.disconnect);
  };

  async close() {
    clearInterval(this.pingInterval);
    for (const socket of this.ws.clients) socket.close();
    await new Promise<void>((resolve, reject) => this.ws.close((error) => (error ? reject(error) : resolve())));
  }
}
