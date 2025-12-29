const API_KEY = "ceab97c8-c5a3-4972-9f36-3a10cde9baf7";
const REFRESH_INTERVAL = 30000;

let map = L.map("map").setView([40.75, -73.9], 11);
let busLayer = L.layerGroup().addTo(map);
let stopLayer = L.layerGroup().addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Icons
const busIcon = L.circleMarker([0, 0], {
  radius: 6,
  color: "#00aaff",
  fillOpacity: 0.9
});

function clearLayers() {
  busLayer.clearLayers();
  stopLayer.clearLayers();
}

async function loadData() {
  clearLayers();

  const route = document.getElementById("routeInput").value.trim();
  if (!route) return;

  await loadBuses(route);
  await loadStops(route);
}

// 🔵 Load buses
async function loadBuses(route) {
  const url =
    `https://bustime.mta.info/api/siri/vehicle-monitoring.json?key=${API_KEY}&LineRef=${route}`;

  const res = await fetch(url);
  const data = await res.json();

  const vehicles =
    data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;

  vehicles.forEach(v => {
    const j = v.MonitoredVehicleJourney;
    const lat = j.VehicleLocation.Latitude;
    const lon = j.VehicleLocation.Longitude;

    const marker = L.circleMarker([lat, lon], {
      radius: 6,
      color: "#00aaff",
      fillOpacity: 0.9
    }).bindPopup(`
      <b>Bus:</b> ${j.VehicleRef}<br>
      <b>Route:</b> ${j.LineRef}<br>
      <b>Dir:</b> ${j.DirectionRef}<br>
      <b>Next Stop:</b> ${j.MonitoredCall?.StopPointName || "N/A"}
    `);

    marker.addTo(busLayer);
  });
}

// 📍 Load stops
async function loadStops(route) {
  const url =
    `https://bustime.mta.info/api/where/stops-for-route/${route}.json?key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  data.data.stops.forEach(stop => {
    L.circleMarker([stop.lat, stop.lon], {
      radius: 3,
      color: "#ffcc00"
    }).bindPopup(stop.name)
      .addTo(stopLayer);
  });
}

// 🔄 Auto refresh
setInterval(() => {
  loadData();
}, REFRESH_INTERVAL);
