import { useState } from "react";
import { Button } from "react-aria-components";
import {
  LocaleString,
  type TextualContentStrategy,
  useVault,
} from "react-iiif-vault";

export function RenderTextualContent(props: {
  strategy: TextualContentStrategy;
}) {
  const languages = props.strategy.items.map(
    (item) => Object.keys(item.text)[0]!,
  );
  const [langauge, setLanguage] = useState(languages[0]);
  const selected = props.strategy.items.find(
    (item) => Object.keys(item.text)[0] === langauge,
  );

  return (
    <div className="overflow-y-auto bg-white shadow">
      <div className="flex gap-2 border-b">
        {languages.map((language) => {
          return (
            <Button
              className={`py-1 px-3 ${langauge === language ? "bg-me-500 text-white" : "bg-white text-black"}`}
              key={language}
              onPress={() => setLanguage(language)}
            >
              {language}
            </Button>
          );
        })}
      </div>
      <div className="p-4 prose">
        <LocaleString
          enableDangerouslySetInnerHTML
          defaultText={
            (
              <span className="text-gray-500 my-8">No content available</span>
            ) as any
          }
        >
          {selected?.text}
        </LocaleString>
      </div>
    </div>
  );
}
