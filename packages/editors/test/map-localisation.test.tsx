import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import * as L from "leaflet";
import "leaflet-draw";
import { FeatureGroup, MapContainer, useMap } from "react-leaflet";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { EditControl } from "../src/definitions/NavPlaceEditor/EditControl";
import { createMapLocalisation } from "../src/definitions/NavPlaceEditor/map-localisation";

const require = createRequire(import.meta.url);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const disposals: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const dispose of disposals.splice(0).reverse()) await dispose();
});
function runtime(locale = "nl") {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
    config: { defaultLocale: locale },
  });
}
beforeAll(() => {
  // JSDOM has no SVG layout engine. Supply only the primitive feature/layout checks
  // used by Leaflet; the actual renderer, controls, handlers and events run unchanged.
  Object.defineProperty(L.Browser, "svg", { configurable: true, value: true });
});

for (const distribution of ["leaflet.draw.js", "leaflet.draw-src.js"]) {
  describe(distribution, () => {
    function maps() {
      const dom = new JSDOM('<div id="one"></div><div id="two"></div>', {
        runScripts: "outside-only",
        url: "https://example.test/",
      });
      dom.window.SVGSVGElement.prototype.createSVGRect = () => new dom.window.DOMRect();
      dom.window.eval(readFileSync(require.resolve("leaflet/dist/leaflet.js"), "utf8"));
      dom.window.eval(readFileSync(require.resolve(`leaflet-draw/dist/${distribution}`), "utf8"));
      const leaf = (dom.window as any).L;
      const dictionary = JSON.stringify(leaf.drawLocal);
      const one = leaf.map(dom.window.document.getElementById("one"), {
        center: [51, 0],
        zoom: 5,
        zoomAnimation: false,
      });
      const two = leaf.map(dom.window.document.getElementById("two"), {
        center: [52, 1],
        zoom: 6,
        zoomAnimation: false,
      });
      const i18n = runtime();
      const english = runtime("en-GB");
      const update = () =>
        one.setDrawLocalisation(createMapLocalisation(i18n.translate("editors"), i18n.getSnapshot().locale));
      update();
      two.setDrawLocalisation(createMapLocalisation(english.translate("editors"), "en-GB"));
      const group = leaf.featureGroup().addTo(one);
      const control = new leaf.Control.Draw({
        draw: {
          polyline: { allowIntersection: false },
          polygon: {},
          rectangle: {},
          circle: {},
          marker: {},
          circlemarker: {},
        },
        edit: { featureGroup: group },
      }).addTo(one);
      const other = new leaf.Control.Draw({ edit: { featureGroup: leaf.featureGroup().addTo(two) } }).addTo(two);
      disposals.push(() => {
        one.remove();
        two.remove();
        dom.window.close();
      });
      return { dom, leaf, one, two, group, control, other, i18n, update, dictionary };
    }
    it("starts Dutch, refreshes existing toolbar/actions/error/draft, and isolates two maps and global copy", async () => {
      const { dom, leaf, one, two, group, control, other, i18n, update, dictionary } = maps();
      const modes = control._toolbars.draw._modes;
      const line = modes.polyline.handler;
      const button = modes.polyline.button;
      expect(button.title).toBe("Een lijn tekenen");
      const disabled = control._toolbars.edit._modes.edit.button;
      expect(disabled.title).toBe("Geen lagen om te bewerken");
      expect(disabled.getAttribute("aria-label")).toBe(disabled.title);
      expect(other._toolbars.draw._modes.polyline.button.title).toBe("Draw a polyline");
      const zoom = one.getZoom();
      const center = one.getCenter();
      line.enable();
      expect(line._tooltip._container.textContent).toContain("Klik om een lijn te tekenen.");
      line.addVertex(leaf.latLng(51, 0));
      line.addVertex(leaf.latLng(52, 1));
      const draft = line._poly;
      const markers = line._markers.slice();
      const geometry = draft.toGeoJSON();
      const actions = control._toolbars.draw._actionButtons.map((action: any) => action.button);
      actions[0].focus();
      line._showErrorTooltip();
      const tooltip = line._tooltip;
      const errorTimer = line._hideErrorTimeout;
      expect(tooltip._container.textContent).toContain("Fout: de randen");
      await i18n.setLocale("en-GB");
      update();
      expect(control._toolbars.draw._modes.polyline.handler).toBe(line);
      expect(modes.polyline.button).toBe(button);
      expect(button.title).toBe("Draw a polyline");
      expect(disabled.title).toBe("No layers to edit");
      expect(disabled.getAttribute("aria-label")).toBe(disabled.title);
      expect(control._toolbars.draw._actionButtons.map((action: any) => action.button)).toEqual(actions);
      expect(actions[0].textContent).toBe("Finish");
      expect(actions[1].title).toBe("Delete last point drawn");
      expect(dom.window.document.activeElement).toBe(actions[0]);
      expect(line._poly).toBe(draft);
      expect(line._markers).toEqual(markers);
      expect(draft.toGeoJSON()).toEqual(geometry);
      expect(line._errorShown).toBe(true);
      expect(line._hideErrorTimeout).toBe(errorTimer);
      expect(line._tooltip).toBe(tooltip);
      expect(tooltip._container.textContent).toContain("Error: shape edges");
      expect(one.getZoom()).toBe(zoom);
      expect(one.getCenter()).toEqual(center);
      expect(two.getZoom()).toBe(6);
      expect(JSON.stringify(leaf.drawLocal)).toBe(dictionary);
      await i18n.setLocale("nl");
      await i18n.setProfile("plain");
      update();
      expect(tooltip._container.textContent).toContain("Fout: de randen");
      line._hideErrorTooltip();
      expect(tooltip._container.textContent).toContain("Klik op het laatste punt om de lijn te voltooien.");
      const created = vi.fn((event) => group.addLayer(event.layer));
      one.on("draw:created", created);
      // The retained real Finish button still invokes its original handler exactly once.
      actions[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
      expect(created).toHaveBeenCalledTimes(1);
      expect(created.mock.calls[0]![0].layerType).toBe("polyline");
      expect(created.mock.calls[0]![0].layer.toGeoJSON()).toEqual(geometry);
      expect(line.enabled()).toBe(false);
      expect(disabled.title).toBe("Lagen bewerken");
      expect(disabled.getAttribute("aria-label")).toBe(disabled.title);
    });
    it("updates current circle/radius and edit/delete tooltips without changing shapes or operations", async () => {
      const { leaf, one, group, control, i18n, update, dom } = maps();
      const modes = control._toolbars.draw._modes;
      const circle = modes.circle.handler;
      circle.enable();
      expect(circle._tooltip._container.textContent).toBe("Klik en sleep om een cirkel te tekenen.");
      circle._isDrawing = true;
      circle._startLatLng = leaf.latLng(51, 0);
      circle._onMouseMove({ latlng: leaf.latLng(51.003, 0.002) });
      const shape = circle._shape,
        radius = shape.getRadius(),
        geometry = shape.toGeoJSON();
      expect(circle._tooltip._container.textContent).toContain("Straal:");
      await i18n.setLocale("en-GB");
      update();
      expect(circle._tooltip._container.textContent).toContain("Radius:");
      expect(circle._tooltip._container.textContent).toContain("Release mouse");
      expect(circle._shape).toBe(shape);
      expect(shape.getRadius()).toBe(radius);
      expect(shape.toGeoJSON()).toEqual(geometry);
      circle.disable();
      const stored = leaf.circle([51, 0], { radius: 1234.5 }).addTo(group);
      const edit = control._toolbars.edit._modes.edit.handler;
      edit.enable();
      const editTooltip = edit._tooltip;
      const savedGeometry = group.toGeoJSON();
      const actions = control._toolbars.edit._actionButtons.map((action: any) => action.button);
      await i18n.setLocale("nl");
      update();
      expect(edit.enabled()).toBe(true);
      expect(edit._tooltip).toBe(editTooltip);
      expect(editTooltip._container.textContent).toContain("Sleep de handgrepen");
      expect(actions[0].textContent).toBe("Opslaan");
      expect(actions[1].title).toContain("Bewerken annuleren");
      // Actual circle resize handler and live tooltip preserve the current radius.
      stored.editing._resize(leaf.latLng(51.01, 0.01));
      const resized = stored.getRadius();
      expect(editTooltip._container.textContent).toContain("Straal:");
      await i18n.setLocale("en-GB");
      update();
      expect(editTooltip._container.textContent).toContain("Radius:");
      expect(stored.getRadius()).toBe(resized);
      control._toolbars.edit.disable(); // genuine cancel reverts the edit backup
      expect(group.toGeoJSON()).toEqual(savedGeometry);
      expect(stored.getRadius()).toBe(1234.5);
      const remove = control._toolbars.edit._modes.remove.handler;
      remove.enable();
      const removeTooltip = remove._tooltip;
      const clear = control._toolbars.edit._actionButtons[2].button;
      await i18n.setLocale("nl");
      update();
      expect(remove.enabled()).toBe(true);
      expect(remove._tooltip).toBe(removeTooltip);
      expect(removeTooltip._container.textContent).toBe("Klik op een vorm om deze te verwijderen.");
      expect(clear.textContent).toBe("Alles verwijderen");
      const deleted = vi.fn();
      one.on("draw:deleted", deleted);
      clear.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
      expect(deleted).toHaveBeenCalledTimes(1);
      expect(deleted.mock.calls[0]![0].layers.getLayers()).toEqual([stored]);
      control.remove();
      expect(one._events["draw:localisationchange"] || []).toHaveLength(0);
    });
    it("refreshes every initial drawing instruction and retains polygon/rectangle geometry", async () => {
      const { leaf, one, control, i18n, update } = maps();
      expect(leaf.Draw.Polyline.prototype.options.drawError.message).toBeUndefined();
      const modes = control._toolbars.draw._modes;
      const instructions = {
        polyline: "Klik om een lijn te tekenen.",
        polygon: "Klik om een vorm te tekenen.",
        rectangle: "Klik en sleep om een rechthoek te tekenen.",
        circle: "Klik en sleep om een cirkel te tekenen.",
        marker: "Klik op de kaart om een markering te plaatsen.",
        circlemarker: "Klik op de kaart om een cirkelmarkering te plaatsen.",
      };
      for (const [type, text] of Object.entries(instructions)) {
        const handler = modes[type].handler;
        handler.enable();
        expect(handler._tooltip._container.textContent).toBe(text);
        await i18n.setLocale("en-GB");
        update();
        expect(handler._tooltip._container.textContent).not.toBe(text);
        await i18n.setLocale("nl");
        update();
        expect(handler._tooltip._container.textContent).toBe(text);
        handler.disable();
      }
      const polygon = modes.polygon.handler;
      polygon.enable();
      polygon.addVertex(leaf.latLng(51, 0));
      polygon.addVertex(leaf.latLng(52, 1));
      polygon.addVertex(leaf.latLng(52, 0));
      const points = polygon._markers.slice(),
        poly = polygon._poly,
        geometry = poly.toGeoJSON();
      await i18n.setLocale("en-GB");
      update();
      expect(polygon._tooltip._container.textContent).toContain("Click first point");
      expect(polygon._markers).toEqual(points);
      expect(polygon._poly).toBe(poly);
      expect(poly.toGeoJSON()).toEqual(geometry);
      polygon.disable();
      const rectangle = modes.rectangle.handler;
      rectangle.enable();
      rectangle._isDrawing = true;
      rectangle._startLatLng = leaf.latLng(51, 0);
      rectangle._onMouseMove({ latlng: leaf.latLng(52, 1) });
      const shape = rectangle._shape,
        rectGeometry = shape.toGeoJSON();
      await i18n.setLocale("nl");
      update();
      expect(rectangle._tooltip._container.textContent).toContain("Laat de muisknop los");
      expect(rectangle._shape).toBe(shape);
      expect(shape.toGeoJSON()).toEqual(rectGeometry);
      expect(one.getCenter()).toEqual(leaf.latLng(51, 0));
    });
    it("refreshes an actual rejected polygon-edit crossing without clearing the error or replacing edit handles", async () => {
      const { leaf, group, control, i18n, update } = maps();
      const polygon = leaf
        .polygon([
          [0, 0],
          [0, 2],
          [2, 2],
          [2, 0],
        ])
        .addTo(group);
      const edit = control._toolbars.edit._modes.edit.handler;
      edit.options.poly = { allowIntersection: false };
      edit.enable();
      const vertices = polygon.editing._verticesHandlers[0];
      const handles = vertices._markers.slice();
      const geometry = polygon.toGeoJSON();
      handles[1].setLatLng([3, 1]);
      vertices._onMarkerDrag({ target: handles[1] });
      expect(edit._tooltip._container.textContent).toContain("Fout: de randen");
      const color = polygon.options.color;
      await i18n.setLocale("en-GB");
      update();
      expect(edit._tooltip._container.textContent).toContain("Error: shape edges");
      expect(polygon.options.color).toBe(color);
      expect(vertices._markers).toEqual(handles);
      expect(polygon.toGeoJSON()).toEqual(geometry);
      expect(edit.enabled()).toBe(true);
    });
    it("preserves legacy English without optional inputs and treats translated text literally", () => {
      const { leaf, one, control, dictionary } = maps();
      one.setDrawLocalisation(undefined);
      const marker = control._toolbars.draw._modes.marker.handler;
      marker.enable();
      expect(marker._tooltip._container.textContent).toBe("Click map to place marker.");
      one.setDrawLocalisation({ translate: () => '<img src=x onerror="throw 1">' });
      expect(marker._tooltip._container.querySelector("img")).toBeNull();
      expect(marker._tooltip._container.textContent).toContain("<img src=x");
      expect(control._toolbars.draw._modes.marker.button.getAttribute("aria-label")).toContain("<img src=x");
      expect(JSON.stringify(leaf.drawLocal)).toBe(dictionary);
    });
  });
}

it("the React adapter retains controls/drafts/callbacks on selection changes, updates zoom, honors option changes and cleans up", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const i18n = runtime();
  let map!: L.Map;
  let group!: L.FeatureGroup;
  let control: any;
  const mounted = vi.fn((value) => {
    control = value;
  });
  const created = vi.fn();
  const edited = vi.fn();
  const deleted = vi.fn();
  let draw = { rectangle: true, circle: true, polyline: true, polygon: true, marker: true, circlemarker: true };
  function Capture() {
    map = useMap();
    return null;
  }
  const render = () => (
    <EditorI18nProvider instance={i18n}>
      <MapContainer center={[51, 0]} zoom={5} zoomAnimation={false}>
        <Capture />
        <FeatureGroup
          ref={(value) => {
            if (value) group = value;
          }}
        >
          <EditControl draw={draw} onMounted={mounted} onCreated={created} onEdited={edited} onDeleted={deleted} />
        </FeatureGroup>
      </MapContainer>
    </EditorI18nProvider>
  );
  await act(async () => {
    root.render(render());
  });
  disposals.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  expect(mounted).toHaveBeenCalledTimes(1);
  const originalControl = control;
  const line = control._toolbars.draw._modes.polyline.handler;
  line.enable();
  line.addVertex(L.latLng(51, 0));
  line.addVertex(L.latLng(52, 1));
  line._onMouseMove({ latlng: L.latLng(52, 1), originalEvent: new MouseEvent("mousemove") });
  const draft = line._poly;
  const zoom = container.querySelector<HTMLAnchorElement>(".leaflet-control-zoom-in")!;
  expect(zoom.title).toBe("Inzoomen");
  expect(zoom.getAttribute("aria-label")).toBe("Inzoomen");
  await act(async () => {
    await i18n.setLocale("en-GB");
    await i18n.setProfile("plain");
  });
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(control).toBe(originalControl);
  expect(line._poly).toBe(draft);
  expect(line.enabled()).toBe(true);
  expect(zoom.title).toBe("Zoom in");
  expect(container.querySelector(".leaflet-control-zoom-in")).toBe(zoom);
  const previousZoom = map.getZoom();
  zoom.click();
  expect(map.getZoom()).toBe(previousZoom + 1);
  const feature = L.marker([51, 0]);
  map.fire("draw:created", { layer: feature, layerType: "marker" });
  expect(group.hasLayer(feature)).toBe(true);
  expect(created).toHaveBeenCalledTimes(1);
  expect(created.mock.calls[0]![0].layer).toBe(feature);
  const payload = { layers: group };
  map.fire("draw:edited", payload);
  map.fire("draw:deleted", payload);
  expect(edited).toHaveBeenCalledTimes(1);
  expect(edited.mock.calls[0]![0].layers).toBe(group);
  expect(deleted).toHaveBeenCalledTimes(1);
  // Original caller semantics: a changed options identity still replaces the control.
  draw = { ...draw, circle: false };
  await act(async () => {
    root.render(render());
  });
  expect(mounted).toHaveBeenCalledTimes(2);
  expect(control).not.toBe(originalControl);
  expect(line.enabled()).toBe(false);
  await act(async () => root.unmount());
  disposals.pop();
  container.remove();
  const calls = created.mock.calls.length;
  map.fire("draw:created", { layer: feature });
  expect(created).toHaveBeenCalledTimes(calls);
  expect(map.options.drawLocalisation).toBeUndefined();
});

it("formats complete Dutch measurement/radius messages using UI locale, including non-metric options", () => {
  const i18n = runtime();
  const local = createMapLocalisation(i18n.translate("editors"), "nl");
  expect(local.formatMeasurement!("distance", 1234.5, { metric: true })).toBe("1,23 kilometer");
  expect(local.formatRadius!(1234.5, { metric: true })).toBe("Straal: 1,23 kilometer");
  expect(local.formatMeasurement!("area", 12345, { metric: true })).toBe("1,23 hectare");
  expect(local.formatMeasurement!("distance", 3, { feet: true })).toBe("10 voet");
  expect(local.formatMeasurement!("distance", 1852, { nautic: true })).toBe("1,00 zeemijl");
  expect(local.formatMeasurement!("area", 100, { metric: false })).toBe("120 vierkante yard");
});

it("keeps two React editor maps independent through a real wording-profile change", async () => {
  const i18n = createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: {
      plain: { nl: { editors: { map: { draw: { toolbar: { buttons: { polyline: "Teken een route" } } } } } } },
    },
    config: { defaultLocale: "nl" },
  });
  const other = runtime("en-GB");
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const controls: any[] = [];
  const maps: L.Map[] = [];
  const draw = { polyline: true };
  const callback = vi.fn();
  function Capture({ index }: { index: number }) {
    maps[index] = useMap();
    return null;
  }
  await act(async () =>
    root.render(
      <>
        {[i18n, other].map((instance, index) => (
          <EditorI18nProvider key={index} instance={instance}>
            <MapContainer center={[51, 0]} zoom={5}>
              <Capture index={index} />
              <FeatureGroup>
                <EditControl
                  draw={draw}
                  onMounted={(control) => {
                    controls[index] = control;
                    callback();
                  }}
                />
              </FeatureGroup>
            </MapContainer>
          </EditorI18nProvider>
        ))}
      </>
    )
  );
  disposals.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const first = controls[0]._toolbars.draw._modes.polyline;
  const second = controls[1]._toolbars.draw._modes.polyline;
  first.handler.enable();
  first.handler.addVertex(L.latLng(51, 0));
  first.handler.addVertex(L.latLng(52, 1));
  second.handler.enable();
  second.handler.addVertex(L.latLng(51, 0));
  const firstDraft = first.handler._poly,
    secondDraft = second.handler._poly;
  const geometry = firstDraft.toGeoJSON();
  expect(first.button.title).toBe("Een lijn tekenen");
  expect(second.button.title).toBe("Draw a polyline");
  await act(async () => {
    await i18n.setProfile("plain");
  });
  expect(first.button.title).toBe("Teken een route");
  expect(second.button.title).toBe("Draw a polyline");
  expect(first.handler._poly).toBe(firstDraft);
  expect(firstDraft.toGeoJSON()).toEqual(geometry);
  expect(second.handler._poly).toBe(secondDraft);
  expect(second.handler._tooltip._container.textContent).toContain("Click to continue drawing line.");
  expect(callback).toHaveBeenCalledTimes(2);
  expect(maps[0]!.options.drawLocalisation).not.toBe(maps[1]!.options.drawLocalisation);
});
