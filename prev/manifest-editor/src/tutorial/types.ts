interface BaseStep {
  label: string;
  description?: string;
  complete?: boolean;
  validator: () => boolean;
}

interface AddResourceStep extends BaseStep {
  type: "add-resource";
  resourceType: string;
}

interface SelectResource extends BaseStep {
  type: "select-resource";
  resourceType: string;
}

interface EditResource extends BaseStep {
  type: "edit-resource";
  resourceType: string;
  editor?: string;
}

interface CustomAction extends BaseStep {
  type: "custom";
}

interface Tutorial {
  actions: BaseStep[];
}
