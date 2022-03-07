import React, { useEffect, useState } from "react";
import { useVault } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";

export const IIIFBrowser: React.FC = () => {
  const vault = useVault();
  const [IIIFuni, setIIIFuni] = useState<any>({});

  useEffect(() => {
    // ASYNC FUNCTION
    const waitData = async () => {
      const IIIFUniverse = await vault.load(
        "https://ryanfb.github.io/iiif-universe/iiif-universe.json"
      );
      setIIIFuni(IIIFUniverse);
    };
    waitData();
  });

  return (
    <ul>
      <h4>
        Check out these IIIF Resources from{" "}
        <a href="https://ryanfb.github.io/iiif-universe/iiif-universe.json">
          https://ryanfb.github.io/iiif-universe/iiif-universe.json
        </a>
      </h4>
      {IIIFuni &&
        IIIFuni.items &&
        IIIFuni.items.map((item: any) => {
          return (
            <li>
              <a href={item.id} rel="noreffer" target="_blank">
                {getValue(item.label) }
              </a>
            </li>
          );
        })}
    </ul>
  );
};
