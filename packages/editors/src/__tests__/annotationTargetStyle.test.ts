import { Vault4 } from "@iiif/helpers/vault-4";
import { Editor } from "@manifest-editor/editor-api";
import { describe, expect, test } from "vitest";

const manifestRef = { id: "https://example.org/manifest", type: "Manifest" as const };
const canvasRef = { id: "https://example.org/canvas/1", type: "Canvas" as const };
const pageRef = { id: "https://example.org/canvas/1/page", type: "AnnotationPage" as const };
const annotationRef = { id: "https://example.org/annotation/1", type: "Annotation" as const };

function createVault() {
  const vault = new Vault4();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    ...manifestRef,
    label: { en: ["Test manifest"] },
    items: [
      {
        ...canvasRef,
        label: { en: ["Canvas 1"] },
        height: 1000,
        width: 1000,
        annotations: [
          {
            ...pageRef,
            items: [
              {
                ...annotationRef,
                motivation: "tagging",
                body: {
                  type: "TextualBody",
                  value: "<h2>Step</h2>",
                  format: "text/html",
                },
                target: {
                  type: "SpecificResource",
                  source: { id: canvasRef.id, type: "Canvas" },
                  selector: { type: "FragmentSelector", value: "xywh=10,20,300,400" },
                },
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

function getAnnotation(vault: Vault4) {
  return vault.get(annotationRef) as any;
}

describe("AnnotationTargetEditor styling", () => {
  test("setBorder writes a styleClass on the target and a CssStylesheet on the annotation", () => {
    const vault = createVault();
    const editor = new Editor(vault).edit(annotationRef);

    editor.annotation.target.setBorder("3px solid #121212");

    const styleClass = editor.annotation.target.getStyleClass();
    expect(styleClass).toBeTruthy();

    const annotation = getAnnotation(vault);
    expect(annotation.stylesheet).toEqual({
      type: "CssStylesheet",
      value: `.${styleClass}{border:3px solid #121212;}`,
    });

    expect(editor.annotation.target.getBoxStyle()).toEqual({
      border: "3px solid #121212",
    });
    expect(editor.annotation.target.getBorder()).toBe("3px solid #121212");
  });

  test("setBoxStyle merges properties and reuses the existing styleClass", () => {
    const vault = createVault();
    const editor = new Editor(vault).edit(annotationRef);

    editor.annotation.target.setBorder("3px solid #121212");
    const styleClass = editor.annotation.target.getStyleClass();

    editor.annotation.target.setBackgroundColor("#ffffff");

    // Same class is reused.
    expect(editor.annotation.target.getStyleClass()).toBe(styleClass);
    expect(editor.annotation.target.getBoxStyle()).toEqual({
      border: "3px solid #121212",
      backgroundColor: "#ffffff",
    });
  });

  test("clearing the border removes the styleClass and stylesheet when empty", () => {
    const vault = createVault();
    const editor = new Editor(vault).edit(annotationRef);

    editor.annotation.target.setBorder("3px solid #121212");
    expect(editor.annotation.target.getStyleClass()).toBeTruthy();

    editor.annotation.target.setBorder(undefined);

    expect(editor.annotation.target.getStyleClass()).toBeUndefined();
    expect(getAnnotation(vault).stylesheet).toBeNull();
    expect(editor.annotation.target.getBoxStyle()).toEqual({});
  });

  test("existing stylesheet rules for other classes are preserved", () => {
    const vault = createVault();
    // Seed the annotation with an unrelated stylesheet rule.
    vault.modifyEntityField(annotationRef, "stylesheet", {
      type: "CssStylesheet",
      value: ".other{background-color:#000000;}",
    });

    const editor = new Editor(vault).edit(annotationRef);
    editor.annotation.target.setBorder("3px solid #121212");
    const styleClass = editor.annotation.target.getStyleClass();

    const css = (getAnnotation(vault).stylesheet as any).value as string;
    expect(css).toContain(".other{background-color:#000000;}");
    expect(css).toContain(`.${styleClass}{border:3px solid #121212;}`);
  });
});
