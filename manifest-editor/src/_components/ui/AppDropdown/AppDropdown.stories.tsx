import { AppDropdown } from "./AppDropdown";

export default { title: "App Dropdown" };

export const Default = () => (
  <AppDropdown
    items={[
      //
      { label: "Open tray", onClick: () => console.log("a"), hotkey: "⌘ E" },
      { label: "Publish...", onClick: () => console.log("a"), hotkey: "⌘ P" },
      { label: "Single language mode", onClick: () => console.log("a") },
      { label: "Project settings", onClick: () => console.log("a") },
      { label: "Settings", onClick: () => console.log("⌘ ,") },
      //
      {
        sectionAbove: { label: "Actions", divider: true },
        label: "Generate canvas labels...",
        action: () => {
          console.log("action");
        },
      },
      {
        label: "Run local OCR",
        action: () => {
          console.log("action");
        },
      },
      {
        label: "Run remote OCR",
        isRunning: true,
        actionLink: () => console.log("view"),
        action: () => {
          console.log("action");
        },
      },
    ]}
  />
);
