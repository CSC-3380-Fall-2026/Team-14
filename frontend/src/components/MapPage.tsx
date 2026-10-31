import React, { useEffect, useRef } from 'react';
import * as mapboxgl from 'mapbox-gl/esm';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiY29vbHByaW5jZXNzcGluazM0NSIsImEiOiJjbXZ2ZTkycHIwMHdtMnlvaTd1ZmsydmJqIn0.GEWiIErAiP3ZcAm7RLK4Uw',
      container: mapContainerRef.current, 
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: [-74.5, 40],
      zoom: 9 
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []); 

  return (
    <div
      style={{ height: '500px', width: '100%' }} 
      ref={mapContainerRef}
      className="map-container"
    />
  );
};

export default MapboxExample;
