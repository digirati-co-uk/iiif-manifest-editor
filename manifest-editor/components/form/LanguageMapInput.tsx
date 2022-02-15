import { InputLabel, Input } from "./Input";
import { useManifest, useVault } from "react-iiif-vault";
import { useEffect, useState, useRef } from "react";
import { CalltoButton, Button } from "../atoms/Button";
import { LanguageSelector } from "./LanguageSelector";
import { AddIcon } from "../icons/AddIcon";

export const LanguageMapInput: React.FC<{
  // Add to this list as we go
  dispatchType: "label" | "summary";
  languages: Array<string>;
}> = ({ dispatchType, languages }) => {
  const manifest = useManifest();
  const vault = useVault();
  const [save, setSave] = useState(false);
  const [newItem, setNewItem] = useState(false);
  const [newValue, setValue] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [languageMap, setLanguageMap] = useState();
  const isMounted = useRef(false);

  useEffect(() => {
    if (dispatchType === "label") {
      const labels = Object.entries(
        manifest && manifest.label ? manifest.label : {}
      );
      setLanguageMap(labels);
    }
  }, []);

  useEffect(() => {
    console.log("manifest HAS CHANGED");
    if (dispatchType == "label") {
      const labels = Object.entries(
        manifest && manifest.label ? manifest.label : {}
      );
      setLanguageMap(labels);
    }
  }, [manifest]);

  useEffect(() => {
    if (manifest) {
      const newLabel = { ...manifest.label, [selectedLanguage]: [newValue] };
      // @ts-ignore
      [selectedLanguage].push(newValue);
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
  }, [save]);

  useEffect(() => {
    if (manifest) {
      const newLabel = { ...manifest.label, [selectedLanguage]: [""] };
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
  }, [newItem]);

  return (
    <>
      {languageMap ? (
        languageMap.map(([key, value], index: number) => {
          return (
            <>
              {value &&
                value.map((val: any) => {
                  return (
                    <InputLabel key={JSON.stringify(value)}>
                      <LanguageSelector
                        selected={key}
                        setLanguage={(val: string) => setSelectedLanguage(val)}
                        options={languages}
                      />
                      <Input
                        key={val}
                        defaultValue={val}
                        onChange={(e: any) => setValue(e.target.value)}
                      />
                      <CalltoButton onClick={() => setSave(!save)}>
                        Save
                      </CalltoButton>
                    </InputLabel>
                  );
                })}
            </>
          );
        })
      ) : (
        <></>
      )}
      <Button onClick={() => setNewItem(!newItem)}>
        <AddIcon />
      </Button>
    </>
  );
};
