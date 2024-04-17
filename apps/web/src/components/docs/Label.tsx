export function Label({ text, theme = "default" }: { text: string; theme?: "default" | "primary" }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-1.5 align-middle font-medium leading-4 tracking-wide [font-size:10px] ${
        theme === "default"
          ? "border border-slate-400/70 text-slate-500 dark:border-slate-600 dark:text-slate-400"
          : "border border-blue-300 text-blue-400 dark:border-blue-800 dark:text-blue-600"
      }`}
    >
      {text}
    </span>
  );
}
