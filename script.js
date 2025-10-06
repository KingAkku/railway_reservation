// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Get all form elements ---
    const reservationForm = document.getElementById('reservation-form');
    const fromStationDropdown = document.getElementById('from-station');
    const toStationDropdown = document.getElementById('to-station');
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
    const confirmation = document.getElementById('confirmation');
    const bookingModal = document.getElementById('booking-modal');
    const trainsList = document.getElementById('trains-list');
    const bookingForm = document.getElementById('booking-form');
    const successModal = document.getElementById('success-modal'); // Success modal

    // --- Function to display train search results ---
    function displayTrains(from, to, trains, date, jClass) {
        trainsList.innerHTML = ''; // Clear previous results

        if (trains.length === 0) {
            trainsList.innerHTML = `<div class="text-center bg-white p-6 rounded-lg shadow-md"><p class="text-gray-600">No trains found for the selected route on this date.</p></div>`;
            return;
        }

        trains.forEach(train => {
            const availabilityClass = train.availability.toLowerCase().includes('available') ? 'text-green-600' : 'text-orange-600';
            const trainCard = `
                <div class="train-card bg-white p-5 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center">
                    <div class="flex-grow">
                        <p class="text-xl font-bold text-gray-900">${train.name} (${train.no})</p>
                        <div class="flex items-center space-x-4 text-gray-700 mt-2">
                            <div><p class="font-semibold">${train.departure}</p><p class="text-sm text-gray-500">${from}</p></div>
                            <div class="text-sm text-gray-400">→ ${train.duration} →</div>
                            <div><p class="font-semibold">${train.arrival}</p><p class="text-sm text-gray-500">${to}</p></div>
                        </div>
                    </div>
                    <div class="text-center mt-4 md:mt-0 md:ml-6">
                        <p class="font-semibold text-lg ${availabilityClass}">${train.availability}</p>
                        <p class="text-sm text-gray-500">${train.class}</p>
                        <button class="book-btn btn mt-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
                                data-train-no="${train.no}"
                                data-class="${train.class}"
                                data-train-name="${train.name}"
                                data-journey-date="${date}">Book Now</button>
                    </div>
                </div>`;
            trainsList.insertAdjacentHTML('beforeend', trainCard);
        });
    }

    // --- Function to fetch locations and populate dropdowns ---
    async function populateLocationDropdowns() {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) throw new Error('Failed to fetch locations');
            const locations = await response.json();
            fromStationDropdown.innerHTML = '<option value="" disabled selected>Select origin</option>';
            toStationDropdown.innerHTML = '<option value="" disabled selected>Select destination</option>';
            locations.forEach(location => {
                fromStationDropdown.add(new Option(location, location));
                toStationDropdown.add(new Option(location, location));
            });
        } catch (error) {
            console.error(error);
            fromStationDropdown.innerHTML = '<option value="" disabled selected>Error loading stations</option>';
            toStationDropdown.innerHTML = '<option value="" disabled selected>Error loading stations</option>';
        }
    }

    // --- Initialize Page ---
    populateLocationDropdowns();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];

    // --- Event Listener for Search Form ---
    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fromStation = fromStationDropdown.value;
        const toStation = toStationDropdown.value;
        const journeyDate = document.getElementById('date').value;
        const journeyClass = document.getElementById('class').value;
        if (!fromStation || !toStation) {
            alert("Please select both origin and destination stations.");
            return;
        }
        try {
            const apiUrl = `/api/trains?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${journeyDate}&class=${encodeURIComponent(journeyClass)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const trains = await response.json();
            displayTrains(fromStation, toStation, trains, journeyDate, journeyClass);
            searchForm.classList.add('hidden');
            searchResults.classList.remove('hidden');
        } catch (error) {
            console.error("Error fetching trains:", error);
        }
    });

    // --- Event Listener for Back Button ---
    document.getElementById('back-to-search').addEventListener('click', () => {
        searchResults.classList.add('hidden');
        searchForm.classList.remove('hidden');
    });

    // --- Event Listeners for Booking Modal ---
    trainsList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('book-btn')) {
            const button = e.target;
            document.getElementById('modal-train-details').textContent = `Train: ${button.dataset.trainName} (${button.dataset.trainNo})`;
            document.getElementById('modal-train-no').value = button.dataset.trainNo;
            document.getElementById('modal-class-type').value = button.dataset.class;
            document.getElementById('modal-journey-date').value = button.dataset.journeyDate;
            bookingModal.classList.remove('hidden');
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookingData = {
            trainNo: document.getElementById('modal-train-no').value,
            classType: document.getElementById('modal-class-type').value,
            journeyDate: document.getElementById('modal-journey-date').value,
            userName: document.getElementById('user-name').value,
            userEmail: document.getElementById('user-email').value,
            userPhone: document.getElementById('user-phone').value,
        };
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const result = await response.json();
            if (result.success) {
                document.getElementById('success-booking-id').textContent = `Your Booking ID is: ${result.bookingId}`;
                bookingModal.classList.add('hidden');
                successModal.classList.remove('hidden');
                bookingForm.reset();
            } else {
                throw new Error(result.message || 'Booking failed.');
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        bookingModal.classList.add('hidden');
    });

    // Handles the "Go to Home" button by reloading the page to its initial state
    document.getElementById('go-home-btn').addEventListener('click', () => {
        window.location.reload();
    });

    // Handles the "Book Another Ticket" button by hiding the pop-up
    document.getElementById('book-another-btn').addEventListener('click', () => {
        // This simply hides the success modal, revealing the search results again
        successModal.classList.add('hidden');
    });
});