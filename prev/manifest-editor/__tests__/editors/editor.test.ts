import { EditorInstance } from "@/editor-api/EditorInstance";
import { Vault } from "@iiif/helpers/vault";

describe("Editor test", () => {
  test("basic test", async () => {
    const empty = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "/config/manifest-templates/with-provider.json",
      type: "Manifest",
      label: {
        en: [""],
      },
      items: [],
    };
    const vault = new Vault();
    await vault.loadManifest(empty.id, empty);

    const { observe, descriptive } = new EditorInstance({
      reference: { id: empty.id, type: "Manifest" },
      vault,
    });

    let counter = 0;

    const stop = observe.start(() => {
      // Simulates react rendering. This would go into an effect.
      counter++;
    });

    expect(descriptive.label.get()).toEqual({ en: [""] });
    descriptive.label.set({ en: ["A new label"] });
    expect(descriptive.label.get()).toEqual({ en: ["A new label"] });

    descriptive.summary.set({ en: ["A summary"] });

    // Should only observe label (since we called .get()).
    expect(counter).toEqual(1);

    expect(descriptive.summary.get()).toEqual({ en: ["A summary"] });
    descriptive.summary.set({ en: ["A summary 2"] });

    // No we are listening to summary, it updates as expected.
    expect(counter).toEqual(2);

    stop();
  });
});
