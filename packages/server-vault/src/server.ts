import { createServer, type IncomingMessage, type Server } from "node:http";
import type { Duplex } from "node:stream";
import { ServerVault } from "./server-vault";
import type { VaultIdentity } from "./authority";

export interface MultiVaultServerOptions {
  /** Return a trusted identity after checking the host's credentials and document access. */
  authenticate?: (request: IncomingMessage, vaultId: string) => VaultIdentity | null | Promise<VaultIdentity | null>;
}

export class MultiVaultServer {
  readonly server: Server;
  readonly vaults = new Map<string, ServerVault>();
  constructor(
    server?: Server,
    private options: MultiVaultServerOptions = {}
  ) {
    this.server = server || createServer();
    this.server.on("upgrade", this.handleUpgrade);
    this.server.on("request", this.handleRequest);
  }
  listen(port: number, hostname?: string, backlog?: number, listeningListener?: () => void) {
    this.server.listen(port, hostname, backlog, listeningListener);
  }
  handleRequest = (request: IncomingMessage, response: any) => {
    if (request.url === "/vault") {
      const json = JSON.stringify({ vaults: [...this.vaults.keys()] });
      response.writeHead(200, { "Content-Length": Buffer.byteLength(json), "Content-Type": "application/json" });
      response.end(json);
    } else {
      response.writeHead(404);
      response.end();
    }
  };
  handleUpgrade = async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    try {
      const pathname = new URL(request.url || "", "http://vault.local").pathname;
      if (!pathname.startsWith("/vault/") || pathname.length === 7) {
        socket.end("HTTP/1.1 404 Not Found\r\n\r\n");
        return;
      }
      const id = pathname.slice(7);
      // Without host authentication, isolate authors by a server-assigned connection identity.
      const identity = this.options.authenticate
        ? await this.options.authenticate(request, id)
        : { actorId: crypto.randomUUID(), sessionId: crypto.randomUUID() };
      if (!identity) {
        socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
        return;
      }
      let vault = this.vaults.get(id);
      if (!vault) {
        vault = new ServerVault({ onClose: () => this.vaults.delete(id) });
        this.vaults.set(id, vault);
      }
      const room = vault;
      room.ws.handleUpgrade(request, socket, head, (ws) => room.ws.emit("connection", ws, request, identity));
    } catch {
      socket.destroy();
    }
  };
}
