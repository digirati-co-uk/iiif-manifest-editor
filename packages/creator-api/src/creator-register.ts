// types and helpers for the creator register.

import type { InternationalString } from "@iiif/presentation-3";
import type {
  AllAvailableParentTypes,
  AllParentTypes,
  AllProperties,
  CreatorDefinition,
  GetSupportedResourceFields,
  SpecificCreatorDefinition,
} from "./types";

// Want to enable the following APIs.
//
// const createImage = useCreator(
//   resource,
//   "thumbnail",
//   "@manifest-editor/image-url-creator"
// );
//
// createImage({ url: 'https://example.org/image.jpg' });
//
// These should be constructed from an array of creators.
// UseCreator<Resource, ResourceField, CreatorId> -> CreatorPayload
//
// But then also:
// await manifestEditor.descriptive.thumbnail.create("@manifest-editor/image-url-creator", {
//   url: "https://example.org/image.jpg",
// });
//
// So essentially, I think we want to create a type that is roughly structured like this:
// {
//   Manifest: {
//      thumbnail: {
//        "@manifest-editor/image-url-creator": {
//          url: string;
//        }
//      }
//   }
// }
// Although it would include _all_ available creators.
// Then the helpers would be fairly easy to implement.
//
// Here the creator definition (might need to change) for this:

export function defineCreator<
  const Payload = any,
  const ID = Readonly<string>,
  const ResourceType extends AllAvailableParentTypes = never,
  const AdditionalResourceTypes extends Array<AllAvailableParentTypes> = [],
  const AllResourceTypes = [ResourceType, ...AdditionalResourceTypes],
  const SupportsParentTypes extends Array<AllAvailableParentTypes> = AllParentTypes,
  const SupportsParentFields extends Array<AllProperties> = [],
>(
  options: SpecificCreatorDefinition<
    Payload,
    ID,
    ResourceType,
    AdditionalResourceTypes,
    AllResourceTypes,
    SupportsParentTypes,
    SupportsParentFields
  >,
) {
  return options;
}

export declare namespace IIIFManifestEditor {
  // biome-ignore lint/suspicious/noEmptyInterface: Empty for global register.
  interface CreatorDefinitions {}
}

export type ExtractCreatorGenerics<T extends CreatorDefinition> = T extends SpecificCreatorDefinition<
  infer Payload,
  infer ID,
  infer ResourceType,
  infer AdditionalResourceTypes,
  infer AllResourceTypes,
  infer SupportsParentTypes,
  infer SupportsParentFields
>
  ? {
      Payload: Payload;
      ID: ID;
      ResourceType: ResourceType;
      AdditionalResourceTypes: AdditionalResourceTypes;
      AllResourceTypes: AllResourceTypes;
      SupportsParentTypes: SupportsParentTypes;
      SupportsParentFields: SupportsParentFields;
    }
  : never;

type CreatorSupportsParentTypes<T, Type extends AllAvailableParentTypes> = T extends CreatorDefinition
  ? ExtractCreatorGenerics<T>["SupportsParentTypes"] extends never
    ? false
    : HelperInArray<Type, ExtractCreatorGenerics<T>["SupportsParentTypes"]>
  : false;

type CreatorSupportsParentFields<T, Field extends AllProperties> = T extends CreatorDefinition
  ? ExtractCreatorGenerics<T>["SupportsParentFields"] extends never
    ? false
    : HelperInArray<Field, ExtractCreatorGenerics<T>["SupportsParentFields"]>
  : false;

type CreatorSupportsParent<
  T,
  Type extends AllAvailableParentTypes,
  Field extends AllProperties,
> = T extends CreatorDefinition
  ? CreatorSupportsParentTypes<T, Type> extends true
    ? CreatorSupportsParentFields<T, Field> extends true
      ? true
      : false
    : false
  : false;

type HelperInArray<ToFind, Array extends readonly any[]> = Array extends readonly [infer Head, ...infer Tail]
  ? Head extends ToFind
    ? true
    : HelperInArray<ToFind, Tail>
  : false;

// type HelperInArray_test = HelperInArray<"ContentResource", ["ContentResource", "Manifest"]>;

// type SupportsManifest = CreatorSupportsParentResourceType<typeof imageUrlCreator, "ContentResource">;

// type FilterCreatorsByParentType<
//   Creators extends Record<any, CreatorDefinition>,
//   Type extends AllAvailableParentTypes,
// > = {
//   [K in keyof Creators as keyof Creators]: CreatorSupportsParentResourceType<Creators[K], Type> extends true
//     ? Creators[K]["id"]
//     : never;
// }[keyof Creators];

// type RecordToArray<Rec extends Record<any, any>> = {
//   [K in keyof Rec]: Rec[K];
// }[keyof Rec][];

// type Values<T> = T[keyof T];
// type CreatorDefinitionsArray = Array<Values<IIIFManifestEditor.CreatorDefinitions>>;

// type AllIds = CreatorDefinitionsArray[number]["id"];

export type CreatorDefinitionFilterByParent<
  Type extends AllAvailableParentTypes,
  Field extends AllProperties = AllProperties,
  CD extends IIIFManifestEditor.CreatorDefinitions = IIIFManifestEditor.CreatorDefinitions,
> = {
  [K in keyof CD]: CreatorSupportsParent<CD[K], Type, Field> extends true ? CD[K] : never;
}[keyof CD];

// type FilterCreatorsByParentType2<
//   Creators extends Array<CreatorDefinition>,
//   Type extends AllAvailableParentTypes,
//   ReturnType extends Array<CreatorDefinition> = [],
// > = Creators extends [infer Head extends CreatorDefinition, ...infer Tail extends Array<CreatorDefinition>]
//   ? CreatorSupportsParentResourceType<Head, Type> extends true
//     ? FilterCreatorsByParentType2<Tail, Type, [...ReturnType, Head]>
//     : ReturnType
//   : ReturnType;

// type FirstCreator<
//   Creators extends Array<CreatorDefinition>,
//   Type extends AllAvailableParentTypes,
//   ReturnType extends Array<CreatorDefinition> = [],
// > = Creators extends [infer Head, ...infer Tail] ? Head : never;

// type t2 = FilterCreatorsByParentType2<CreatorDefinitionsArray, "ContentResource">;

// type t1 = typeof imageUrlCreator.additionalTypes;

// // No we want functions that use the register.
export function exampleFunction<
  const ResourceType extends AllAvailableParentTypes,
  const ResourceField extends GetSupportedResourceFields<ResourceType>,
  const CID extends CreatorDefinitionFilterByParent<ResourceType, ResourceField>["id"],
>(
  resourceType: ResourceType,
  resourceField: ResourceField,
  creator: CID,
): (args: ExtractCreatorGenerics<IIIFManifestEditor.CreatorDefinitions[CID]>["Payload"]) => void {
  // Implementation here
  //
  return () => {};
}
