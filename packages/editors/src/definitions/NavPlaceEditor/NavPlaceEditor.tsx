import * as L from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import type { GeoJSON } from "geojson";
import { InputLabel } from "../../components/Input";

export function NavPlaceEditor() {
  const { extensions, notAllowed } = useEditor();
  const { navPlace } = extensions;
  const [center, setCenter] = useState([51.505, -0.09]);
  const ZOOM_LEVEL = 1;
  const mapRef = useRef();
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
      <InputLabel>Nav place</InputLabel>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: 300, zIndex: 1 }}>
        <FeatureGroup ref={ref}>
          <EditControl
            position="topright"
            onMounted={() => initialiseFromGeoJSON(geojson)}
            onEdited={handleChange}
            onCreated={handleChange}
            onDeleted={handleChange}
            draw={{
              rectangle: true,
              circle: true,
              polyline: true,
              polygon: true,
              marker: true,
              circlemarker: true,
            }}
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
