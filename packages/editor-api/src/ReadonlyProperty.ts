import { BasePropertyEditor } from "./BasePropertyEditor";

export class ReadonlyProperty<T, Prop> extends BasePropertyEditor<T, Prop> {
  set() {
    throw new Error("Read only");
  }
}
