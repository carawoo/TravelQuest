import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GoogleMapView({ location, places, onMarkerClick, selectedPlace }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found. Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env');
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    loader.load().then((google) => {
      if (mapRef.current && !googleMapRef.current) {
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        // 사용자 위치 마커
        new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: googleMapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: '내 위치',
        });

        // 장소 마커들
        updateMarkers(google);
      }
    });
  }, []);

  useEffect(() => {
    if (googleMapRef.current && window.google) {
      updateMarkers(window.google);
    }
  }, [places]);

  useEffect(() => {
    if (googleMapRef.current && location) {
      googleMapRef.current.setCenter({ lat: location.latitude, lng: location.longitude });
    }
  }, [location]);

  const updateMarkers = (google) => {
    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    places.forEach((place) => {
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: googleMapRef.current,
        title: place.name,
        label: {
          text: place.icon || '📍',
          fontSize: '20px',
        },
      });

      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(place);
        }
      });

      markersRef.current.push(marker);

      // 선택된 장소에 원 표시
      if (selectedPlace && selectedPlace.name === place.name) {
        new google.maps.Circle({
          strokeColor: '#4CAF50',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#4CAF50',
          fillOpacity: 0.15,
          map: googleMapRef.current,
          center: { lat: place.lat, lng: place.lng },
          radius: 500, // 500m
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
