import { createContext, Dispatch, FormEvent, ReactNode, SetStateAction, useContext, useMemo, useState } from "react";
import { StoreApi } from "zustand/vanilla";
import invariant from "tiny-invariant";
import liveSearch from "../icons/live-search.svg";

interface FilterContextType {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function useFilter() {
  const ctx = useContext(FilterContext);
  invariant(ctx);
  return ctx;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState("");

  return (
    <FilterContext.Provider value={useMemo(() => ({ value: filter, setValue: setFilter }), [filter])}>
      {children}
    </FilterContext.Provider>
  );
}

export function ItemFilter({ open }: { open: boolean }) {
  const { value, setValue } = useFilter();
  const [isForm, setIsForm] = useState(false);

  const onSubmit = (e: FormEvent) => {
    const form = e.target as HTMLFormElement;
    // Prevent default.
    e.preventDefault();

    const data = new FormData(form);
    const object = Object.fromEntries(data.entries()) as { value: string };
    setValue(object.value);
  };

  if (!open) {
    return null;
  }

  const form = isForm ? (
    <form onSubmit={onSubmit}>
      <input type="text" disabled={!open} name="value" />
    </form>
  ) : (
    <div>
      <input type="text" disabled={!open} value={value} onChange={(e) => setValue(e.currentTarget.value)} />
    </div>
  );

  return (
    <div>
      {form}

      <button onClick={() => setIsForm((e) => !e)}>
        <img src={liveSearch} alt="" /> {!isForm ? "live on" : "live off"}
      </button>
    </div>
  );
}
