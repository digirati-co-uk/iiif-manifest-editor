import type { DispatchOptions, HistoryResult, HistoryState, IIIFStore, VaultAction } from "@iiif/helpers/vault";

/** IDs and history in messages are correlation data; the authority supplies the owner. */
export type RemoteVaultAction = {
  _id: string;
  _type: "vault-action";
  sequence?: number;
  _lastActionId?: string;
  action: VaultAction;
  options?: DispatchOptions;
  epoch?: string;
  revision?: number;
  requestId?: string;
  history?: HistoryState;
};
export type RemoteVaultInitResponse = {
  _id?: string;
  _type: "init-response";
  _lastActionId?: string;
  data: IIIFStore;
  protocol?: 1 | 2;
  epoch?: string;
  revision?: number;
  history?: HistoryState;
  readOnly?: boolean;
};
export type RemoteVaultInitRequest = { _type: "init-request"; protocol?: 2 };
export type RemoteVaultActionConfirmation = {
  _id: string;
  _type: "vault-action-confirmation";
  _lastActionId?: string;
  action: string;
  history?: HistoryState;
};
export type RemoteVaultActionRejection = {
  _id: string;
  _type: "vault-action-rejection";
  _lastActionId?: string;
  action: string;
  reason?: string;
};
export type RemoteVaultHistoryRequest = {
  _type: "history-request";
  sequence?: number;
  _id: string;
  direction: "undo" | "redo";
  groupId: string;
  epoch: string;
};
export type RemoteVaultGroupFinish = {
  _type: "group-finish";
  _id: string;
  groupId: string;
  epoch: string;
  sequence?: number;
};
export type RemoteVaultClientMessage =
  | RemoteVaultAction
  | RemoteVaultInitRequest
  | RemoteVaultHistoryRequest
  | RemoteVaultGroupFinish;
export type RemoteVaultServerMessage =
  | RemoteVaultAction
  | RemoteVaultInitResponse
  | RemoteVaultActionConfirmation
  | RemoteVaultActionRejection
  | { _type: "history-state"; history: HistoryState }
  | { _type: "history-result"; _id: string; result: HistoryResult; history?: HistoryState }
  | { _type: "empty-vault-response"; _id?: string; _lastActionId?: string };
