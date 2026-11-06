import styled from "styled-components";
import { InfoIcon } from "./icons";

const Box = styled.aside`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 13px;
  line-height: 1.5;
  > svg {
    flex: none;
    margin-top: 1px;
    font-size: 20px;
    color: #2563eb;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 12px;
    margin: 0;
  }
  dt {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  dd {
    margin: 0;
  }
  kbd {
    padding: 0 6px;
    border: 1px solid #93c5fd;
    border-bottom-width: 2px;
    border-radius: 4px;
    background: #fff;
    color: #1e3a8a;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  p {
    margin: 10px 0 0;
    padding-top: 8px;
    border-top: 1px solid #bfdbfe;
    font-size: 12px;
    color: #1e40af;
  }
  a {
    color: inherit;
    text-decoration: underline;
  }
`;

const shortcuts: Array<[string[], string]> = [
  [["Space", "K"], "Play or pause"],
  [["←", "→"], "Seek 5 seconds"],
  [["J", "L"], "Seek 10 seconds"],
  [["M"], "Mute"],
  [["0–9"], "Jump to 0–90%"],
  [["[", "]"], "Previous or next section"],
  [["Ctrl/⌘ click"], "Select sibling sections to group"],
  [["Drag grip"], "Resize the bubbles"],
];

export function HelpBox() {
  return (
    <Box aria-label="Shortcuts and tips">
      <InfoIcon />
      <div>
        <h3>Shortcuts and tips</h3>
        <dl>
          {shortcuts.map(([keys, description]) => (
            <div key={description} style={{ display: "contents" }}>
              <dt>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <p>
          Saved with the manifest through Manifest Editor. Inspired by{" "}
          <a href="https://github.com/IUBLibTech/timeliner" target="_blank" rel="noreferrer">
            Variations Timeliner
          </a>
          .
        </p>
      </div>
    </Box>
  );
}
