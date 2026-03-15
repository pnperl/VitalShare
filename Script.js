const STORAGE_KEY = 'lpg-buddy-live-listings';

const seedListings = [
  {
    id: 'seed-1',
    name: 'Ravi Sharma',
    phone: '98xxxx1201',
    area: 'Mukherjee Nagar, Delhi',
    rentPerDay: 90,
    deposit: 1200,
    duration: '7-30 days',
    note: 'Regulator included, evening pickup preferred.',
    available: true,
    updatedAt: Date.now() - 1000 * 60 * 35,
    lat: 28.7056,
    lon: 77.2059
  },
  {
    id: 'seed-2',
    name: 'Sana Khan',
    phone: '88xxxx3904',
    area: 'Laxmi Nagar, Delhi',
    rentPerDay: 80,
    deposit: 1000,
    duration: '5-20 days',
    note: 'Morning pickup, quick handover.',
    available: true,
    updatedAt: Date.now() - 1000 * 60 * 10,
    lat: 28.6303,
    lon: 77.2773
  },
  {
    id: 'seed-3',
    name: 'Pritam Das',
    phone: '97xxxx4512',
    area: 'Karol Bagh, Delhi',
    rentPerDay: 110,
    deposit: 1500,
    duration: '15-60 days',
    note: 'Long duration preferred.',
    available: true,
    updatedAt: Date.now() - 1000 * 60 * 70,
    lat: 28.6519,
    lon: 77.1909
  }
];

const dom = {
  searchForm: document.getElementById('searchForm'),
  addListingForm: document.getElementById('addListingForm'),
  areaInput: document.getElementById('areaInput'),
  budgetInput: document.getElementById('budgetInput'),
  distanceInput: document.getElementById('distanceInput'),
  listings: document.getElementById('listings'),
  resultCount: document.getElementById('resultCount'),
  searchStatus: document.getElementById('searchStatus'),
  formStatus: document.getElementById('formStatus'),
  heroMetrics: document.getElementById('heroMetrics')
};

let map;
let markersLayer;
let searchMarker;
let appState = loadListings();

function loadListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedListings));
    return seedListings;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (error) {
    console.warn('Failed to parse local listings, resetting seeds.', error);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedListings));
  return seedListings;
}

function saveListings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView([28.6448, 77.2167], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function formatAgo(timestamp) {
  const mins = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(aLat, aLon, bLat, bLon) {
  const earthRadius = 6371;
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const c1 = Math.sin(dLat / 2) ** 2;
  const c2 = Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * (2 * Math.atan2(Math.sqrt(c1 + c2), Math.sqrt(1 - c1 - c2)));
}

async function geocodeArea(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Could not reach geocoding service.');
  }

  const data = await response.json();
  if (!data.length) {
    throw new Error('Area not found. Try a more specific location.');
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    displayName: data[0].display_name
  };
}

function renderMetrics(listings) {
  const liveCount = listings.filter((item) => item.available).length;
  const avgRent = Math.round(listings.reduce((sum, item) => sum + item.rentPerDay, 0) / listings.length);
  const localities = new Set(listings.map((item) => item.area)).size;

  dom.heroMetrics.innerHTML = `
    <article class="metric"><strong>${liveCount}</strong><span>Live listings</span></article>
    <article class="metric"><strong>₹${avgRent}</strong><span>Avg. daily rent</span></article>
    <article class="metric"><strong>${localities}</strong><span>Covered localities</span></article>
  `;
}

function renderMap(listings, center) {
  markersLayer.clearLayers();

  listings.forEach((item) => {
    if (!item.lat || !item.lon) return;
    const marker = L.marker([item.lat, item.lon]).bindPopup(
      `<strong>${item.name}</strong><br/>${item.area}<br/>₹${item.rentPerDay}/day`
    );
    markersLayer.addLayer(marker);
  });

  if (searchMarker) {
    map.removeLayer(searchMarker);
  }

  if (center) {
    searchMarker = L.circleMarker([center.lat, center.lon], {
      radius: 9,
      color: '#22e7ff',
      fillColor: '#22e7ff',
      fillOpacity: 0.65
    }).bindPopup('Search center').addTo(map);
    map.setView([center.lat, center.lon], 12);
  } else if (listings.length && listings[0].lat && listings[0].lon) {
    map.setView([listings[0].lat, listings[0].lon], 11);
  }
}

function listingTemplate(item) {
  const distanceText = item.distanceKm ? `📏 ${item.distanceKm.toFixed(1)} km` : '📏 Distance N/A';
  return `
    <article class="listing-card">
      <div class="listing-top">
        <div>
          <h3>${item.name}</h3>
          <div class="meta"><span>📍 ${item.area}</span><span>📞 ${item.phone}</span></div>
        </div>
        <span class="badge ok">Available</span>
      </div>
      <div class="meta">
        <span>💸 ₹${item.rentPerDay}/day</span>
        <span>🔐 ₹${item.deposit} deposit</span>
        <span>⏱ ${item.duration}</span>
        <span>${distanceText}</span>
        <span>🕒 Updated ${formatAgo(item.updatedAt)}</span>
      </div>
      <p class="note">${item.note || 'No additional notes provided.'}</p>
    </article>
  `;
}

function renderListings(listings) {
  dom.resultCount.textContent = `${listings.length} matches`;

  if (!listings.length) {
    dom.listings.innerHTML = '<article class="listing-card">No listings found for this filter. Try increasing distance or budget.</article>';
    return;
  }

  dom.listings.innerHTML = listings.map(listingTemplate).join('');
}

function getFilteredListings(filters) {
  const maxBudget = Number(filters.maxBudget || Number.MAX_SAFE_INTEGER);
  const maxDistance = Number(filters.maxDistance || Number.MAX_SAFE_INTEGER);

  return appState
    .filter((item) => item.available && item.rentPerDay <= maxBudget)
    .map((item) => {
      if (!filters.center) return { ...item, distanceKm: null };

      const distance = distanceKm(filters.center.lat, filters.center.lon, item.lat, item.lon);
      return { ...item, distanceKm: distance };
    })
    .filter((item) => (item.distanceKm === null ? true : item.distanceKm <= maxDistance))
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return a.rentPerDay - b.rentPerDay;
    });
}

async function handleSearch(event) {
  event.preventDefault();
  dom.searchStatus.textContent = 'Finding location and matching listings...';

  try {
    const center = await geocodeArea(dom.areaInput.value.trim());
    const filters = {
      maxBudget: Number(dom.budgetInput.value || Number.MAX_SAFE_INTEGER),
      maxDistance: Number(dom.distanceInput.value || Number.MAX_SAFE_INTEGER),
      center
    };

    const results = getFilteredListings(filters);
    renderListings(results);
    renderMap(results.length ? results : appState, center);

    dom.searchStatus.textContent = `Showing results near ${center.displayName}.`;
  } catch (error) {
    dom.searchStatus.textContent = error.message;
    const fallback = getFilteredListings({
      maxBudget: Number(dom.budgetInput.value || Number.MAX_SAFE_INTEGER),
      maxDistance: Number.MAX_SAFE_INTEGER,
      center: null
    });
    renderListings(fallback);
    renderMap(fallback, null);
  }
}

async function handleCreateListing(event) {
  event.preventDefault();
  dom.formStatus.textContent = 'Publishing listing...';

  try {
    const areaText = document.getElementById('ownerArea').value.trim();
    const geocoded = await geocodeArea(areaText);

    const newItem = {
      id: `user-${Date.now()}`,
      name: document.getElementById('ownerName').value.trim(),
      phone: document.getElementById('ownerPhone').value.trim(),
      area: areaText,
      rentPerDay: Number(document.getElementById('dailyRent').value),
      deposit: Number(document.getElementById('deposit').value),
      duration: document.getElementById('duration').value.trim(),
      note: document.getElementById('notes').value.trim(),
      available: true,
      updatedAt: Date.now(),
      lat: geocoded.lat,
      lon: geocoded.lon
    };

    appState = [newItem, ...appState];
    saveListings();
    renderMetrics(appState);

    const fresh = getFilteredListings({ center: null, maxBudget: Number.MAX_SAFE_INTEGER, maxDistance: Number.MAX_SAFE_INTEGER });
    renderListings(fresh);
    renderMap(fresh, null);

    dom.addListingForm.reset();
    dom.formStatus.textContent = 'Listing published successfully and now visible on map.';
  } catch (error) {
    dom.formStatus.textContent = `Could not publish listing: ${error.message}`;
  }
}

function boot() {
  initMap();
  renderMetrics(appState);

  const initial = getFilteredListings({ center: null, maxBudget: Number.MAX_SAFE_INTEGER, maxDistance: Number.MAX_SAFE_INTEGER });
  renderListings(initial);
  renderMap(initial, null);

  dom.searchForm.addEventListener('submit', handleSearch);
  dom.addListingForm.addEventListener('submit', handleCreateListing);
}

boot();
