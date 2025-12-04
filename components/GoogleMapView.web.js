import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GoogleMapView({ location, places, onMarkerClick, selectedPlace, recenterTrigger, routePath }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found. Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env');
      return;
    }

    // 새로운 Google Maps API 로딩 방식
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (mapRef.current && !googleMapRef.current && window.google) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 12,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          tilt: 0,
          heading: 0,
          disableDoubleClickZoom: false,
        });

        // 사용자 위치 마커
        new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: '내 위치',
        });

        // 장소 마커들
        updateMarkers(window.google);
      }
    };

    loadGoogleMaps();
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

  useEffect(() => {
    if (googleMapRef.current && location && recenterTrigger) {
      googleMapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
      googleMapRef.current.setZoom(15);
    }
  }, [recenterTrigger]);

  // 경로선 그리기
  useEffect(() => {
    if (googleMapRef.current && window.google && routePath && routePath.length > 1) {
      // 기존 경로선 제거
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      // 새 경로선 생성
      const path = routePath.map(point => ({
        lat: point.latitude,
        lng: point.longitude,
      }));

      polylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4CAF50',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: googleMapRef.current,
      });
    }
  }, [routePath]);

  const updateMarkers = (google) => {
    if (!google || !googleMapRef.current) return;

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
