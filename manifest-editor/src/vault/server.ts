import { createServer, IncomingMessage, Server } from "http";
import { Socket } from "net";
import { URL } from "url";
import { ServerVault } from "@/vault/server-vault";

export class MultiVaultServer {
  server: Server;
  vaults: Map<string, ServerVault> = new Map();
  constructor(server?: Server) {
    this.server = server || createServer();
    this.server.on("upgrade", this.handleUpgrade);
    this.server.on("request", this.handleRequest);
  }

  listen(port: number, hostname?: string, backlog?: number, listeningListener?: () => void) {
    this.server.listen(port, hostname, backlog, listeningListener);
  }

  handleRequest = (request: IncomingMessage, response: any) => {
    if (request.url === "/vault") {
      // Need to respond with a JSON body with a list of available vaults.
      const vaults = Array.from(this.vaults.keys());
      const json = JSON.stringify({ vaults });

      response.writeHead(200, {
        "Content-Length": Buffer.byteLength(json),
        "Content-Type": "application/json",
      });
      response.write(json);
      response.end();
      return;
    }

    // If the pathname is not recognised, destroy the socket and send 404.
    response.writeHead(404);
    response.end();
  };

  handleUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) => {
    console.log("ws.url", request.url);
    const pathname = request.url;

    // @todo some logic for handling the pathname. For now, just let any incoming be an ID.
    if (pathname && (pathname as string).startsWith("/vault")) {
      // Get the vault ID from the URL.
      const vaultId = (pathname as string).replace("/vault/", "");

      let vault = this.vaults.get(vaultId);

      // If no vault exists for this ID, create one.
      if (!vault) {
        const newVault = new ServerVault();
        console.log("new vault", vaultId);
        this.vaults.set(vaultId, newVault);
        vault = newVault;
      }

      if (vault) {
        const theVault = vault;
        // If it exists, add the socket to the vault.
        theVault.ws.handleUpgrade(request, socket, head, (ws) => {
          console.log("new client", vaultId);
          theVault.ws.emit("connection", ws, request);
          theVault.ws.on("close", () => {
            if (theVault.ws.clients.size === 0) {
              console.log("destroying vault", vaultId);
              this.vaults.delete(vaultId);
            }
          });
        });
      } else {
        socket.destroy();
      }
      return;
    }

    // If the pathname is not recognised, destroy the socket and send 404.
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  };
}
