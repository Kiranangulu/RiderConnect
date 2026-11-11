
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import {
  Route,
  Radio,
  Square,
  MapPin,
  Clock,
  Trash2,
  ShieldCheck,
  Navigation,
  History,
  AlertCircle,
  LoaderCircle
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { readData, writeData } from "../services/storage";

const INITIAL_POSITION = [17.6868, 83.2185];

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [position, map]);

  return null;
}

function calculateDistance(point1, point2) {
  const toRadians = (value) => value * Math.PI / 180;
  const earthRadius = 6371;

  const lat1 = point1[0];
  const lng1 = point1[1];
  const lat2 = point2[0];
  const lng2 = point2[1];

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

function calculateRouteDistance(points) {
  let totalDistance = 0;

  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(
      points[i - 1],
      points[i]
    );
  }

  return totalDistance;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function RouteIntelligence() {
  const [consent, setConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [recordedPoints, setRecordedPoints] = useState([]);

  const [journeys, setJourneys] = useState(() =>
    readData("returnJourneys", [])
  );

  const [selectedJourney, setSelectedJourney] = useState(null);

  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Your return journey has not started."
  );

  const [saving, setSaving] = useState(false);

  const watchId = useRef(null);
  const pointsRef = useRef([]);
  const startedAtRef = useRef(null);

  const selectedJourneyData = journeys.find(
    (journey) => journey.id === selectedJourney
  );

  const displayedPoints = isRecording
    ? recordedPoints
    : selectedJourneyData?.points || [];

  const currentRouteDistance = calculateRouteDistance(
    recordedPoints
  );

  // Persist journey history
  useEffect(() => {
    writeData("returnJourneys", journeys);
  }, [journeys]);

  // Stop GPS tracking
  const stopGpsTracking = () => {
    if (
      watchId.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // Start an opt-in return journey recording
  const startRecording = () => {
    if (!consent) {
      setError(
        "Please provide GPS recording consent before starting."
      );
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");
    setRecordedPoints([]);
    pointsRef.current = [];
    startedAtRef.current = new Date().toISOString();

    setSelectedJourney(null);
    setStatusMessage("Waiting for your GPS location...");

    setIsRecording(true);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setCurrentPosition(point);

        // Avoid saving repeated GPS coordinates
        const previous = pointsRef.current;
        const lastPoint = previous[previous.length - 1];

        if (
          !lastPoint ||
          calculateDistance(lastPoint, point) >= 0.005
        ) {
          const updatedPoints = [...previous, point];

          pointsRef.current = updatedPoints;
          setRecordedPoints(updatedPoints);
        }

        setStatusMessage(
          `Recording your journey. GPS accuracy: ${Math.round(
            position.coords.accuracy
          )} metres.`
        );
      },
      (gpsError) => {
        let message = "Unable to access GPS location.";

        if (gpsError.code === 1) {
          message = "Location permission denied.";
        } else if (gpsError.code === 2) {
          message = "GPS location is unavailable.";
        } else if (gpsError.code === 3) {
          message = "GPS request timed out.";
        }

        setError(message);
        setStatusMessage("GPS recording stopped.");

        stopGpsTracking();
        setIsRecording(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 20000
      }
    );
  };

  // Save the recorded return journey
  const stopRecording = () => {
    stopGpsTracking();

    setIsRecording(false);
    setSaving(true);

    const points = pointsRef.current;

    if (points.length < 2) {
      setError(
        "Not enough GPS points to save a journey. Record a little longer."
      );
      setStatusMessage("Journey was not saved.");
      setSaving(false);
      return;
    }

    const journey = {
      id: Date.now(),
      title: `Return Journey ${journeys.length + 1}`,
      startedAt: startedAtRef.current,
      completedAt: new Date().toISOString(),
      points,
      distance: calculateRouteDistance(points),
      totalPoints: points.length,
      consentGiven: true
    };

    const updatedJourneys = [journey, ...journeys];

    setJourneys(updatedJourneys);
    writeData("returnJourneys", updatedJourneys);

    setSelectedJourney(journey.id);
    setStatusMessage("Your return journey was saved successfully.");
    setRecordedPoints(points);
    setSaving(false);
    setConsent(false);
    pointsRef.current = [];
  };

  // Delete a saved journey
  const deleteJourney = (id) => {
    const updatedJourneys = journeys.filter(
      (journey) => journey.id !== id
    );

    setJourneys(updatedJourneys);

    if (selectedJourney === id) {
      setSelectedJourney(null);
    }
  };

  // Clear current map selection
  const clearSelection = () => {
    setSelectedJourney(null);
    setRecordedPoints([]);
  };

  // Stop tracking if the page is closed
  useEffect(() => {
    return () => {
      stopGpsTracking();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-4 md:p-8 space-y-6">

          {/* Page heading */}
          <section>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Route Intelligence
            </h1>

            <p className="text-slate-500 mt-2">
              Learn from completed rider return journeys and discover
              frequently travelled roads.
            </p>
          </section>

          {/* Privacy and consent */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="text-green-600 shrink-0"
                size={25}
              />

              <div>
                <h2 className="font-bold text-slate-800">
                  GPS Privacy and Consent
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  GPS recording is optional. Your location is recorded
                  only after you provide consent and start a journey.
                  You can stop recording at any time.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                disabled={isRecording}
                onChange={(event) =>
                  setConsent(event.target.checked)
                }
                className="mt-1 w-4 h-4 accent-green-600"
              />

              <span className="text-sm text-slate-700">
                I voluntarily agree to share my GPS route data
                for RiderConnect route intelligence.
              </span>
            </label>
          </section>

          {/* Recording controls */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">

              <div>
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Radio className="text-green-600" />
                  Return Journey Recorder
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Record the route you travel while returning to the store.
                </p>

                <p className="text-sm mt-3 text-slate-600">
                  {statusMessage}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!consent || saving}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    <Radio size={18} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    <Square size={18} />
                    Stop and Save
                  </button>
                )}

              </div>
            </div>

            {isRecording && (
              <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
                  GPS recording is active
                </p>

                <p className="text-sm text-green-700 mt-2">
                  GPS points collected: {recordedPoints.length}
                </p>

                <p className="text-sm text-green-700">
                  Recorded distance: {currentRouteDistance.toFixed(3)} km
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 flex gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <AlertCircle size={19} />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <History className="text-green-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Saved Journeys
                  </p>

                  <h2 className="text-2xl font-bold">
                    {journeys.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Route className="text-blue-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Total Recorded Distance
                  </p>

                  <h2 className="text-2xl font-bold">
                    {journeys
                      .reduce(
                        (total, journey) =>
                          total + journey.distance,
                        0
                      )
                      .toFixed(2)} km
                  </h2>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MapPin className="text-purple-700" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    GPS Points Saved
                  </p>

                  <h2 className="text-2xl font-bold">
                    {journeys.reduce(
                      (total, journey) =>
                        total + journey.totalPoints,
                      0
                    )}
                  </h2>
                </div>
              </div>
            </div>

          </section>

          {/* Journey map */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-800">
                  Recorded Journey Map
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  View your current recording or select a saved journey.
                </p>
              </div>

              {!isRecording && selectedJourney && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div
              className="w-full overflow-hidden rounded-xl border"
              style={{ height: "450px" }}
            >
              <MapContainer
                center={currentPosition || INITIAL_POSITION}
                zoom={INITIAL_POSITION ? 13 : 5}
                scrollWheelZoom
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {currentPosition && (
                  <>
                    <MapUpdater position={currentPosition} />

                    <CircleMarker
                      center={currentPosition}
                      radius={9}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: "#16a34a",
                        fillOpacity: 1,
                        weight: 3
                      }}
                    >
                      <Popup>Current rider location</Popup>
                    </CircleMarker>
                  </>
                )}

                {displayedPoints.length > 1 && (
                  <Polyline
                    positions={displayedPoints}
                    pathOptions={{
                      color: "#16a34a",
                      weight: 5,
                      opacity: 0.85
                    }}
                  />
                )}

                {displayedPoints.length > 0 && (
                  <>
                    <CircleMarker
                      center={displayedPoints[0]}
                      radius={7}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: "#2563eb",
                        fillOpacity: 1
                      }}
                    >
                      <Popup>Journey starting point</Popup>
                    </CircleMarker>

                    <CircleMarker
                      center={displayedPoints[displayedPoints.length - 1]}
                      radius={7}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: "#dc2626",
                        fillOpacity: 1
                      }}
                    >
                      <Popup>Journey ending point</Popup>
                    </CircleMarker>
                  </>
                )}
              </MapContainer>
            </div>

            <div className="flex flex-wrap gap-5 mt-4 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-600 rounded-full" />
                Recorded route
              </span>

              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full" />
                Start
              </span>

              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full" />
                End
              </span>
            </div>
          </section>

          {/* Saved journey history */}
          <section className="bg-white border rounded-xl p-5">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <History className="text-green-600" />
              Return Journey History
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-5">
              Select a saved journey to view its recorded route.
            </p>

            {journeys.length === 0 ? (
              <div className="text-center py-10">
                <Route
                  className="mx-auto text-slate-300"
                  size={42}
                />

                <p className="font-semibold text-slate-700 mt-3">
                  No journeys recorded yet
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Provide consent and start your first return journey.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {journeys.map((journey) => (
                  <div
                    key={journey.id}
                    className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 ${
                      selectedJourney === journey.id
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {journey.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(journey.completedAt)}
                      </p>

                      <p className="text-sm text-slate-600 mt-2">
                        Distance: {journey.distance.toFixed(2)} km
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {journey.totalPoints} GPS points
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedJourney(journey.id)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        View Route
                      </button>

                      <button
                        onClick={() => deleteJourney(journey.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                        title="Delete journey"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Future intelligence */}
          <section className="bg-slate-900 text-white rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Navigation className="text-green-400" size={25} />

              <h2 className="font-bold text-lg">
                Upcoming: Smart Route Recommendations
              </h2>
            </div>

            <p className="text-sm text-slate-300 mt-3">
              RiderConnect will analyse multiple recorded journeys
              to identify frequently travelled road corridors.
              Future recommendations will validate road direction,
              one-way restrictions and route connectivity before
              suggesting a route to a new delivery destination.
            </p>

            <p className="text-xs text-green-300 mt-3">
              Current version: GPS recording and local journey history.
            </p>
          </section>

          <p className="text-xs text-slate-400">
            GPS journeys are currently stored in this browser using
            localStorage. They are not uploaded to a server.
          </p>

        </div>
      </main>
    </div>
  );
}
