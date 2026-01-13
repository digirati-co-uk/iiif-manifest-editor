import type {
  AllAvailableParentTypes,
  AllParentTypes,
  AllProperties,
  CreatorContext,
  CreatorDefinition,
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
  const SupportsParentTypes extends
    Array<AllAvailableParentTypes> = AllParentTypes,
  const SupportsParentFields extends Array<AllProperties> = [],
  const CreateReturnType = any,
>(
  options: SpecificCreatorDefinition<
    Payload,
    ID,
    ResourceType,
    AdditionalResourceTypes,
    AllResourceTypes,
    SupportsParentTypes,
    SupportsParentFields,
    CreateReturnType
  >,
) {
  return options;
}

export function withInitialData<T extends CreatorDefinition>(
  creator: T,
  data: Record<string, any>,
  overrides: Record<string, any> = {},
): T {
  const render = creator.render
    ? (ctx: CreatorContext<any>) => {
        const newContext: CreatorContext = {
          ...ctx,
          options: {
            ...(ctx.options || {}),
            initialData: {
              ...(data || {}),
              ...(ctx.options?.initialData || {}),
              ...(overrides || {}),
            },
          },
        };
        return creator.render?.(newContext);
      }
    : undefined;

  return { ...creator, render } as T;
}

export function withCustomRender<T extends CreatorDefinition>(
  creator: T,
  render: (
    ctx: CreatorContext<any>,
    originalRender: (ctx: CreatorContext<any>) => React.ReactNode,
  ) => React.ReactNode,
): T {
  const newRender = (ctx: CreatorContext<any>) => {
    return render(ctx, creator.render as any);
  };

  return { ...creator, render: newRender } as T;
}

export declare namespace IIIFManifestEditor {
  // biome-ignore lint/suspicious/noEmptyInterface: Empty for global register.
  interface CreatorDefinitions {}
}

export type ExtractCreatorGenerics<T extends CreatorDefinition> =
  T extends SpecificCreatorDefinition<
    infer Payload,
    infer ID,
    infer ResourceType,
    infer AdditionalResourceTypes,
    infer AllResourceTypes,
    infer SupportsParentTypes,
    infer SupportsParentFields,
    infer CreateReturnType
  >
    ? {
        Payload: Payload;
        ID: ID;
        ResourceType: ResourceType;
        AdditionalResourceTypes: AdditionalResourceTypes;
        AllResourceTypes: AllResourceTypes;
        SupportsParentTypes: SupportsParentTypes;
        SupportsParentFields: SupportsParentFields;
        CreateReturnType: CreateReturnType;
      }
    : never;

type CreatorSupportsParentTypes<
  T,
  Type extends AllAvailableParentTypes,
> = T extends CreatorDefinition
  ? ExtractCreatorGenerics<T>["SupportsParentTypes"] extends never
    ? false
    : HelperInArray<Type, ExtractCreatorGenerics<T>["SupportsParentTypes"]>
  : false;

type CreatorSupportsParentFields<
  T,
  Field extends AllProperties,
> = T extends CreatorDefinition
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

type HelperInArray<
  ToFind,
  Array extends readonly any[],
> = Array extends readonly [infer Head, ...infer Tail]
  ? Head extends ToFind
    ? true
    : HelperInArray<ToFind, Tail>
  : false;

export type CreatorDefinitionFilterByParent<
  Type extends AllAvailableParentTypes,
  Field extends AllProperties = AllProperties,
  CD extends
    IIIFManifestEditor.CreatorDefinitions = IIIFManifestEditor.CreatorDefinitions,
> = {
  [K in keyof CD]: CreatorSupportsParent<CD[K], Type, Field> extends true
    ? CD[K]
    : never;
}[keyof CD];
