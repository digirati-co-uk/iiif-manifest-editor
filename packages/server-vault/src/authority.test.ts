import { importEntities, addMappings } from "@iiif/helpers/vault/actions";
import { afterEach, describe, expect, test } from "vitest";
import { RemoteClientVault, parseVaultMessage, stringifyVaultMessage } from "@manifest-editor/client-vault";
import { VaultAuthority } from "./authority";

const authorities: VaultAuthority[] = [];
afterEach(() => {
  for (const authority of authorities.splice(0)) authority.dispose();
});
const canvas = { id: "c", type: "Canvas" as const };
function setup() {
  const authority = new VaultAuthority();
  authorities.push(authority);
  authority.vault.loadSync("m", { id: "m", type: "Manifest", items: [{ ...canvas, width: 100, height: 100 }] });
  class Client extends RemoteClientVault {
    sent: string[] = [];
    errors: unknown[] = [];
    connection = authority.connect({ actorId: crypto.randomUUID(), sessionId: crypto.randomUUID() }, (wire) => {
      void this.handleTransportMessage(wire).catch((error) => this.errors.push(error));
    });
    constructor() {
      super();
      this.requestInitialState();
    }
    protected sendMessage(wire: string) {
      this.sent.push(wire);
      this.connection.receive(wire);
    }
  }
  const a = new Client(),
    b = new Client();
  return { authority, a, b };
}

describe("authoritative Vault history", () => {
  test("only undoes the caller's edits and converges without overwriting unrelated foreign fields", async () => {
    const { a, b, authority } = setup();
    a.modifyEntityField(canvas, "label", { en: ["Alice"] });
    b.modifyEntityField(canvas, "summary", { en: ["Bob"] });
    expect(a.pendingActions.size).toBe(0);
    expect((await a.requestHistory("undo")).ok).toBe(true);
    for (const vault of [a, b, authority.vault]) {
      expect(vault.get(canvas).label).not.toEqual({ en: ["Alice"] });
      expect(vault.get(canvas).summary).toEqual({ en: ["Bob"] });
    }
    expect((await a.requestHistory("redo")).ok).toBe(true);
    expect(b.get(canvas).label).toEqual({ en: ["Alice"] });
    expect(a.errors).toEqual([]);
    expect(b.errors).toEqual([]);
  });

  test("blocks same-field conflicts, changed-back values and forged ownership", async () => {
    const { a, b, authority } = setup();
    a.modifyEntityField(canvas, "width", 200);
    b.dispatch(
      { type: "@iiif/MODIFY_ENTITY_FIELD", payload: { ...canvas, key: "width", value: 300 } },
      { actorId: "forged", sessionId: "forged" }
    );
    b.modifyEntityField(canvas, "width", 200);
    expect(await a.requestHistory("undo")).toMatchObject({ ok: false, reason: "conflict" });
    expect(authority.vault.get(canvas).width).toBe(200);
    expect((await b.requestHistory("undo")).ok).toBe(true);
    expect(a.get(canvas).width).toBe(300);
  });

  test("nested scopes publish once per batch and close one shared remote group", async () => {
    const { a, b } = setup();
    await a.interaction({ label: "Resize" }, async (scoped) => {
      scoped.batch(() => {
        scoped.modifyEntityField(canvas, "width", 400);
        scoped.batch(() => scoped.modifyEntityField(canvas, "height", 500));
      });
      await scoped.interaction({}, (nested) => nested.modifyEntityField(canvas, "label", { en: ["Size"] }));
      expect(a.getRemoteHistoryState().canUndo).toBe(false);
    });
    expect(a.sent.map(parseVaultMessage).filter((m: any) => m._type === "vault-action")).toHaveLength(2);
    expect(a.getRemoteHistoryState().undo).toHaveLength(1);
    expect(a.getRemoteHistoryState().canUndo).toBe(true);
    expect((await a.requestHistory("undo")).ok).toBe(true);
    expect(b.get(canvas).width).toBe(100);
    expect(b.get(canvas).height).toBe(100);
  });

  test("rejects arbitrary inverse patches and deduplicates retries", () => {
    const { a, authority } = setup();
    a.modifyEntityField(canvas, "width", 220);
    const wire = a.sent.find((wire) => parseVaultMessage(wire)._type === "vault-action")!;
    const revision = authority.revision;
    a.connection.receive(wire);
    expect(authority.revision).toBe(revision);
    a.connection.receive(
      stringifyVaultMessage({
        ...parseVaultMessage<any>(wire),
        _id: "forged",
        revision,
        action: { type: "@iiif/APPLY_HISTORY", payload: { changes: [], direction: "undo" } },
      })
    );
    expect(authority.revision).toBe(revision);
    expect(authority.vault.get(canvas).width).toBe(220);
  });

  test("remote public undo never performs an unconfirmed local reversal", () => {
    const { a } = setup();
    a.modifyEntityField(canvas, "width", 200);
    expect(a.undo()).toEqual({ ok: false, reason: "disabled" });
    expect(a.get(canvas).width).toBe(200);
  });
});

test("a surviving foreign reference blocks undoing entity creation", async () => {
  const { a, b, authority } = setup();
  await a.interaction({ label: "Import image" }, (scoped) =>
    scoped.batch(() => {
      scoped.dispatch(
        importEntities({
          entities: { ContentResource: { image: { id: "image", type: "Image", width: 10, height: 10 } } },
        })
      );
      scoped.dispatch(addMappings({ mapping: { image: "ContentResource" } }));
    })
  );
  b.modifyEntityField(canvas, "thumbnail", [{ id: "image", type: "ContentResource" }]);
  const before = authority.vault.getState().iiif;
  expect(await a.requestHistory("undo")).toMatchObject({ ok: false, reason: "conflict", conflict: "reference" });
  expect(authority.vault.getState().iiif).toBe(before);
  expect(a.get({ id: "image", type: "ContentResource" })).not.toBeNull();
});

test("document replacement changes epoch, clears remote history and rejects stale scopes", async () => {
  const { a, authority } = setup();
  const context = a.beginInteraction({ label: "Old document" });
  context.vault.modifyEntityField(canvas, "width", 220);
  authority.vault.getStore().setState({ iiif: authority.vault.getState().iiif });
  expect(a.getRemoteHistoryState().undo).toHaveLength(0);
  expect(() => context.vault.modifyEntityField(canvas, "width", 330)).toThrow(/replaced state/);
  expect(a.get(canvas).width).toBe(220);
});

test("a repeated history request never reverses a second group", async () => {
  const { a, authority } = setup();
  a.modifyEntityField(canvas, "width", 200);
  a.modifyEntityField(canvas, "width", 300);
  expect((await a.requestHistory("undo")).ok).toBe(true);
  const wire = a.sent.filter((wire) => parseVaultMessage(wire)._type === "history-request").at(-1)!;
  const revision = authority.revision;
  a.connection.receive(wire);
  expect(authority.revision).toBe(revision);
  expect(a.get(canvas).width).toBe(200);
});

test("server-originated edits are never attributed to every connected user", () => {
  const { a, b, authority } = setup();
  authority.vault.modifyEntityField(canvas, "width", 190);
  expect(a.getRemoteHistoryState().undo).toHaveLength(0);
  expect(b.getRemoteHistoryState().undo).toHaveLength(0);
  expect(a.get(canvas).width).toBe(190);
});

test("a failing peer does not interrupt accepted commits or other subscribers", () => {
  const { a, authority } = setup();
  authority.connect({ actorId: "lost", sessionId: "lost" }, () => {
    throw new Error("Disconnected");
  });
  a.modifyEntityField(canvas, "width", 250);
  expect(a.pendingActions.size).toBe(0);
  expect(authority.vault.get(canvas).width).toBe(250);
  expect(a.lastRejection).toBeUndefined();
});

test("stale concurrent writes resynchronize without replaying destructive intent", () => {
  const { a, b, authority } = setup();
  const delayed: string[] = [];
  const receive = a.connection.receive;
  a.connection.receive = (wire: unknown) => {
    if (parseVaultMessage<any>(wire)._type === "vault-action") delayed.push(String(wire));
    else receive(wire);
  };
  a.modifyEntityField(canvas, "width", 200);
  b.modifyEntityField(canvas, "height", 300);
  const revision = authority.revision;
  receive(delayed[0]);
  expect(authority.revision).toBe(revision);
  for (const vault of [a, b, authority.vault]) {
    expect(vault.get(canvas).width).toBe(100);
    expect(vault.get(canvas).height).toBe(300);
  }
  expect(a.pendingActions.size).toBe(0);
  expect(a.lastRejection).toBe("revision");
  expect(a.isReady).toBe(true);
});

test("long-lived sessions keep editing after the retry window fills and reject evicted sequenced retries", () => {
  const authority = new VaultAuthority();
  authorities.push(authority);
  authority.vault.loadSync("c", { ...canvas, width: 100, height: 100, items: [] });
  const replies: any[] = [];
  const connection = authority.connect({ actorId: "long-lived", sessionId: "session" }, (wire) =>
    replies.push(parseVaultMessage(wire))
  );
  let sequence = 0;
  const send = (message: object) =>
    connection.receive(stringifyVaultMessage({ epoch: authority.epoch, sequence: ++sequence, ...message }));
  const first = {
    _type: "vault-action",
    _id: "first",
    epoch: authority.epoch,
    sequence: ++sequence,
    revision: authority.revision,
    action: { type: "@iiif/MODIFY_ENTITY_FIELD", payload: { ...canvas, key: "width", value: 200 } },
  };
  connection.receive(stringifyVaultMessage(first));
  for (let i = 0; i < 10_001; i++) send({ _type: "group-finish", _id: `finish-${i}`, groupId: `group-${i}` });
  connection.receive(stringifyVaultMessage({ _type: "init-request" }));
  send({
    _type: "vault-action",
    _id: "latest",
    revision: authority.revision,
    action: { type: "@iiif/MODIFY_ENTITY_FIELD", payload: { ...canvas, key: "height", value: 300 } },
  });
  expect(authority.vault.get(canvas).height).toBe(300);
  const revision = authority.revision;
  connection.receive(stringifyVaultMessage(first));
  expect(authority.revision).toBe(revision);
  expect(replies.at(-1)).toMatchObject({ _type: "vault-action-rejection", reason: "expired-request" });
  const state = [...replies].reverse().find((message) => message.history)?.history;
  send({ _type: "history-request", _id: "undo-latest", direction: "undo", groupId: state.undo.at(-1).id });
  expect(replies.at(-1)).toMatchObject({ _type: "history-result", result: { ok: true } });
  expect(authority.vault.get(canvas).height).toBe(100);
});
