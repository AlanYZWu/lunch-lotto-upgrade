const apiKey = "fsq3hxJtVlvwGDVrEbkXz5o0PgRyxe+03woQ9thciadp+SI=";
const defaultSettings = {
  distance: 0.5,       // Default search radius in miles
  price: "2,3",        // Google Places API uses 1-4 ($ - $$$$)
  dietary: "",         // Empty means no filter (future: vegetarian, gluten-free, etc.)
  history: []         // Array to store restaurant selection history
};
// Convert miles to meters (Google Maps API uses meters)
function milesToMeters(miles) {
  return miles * 1609.34;
}

function showProgress() {
  const txt = document.getElementById("loading-text");
  const ctr = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  txt.style.display = "block"
  ctr.style.display = "block";
  bar.style.width = "0%";
}

// Set the bar to any percent (0–100)
function setProgress(pct) {
  document.getElementById("progress-bar").style.width = pct + "%";
}

// Complete & hide after a brief delay
function hideProgress() {
  const text = document.getElementById("loading-text");
  const ctr = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  bar.style.width = "100%";
  setTimeout(() => {
    ctr.style.display = "none";
    text.style.display = "none";
    bar.style.width = "0%";
  }, 300);
}



// Load user settings or use defaults
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (settings) => {
      resolve(settings);
    });
  });
}

async function fetchRestaurants() {
  try {
    // 🔄 Show Loading GIF and Hide the Wheel
    document.getElementById("loading-gif").style.display = "block";
    document.getElementById("wheel").style.display = "none";

    showProgress();              // 0%

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      const settings = await loadSettings();

      const radiusMeters = Math.round(milesToMeters(settings.distance));

      // 2) build the query params
      const params = new URLSearchParams({
        ll: `${lat},${lng}`,                    // must be "lat,lng"
        radius: String(radiusMeters),           // integer meters
        query: settings.keyword || "restaurant",// your search term
        limit: String(settings.limit || 20),
        min_price: settings.price[0],
        max_price: settings.price[2]
      });

      const url = `https://api.foursquare.com/v3/places/search?${params}`;
      setProgress(25);

      // 3) fetch with your raw API key header
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: apiKey   // no “Bearer ” prefix for v3
        }
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const { results } = await res.json();
      setTimeout(() => {
        setProgress(50);
      }, 2000);

      if (!results.length) {
        console.warn("No spots found!");
        hideProgress();
        return;
      }

      // ✅ Extract restaurant data
      let restaurants = results.map(place => {
        const lat = place.geocodes.main.latitude;
        const lng = place.geocodes.main.longitude;
        return {
          name: place.name,
          distance: settings.distance.toFixed(1),
          price: place.price ? "$".repeat(place.price) : "Unknown",
          lat, lng,
          // instead of a Google Maps link…
          fsqLink: `https://foursquare.com/v/${place.fsq_id}`
        };
      });

      setTimeout(() => {
        setProgress(75);
      }, 3000);

      // ✅ Remove duplicate restaurant names
      const seen = new Set();
      restaurants = restaurants.filter((restaurant) => {
        if (seen.has(restaurant.name)) {
          return false; // Duplicate found, skip this restaurant
        }
        seen.add(restaurant.name);
        return true; // Unique restaurant, keep it
      });

      console.log("✅ Unique Restaurants fetched:", restaurants);

      // ✅ Store restaurant details globally
      restaurantDetails = restaurants.reduce((acc, r) => {
        acc[r.name] = r;
        return acc;
      }, {});

      // wait for 4 seconds for restaurants to load 
      setTimeout(() => {
        setProgress(100);
        hideProgress();
      }, 4500);

      // ⏳ Wait 5 seconds before showing the wheel
      setTimeout(() => {
        document.getElementById("loading-gif").style.display = "none"; // ✅ Hide Loading GIF
        document.getElementById("wheel").style.display = "block";      // ✅ Show the wheel
        updateWheel(restaurants);                                      // ✅ Update the wheel
      }, 5000);

    }, (error) => {
      console.error("❌ Geolocation error:", error);
      alert("Please enable location access to fetch restaurants.");
      document.getElementById("loading-gif").style.display = "none";
      document.getElementById("wheel").style.display = "block";
    });
  } catch (error) {
    console.error("❌ Error fetching restaurants:", error);
    document.getElementById("loading-gif").style.display = "none";
    document.getElementById("wheel").style.display = "block";
  }
}


function updateWheel(restaurants) {
  options.length = 0; // Clear the current options array

  // Randomly shuffle the restaurants array
  const shuffledRestaurants = [...restaurants].sort(() => Math.random() - 0.5);

  // Choose 8 random restaurants
  const selectedRestaurants = shuffledRestaurants.slice(0, 8);

  // Extract restaurant names and Google Maps links, and populate options array
  options.push(...selectedRestaurants.map(r => ({
    name: r.name,
    link: r.fsqLink
  })));

  // Debugging: Log the selected restaurants with their links
  console.log("✅ Options for the Wheel:", options);

  // Store full restaurant details, including names and links
  restaurantDetails = selectedRestaurants.map(r => ({
    name: r.name,
    link: r.fsqLink
  }));

  console.log("✅ Selected Restaurants for the Wheel:", restaurantDetails);

  // Redraw the wheel with the updated options
  drawWheel();
}

// 🛠️ Toggle Settings View
function showSettings() {
  document.getElementById("main-view").style.display = "none";
  document.getElementById("settings-view").style.display = "block";
}

function hideSettings() {
  document.getElementById("main-view").style.display = "block";
  document.getElementById("settings-view").style.display = "none";
}

// Ensure scripts run only after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await fetchRestaurants();

  // Spin button event
  document.getElementById("spin").addEventListener("click", () => spin());

  // Open settings view
  document.getElementById("open-settings").addEventListener("click", showSettings);

  // Close settings view
  document.getElementById("close-settings").addEventListener("click", hideSettings);

  // Load saved settings into inputs
  const settings = await loadSettings();
  document.getElementById("distance").value = settings.distance;
  document.getElementById("price").value = settings.price;

  // Save settings
  document.getElementById("save-settings").addEventListener("click", async () => {
    const distance = parseFloat(document.getElementById("distance").value);
    const price = document.getElementById("price").value;

    // Save the updated settings
    chrome.storage.sync.set({ distance, price }, async () => {
      swal({
        title: "Settings saved!",
        icon: "success",
        button: false, // Hide the default OK button
      });

      // Hide the settings view and fetch new restaurants
      hideSettings();
      await fetchRestaurants(); // Fetch restaurants with the new settings
    });
  });
});


