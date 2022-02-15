import { InputLabel, Input } from "./Input";
import { useManifest, useVault } from "react-iiif-vault";
import { useEffect, useState } from "react";
import { CalltoButton } from "../atoms/Button";
import { LanguageSelector } from "./LanguageSelector";

type LanguageMap = Array<any>;

export const LanguageMapInput: React.FC<{
  languageMap: LanguageMap;
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages: Array<string>;
}> = ({ languageMap, dispatchType, languages }) => {
  const manifest = useManifest();
  const vault = useVault();
  const [save, setSave] = useState(true);
  const [newValue, setValue] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    vault.batch(v => {
      if (manifest) {
        v.modifyEntityField(manifest, dispatchType, {
          [selectedLanguage]: [newValue]
        });
      }
    });
  }, [save]);

  return (
    <>
      {languageMap ? (
        languageMap.map(([key, value]) => {
          return (
            <InputLabel key={key}>
              {/* This will be a multiselect */}
              <LanguageSelector
                selected={"en"}
                setLanguage={(val: string) => setSelectedLanguage(val)}
                options={languages} />
              {value.map((val: any) => {
                return (
                  <Input
                    key={val}
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
