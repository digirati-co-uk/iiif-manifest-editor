import { formatTime } from "../av-ranges/temporal-range-utils";

/** A time such as 01:23.456 with the milliseconds toned down, so the readable part stands out. */
export function TimeText({ value }: { value: number }) {
  const text = formatTime(value);
  const dot = text.lastIndexOf(".");
  return (
    <>
      {text.slice(0, dot)}
      <span data-ms="" style={{ opacity: 0.55 }}>
        {text.slice(dot)}
      </span>
    </>
  );
}
