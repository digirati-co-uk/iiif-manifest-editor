/**
 * IIIF Presentation API version 3.0
 *
 * Everything in this file is adapted from this specification: https://iiif.io/api/presentation/3.0/
 * Summaries are provided by this specification.
 *
 * Editors of the specification:
 *
 *   Michael Appleby, Yale University
 *   Tom Crane, Digirati
 *   Robert Sanderson, J. Paul Getty Trust
 *   Jon Stroop, Princeton University Library
 *   Simeon Warner, Cornell University
 *
 * Copyright © 2012-2023 Editors and contributors. Published by the IIIF Consortium under the CC-BY license.
 */

import {
  DescriptiveProperties,
  LinkingProperties,
  StructuralProperties,
  TechnicalProperties,
} from "@iiif/presentation-3";

type DocDefinition = {
  link: string;
  summary: string;
};

const root = `https://iiif.io/api/presentation/3.0/`;

const definedTypes: Record<string, DocDefinition> = {
  Collection: {
    link: `${root}#overview-collection`,
    summary: `An ordered list of Manifests, and/or further Collections. Collections allow Manifests and child Collections to be grouped in a hierarchical structure for presentation, which can be for generating navigation, showing dynamic results from a search, or providing fixed sets of related resources for any other purpose.`,
  },
  Manifest: {
    link: `${root}#overview-manifest`,
    summary: `A description of the structure and properties of the compound object. It carries information needed for the client to present the content to the user, such as a title and other descriptive information about the object or the intellectual work that it conveys. Each Manifest usually describes how to present a single compound object such as a book, a statue or a music album.`,
  },
  Canvas: {
    link: `${root}#overview-canvas`,
    summary: `A virtual container that represents a particular view of the object and has content resources associated with it or with parts of it. The Canvas provides a frame of reference for the layout of the content, both spatially and temporally. The concept of a Canvas is borrowed from standards like PDF and HTML, or applications like Photoshop and PowerPoint, where an initially blank display surface has images, video, text and other content “painted” on to it by Annotations, collected in Annotation Pages.`,
  },
  Range: {
    link: `${root}#overview-range`,
    summary: `An ordered list of Canvases, and/or further Ranges. Ranges allow Canvases, or parts thereof, to be grouped together in some way. This could be for content-based reasons, such as might be described in a table of contents or the set of scenes in a play. Equally, physical features might be important such as page gatherings in an early book, or when recorded music is split across different physical carriers such as two CDs.`,
  },
  AnnotationPage: {
    link: `${root}#overview-annotationpage`,
    summary: `An ordered list of Annotations that is typically associated with a Canvas but may be referenced from other types of resource as well. Annotation Pages collect and order lists of Annotations, which in turn provide commentary about a resource or content that is part of a Canvas.`,
  },
  Annotation: {
    link: `${root}#overview-annotation`,
    summary: `Annotations associate content resources with Canvases. The same mechanism is used for the visible and/or audible resources as is used for transcriptions, commentary, tags and other content. This provides a single, unified method for aligning information, and provides a standards-based framework for distinguishing parts of resources and parts of Canvases. As Annotations can be added later, it promotes a distributed system in which publishers can align their content with the descriptions created by others. Annotation related functionality may also rely on further classes such as SpecificResource, Choice or Selectors.`,
  },
  ContentResource: {
    link: `${root}#overview-content`,
    summary: `Web resources such as images, audio, video, or text which are associated with a Canvas via an Annotation, or provide a representation of any resource.`,
  },
  AnnotationCollection: {
    link: `${root}#overview-annotationcollection`,
    summary: `An ordered list of Annotation Pages. Annotation Collections allow higher level groupings of Annotations to be recorded. For example, all of the English translation Annotations of a medieval French document could be kept separate from the transcription or an edition in modern French, or the director’s commentary on a film can be separated from the script.`,
  },
};

const descriptive: Record<keyof DescriptiveProperties, DocDefinition> = {
  label: {
    link: `${root}#label`,
    summary: `A human readable label, name or title. The label property is intended to be displayed as a short, textual surrogate for the resource if a human needs to make a distinction between it and similar resources, for example between objects, pages, or options for a choice of images to display. The label property can be fully internationalized, and each language can have multiple values.`,
  },
  metadata: {
    link: `${root}#metadata`,
    summary: `An ordered list of descriptions to be displayed to the user when they interact with the resource, given as pairs of human readable label and value entries. The content of these entries is intended for presentation only; descriptive semantics should not be inferred. An entry might be used to convey information about the creation of the object, a physical description, ownership information, or other purposes.`,
  },
  summary: {
    link: `${root}#summary`,
    summary: `A short textual summary intended to be conveyed to the user when the metadata entries for the resource are not being displayed. This could be used as a brief description for item level search results, for small-screen environments, or as an alternative user interface when the metadata property is not currently being rendered. The summary property follows the same pattern as the label property described above.`,
  },
  requiredStatement: {
    link: `${root}#requiredstatement`,
    summary: `Text that must be displayed when the resource is displayed or used. For example, the requiredStatement property could be used to present copyright or ownership statements, an acknowledgement of the owning and/or publishing institution, or any other text that the publishing organization deems critical to display to the user. Given the wide variation of potential client user interfaces, it will not always be possible to display this statement to the user in the client’s initial state. If initially hidden, clients must make the method of revealing it as obvious as possible.`,
  },
  rights: {
    link: `${root}#rights`,
    summary: `A string that identifies a license or rights statement that applies to the content of the resource, such as the JSON of a Manifest or the pixels of an image. The value must be drawn from the set of Creative Commons license URIs, the RightsStatements.org rights statement URIs, or those added via the extension mechanism. The inclusion of this property is informative, and for example could be used to display an icon representing the rights assertions.`,
  },
  provider: {
    link: `${root}#provider`,
    summary: `An organization or person that contributed to providing the content of the resource. Clients can then display this information to the user to acknowledge the provider's contributions. This differs from the requiredStatement property, in that the data is structured, allowing the client to do more than just present text but instead have richer information about the people and organizations to use in different interfaces.`,
  },
  thumbnail: {
    link: `${root}#thumbnail`,
    summary: `A content resource, such as a small image or short audio clip, that represents the resource that has the thumbnail property. A resource may have multiple thumbnail resources that have the same or different type and format.`,
  },
  navDate: {
    link: `${root}#navdate`,
    summary: `A date that clients may use for navigation purposes when presenting the resource to the user in a date-based user interface, such as a calendar or timeline. More descriptive date ranges, intended for display directly to the user, should be included in the metadata property for human consumption. If the resource contains Canvases that have the duration property, the datetime given corresponds to the navigation datetime of the start of the resource. For example, a Range that includes a Canvas that represents a set of video content recording a historical event, the navDate is the datetime of the first moment of the recorded event.`,
  },
  placeholderCanvas: {
    link: `${root}#placeholdercanvas`,
    summary: `A single Canvas that provides additional content for use before the main content of the resource that has the placeholderCanvas property is rendered, or as an advertisement or stand-in for that content. Examples include images, text and sound standing in for video content before the user initiates playback; or a film poster to attract user attention. The content provided by placeholderCanvas differs from a thumbnail: a client might use thumbnail to summarize and navigate multiple resources, then show content from placeholderCanvas as part of the initial presentation of a single resource. A placeholder Canvas is likely to have different dimensions to those of the Canvas(es) of the resource that has the placeholderCanvas property.`,
  },
  accompanyingCanvas: {
    link: `${root}#accompanyingcanvas`,
    summary: `A single Canvas that provides additional content for use while rendering the resource that has the accompanyingCanvas property. Examples include an image to show while a duration-only Canvas is playing audio; or background audio to play while a user is navigating an image-only Manifest.`,
  },
  language: {
    link: `${root}#language`,
    summary: `The language or languages used in the content of this external resource. This property is already available from the Web Annotation model for content resources that are the body or target of an Annotation, however it may also be used for resources referenced from homepage, rendering, and partOf.`,
  },
};

const technical: Record<keyof TechnicalProperties, DocDefinition> = {
  id: {
    link: `${root}#id`,
    summary: `The URI that identifies the resource. If the resource is only available embedded within another resource, such as a Range within a Manifest, then the URI may be the URI of the embedding resource with a unique fragment on the end. This is not true for Canvases, which must have their own URI without a fragment.`,
  },
  type: {
    link: `${root}#type`,
    summary: `The type or class of the resource. For classes defined for this specification`,
  },
  format: {
    link: `${root}#format`,
    summary: `The specific media type (often called a MIME type) for a content resource, for example image/jpeg. This is important for distinguishing different formats of the same overall type of resource, such as distinguishing text in XML from plain text.`,
  },
  profile: {
    link: `${root}#profile`,
    summary: `A schema or named set of functionality available from the resource. The profile can further clarify the type and/or format of an external resource or service, allowing clients to customize their handling of the resource that has the profile property.`,
  },
  height: {
    link: `${root}#height`,
    summary: `The height of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the width, it conveys an aspect ratio for the space in which content resources are located.`,
  },
  width: {
    link: `${root}#width`,
    summary: `The width of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the height, it conveys an aspect ratio for the space in which content resources are located.`,
  },
  duration: {
    link: `${root}#duration`,
    summary: `The duration of the Canvas or external content resource, given in seconds.`,
  },
  viewingDirection: {
    link: `${root}#viewingdirection`,
    summary: `The direction in which a set of Canvases should be displayed to the user. This specification defines four direction values in the table below. Others may be defined externally as an extension.`,
  },
  behavior: {
    link: `${root}#behavior`,
    summary: `A set of user experience features that the publisher of the content would prefer the client to use when presenting the resource. This specification defines the values in the table below. Others may be defined externally as an extension.`,
  },
  timeMode: {
    link: `${root}#timemode`,
    summary: `A mode associated with an Annotation that is to be applied to the rendering of any time-based media, or otherwise could be considered to have a duration, used as a body resource of that Annotation. Note that the association of timeMode with the Annotation means that different resources in the body cannot have different values. This specification defines the values specified in the table below. Others may be defined externally as an extension.`,
  },
  motivation: {
    link: `${root}#values-for-motivation`,
    summary: `This specification defines two values for the Web Annotation property of motivation, or purpose when used on a Specific Resource or Textual Body. Resources associated with a Canvas by an Annotation that has the motivation value "painting" must be presented to the user as the representation of the Canvas. Resources associated with a Canvas by an Annotation that has the motivation value supplementing may be presented to the user as part of the representation of the Canvas, or may be presented in a different part of the user interface.`,
  },
};

const linking: Record<keyof LinkingProperties, DocDefinition> = {
  // External
  homepage: {
    link: `${root}#homepage`,
    summary: `A web page that is about the object represented by the resource that has the homepage property. The web page is usually published by the organization responsible for the object, and might be generated by a content management system or other cataloging system. The resource must be able to be displayed directly to the user. Resources that are related, but not home pages, must instead be added into the metadata property, with an appropriate label or value to describe the relationship.`,
  },
  logo: {
    link: `${root}#logo`,
    summary: `A small image resource that represents the Agent resource it is associated with. The logo must be clearly rendered when the resource is displayed or used, without cropping, rotating or otherwise distorting the image. It is recommended that a IIIF Image API service be available for this image for other manipulations such as resizing.`,
  },
  rendering: {
    link: `${root}#rendering`,
    summary: `A resource that is an alternative, non-IIIF representation of the resource that has the rendering property. Such representations typically cannot be painted onto a single Canvas, as they either include too many views, have incompatible dimensions, or are compound resources requiring additional rendering functionality. The rendering resource must be able to be displayed directly to a human user, although the presentation may be outside of the IIIF client. The resource must not have a splash page or other interstitial resource that mediates access to it. If access control is required, then the IIIF Authentication API is recommended. Examples include a rendering of a book as a PDF or EPUB, a slide deck with images of a building, or a 3D model of a statue.`,
  },
  service: {
    link: `${root}#service`,
    summary: `A service that the client might interact with directly and gain additional information or functionality for using the resource that has the service property, such as from an Image to the base URI of an associated IIIF Image API service. The service resource should have additional information associated with it in order to allow the client to determine how to make appropriate use of it. Please see the Service Registry document for the details of currently known service types.`,
  },
  services: {
    link: `${root}#services`,
    summary: `A list of one or more service definitions on the top-most resource of the document, that are typically shared by more than one subsequent resource. This allows for these shared services to be collected together in a single place, rather than either having their information duplicated potentially many times throughout the document, or requiring a consuming client to traverse the entire document structure to find the information. The resource that the service applies to must still have the service property, as described above, where the service resources have at least the id and type or @id and @type properties. This allows the client to know that the service applies to that resource. Usage of the services property is at the discretion of the publishing system.`,
  },
  seeAlso: {
    link: `${root}#seealso`,
    summary: `A machine-readable resource such as an XML or RDF description that is related to the current resource that has the seeAlso property. Properties of the resource should be given to help the client select between multiple descriptions (if provided), and to make appropriate use of the document. If the relationship between the resource and the document needs to be more specific, then the document should include that relationship rather than the IIIF resource. Other IIIF resources are also valid targets for seeAlso, for example to link to a Manifest that describes a related object. The URI of the document must identify a single representation of the data in a particular format. For example, if the same data exists in JSON and XML, then separate resources should be added for each representation, with distinct id and format properties.`,
  },
  // Internal
  partOf: {
    link: `${root}#partof`,
    summary: `A containing resource that includes the resource that has the partOf property. When a client encounters the partOf property, it might retrieve the referenced containing resource, if it is not embedded in the current representation, in order to contribute to the processing of the contained resource. For example, the partOf property on a Canvas can be used to reference an external Manifest in order to enable the discovery of further relevant information. Similarly, a Manifest can reference a containing Collection using partOf to aid in navigation.`,
  },
  start: {
    link: `${root}#start`,
    summary: `A Canvas, or part of a Canvas, which the client should show on initialization for the resource that has the start property. The reference to part of a Canvas is handled in the same way that Ranges reference parts of Canvases. This property allows the client to begin with the first Canvas that contains interesting content rather than requiring the user to manually navigate to find it.`,
  },
  supplementary: {
    link: `${root}#supplementary`,
    summary: `A link from this Range to an Annotation Collection that includes the supplementing Annotations of content resources for the Range. Clients might use this to present additional content to the user from a different Canvas when interacting with the Range, or to jump to the next part of the Range within the same Canvas. For example, the Range might represent a newspaper article that spans non-sequential pages, and then uses the supplementary property to reference an Annotation Collection that consists of the Annotations that record the text, split into Annotation Pages per newspaper page. Alternatively, the Range might represent the parts of a manuscript that have been transcribed or translated, when there are other parts that have yet to be worked on. The Annotation Collection would be the Annotations that transcribe or translate, respectively.`,
  },
};

const structural: Record<keyof StructuralProperties<unknown>, DocDefinition> = {
  items: {
    link: `${root}#items`,
    summary: `Much of the functionality of the IIIF Presentation API is simply recording the order in which child resources occur within a parent resource, such as Collections or Manifests within a parent Collection, or Canvases within a Manifest. All of these situations are covered with a single property, items.`,
  },
  structures: {
    link: `${root}#structures`,
    summary: `The structure of an object represented as a Manifest can be described using a hierarchy of Ranges. Ranges can be used to describe the “table of contents” of the object or other structures that the user can interact with beyond the order given by the items property of the Manifest. The hierarchy is built by nesting the child Range resources in the items array of the higher level Range. The top level Ranges of these hierarchies are given in the structures property.`,
  },
  annotations: {
    link: `${root}#annotations`,
    summary: `An ordered list of Annotation Pages that contain commentary or other Annotations about this resource, separate from the Annotations that are used to paint content on to a Canvas. The motivation of the Annotations must not be painting, and the target of the Annotations must include this resource or part of it.`,
  },
};

export const documentation = {
  attribution: `Copyright © 2012-2023 Editors and contributors. Published by the IIIF Consortium under the CC-BY license, see disclaimer.`,
  disclaimer: `https://iiif.io/api/annex/notes/disclaimer/`,
  license: "https://creativecommons.org/licenses/by/4.0/",
  version: "3.0",
  definedTypes,
  descriptive,
  structural,
  technical,
  linking,
  root,
};
