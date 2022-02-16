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
  const [newItem, setNewItem] = useState(0);
  const [newValue, setValue] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const isMounted = useRef(false);

  useEffect(() => {
    if (manifest) {
      console.log("manifest HAS CHANGED", manifest?.label);
    }
  }, [manifest]);

  // useEffect(() => {
  //   if (isMounted.current) return;
  //   console.log("manifest HAS CHANGED");
  //   if (manifest) {
  //     const newLabel = { ...manifest.label };
  //     // @ts-ignore
  //     if (newLabel[selectedLanguage]) {
  //       // @ts-ignore
  //       newLabel[selectedLanguage].push(newValue);
  //     } else {
  //       // @ts-ignore
  //       newLabel[selectedLanguage] = [newValue];
  //     }
  //     vault.modifyEntityField(manifest, dispatchType, newLabel);
  //   }
  // }, [save]);

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
      console.log("dispatching this newLabel to the vault: ", newLabel);
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
  }, [newItem]);

  return (
    <>
      {Object.entries(manifest && manifest.label ? manifest.label : {}) ? (
        Object.entries(manifest && manifest.label ? manifest.label : {}).map(
          ([key, value], index: number) => {
            return (
              <div key={index}>
                {value &&
                  value.map((val: any) => {
                    return (
                      <InputLabel key={JSON.stringify(value)}>
                        <LanguageSelector
                          selected={key}
                          setLanguage={(val: string) =>
                            setSelectedLanguage(val)
                          }
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
              </div>
            );
          }
        )
      ) : (
        <></>
      )}
      <Button onClick={() => setNewItem(1 + newItem)}>
        <AddIcon />
      </Button>
    </>
  );
};
