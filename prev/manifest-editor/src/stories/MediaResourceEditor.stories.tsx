import * as React from "react";
import { MediaResourceEditor } from "../editors/MediaResourceEditor";

export default {
  title: "Form/Media Resource Editor",
  component: MediaResourceEditor,
};

const Template: any = (props: any) => <MediaResourceEditor {...props} />;

export const MediaResourceEditorEmpty = Template.bind({});
MediaResourceEditorEmpty.args = {
  thumbnailSrc: "https://iiif.wellcomecollection.org/thumbs/b28658401_0005.jp2/full/58,100/0/default.jpg",
};
