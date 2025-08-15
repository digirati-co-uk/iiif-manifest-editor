import { ActionButton } from "@manifest-editor/components";
import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useCurrentAnnotationActions } from "react-iiif-vault";
import { ModalCloseIcon } from "../../../ui/madoc/components/Modal";

export function AnnotationCreationPopup() {
  const { cancelRequest, saveAnnotation } = useCurrentAnnotationActions();

  return (
    <div className="bg-white rounded shadow-xl w-[420px]">
      <div className="flex items-center p-1 gap-2">
        <div className="flex-1 px-2">New annotation</div>

        {/*<div>Color</div>*/}
        <div>
          <ActionButton>Edit target</ActionButton>
        </div>
        <Button onPress={() => cancelRequest()} className="bg-white hover:bg-gray-100 p-1 rounded-sm">
          <ModalCloseIcon className="text-2xl" />
        </Button>
      </div>

      <Tabs>
        <TabList className="flex gap-2 border-b p-1 bg-gray-100">
          <Tab className="aria-[selected=true]:white p-1 text-sm rounded-sm" id="html">
            HTML
          </Tab>
          <Tab className="aria-[selected=true]:white p-1 text-sm rounded-sm" id="text">
            Text
          </Tab>
          <Tab className="aria-[selected=true]:white p-1 text-sm rounded-sm" id="tagging">
            Tagging
          </Tab>
          <Tab className="aria-[selected=true]:white p-1 text-sm rounded-sm" id="image">
            Image
          </Tab>
        </TabList>
        <TabPanel id="html" className="p-4">
          <p>HTML testing</p>
          <p>HTML testing</p>
          <p>HTML testing</p>
          <p>HTML testing</p>
        </TabPanel>

        <TabPanel id="text" className="p-4">
          <p>Text testing</p>
          <p>Text testing</p>
          <p>Text testing</p>
          <p>Text testing</p>
        </TabPanel>

        <TabPanel id="tagging" className="p-4">
          <p>Tagging testing</p>
          <p>Tagging testing</p>
          <p>Tagging testing</p>
          <p>Tagging testing</p>
        </TabPanel>

        <TabPanel id="image" className="p-4">
          <p>Image testing</p>
          <p>Image testing</p>
          <p>Image testing</p>
          <p>Image testing</p>
        </TabPanel>
      </Tabs>

      <div className="flex gap-2 p-2">
        <ActionButton onPress={() => saveAnnotation()} primary>
          Add annotation
        </ActionButton>
      </div>
    </div>
  );
}
