import type { VaultOptions } from "@iiif/helpers/vault";
import { RemoteClientVault } from "./remote-client-vault";

export class ClientVault extends RemoteClientVault {
  ws: WebSocket;

  constructor(url: string, options?: Partial<VaultOptions>) {
    super(options);

    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.addEventListener("open", this.handleOpen);
  }

  handleOpen = () => {
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
    this.requestInitialState();
  };

  handleMessage = async (e: MessageEvent<Blob>) => {
    await this.handleTransportMessage(e.data);
  };

  handleClose = () => {
    this.handleTransportClose();
  };

  protected sendMessage(message: string): void {
    this.ws.send(message);
  }
}
