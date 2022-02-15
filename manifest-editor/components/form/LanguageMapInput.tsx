import { InputLabel, Input } from "./Input";
import { useManifest, useVault } from "react-iiif-vault";
import { useEffect, useState } from "react";
import { CalltoButton } from "../atoms/Button";

type LanguageMap = Array<any>;

export const LanguageMapInput: React.FC<{
  languageMap: LanguageMap;
  dispatchType: "label" | "summary";
}> = ({ languageMap, dispatchType }) => {
  const manifest = useManifest();
  const vault = useVault();
  const [save, setSave] = useState(true);
  const [newValue, setValue] = useState("");

  useEffect(() => {
    vault.batch(v => {
      if (manifest) {
        v.modifyEntityField(manifest, dispatchType, {
          en: [newValue]
        });
      }
    });
  }, [save]);
  return (
    <>
      {languageMap ? (
        languageMap.map(([key, value]) => {
          return (
            <InputLabel>
              {/* This will be a multiselect */}
              {key}
              {value.map((val: any) => {
                return (
                  <Input
                    defaultValue={val}
                    onChange={(e: any) => setValue(e.target.value)}
                  />
                );
              })}
              <CalltoButton onClick={() => setSave(!save)}>Save</CalltoButton>
            </InputLabel>
          );
        })
      ) : (
        <></>
      )}
    </>
  );
};
