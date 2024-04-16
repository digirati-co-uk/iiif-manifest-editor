import $ from "../styles/ComboButton.module.css";
import _useDropdownMenu from "react-accessible-dropdown-menu-hook";

// @ts-ignore
const useDropdownMenu = _useDropdownMenu.default ?? _useDropdownMenu;

export interface ComboButtonProps {
  disabled?: boolean;
  actions: Array<{ label: string; action: () => void }>;
}

export function ComboButton(props: ComboButtonProps) {
  const [first, ...otherOptions] = props.actions || [];
  const { isOpen, buttonProps, itemProps, setIsOpen, moveFocus } = useDropdownMenu(otherOptions.length);

  if (!first) return null;

  return (
    <div className={$.ComboButtonContainer}>
      <button
        className={$.ComboButtonMain}
        disabled={props.disabled}
        data-only={otherOptions.length === 0 || props.disabled}
        onClick={first.action}
      >
        {first.label}
      </button>
      {!props.disabled && otherOptions.length ? (
        <>
          <span
            className={$.ComboButtonChoice}
            {...buttonProps}
            aria-haspopup="true"
            aria-expanded={isOpen}
            title="Open for more actions"
          >
            <svg viewBox="0 0 20 20">
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                stroke="#fff"
              />
            </svg>
            <ul className={$.ComboButtonOverlay} data-open={isOpen}>
              {otherOptions.map((option, k) => (
                <li key={k} className={$.ComboButtonOption}>
                  <a className={$.ComboButtonOptionButton} onClick={option.action} {...itemProps[k]}>
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </span>
        </>
      ) : null}
    </div>
  );
}
