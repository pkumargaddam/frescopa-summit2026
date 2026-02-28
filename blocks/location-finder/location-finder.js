const COMPUTE_BACKEND = 'https://compute-backend-p45403-e1547974-first-compute.adobeaemcloud.com/compute/frescopa-locations';
const LOCAL_PROXY = 'http://localhost:3001/api/frescopa-locations';

function getApiUrl() {
  return window.location.hostname === 'localhost' ? LOCAL_PROXY : COMPUTE_BACKEND;
}

function createSearchForm() {
  const form = document.createElement('div');
  form.className = 'location-finder-search';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Zip code';
  input.className = 'location-finder-input';
  input.maxLength = 10;
  input.setAttribute('aria-label', 'Enter zipcode to find locations');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'location-finder-btn';
  button.textContent = 'Search';

  form.append(input, button);
  return form;
}

function parseTimeToMinutes(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'AM' && hours === 12) hours = 0;
  else if (period === 'PM' && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

function getFutureTimes(times) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return times.filter((time) => parseTimeToMinutes(time) > currentMinutes);
}

function createLocationCard(location, futureTimes) {
  const card = document.createElement('div');
  card.className = 'location-card';

  const info = document.createElement('div');
  info.className = 'location-info';
  info.innerHTML = `
    <h4>${location.name}</h4>
    <p class="location-address">${location.address}</p>
    <p class="location-distance">${location.distance} away</p>
  `;

  const times = document.createElement('div');
  times.className = 'location-times';

  if (futureTimes.length === 0) {
    times.innerHTML = '<p class="times-label">No more slots available today</p>';
  } else {
    times.innerHTML = '<p class="times-label">Available times:</p>';
    const timesGrid = document.createElement('div');
    timesGrid.className = 'times-grid';

    futureTimes.forEach((time) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = time;
      btn.dataset.locationId = location.id;
      btn.dataset.locationName = location.name;
      btn.dataset.locationAddress = location.address;
      btn.dataset.time = time;
      timesGrid.append(btn);
    });

    times.append(timesGrid);
  }

  card.append(info, times);
  return card;
}

function showConfirmation(overlay, booking, zipcode) {
  const popup = overlay.querySelector('.location-popup');
  const bookingRef = `FCP-${Date.now().toString(36).toUpperCase()}`;

  popup.innerHTML = `
    <div class="popup-header">
      <h3>Booking Confirmed!</h3>
      <button type="button" class="popup-close" aria-label="Close">&times;</button>
    </div>
    <div class="popup-body confirmation">
      <div class="confirmation-icon">&#10003;</div>
      <h4>Your tasting experience is booked</h4>
      <div class="confirmation-details">
        <p><strong>Location:</strong> ${booking.locationName}</p>
        <p><strong>Address:</strong> ${booking.locationAddress}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Zipcode:</strong> ${zipcode}</p>
        <p><strong>Booking Ref:</strong> ${bookingRef}</p>
      </div>
      <p class="confirmation-note">A confirmation email will be sent to you shortly.</p>
    </div>
    <div class="popup-footer">
      <button type="button" class="confirm-btn done-btn">Done</button>
    </div>
  `;

  popup.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
  popup.querySelector('.done-btn').addEventListener('click', () => overlay.remove());
}

function showPopup(block, data) {
  // Remove any existing popup
  block.querySelector('.location-popup-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'location-popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'location-popup';

  const header = document.createElement('div');
  header.className = 'popup-header';
  header.innerHTML = `
    <h3>Locations near ${data.zipcode}</h3>
    <button type="button" class="popup-close" aria-label="Close">&times;</button>
  `;

  const body = document.createElement('div');
  body.className = 'popup-body';

  if (!data.locations || data.locations.length === 0) {
    body.innerHTML = '<p class="no-results">No locations found for this zipcode. Please try another.</p>';
  } else {
    let hasAnySlots = false;
    data.locations.forEach((loc) => {
      const futureTimes = getFutureTimes(loc.times);
      if (futureTimes.length > 0) hasAnySlots = true;
      body.append(createLocationCard(loc, futureTimes));
    });
    if (!hasAnySlots) {
      const note = document.createElement('p');
      note.className = 'no-results';
      note.textContent = 'All timeslots for today have passed. Please try again tomorrow.';
      body.prepend(note);
    }
  }

  const footer = document.createElement('div');
  footer.className = 'popup-footer';
  footer.innerHTML = `
    <div class="selected-info" hidden>
      <p class="selected-summary"></p>
    </div>
    <button type="button" class="confirm-btn" disabled>Confirm Booking</button>
  `;

  popup.append(header, body, footer);
  overlay.append(popup);
  document.body.append(overlay);

  // Selection state
  let selected = null;

  // Time slot selection
  body.addEventListener('click', (e) => {
    const slot = e.target.closest('.time-slot');
    if (!slot) return;

    body.querySelectorAll('.time-slot').forEach((s) => s.classList.remove('selected'));
    slot.classList.add('selected');

    selected = {
      locationId: slot.dataset.locationId,
      locationName: slot.dataset.locationName,
      locationAddress: slot.dataset.locationAddress,
      time: slot.dataset.time,
    };

    const info = footer.querySelector('.selected-info');
    info.hidden = false;
    info.querySelector('.selected-summary').textContent = `${selected.locationName} — ${selected.time}`;
    footer.querySelector('.confirm-btn').disabled = false;
  });

  // Close popup
  const closePopup = () => overlay.remove();
  header.querySelector('.popup-close').addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  // Confirm booking
  footer.querySelector('.confirm-btn').addEventListener('click', () => {
    if (!selected) return;
    showConfirmation(overlay, selected, data.zipcode);
  });
}

export default async function decorate(block) {
  // Extract authored content
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h2, h3, h1');
  const headingText = heading?.textContent || 'Schedule a Frescopa coffee bean tasting experience';

  // Rebuild block
  block.textContent = '';

  // Left panel - search content
  const panel = document.createElement('div');
  panel.className = 'location-finder-panel';

  const h2 = document.createElement('h2');
  h2.textContent = headingText;
  panel.append(h2);

  const label = document.createElement('p');
  label.className = 'location-finder-label';
  label.textContent = 'Find a Location NOW';
  panel.append(label);

  const searchForm = createSearchForm();
  panel.append(searchForm);

  const status = document.createElement('div');
  status.className = 'location-finder-status';
  panel.append(status);

  // Right panel - map placeholder
  const mapPanel = document.createElement('div');
  mapPanel.className = 'location-finder-map';
  mapPanel.innerHTML = `
    <div class="location-finder-map-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
      <span>Map View</span>
    </div>
  `;

  block.append(panel, mapPanel);

  // Search handler
  const input = searchForm.querySelector('.location-finder-input');
  const btn = searchForm.querySelector('.location-finder-btn');

  async function doSearch() {
    const zipcode = input.value.trim();
    if (!zipcode) {
      status.textContent = 'Please enter a zipcode.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Searching...';
    status.textContent = '';

    try {
      const resp = await fetch(`${getApiUrl()}?zipcode=${encodeURIComponent(zipcode)}`);
      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
      const data = await resp.json();
      showPopup(block, data);
    } catch (err) {
      status.textContent = 'Unable to find locations. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
