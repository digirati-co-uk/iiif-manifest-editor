import React, { useContext, useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import { useShell } from "../../context/ShellContext/ShellContext";

export const IIIFBrowser: React.FC = () => {
  const vault = useVault();
  const [collection, setCollection] = useState<any>({});
  const shellContext = useShell();

  useEffect(() => {
    const waitData = async () => {
      const data = await vault.load(shellContext.resourceID || "");
      setCollection(data);
    };
    waitData();
  });

  return (
    <ul>
      <h4>
        You are browsing:
        <a href={shellContext.resourceID || ""}>{shellContext.resourceID} </a>
      </h4>
      {collection &&
        collection.items &&
        collection.items.map((item: any) => {
          return (
            <li>
              <a href={item.id} rel="noreffer" target="_blank">
                {getValue(item.label)}
              </a>
            </li>
          );
        })}
    </ul>
  );
};
