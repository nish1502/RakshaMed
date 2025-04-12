let users = [];

window.onload = () => {
  const stored = localStorage.getItem("users");
  users = stored ? JSON.parse(stored) : [];
  renderFamilyCards();

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = users.filter(u => u.name.toLowerCase().includes(q));
    renderFamilyCards(filtered);
  });
};

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function getTodayDay() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
}

function getFormattedDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('en-IN', options);
}

function getWeekDates() {
  const today = new Date();
  const weekDates = [];
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // Monday as start

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const label = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }); // Mon 08 Apr
    const key = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    weekDates.push({ key, label });
  }
  return weekDates;
}

function getMonthDates() {
  const today = new Date();
  const monthDates = [];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    monthDates.push(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
  }
  return monthDates;
}

function getYearDates() {
  const yearDates = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(new Date().getFullYear(), i, 1);
    yearDates.push(date.toLocaleDateString('en-GB', { month: 'short' }));
  }
  return yearDates;
}

function renderWeekCells(med) {
  const weekDates = getWeekDates();
  if (!med.weekLog) med.weekLog = {};
  return weekDates.map(day => {
    const val = med.weekLog[day.key];
    return val === "taken"
      ? `<td class='bg-success text-white'>✔️</td>`
      : val === "missed"
      ? `<td class='bg-danger text-white'>❌</td>`
      : `<td class='bg-warning text-dark'>⚠️</td>`;
  }).join("");
}

function renderFamilyCards(filteredUsers = null) {
  const container = document.getElementById("familyContainer");
  const data = filteredUsers || users;
  container.innerHTML = "";
  const weekDates = getWeekDates();
  let missedAlerts = [];
  const today = getTodayDay();

  data.forEach((user, userIndex) => {
    const rows = user.medications.map((med, medIndex) => {
      med.weekLog = med.weekLog || {};
      if (!med.weekLog[today]) med.weekLog[today] = "missed";
      if (med.weekLog[today] === "missed") {
        missedAlerts.push(`${user.name} missed ${med.name} today`);
      }

      const lowQtyWarning = med.quantity <= 5 ? "<span class='badge badge-danger'>Low</span>" : "";

      return `
        <tr>
          <td><strong>${med.name}</strong> @ ${med.time}</td>
          <td>${med.frequency || 1}x</td>
          <td>${med.quantity || 0} ${lowQtyWarning}</td>
          ${renderWeekCells(med)}
          <td>
            <button class="btn btn-sm btn-success" onclick="markAsTaken(${userIndex}, ${medIndex})">✅</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMed(${userIndex}, ${medIndex})">❌</button>
            <button class="btn btn-sm btn-info" onclick="editMedication(${userIndex}, ${medIndex})">✏️ Edit</button>
          </td>
        </tr>
      `;
    }).join("");

    const dayHeaders = weekDates.map(d => `<th>${d.key}<br><small>${d.label}</small></th>`).join("");

    const card = document.createElement("div");
    card.className = "col-md-12 mb-4";
    card.innerHTML = `
      <div class="card shadow">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <div>
              <h5>${user.name} ${user.isPrimary ? '<span class="badge badge-primary">Primary</span>' : '<span class="badge badge-secondary">Caretaker</span>'}</h5>
              ${user.caretakers?.length ? `<small class="text-muted">👥 ${user.caretakers.join(", ")}</small>` : ''}
            </div>
            <div>
              <button class="btn btn-sm btn-outline-success" onclick="exportCSV(${userIndex}, 'weekly')">📁 Weekly CSV</button>
              <button class="btn btn-sm btn-outline-success" onclick="exportCSV(${userIndex}, 'monthly')">📁 Monthly CSV</button>
              <button class="btn btn-sm btn-outline-success" onclick="exportCSV(${userIndex}, 'yearly')">📁 Yearly CSV</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="resetLog(${userIndex})">🔁 Reset Week</button>
            </div>
          </div>
          <p class="text-muted mb-2">📅 Report Date: <strong>${getFormattedDate()}</strong></p>
          <table class="table table-bordered log-table">
            <thead>
              <tr>
                <th>Medication</th><th>Doses/Day</th><th>Qty</th>
                ${dayHeaders}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  const alertBox = document.getElementById("alertBox");
  if (missedAlerts.length > 0) {
    alertBox.classList.remove("d-none");
    alertBox.innerHTML = `<strong>Missed Meds Today:</strong><br>${missedAlerts.join("<br>")}`;
  } else {
    alertBox.classList.add("d-none");
    alertBox.innerHTML = "";
  }

  saveUsers();
}

document.getElementById("addUserForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("userName").value;
  const medName = document.getElementById("medName").value;
  const medTime = document.getElementById("medTime").value;
  const medQty = parseInt(document.getElementById("medQty").value || "30");
  const medFreq = parseInt(document.getElementById("medFreq").value || "1");
  const isPrimary = document.getElementById("isPrimary").checked;
  const caretakers = document.getElementById("caretakers").value
    .split(',').map(c => c.trim()).filter(c => c);

  const newUser = {
    name,
    isPrimary,
    caretakers,
    medications: [{
      name: medName,
      time: medTime,
      quantity: medQty,
      frequency: medFreq,
      weekLog: {}
    }]
  };

  users.push(newUser);
  saveUsers();
  renderFamilyCards();
  this.reset();
  $('#addUserModal').modal('hide');
});

function markAsTaken(userIndex, medIndex) {
  const today = getTodayDay();
  const med = users[userIndex].medications[medIndex];
  med.weekLog = med.weekLog || {};
  med.weekLog[today] = "taken";
  if (med.quantity && med.quantity > 0) {
    med.quantity -= 1;
  }
  saveUsers();
  renderFamilyCards();
}

function deleteMed(userIndex, medIndex) {
  users[userIndex].medications.splice(medIndex, 1);
  saveUsers();
  renderFamilyCards();
}

function resetLog(userIndex) {
  users[userIndex].medications.forEach(m => m.weekLog = {});
  saveUsers();
  renderFamilyCards();
}

function editMedication(userIndex, medIndex) {
  console.log('Editing medication for user:', users[userIndex].name, 'Medication:', users[userIndex].medications[medIndex]);
}

function exportCSV(userIndex, period) {
  const user = users[userIndex];
  let dates = [];
  let headers = [];

  if (period === "monthly") {
    dates = getMonthDates();
    headers = ["Medication", "Frequency", "Qty", ...dates];
  } else if (period === "yearly") {
    dates = getYearDates();
    headers = ["Medication", "Frequency", "Qty", ...dates];
  } else {
    const week = getWeekDates();
    dates = week.map(d => d.key);
    headers = ["Medication", "Frequency", "Qty", ...week.map(d => `${d.key} (${d.label})`)];
  }

  const rows = [
    [`Report Generated: ${getFormattedDate()}`],
    [],
    headers
  ];

  user.medications.forEach(med => {
    const log = med.weekLog || {};
    const row = [
      med.name,
      med.frequency + "x",
      med.quantity,
      ...dates.map(d => log[d.key || d] || "-")
    ];
    rows.push(row);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${user.name}_${period}_medications.csv`;
  a.click();
}
