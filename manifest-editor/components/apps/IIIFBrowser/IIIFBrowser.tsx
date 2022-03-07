import React, { useContext, useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import ShellContext from "../Shell/ShellContext";

export const IIIFBrowser: React.FC = () => {
  const vault = useVault();
  const [collection, setCollection] = useState<any>({});
  const shellContext = useContext(ShellContext);

  useEffect(() => {
    // ASYNC FUNCTION
    const waitData = async () => {
      const data = await vault.load(shellContext?.resourceID || "");
      console.log(shellContext);
      console.log(data);
      setCollection(data);
    };
    waitData();
  });

  // https://ryanfb.github.io/iiif-universe/iiif-universe.json

  return (
    <ul>
      <h4>
        You are browsing:
        <a href={shellContext?.resourceID || ""}>{shellContext?.resourceID} </a>
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
