import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { useState } from "react";

export const AddManifestModal: React.FC<{
  manifest: string;
  onChange: any;
}> = ({ manifest, onChange }) => {
  const [inputValue, setInputValue] = useState(manifest);

  return (
    <div>
      <Input
        placeholder={manifest}
        onChange={(e: any) => setInputValue(e.target.value)}
      />
      <Button onClick={() => onChange(inputValue)}>Go</Button>
    </div>
  );
};
