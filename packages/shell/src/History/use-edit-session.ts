import { VaultEditSession } from "@manifest-editor/editor-api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";

export function useVaultEditSession(label: string, key: string = label) {
  const vault = useVault();
  const [epoch, setEpoch] = useState(0);
  useEffect(
    () =>
      vault.getStore().onReset((phase) => {
        if (phase === "after") setEpoch((value) => value + 1);
      }),
    [vault]
  );
  const session = useMemo(() => new VaultEditSession(vault, label, epoch), [vault, key, epoch]);
  const lifetimes = useRef(new Map<VaultEditSession, number>());
  useEffect(() => {
    const generation = (lifetimes.current.get(session) || 0) + 1;
    lifetimes.current.set(session, generation);
    return () =>
      queueMicrotask(() => {
        if (lifetimes.current.get(session) === generation) {
          session.dispose();
          lifetimes.current.delete(session);
        }
      });
  }, [session]);
  return session;
}
