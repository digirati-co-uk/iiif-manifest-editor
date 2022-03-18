import { StringSelector } from "../components/form/StringSelector";

export default {
  title: "Manifest Editor/StringSelect",
  component: StringSelector,
  args: {
    options: [],
    selected: [],
    changeHandler: (e: string) => alert(e),
  },
};

const Template: any = (props: any) => <StringSelector {...props} />;

export const ViewingDirectionNone = Template.bind({});
ViewingDirectionNone.args = {
  label: "Viewing direction, none selected",
  options: ["left to right", "right to left", "top to bottom", "bottom to top"],
  selected: [],
  mutli: false,
  guidanceReference: "https://iiif.io/api/presentation/3.0/#viewingdirection",
};

export const ViewingDirectionOne = Template.bind({});
ViewingDirectionOne.args = {
  label: "Viewing direction, one selected",
  options: ["left to right", "right to left", "top to bottom", "bottom to top"],
  selected: ["left to right"],
  multi: false,
  guidanceReference: "https://iiif.io/api/presentation/3.0/#viewingdirection",
};

export const MultiSelectExample = Template.bind({});
MultiSelectExample.args = {
  label: "Behavior properties",
  options: [
    "auto-advance",
    "no-auto-advance",
    "repeat",
    "no-repeat",
    "unordered",
    "individuals",
    "continuous",
    "paged",
    "multi-part",
    "together",
    "sequence",
    "thumbnail-nav",
    "no-nav",
    "hidden",
  ],
  selected: ["no-repeat", "paged", "hidden"],
  multi: true,
  guidanceReference: "https://iiif.io/api/presentation/3.0/#behavior",
};
