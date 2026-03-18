import { memo, useCallback, useRef, useState } from "react";

function PromptInputInner(props: {
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasText = value.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const text = value.trim();
    if (!text || props.disabled) {
      return;
    }
    props.onSubmit(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, props.disabled, props.onSubmit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    const el = event.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  return (
    <form
      className="shrink-0 border-t border-me-gray-300 bg-white p-2"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="overflow-hidden rounded-lg border border-me-gray-300 bg-me-gray-100 transition-colors focus-within:border-me-primary-500 focus-within:bg-white">
        <textarea
          ref={textareaRef}
          rows={2}
          value={value}
          disabled={props.disabled}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask the assistant…"
          className="block w-full min-h-[48px] max-h-[160px] resize-none bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-me-gray-900 outline-none placeholder:text-me-gray-500"
        />
        <div className="flex items-center justify-end gap-1 px-1.5 pb-1.5">
          {props.isStreaming && props.onStop ? (
            <button
              type="button"
              onClick={props.onStop}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-me-gray-700 text-white transition-colors hover:bg-me-gray-900"
              title="Stop generating"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
              </svg>
            </button>
          ) : null}
          <button
            type="submit"
            disabled={props.disabled || !hasText}
            className={[
              "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
              hasText && !props.disabled
                ? "bg-me-primary-500 text-white hover:bg-me-primary-600"
                : "bg-me-gray-300 text-me-gray-500 cursor-not-allowed",
            ].join(" ")}
            title="Send message"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2.5V11.5M7 2.5L3 6.5M7 2.5L11 6.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}

export const PromptInput = memo(PromptInputInner);
