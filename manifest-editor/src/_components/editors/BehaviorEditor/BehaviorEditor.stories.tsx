import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { BehaviorEditor } from "./BehaviorEditor";
import { useState } from "react";

export default { title: "Behavior Editor", panel: "right" };

export const SimpleExample = () => {
  const [temp, setTemp] = useState<string[]>(["Not fish", "cat"]);

  return (
    <>
      <BehaviorEditor
        behavior={temp}
        onChange={setTemp}
        configs={[
          {
            id: "pets",
            label: { none: ["Choose pet"] },
            type: "choice",
            items: [
              { label: { none: ["None"] }, value: "" },
              { label: { none: ["Cat"] }, value: "cat" },
              { label: { none: ["Dog"] }, value: "dog" },
              { label: { none: ["Fish"] }, value: "fish" },
            ],
          },
        ]}
      />
    </>
  );
};
