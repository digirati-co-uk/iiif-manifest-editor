import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";

export class NavDateEditor<T> extends BasePropertyEditor<T, string | null> {
  constructor(config: EditorConfig) {
    super(config, "navDate");
  }

  setDate(date: Date | null) {
    if (!date) {
      this.set(null);
      return;
    }
    this.set(date.toISOString());
  }

  getDate() {
    const date = this.get();
    if (date) {
      return new Date(date);
    }
    return null;
  }

  modifyAsDate(fn: (date: Date) => void) {
    const date = this.getWithoutTracking();
    const dateTime = date ? new Date(date) : new Date();

    fn(dateTime);

    this.setDate(dateTime);
  }
}
