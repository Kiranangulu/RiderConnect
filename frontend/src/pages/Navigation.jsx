
import { useEffect, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents
} from "react-leaflet";

import {
  MapPin,
  LocateFixed,
  Route,
  Clock,
  Trash2,
  AlertCircle,
  ListOrdered,
  Fuel,
  Hospital,
  Pill,
  Utensils,
  Coffee,
  LoaderCircle,
  Volume2,
  VolumeX,
  Languages
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const INITIAL_POSITION = [17.6868, 83.2185];
const INITIAL_ZOOM = 13;
const ALERT_RADIUS = 200;

const LANDMARK_TYPES = [
  { key: "fuel", label: "Petrol Stations", icon: Fuel },
  { key: "hospital", label: "Hospitals", icon: Hospital },
  { key: "pharmacy", label: "Pharmacies", icon: Pill },
  { key: "restaurant", label: "Restaurants", icon: Utensils },
  { key: "cafe", label: "Cafes", icon: Coffee }
];

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

function MapClickHandler({ onDestinationSelect }) {
  useMapEvents({
    click(event) {
      onDestinationSelect([
        event.latlng.lat,
        event.latlng.lng
      ]);
    }
  });

  return null;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371;
  const toRadians = (value) => value * Math.PI / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

function getLandmarkCategory(tags = {}) {
  if (tags.amenity === "fuel") return "Petrol Station";
  if (tags.amenity === "hospital") return "Hospital";
  if (tags.amenity === "pharmacy") return "Pharmacy";
  if (tags.amenity === "restaurant") return "Restaurant";
  if (tags.amenity === "cafe") return "Cafe";

  return "Nearby Place";
}

function getLandmarkIcon(category) {
  const icons = {
    "Petrol Station": Fuel,
    Hospital,
    Pharmacy: Pill,
    Restaurant: Utensils,
    Cafe: Coffee
  };

  return icons[category] || MapPin;
}

export default function Navigation() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeOrigin, setRouteOrigin] = useState(null);
  const [landmarkSearchCenter, setLandmarkSearchCenter] = useState(null);
  const [destination, setDestination] = useState(null);

  const [isTracking, setIsTracking] = useState(false);
  const watchId = useRef(null);

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [landmarks, setLandmarks] = useState([]);
  const [landmarkLoading, setLandmarkLoading] = useState(false);
  const [landmarkError, setLandmarkError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [locationMessage, setLocationMessage] = useState(
    "Your location has not been detected yet."
  );

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [voiceMessage, setVoiceMessage] = useState(
    "Voice guidance is disabled."
  );

  const announcedLandmarks = useRef(new Set());
  const repeatTimers = useRef(new Set());
  const speechQueue = useRef([]);
  const speaking = useRef(false);
  const voiceEnabledRef = useRef(false);
  const languageRef = useRef("en-IN");

  // Voice message queue
  const processSpeechQueue = () => {
    if (
      !("speechSynthesis" in window) ||
      speaking.current ||
      !voiceEnabledRef.current ||
      speechQueue.current.length === 0
    ) {
      return;
    }

    const message = speechQueue.current.shift();
    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = languageRef.current;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const selectedVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang === languageRef.current);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    speaking.current = true;

    utterance.onend = () => {
      speaking.current = false;
      processSpeechQueue();
    };

    utterance.onerror = () => {
      speaking.current = false;
      processSpeechQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakMessage = (message) => {
    if (!("speechSynthesis" in window)) return;

    speechQueue.current.push(message);
    processSpeechQueue();
  };

  const clearVoiceTimers = () => {
    repeatTimers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    repeatTimers.current.clear();
  };

  const toggleVoice = () => {
    if (!("speechSynthesis" in window)) {
      setError("Voice guidance is not supported by this browser.");
      return;
    }

    if (voiceEnabled) {
      voiceEnabledRef.current = false;
      setVoiceEnabled(false);

      speechQueue.current = [];
      window.speechSynthesis.cancel();
      clearVoiceTimers();

      speaking.current = false;
      announcedLandmarks.current.clear();

      setVoiceMessage("Voice guidance is disabled.");
      return;
    }

    voiceEnabledRef.current = true;
    setVoiceEnabled(true);
    setVoiceMessage("Voice guidance is enabled.");

    speakMessage("RiderConnect voice guidance activated.");
  };

  const changeLanguage = (value) => {
    languageRef.current = value;
    setLanguage(value);

    speechQueue.current = [];

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    speaking.current = false;
    setVoiceMessage("Voice language updated.");
  };

  // Start and stop continuous GPS tracking
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Stop tracking if already active
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;

      setIsTracking(false);
      setLocationMessage("Live location tracking stopped.");
      return;
    }

    setError("");
    setLocationMessage("Starting live GPS tracking...");

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setCurrentLocation(coordinates);

        // Set the initial route origin only once.
        setRouteOrigin((previous) => previous || coordinates);

        // Load landmarks around the initial rider location.
        setLandmarkSearchCenter(
          (previous) => previous || coordinates
        );

        setIsTracking(true);

        setLocationMessage(
          `Live GPS active. Accuracy: approximately ${Math.round(
            position.coords.accuracy
          )} metres.`
        );

        setError("");
      },
      (err) => {
        let message = "Unable to detect your location.";

        if (err.code === 1) {
          message = "Location permission denied. Allow location access.";
        } else if (err.code === 2) {
          message = "Location unavailable. Check your GPS settings.";
        } else if (err.code === 3) {
          message = "GPS request timed out. Please try again.";
        }

        setError(message);
        setLocationMessage("Live location unavailable.");

        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }

        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 3000
      }
    );

    setIsTracking(true);
  };

  const selectDestination = (coordinates) => {
    setDestination(coordinates);
    setError("");
  };

  // Calculate driving route using OSRM
  useEffect(() => {
    if (!routeOrigin || !destination) {
      setRouteCoordinates([]);
      setRouteSteps([]);
      setDistance(null);
      setDuration(null);
      return;
    }

    const controller = new AbortController();

    async function getRoute() {
      try {
        setLoading(true);
        setError("");

        const [startLat, startLng] = routeOrigin;
        const [endLat, endLng] = destination;

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${startLng},${startLat};${endLng},${endLat}` +
          `?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Routing service is unavailable.");
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No driving route found.");
        }

        const selectedRoute = data.routes[0];

        const coordinates =
          selectedRoute.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

        setRouteCoordinates(coordinates);
        setDistance(selectedRoute.distance / 1000);
        setDuration(selectedRoute.duration / 60);

        const instructions = selectedRoute.legs.flatMap((leg) =>
          leg.steps.map((step) => ({
            instruction:
              step.maneuver.instruction ||
              `${step.maneuver.type} ${
                step.maneuver.modifier || ""
              }`.trim(),
            distance: step.distance,
            duration: step.duration,
            roadName: step.name || "Unnamed road"
          }))
        );

        setRouteSteps(instructions);
      } catch (err) {
        if (err.name !== "AbortError") {
          setRouteCoordinates([]);
          setRouteSteps([]);
          setDistance(null);
          setDuration(null);
          setError(err.message || "Unable to calculate route.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    getRoute();

    return () => controller.abort();
  }, [routeOrigin, destination]);

  // Find landmarks around the initial rider location
  useEffect(() => {
    if (!landmarkSearchCenter) {
      setLandmarks([]);
      return;
    }

    const controller = new AbortController();

    async function findLandmarks() {
      try {
        setLandmarkLoading(true);
        setLandmarkError("");

        const [lat, lng] = landmarkSearchCenter;

        const query = `
          [out:json][timeout:20];
          (
            node["amenity"~"^(fuel|hospital|pharmacy|restaurant|cafe)$"]
              (around:1500,${lat},${lng});
            way["amenity"~"^(fuel|hospital|pharmacy|restaurant|cafe)$"]
              (around:1500,${lat},${lng});
          );
          out center tags;
        `;

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ data: query }),
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Landmark service is unavailable.");
        }

        const data = await response.json();

        const results = (data.elements || [])
          .map((item) => {
            const itemLat = item.lat ?? item.center?.lat;
            const itemLng = item.lon ?? item.center?.lon;

            if (
              typeof itemLat !== "number" ||
              typeof itemLng !== "number"
            ) {
              return null;
            }

            const category = getLandmarkCategory(item.tags);

            return {
              id: `${item.type}-${item.id}`,
              name: item.tags?.name || category,
              category,
              latitude: itemLat,
              longitude: itemLng,
              distance: getDistance(
                lat,
                lng,
                itemLat,
                itemLng
              )
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance);

        setLandmarks(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          setLandmarks([]);
          setLandmarkError(
            err.message || "Unable to load nearby landmarks."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLandmarkLoading(false);
        }
      }
    }

    findLandmarks();

    return () => controller.abort();
  }, [landmarkSearchCenter]);

  // Check actual live GPS distance from each landmark.
  useEffect(() => {
    if (
      !voiceEnabled ||
      !currentLocation ||
      landmarks.length === 0
    ) {
      return;
    }

    landmarks.forEach((place) => {
      const distanceInMeters =
        getDistance(
          currentLocation[0],
          currentLocation[1],
          place.latitude,
          place.longitude
        ) * 1000;

      if (
        distanceInMeters <= ALERT_RADIUS &&
        !announcedLandmarks.current.has(place.id)
      ) {
        announcedLandmarks.current.add(place.id);

        const message =
          `${place.name}, ${place.category}, approximately ` +
          `${Math.round(distanceInMeters)} metres away.`;

        // First announcement
        speakMessage(message);

        // Second announcement five seconds after the first
        const timer = window.setTimeout(() => {
          if (voiceEnabledRef.current) {
            speakMessage(message);
          }

          repeatTimers.current.delete(timer);
        }, 5000);

        repeatTimers.current.add(timer);
      }
    });
  }, [voiceEnabled, currentLocation, landmarks]);

  // Cleanup GPS and voice when leaving the page
  useEffect(() => {
    return () => {
      if (
        watchId.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchId.current);
      }

      voiceEnabledRef.current = false;
      window.speechSynthesis?.cancel();
      clearVoiceTimers();
    };
  }, []);

  const clearDestination = () => {
    setDestination(null);
    setRouteCoordinates([]);
    setRouteSteps([]);
    setDistance(null);
    setDuration(null);
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-4 md:p-8 space-y-6">

          <section>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Smart Navigation
            </h1>
            <p className="text-slate-500 mt-2">
              Explore routes, landmarks and voice assistance.
            </p>
          </section>

          {/* Rider GPS */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
              <div>
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <LocateFixed className="text-green-600" size={20} />
                  Rider Location
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  {locationMessage}
                </p>
              </div>

              <button
                onClick={detectLocation}
                className={`flex items-center justify-center gap-2 text-white px-5 py-3 rounded-lg font-medium ${
                  isTracking
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <LocateFixed size={18} />
                {isTracking
                  ? "Stop Live Tracking"
                  : "Start Live Tracking"}
              </button>
            </div>
          </section>

          {/* Voice assistance */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Volume2 className="text-green-600" />
                  Voice Landmark Assistance
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Receive spoken alerts for landmarks within 200 metres.
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  {voiceMessage}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <Languages size={18} className="text-slate-500" />

                  <select
                    value={language}
                    onChange={(event) => changeLanguage(event.target.value)}
                    className="bg-transparent text-sm outline-none"
                  >
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="te-IN">Telugu</option>
                  </select>
                </div>

                <button
                  onClick={toggleVoice}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-white ${
                    voiceEnabled
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {voiceEnabled ? (
                    <>
                      <VolumeX size={19} />
                      Disable Voice
                    </>
                  ) : (
                    <>
                      <Volume2 size={19} />
                      Enable Voice
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Each nearby landmark is announced twice, five seconds apart.
              Alerts use your live GPS position.
            </p>
          </section>

          {/* Route statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Route className="text-green-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Route Distance
                  </p>

                  <h3 className="text-xl font-bold">
                    {distance !== null
                      ? `${distance.toFixed(2)} km`
                      : "--"}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="text-blue-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Estimated Travel Time
                  </p>

                  <h3 className="text-xl font-bold">
                    {duration !== null
                      ? `${Math.round(duration)} min`
                      : "--"}
                  </h3>
                </div>
              </div>
            </div>
          </section>

          {/* Map */}
          <section className="bg-white border rounded-xl p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-800">
                  Live Navigation Map
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Click the map to select a customer destination.
                </p>
              </div>

              {destination && (
                <button
                  onClick={clearDestination}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm"
                >
                  <Trash2 size={16} />
                  Clear Destination
                </button>
              )}
            </div>

            <div
              className="w-full rounded-xl overflow-hidden border"
              style={{ height: "480px" }}
            >
              <MapContainer
                center={INITIAL_POSITION}
                zoom={INITIAL_ZOOM}
                scrollWheelZoom
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler
                  onDestinationSelect={selectDestination}
                />

                {currentLocation && (
                  <>
                    <MapUpdater position={currentLocation} />

                    <CircleMarker
                      center={currentLocation}
                      radius={9}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: "#16a34a",
                        fillOpacity: 1,
                        weight: 3
                      }}
                    >
                      <Popup>Your current location</Popup>
                    </CircleMarker>
                  </>
                )}

                {destination && (
                  <Marker position={destination}>
                    <Popup>Customer destination</Popup>
                  </Marker>
                )}

                {routeCoordinates.length > 0 && (
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#16a34a",
                      weight: 6,
                      opacity: 0.85
                    }}
                  />
                )}

                {landmarks.map((place) => (
                  <CircleMarker
                    key={place.id}
                    center={[place.latitude, place.longitude]}
                    radius={7}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: "#2563eb",
                      fillOpacity: 0.95,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <strong>{place.name}</strong>
                      <br />
                      {place.category}
                      <br />
                      {place.distance.toFixed(2)} km from search location
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600" />
                Rider location
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                Customer destination
              </span>

              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                Nearby landmarks
              </span>
            </div>
          </section>

          {/* Loading and errors */}
          {loading && (
            <p className="text-blue-600 text-sm">
              Calculating road route...
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <AlertCircle size={19} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Route instructions */}
          {routeSteps.length > 0 && (
            <section className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <ListOrdered className="text-green-700" size={24} />

                <h2 className="text-lg font-bold">
                  Route Instructions
                </h2>
              </div>

              <div className="space-y-4">
                {routeSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="bg-green-100 text-green-700 rounded-full w-9 h-9 flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {step.instruction}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {step.roadName}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {(step.distance / 1000).toFixed(2)} km ·{" "}
                        {Math.round(step.duration / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby landmarks */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Nearby Landmarks
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Places found around your initial rider location.
                  Voice alerts use your live GPS distance.
                </p>
              </div>

              {landmarkLoading && (
                <span className="flex items-center gap-2 text-sm text-blue-600">
                  <LoaderCircle size={17} className="animate-spin" />
                  Finding places...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {LANDMARK_TYPES.map((type) => {
                const Icon = type.icon;

                return (
                  <span
                    key={type.key}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs sm:text-sm"
                  >
                    <Icon size={16} />
                    {type.label}
                  </span>
                );
              })}
            </div>

            {landmarkError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {landmarkError}
              </p>
            )}

            {!landmarkLoading &&
              !landmarkError &&
              landmarks.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="mx-auto text-slate-300" size={36} />

                  <p className="font-medium text-slate-700 mt-3">
                    No landmarks found
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Start live tracking to search for nearby places.
                  </p>
                </div>
              )}

            {landmarks.length > 0 && (
              <>
                <p className="text-sm text-slate-500 mb-3">
                  Found {landmarks.length} nearby places.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {landmarks.map((place) => {
                    const Icon = getLandmarkIcon(place.category);

                    const liveDistance = currentLocation
                      ? getDistance(
                          currentLocation[0],
                          currentLocation[1],
                          place.latitude,
                          place.longitude
                        )
                      : null;

                    return (
                      <div
                        key={place.id}
                        className="flex items-center gap-3 border rounded-lg p-3"
                      >
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {place.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {place.category}
                          </p>

                          <p className="text-xs text-blue-600 mt-1">
                            {liveDistance !== null
                              ? `${liveDistance.toFixed(2)} km from you`
                              : `${place.distance.toFixed(2)} km from search location`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <p className="text-xs text-slate-400 mt-5">
              Landmark data © OpenStreetMap contributors.
            </p>
          </section>

          <p className="text-xs text-slate-400">
            Routing provided by the public OSRM demonstration service.
            This is a demonstration and is not guaranteed for live delivery.
          </p>

        </div>
      </main>
    </div>
  );
}
