import { InputLabel, Input } from "./Input";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import { useEffect, useState } from "react";
import { CalltoButton, Button } from "../atoms/Button";
import { LanguageSelector } from "./LanguageSelector";
import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";

type TempInput = {
  parentIndex: number;
  index: number;
  value: string;
  previousValue: string;
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
  const [languageMap, setLanguageMap] = useState<any>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [inputValue, setInputValue] = useState<TempInput | null>();

  useEffect(() => {
    if (manifest && save >= 1) {
      const newLabel = Object.fromEntries(languageMap);
      vault.modifyEntityField(manifest, dispatchType, newLabel);
    }
  }, [save]);

  const setValue = () => {
    if (!inputValue) return;
    const updateValue = [...languageMap];
    const editedIndexValue = updateValue[inputValue.parentIndex][
      inputValue.index + 1
    ].indexOf(inputValue.previousValue);
    updateValue[inputValue.parentIndex][inputValue.index + 1][
      editedIndexValue
    ] = inputValue.value;
    setLanguageMap(updateValue);
    setInputValue(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue();
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const withNew = [...languageMap];
    withNew.push([selectedLanguage, [""]]);
    setLanguageMap(withNew);
  }, [newItem]);

  useEffect(() => {
    const languageMap = Object.entries(
      // @ts-ignore
      manifest && manifest[dispatchType] ? manifest[dispatchType] : {}
    );
    setLanguageMap(languageMap);
  }, [manifest]);

  return (
    <>
      <h4>{dispatchType}</h4>

      {languageMap.map(
          // @ts-ignore
          ([key, value], parentIndex: number) => {
        return (
          <div key={parentIndex}>
            {value &&
              value.map((val: any, index: number) => {
                return (
                  <InputLabel key={index}>
                    <LanguageSelector
                      selected={key}
                      setLanguage={(lang: string) => setSelectedLanguage(lang)}
                      options={languages}
                    />
                    <Input
                      key={val}
                      defaultValue={val}
                      onChange={(e: any) =>
                        setInputValue({
                          parentIndex: parentIndex,
                          index: index,
                          value: e.target.value,
                          previousValue: val
                        })
                      }
                    />
                  </InputLabel>
                );
              })}
          </div>
        );
      })}
      <FlexContainer>
        <CalltoButton onClick={() => setSave(1 + save)}>Save</CalltoButton>
        <Button onClick={() => setNewItem(1 + newItem)}>
          <AddIcon />
        </Button>
      </FlexContainer>
    </>
  );
};
