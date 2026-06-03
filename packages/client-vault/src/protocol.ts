import type { AllActions, IIIFStore } from "@iiif/helpers/vault";
import type { BatchAction } from "@iiif/helpers/vault/actions";

export type RemoteVaultAction = {
  _id: string;
  _type: "vault-action";
  _lastActionId: string;
  action: AllActions | BatchAction;
};

export type RemoteVaultInitResponse = {
  _id?: string;
  _type: "init-response";
  _lastActionId?: string;
  data: IIIFStore;
};

export type RemoteVaultInitRequest = {
  _type: "init-request";
};

export type RemoteVaultActionConfirmation = {
  _id: string;
  _type: "vault-action-confirmation";
  _lastActionId?: string;
  action: string;
};

export type RemoteVaultActionRejection = {
  _id: string;
  _type: "vault-action-rejection";
  _lastActionId?: string;
  action: string;
};

export type RemoteVaultClientMessage =
  | RemoteVaultAction
  | RemoteVaultInitRequest;

export type RemoteVaultServerMessage =
  | RemoteVaultAction
  | RemoteVaultInitResponse
  | RemoteVaultActionConfirmation
  | RemoteVaultActionRejection
  | {
      _id?: string;
      _type: "empty-vault-response";
      _lastActionId?: string;
    };
