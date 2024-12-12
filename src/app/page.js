'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DistanceMatrixService } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

export default function HomePage() {
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPosition, setCurrentPosition] = useState({ lat: null, lng: null });
  const [distances, setDistances] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/locations?query=${query}`);
    const data = await res.json();
    setLocations(data);
    setSelectedMarker(null); // Reset selected marker on new search
  };

  const handleDistanceMatrixCallback = (response) => {
    console.log('Distance Matrix Response:', response); // Log the response
    if (response && response.rows[0].elements) {
      const distances = response.rows[0].elements.map((element, index) => {
        if (element.status === "OK") {
          return {
            location: locations[index],
            distance: element.distance.text,
          };
        } else {
          return {
            location: locations[index],
            distance: 'Distance not available',
          };
        }
      });
      setDistances(distances);
    } else {
      console.error('Error in Distance Matrix response:', response);
    }
  };

  useEffect(() => {
    if (mapRef.current && distances.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      distances.forEach((item) => {
        bounds.extend(new window.google.maps.LatLng(item.location.LATITUDE, item.location.LONGITUDE));
      });
      if (currentPosition.lat && currentPosition.lng) {
        bounds.extend(new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng));
      }
      mapRef.current.fitBounds(bounds);
    }
  }, [distances, currentPosition]);

  const handleListItemClick = (index) => {
    const location = distances[index].location;
    setSelectedMarker(index);
    mapRef.current.panTo(new window.google.maps.LatLng(location.LATITUDE, location.LONGITUDE));
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px', overflowY: 'auto', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h1>Location Search</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter ZIP code or location name"
          />
          <button type="submit">Search</button>
        </form>
        <ul>
          {distances.map((item, index) => (
            <li key={item.location._id} onClick={() => handleListItemClick(index)} style={{ cursor: 'pointer', padding: '5px 0' }}>
              <strong>{item.location.STORE_NAME}</strong><br />
              {item.distance}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, height: '400px' }}>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition.lat ? currentPosition : { lat: 0, lng: 0 }}
            zoom={currentPosition.lat ? 10 : 2}
            onLoad={(map) => (mapRef.current = map)}
          >
            {currentPosition.lat && (
              <Marker position={currentPosition} title="Current Location" />
            )}
            {distances.map((item, index) => (
              <Marker
                key={item.location._id}
                position={{ lat: item.location.LATITUDE, lng: item.location.LONGITUDE }}
                title={item.location.STORE_NAME}
                onClick={() => setSelectedMarker(index)}
              >
                {selectedMarker === index && (
                  <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                    <div>
                      <h2>{item.location.STORE_NAME}</h2>
                      <p>Distance: {item.distance}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
            {currentPosition.lat && locations.length > 0 && (
              <DistanceMatrixService
                options={{
                  origins: [currentPosition],
                  destinations: locations.map((location) => ({
                    lat: location.LATITUDE,
                    lng: location.LONGITUDE,
                  })),
                  travelMode: 'DRIVING',
                }}
                callback={handleDistanceMatrixCallback}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
