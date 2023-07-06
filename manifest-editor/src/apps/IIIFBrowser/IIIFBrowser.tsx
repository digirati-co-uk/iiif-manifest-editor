import React from "react";
import { useExternalCollection } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import { useApps } from "@/shell";
import { Loading } from "@/atoms/Loading";

export const IIIFBrowser: React.FC = () => {
  const { currentApp } = useApps();
  const collectionSnippet = currentApp?.args;
  const { manifest: collection, isLoaded } = useExternalCollection(collectionSnippet);

  if (!isLoaded || !collection) {
    return <Loading />;
  }

  return (
    <ul>
      <h4>
        You are browsing: <a href={collection.id || ""}>{getValue(collection.label) || collection.id} </a>
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
