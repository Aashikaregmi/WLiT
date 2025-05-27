document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    const pickupPointSelect = document.getElementById('pickupPointSelect');
    const findBusesBtn = document.getElementById('findBusesBtn');
    const busResultsArea = document.getElementById('bus-results-area');
    const busResultsHeader = document.getElementById('bus-results-header');
    const selectedPickupDisplay = document.getElementById('selected-pickup-display');
    const busResultsDiv = document.getElementById('bus-results');
    const noResultsMessage = document.querySelector('.no-results-message');

    const timerSection = document.getElementById('timer-section');
    const countdownDisplay = document.getElementById('countdown-display');
    const busInfoDisplay = document.getElementById('bus-info-display');
    const cancelTripBtn = document.getElementById('cancelTripBtn');

    let map;
    let userMarker;
    let timerInterval;
    let audioAlarm = new Audio('/audio/alarm.mp3');
    audioAlarm.loop = true;

    const pokharaCoords = [28.2096, 83.9856];
    let currentPickupName = null;

    // Map Initialization
    if (mapContainer) {
        map = L.map('map').setView(pokharaCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', (e) => {
            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker(e.latlng).addTo(map)
                .bindPopup("Your Selected Pickup Point").openPopup();
            map.panTo(e.latlng);
            currentPickupName = `Map Point (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
            pickupPointSelect.value = '';
        });

        pickupPointSelect.addEventListener('change', () => {
            currentPickupName = pickupPointSelect.value;
            if (currentPickupName) {
                const mockPointCoords = {
                    "Mahendrapul": [28.2163, 83.9873],
                    "Lakeside": [28.2155, 83.9576],
                    "Hallan Chowk": [28.2201, 83.9788],
                    "Prithvi Chowk": [28.2003, 83.9928]
                };
                const coords = mockPointCoords[currentPickupName] || pokharaCoords;
                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker(coords).addTo(map)
                    .bindPopup(`Selected: ${currentPickupName}`).openPopup();
                map.setView(coords, 15);
            } else {
                if (userMarker) map.removeLayer(userMarker);
            }
        });
    }

    // Bus Search
    findBusesBtn.addEventListener('click', async () => {
        let finalPickupQuery = pickupPointSelect.value || currentPickupName;
        if (!finalPickupQuery || finalPickupQuery.includes('Select Pickup Point')) {
            alert('Please select a pickup point from the map or dropdown!');
            return;
        }

        selectedPickupDisplay.textContent = finalPickupQuery;
        busResultsHeader.style.display = 'block';
        busResultsDiv.innerHTML = '';
        noResultsMessage.style.display = 'none';

        try {
            const response = await fetch(`/buses/user/filter?pickup=${encodeURIComponent(finalPickupQuery)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    noResultsMessage.textContent = `No buses found from "${finalPickupQuery}". Please try another location.`;
                    noResultsMessage.style.display = 'block';
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const buses = await response.json();

            if (buses.length === 0) {
                noResultsMessage.textContent = `No buses found from "${finalPickupQuery}". Please try another location.`;
                noResultsMessage.style.display = 'block';
            } else {
                buses.forEach(bus => {
                    const busCard = document.createElement('div');
                    busCard.classList.add('bus-card');
                    busCard.innerHTML = `
                        <h3>Bus No: ${bus.busNumber}</h3>
                        <p>Route: ${bus.pickUp} to ${bus.destination}</p>
                        <p>Departure: ${new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p class="fare">Fare: Rs. ${bus.fare}</p>
                        <button class="btn btn-success select-bus-btn"
                                data-bus-id="${bus._id}"
                                data-bus-number="${bus.busNumber}"
                                data-departure-time="${bus.departureTime}"
                                data-pickup="${bus.pickUp}"
                                data-destination="${bus.destination}">
                            Select Bus
                        </button>
                    `;
                    busResultsDiv.appendChild(busCard);
                });

                document.querySelectorAll('.select-bus-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const busId = event.target.dataset.busId;
                        const busNumber = event.target.dataset.busNumber;
                        const departureTime = event.target.dataset.departureTime;
                        const pickup = event.target.dataset.pickup;
                        const destination = event.target.dataset.destination;
                        // Simulate selection
                        await fetch(`/buses/user/select/${busId}`, { method: 'POST' });
                        startBusTimer(busNumber, departureTime, pickup, destination);
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching buses:', error);
            busResultsDiv.innerHTML = '<p class="alert">Failed to load bus routes. Please try again later.</p>';
        }
    });

    // Bus Timer
    function startBusTimer(busNumber, departureTimeStr, pickup, destination) {
        const departureTime = new Date(departureTimeStr).getTime();
        const now = new Date().getTime();
        let remainingTimeMs = Math.max(0, departureTime - now);
        if (remainingTimeMs === 0) {
            remainingTimeMs = 45 * 60 * 1000; // 45 minutes for demo
        }

        busResultsArea.style.display = 'none';
        mapContainer.style.display = 'none';
        pickupPointSelect.parentElement.style.display = 'none';
        findBusesBtn.style.display = 'none';
        timerSection.style.display = 'block';

        busInfoDisplay.innerHTML = `Bus No: <b>${busNumber}</b><br>From: <b>${pickup}</b><br>To: <b>${destination}</b>`;

        if (timerInterval) clearInterval(timerInterval);
        audioAlarm.pause();
        audioAlarm.currentTime = 0;

        timerInterval = setInterval(() => {
            remainingTimeMs -= 1000;
            if (remainingTimeMs <= 0) {
                clearInterval(timerInterval);
                countdownDisplay.textContent = "Arrived!";
                busInfoDisplay.innerHTML = `Bus No: <b>${busNumber}</b> has arrived at <b>${pickup}</b>!<br>Enjoy your trip!`;
                timerSection.classList.remove('timer-alert-30min', 'timer-alert-5min');
                audioAlarm.pause();
                audioAlarm.currentTime = 0;
                cancelTripBtn.style.display = 'none';
                return;
            }

            const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);
            countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (minutes <= 30 && minutes > 5 && !timerSection.classList.contains('timer-alert-30min')) {
                timerSection.classList.add('timer-alert-30min');
            } else if (minutes > 30 && timerSection.classList.contains('timer-alert-30min')) {
                timerSection.classList.remove('timer-alert-30min');
            }

            if (minutes <= 5 && !timerSection.classList.contains('timer-alert-5min')) {
                timerSection.classList.remove('timer-alert-30min');
                timerSection.classList.add('timer-alert-5min');
                audioAlarm.play().catch(e => console.error("Audio play failed:", e));
            } else if (minutes > 5 && timerSection.classList.contains('timer-alert-5min')) {
                timerSection.classList.remove('timer-alert-5min');
                audioAlarm.pause();
                audioAlarm.currentTime = 0;
            }
        }, 1000);
    }

    // Cancel Trip
    cancelTripBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this trip?')) {
            clearInterval(timerInterval);
            audioAlarm.pause();
            audioAlarm.currentTime = 0;
            timerSection.style.display = 'none';
            busResultsArea.style.display = 'block';
            mapContainer.style.display = 'block';
            pickupPointSelect.parentElement.style.display = 'block';
            findBusesBtn.style.display = 'block';
            countdownDisplay.textContent = "00:00";
            timerSection.classList.remove('timer-alert-30min', 'timer-alert-5min');
            busResultsDiv.innerHTML = '';
            busResultsHeader.style.display = 'none';
            noResultsMessage.style.display = 'none';
            pickupPointSelect.value = '';
            if (userMarker) map.removeLayer(userMarker);
            currentPickupName = null;
            map.setView(pokharaCoords, 13);
        }
    });
});