const nearbyMockData = [
    {
      name: "CityCare Multispeciality Hospital",
      type: "Hospital",
      mapsLink: "https://www.google.com/maps?q=CityCare+Multispeciality+Hospital"
    },
    {
      name: "Dr. Mehta's Family Clinic",
      type: "Doctor",
      mapsLink: "https://www.google.com/maps?q=Dr.+Mehta+Family+Clinic"
    },
    {
      name: "Apollo Pharmacy",
      type: "Pharmacy",
      mapsLink: "https://www.google.com/maps?q=Apollo+Pharmacy"
    },
    {
      name: "Swasthya Wellness Centre",
      type: "Clinic",
      mapsLink: "https://www.google.com/maps?q=Swasthya+Wellness+Clinic"
    },
    {
      name: "LifeLine Diagnostics",
      type: "Diagnostics",
      mapsLink: "https://www.google.com/maps?q=LifeLine+Diagnostics"
    },
    {
      name: "Dr. Rajeev ENT Hospital",
      type: "Hospital",
      mapsLink: "https://www.google.com/maps?q=Dr+Rajeev+ENT+Hospital"
    },
    {
      name: "Shree Medical & General Stores",
      type: "Pharmacy",
      mapsLink: "https://www.google.com/maps?q=Shree+Medical+Store"
    }
  ];
  
  function getLocation() {
    const msg = document.getElementById("locationMsg");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        msg.innerText = `📍 Your location: (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
        renderNearbyCards(); // For now use static list
      }, () => {
        msg.innerText = "⚠️ Location access denied. Showing default results.";
        renderNearbyCards();
      });
    } else {
      msg.innerText = "❌ Geolocation not supported by this browser.";
      renderNearbyCards();
    }
  }
  
  function renderNearbyCards() {
    const container = document.getElementById("nearbyContainer");
    container.innerHTML = "";
  
    nearbyMockData.forEach((place) => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
      card.innerHTML = `
        <div class="card shadow h-100">
          <div class="card-body">
            <h5 class="card-title">${place.name}</h5>
            <p class="card-text">Type: <strong>${place.type}</strong></p>
            <a href="${place.mapsLink}" target="_blank" class="btn btn-sm btn-primary">🔗 View on Map</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Auto-render mock results on page load
  window.onload = () => {
    renderNearbyCards();
  };
  