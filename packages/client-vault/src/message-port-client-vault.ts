import type { Vault4Options } from "@iiif/helpers/vault-4";
import { RemoteClientVault } from "./remote-client-vault";

export class MessagePortClientVault extends RemoteClientVault {
  port: MessagePort;

  constructor(port: MessagePort, options?: Partial<Vault4Options>) {
    super(options);
    this.port = port;
    this.port.addEventListener("message", this.handleMessage);
    this.port.addEventListener("messageerror", this.handleClose);
    this.port.start();
    this.requestInitialState();
  }

  destroy() {
    this.port.removeEventListener("message", this.handleMessage);
    this.port.removeEventListener("messageerror", this.handleClose);
    this.handleTransportClose();
    this.port.close();
  }

  protected sendMessage(message: string): void {
    this.port.postMessage(message);
  }

  private handleMessage = (event: MessageEvent) => {
    void this.handleTransportMessage(event.data);
  };

  private handleClose = () => {
    this.handleTransportClose();
  };
}
