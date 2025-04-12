function searchMedicine() {
  const query = document.getElementById("medName").value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const resultContainer = document.getElementById("resultContainer");

  if (!query) {
    alert("Please enter a medicine name.");
    return;
  }

  fetch("data/medicines.json")
    .then(res => res.json())
    .then(data => {
      const match = data.find(item => {
        const name = (item["name"] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const salt1 = (item["short_composition1"] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const salt2 = (item["short_composition2"] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return name.includes(query) || salt1.includes(query) || salt2.includes(query);
      });

      if (match) {
        resultContainer.innerHTML = `
          <div class="card shadow border-left-success">
            <div class="card-body">
              <h5 class="card-title">✅ ${match.name}</h5>
              <p><strong>Salt 1:</strong> ${match.short_composition1 || "N/A"}</p>
              <p><strong>Salt 2:</strong> ${match.short_composition2 || "N/A"}</p>
              <p><strong>Manufacturer:</strong> ${match.manufacturer_name || "N/A"}</p>
              <p><strong>Type:</strong> ${match.type || "N/A"}</p>
              <p><strong>Price (MRP):</strong> ₹${match["price(â‚¹)"] || "N/A"}</p>
            </div>
          </div>
        `;
      } else {
        resultContainer.innerHTML = `
          <div class="card shadow border-left-danger">
            <div class="card-body">
              <h5 class="card-title text-danger">❌ Medicine Not Found</h5>
              <p>We couldn't find "<strong>${query}</strong>" in our dataset.</p>
            </div>
          </div>
        `;
      }
    })
    .catch(err => {
      resultContainer.innerHTML = `<p class="text-danger">❌ Error: ${err.message}</p>`;
    });
}
