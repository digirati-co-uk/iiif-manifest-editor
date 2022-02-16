import { InputLabel, Input } from "./Input";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import { useEffect, useState } from "react";
import { CalltoButton, Button } from "../atoms/Button";
import { LanguageSelector } from "./LanguageSelector";
import { AddIcon } from "../icons/AddIcon";

type LanguageMap = {
  key?: string;
  value?: string;
};

export const LanguageMapInput: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages: Array<string>;
}> = ({ dispatchType, languages }) => {
  const manifest = useManifest();
  const vault = useVault();
  const [save, setSave] = useState(0);
  const [newItem, setNewItem] = useState(0);
  const [newValue, setNewValue] = useState<LanguageMap>();
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    if (manifest && save >= 1) {
      const newLabel = { ...manifest.label };
      // @ts-ignore
      if (newLabel[newValue.key] && !(newLabel[newValue.key][0] === "")) {
        // @ts-ignore
        newLabel[newValue.key].push(newValue.value);
      } else {
        // @ts-ignore
        newLabel[newValue.key] = [newValue.value];
      }
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
    setNewValue({ key: selectedLanguage, value: "" });
  }, [save]);

  useEffect(() => {
    if (manifest && newItem >= 1) {
      const newLabel = { ...manifest.label };
      // @ts-ignore
      if (newLabel[selectedLanguage]) {
        // @ts-ignore
        newLabel[selectedLanguage].push("");
      } else {
        // @ts-ignore
        newLabel[selectedLanguage] = [""];
      }
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
  }, [newItem]);

  const setLan = (lang: string) => {
    const newVal = { ...newValue, key: lang };
    setNewValue(newVal);
    setSelectedLanguage(lang);
  };

  const setValue = (value: string) => {
    const newVal = { ...newValue, value: value };
    setNewValue(newVal);
  };

  return (
    <>
      <h4>{dispatchType}</h4>
      {Object.entries(
        // @ts-ignore
        manifest && manifest[dispatchType] ? manifest[dispatchType] : {}
      ) ? (
        Object.entries(
          // @ts-ignore
          manifest && manifest[dispatchType] ? manifest[dispatchType] : {}
        ).map(([key, value], index: number) => {
          return (
            <div key={index}>
              {value &&
                value.map((val: any, index: number) => {
                  return (
                    <InputLabel key={index}>
                      <LanguageSelector
                        selected={key}
                        setLanguage={(lang: string) => setLan(lang)}
                        options={languages}
                      />
                      <Input
                        key={val}
                        defaultValue={val}
                        onChange={(e: any) => setValue(e.target.value)}
                      />
                      <CalltoButton onClick={() => setSave(1 + save)}>
                        Save
                      </CalltoButton>
                    </InputLabel>
                  );
                })}
            </div>
          );
        })
      ) : (
        <></>
      )}
      <Button onClick={() => setNewItem(1 + newItem)}>
        <AddIcon />
      </Button>
    </>
  );
};
