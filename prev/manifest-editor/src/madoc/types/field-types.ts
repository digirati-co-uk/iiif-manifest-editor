import { BaseProperty } from './base-property';

export interface BaseField extends BaseProperty {
  id: string;
  type: Exclude<string, 'entity'>;
  value: any;
}

