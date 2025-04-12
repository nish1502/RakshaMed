document.addEventListener("DOMContentLoaded", () => {
    const entryForm = document.getElementById("entryForm");
    const cycleHistory = document.getElementById("cycleHistory");
    const nextPeriodText = document.getElementById("nextPeriod");
    const avgCycleText = document.getElementById("avgCycle");
    const userSwitcher = document.getElementById("userSwitcher");
  
    const getActiveUserKey = () => localStorage.getItem("active_user") || "user_1_history";
  
    const getHistory = () => {
      const key = getActiveUserKey();
      return JSON.parse(localStorage.getItem(key)) || [];
    };
  
    const saveHistory = (data) => {
      const key = getActiveUserKey();
      localStorage.setItem(key, JSON.stringify(data));
    };
  
    const getRecommendations = (symptoms) => {
      const map = {
        "Cramps": "👉 Use a hot water bag or ibuprofen.",
        "Fatigue": "👉 Get enough rest and drink fluids.",
        "Mood Swings": "👉 Try breathing exercises or chocolate.",
        "Acne": "👉 Use gentle skincare and avoid junk food.",
        "Headache": "👉 Rest in a dark room or take paracetamol.",
        "Nausea": "👉 Sip ginger or peppermint tea.",
        "Back Pain": "👉 Stretch or apply a heating pad."
      };
      return symptoms.map(s => map[s] || "👉 No suggestion").join("<br>");
    };
  
    const isCaregiver = () => document.getElementById("caregiverView")?.checked;
  
    const renderHistory = () => {
      const data = getHistory();
      cycleHistory.innerHTML = "";
      if (data.length === 0) {
        cycleHistory.innerHTML = "<li class='list-group-item'>No history logged yet.</li>";
        nextPeriodText.innerText = avgCycleText.innerText = "Not set";
        return;
      }
  
      let totalCycle = 0;
      for (let i = 1; i < data.length; i++) {
        const prevEnd = new Date(data[i - 1].end);
        const currentStart = new Date(data[i].start);
        totalCycle += (currentStart - prevEnd) / (1000 * 3600 * 24);
      }
      const avgCycle = data.length > 1 ? Math.round(totalCycle / (data.length - 1)) : 28;
  
      data.forEach(entry => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
          <strong>${entry.start} to ${entry.end}</strong><br>
          Symptoms: ${entry.symptoms.join(", ")}<br>
          <small class="text-muted">Recommendations:</small><br>
          ${getRecommendations(entry.symptoms)}
        `;
        cycleHistory.appendChild(li);
      });
  
      const lastEnd = new Date(data[data.length - 1].end);
      const nextPeriod = new Date(lastEnd);
      nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
  
      nextPeriodText.innerText = nextPeriod.toDateString();
      avgCycleText.innerText = `${avgCycle} days`;
  
      drawCharts(data);
      document.getElementById("entryFormContainer").style.display = isCaregiver() ? "none" : "block";
    };
  
    const drawCharts = (history) => {
      if (!history.length) return;
  
      const labels = [];
      const durations = [];
      const symptomMap = {};
  
      history.forEach(entry => {
        const start = new Date(entry.start);
        const end = new Date(entry.end);
        labels.push(entry.start);
        durations.push((end - start) / (1000 * 60 * 60 * 24));
        entry.symptoms.forEach(symptom => {
          symptomMap[symptom] = (symptomMap[symptom] || 0) + 1;
        });
      });
  
      new Chart(document.getElementById("cycleDurationChart"), {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Cycle Duration (days)",
            data: durations,
            borderColor: "#4e73df",
            fill: true
          }]
        },
        options: { responsive: true }
      });
  
      new Chart(document.getElementById("symptomChart"), {
        type: "bar",
        data: {
          labels: Object.keys(symptomMap),
          datasets: [{
            label: "Frequency",
            data: Object.values(symptomMap),
            backgroundColor: "#e74a3b"
          }]
        },
        options: { responsive: true }
      });
    };
  
    document.getElementById("caregiverView").addEventListener("change", renderHistory);
  
    if (userSwitcher) {
      userSwitcher.value = getActiveUserKey();
      userSwitcher.addEventListener("change", (e) => {
        localStorage.setItem("active_user", e.target.value);
        location.reload();
      });
    }
  
    if (!isCaregiver()) {
      entryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const start = document.getElementById("periodStart").value;
        const end = document.getElementById("periodEnd").value;
        const symptoms = Array.from(document.getElementById("symptoms").selectedOptions).map(o => o.value);
        if (!start || !end) return alert("Please enter valid dates.");
        const newEntry = { start, end, symptoms };
        const history = getHistory();
        history.push(newEntry);
        saveHistory(history);
        $('#addEntryModal').modal('hide');
        entryForm.reset();
        renderHistory();
      });
    }
  
    renderHistory();
  });
  