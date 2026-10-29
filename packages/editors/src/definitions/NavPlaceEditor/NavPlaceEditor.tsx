import { propertyLabels } from "@manifest-editor/editor-api";
import { useDisplayLabel } from "../../i18n";
import * as L from "leaflet";
import React, { useEffect, useRef } from "react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import type { GeoJSON } from "geojson";
import { InputLabel } from "../../components/Input";
import { EditControl } from "./EditControl";

// EditControl deliberately honors option-identity changes from callers. Locale
// renders must keep these options stable so an active draft is never reconstructed.
const mapDrawOptions = {
  rectangle: true,
  circle: true,
  polyline: true,
  polygon: true,
  marker: true,
  circlemarker: true,
};

export function NavPlaceEditor() {
  const apiLabel = useDisplayLabel();
  const { extensions, notAllowed } = useEditor();
  const { navPlace } = extensions;
  const [center] = React.useState<L.LatLngTuple>([51.505, -0.09]);
  const ZOOM_LEVEL = 1;
  const mapRef = useRef<L.Map>(null);
  const ref = React.useRef<L.FeatureGroup>(null);
  const geojson = navPlace.get();
  const isInitialized = useRef(false);
  useEffect(() => {
    isInitialized.current = true;
    return () => {
      isInitialized.current = false;
    };
  }, []);

  const initialiseFromGeoJSON = (geojson: GeoJSON | undefined) => {
    if (ref.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Marker) {
          if (layer?.feature?.properties.radius && ref.current) {
            new L.Circle(layer.feature.geometry.coordinates.slice().reverse(), {
              radius: layer.feature?.properties.radius,
            }).addTo(ref.current);
          } else {
            ref.current?.addLayer(layer);
          }
        }
      });
    }
  };

  useEffect(() => {
    initialiseFromGeoJSON(geojson);
  }, [geojson]);

  const handleChange = () => {
    const geo = ref.current?.toGeoJSON();
    if (geo?.type === "FeatureCollection") {
      navPlace.set({
        ...geojson,
        ...geo,
      });
    }
  };

  if (notAllowed.includes("navPlace")) {
    return null;
  }

  if (!isInitialized) return null;

  return (
    <PaddedSidebarContainer>
      <InputLabel>{apiLabel(propertyLabels.navPlace)!}</InputLabel>
      <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: 300, zIndex: 1 }}>
        <FeatureGroup ref={ref}>
          <EditControl
            position="topright"
            onMounted={() => initialiseFromGeoJSON(geojson)}
            onEdited={handleChange}
            onCreated={handleChange}
            onDeleted={handleChange}
            draw={mapDrawOptions}
          />
        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </PaddedSidebarContainer>
  );
}
