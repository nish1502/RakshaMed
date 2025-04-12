function handleImage() {
    const file = document.getElementById("medImage").files[0];
    const resultContainer = document.getElementById("resultContainer");
    const ocrText = document.getElementById("ocrText");
  
    if (!file) {
      alert("Please select an image.");
      return;
    }
  
    ocrText.innerText = "📡 Scanning image for text...";
  
    const reader = new FileReader();
    reader.onload = function () {
      Tesseract.recognize(reader.result, 'eng', {
        logger: m => console.log(m) // optional logging
      }).then(({ data: { text, confidence } }) => {
        if (confidence < 50) {
          ocrText.innerHTML = `❌ OCR confidence is too low (${confidence.toFixed(2)}%). Try a clearer image.`;
          resultContainer.innerHTML = "";
          return;
        }
  
        // Clean & tokenize
        const cleaned = text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter(word => word.length > 3 && /^[a-z]+$/.test(word)); // remove gibberish
  
        // Optional medical terms filter
        const medicalKeywords = ["paracetamol", "dolo", "tablet", "capsule", "azithro", "amoxy", "clav", "pain", "fever"];
        const filteredWords = cleaned.filter(word =>
          medicalKeywords.some(key => word.includes(key))
        );
  
        console.log("🧾 Cleaned OCR Words:", cleaned);
        ocrText.innerHTML = `🧾 OCR Confidence: <strong>${confidence.toFixed(2)}%</strong><br>Detected Words: ${cleaned.join(", ")}`;
  
        searchFromOCR(filteredWords.length ? filteredWords : cleaned);
      }).catch(err => {
        console.error("❌ OCR Error:", err);
        ocrText.innerHTML = `<span class="text-danger">❌ OCR failed. Please try a clearer image.</span>`;
      });
    };
  
    reader.readAsDataURL(file);
  }
  
  function searchFromOCR(words) {
    const resultContainer = document.getElementById("resultContainer");
  
    fetch("data/medicines.json")
      .then(res => res.json())
      .then(data => {
        const scoredMatches = data.map(item => {
          const name = (item.name || "").toLowerCase();
          const salt1 = (item.short_composition1 || "").toLowerCase();
          const salt2 = (item.short_composition2 || "").toLowerCase();
  
          let score = 0;
          words.forEach(word => {
            if (name.includes(word)) score += 2;
            if (salt1.includes(word)) score += 1;
            if (salt2.includes(word)) score += 1;
            if (word === name) score += 5; // exact match
          });
  
          return { ...item, matchScore: score };
        });
  
        const topMatches = scoredMatches
          .filter(m => m.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);
  
        if (topMatches.length > 0) {
          resultContainer.innerHTML = `<h5 class="mb-3">🔍 Top ${topMatches.length} Matches:</h5>`;
  
          topMatches.forEach((match, i) => {
            resultContainer.innerHTML += `
              <div class="card shadow border-left-success mb-3">
                <div class="card-body">
                  <h5 class="card-title">#${i + 1}. ${match.name}</h5>
                  <p><strong>Salt 1:</strong> ${match.short_composition1 || "N/A"}</p>
                  <p><strong>Salt 2:</strong> ${match.short_composition2 || "N/A"}</p>
                  <p><strong>Manufacturer:</strong> ${match.manufacturer_name || "N/A"}</p>
                  <p><strong>Type:</strong> ${match.type || "N/A"}</p>
                  <p><strong>Price:</strong> ₹${match["price(â‚¹)"] || "N/A"}</p>
                  <p><strong>Match Score:</strong> ${match.matchScore}</p>
                </div>
              </div>
            `;
          });
        } else {
          resultContainer.innerHTML = `
            <div class="alert alert-warning">⚠️ No confident match found. Try a clearer or more zoomed-in image.</div>
          `;
        }
      });
  }
  