import * as $ from "@/components/widgets/IIIFExplorer/styles/ExplorerInput.styles";
import { FormEvent, useState } from "react";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";

export function ExplorerInput() {
  const store = useExplorerStore();
  const select = useStore(store, (s) => s.select);
  // const [selected, setSelected] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.url) {
      select(formData.url);
    }
  };

  return (
    <form onSubmit={onSubmit} className={$.InputContainer}>
      <input type="text" placeholder="Enter Manifest or Collection URL..." className={$.Input} name="url" id="url" />
    </form>
  );
}
