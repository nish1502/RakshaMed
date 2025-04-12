// ✅ Get & Save reminders from localStorage
function getReminders() {
    return JSON.parse(localStorage.getItem("medReminders") || "[]");
  }
  
  function saveReminders(data) {
    localStorage.setItem("medReminders", JSON.stringify(data));
  }
  
  // ✅ Ask for notification permission
  if (Notification && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  
  // ✅ Show Notification with Snooze
  function showReminder(user, medicine, id) {
    console.log(`🔔 Reminder for ${user}: ${medicine}`);
  
    if (Notification.permission === "granted") {
      const notification = new Notification(`💊 Time to take: ${medicine}`, {
        body: `${user}, it's time for your medicine.`,
        tag: id,
        icon: "img/medicine.png",
        requireInteraction: true,
      });
  
      notification.onclick = () => {
        console.log(`${user} clicked the reminder`);
      };
  
      notification.onclose = () => {
        snoozeReminder(id);
      };
    } else {
      alert(`${user}, it's time for your medicine: ${medicine}`);
    }
  }
  
  // ✅ Snooze for 15 minutes
  function snoozeReminder(id) {
    const reminders = getReminders();
    const r = reminders.find(rem => rem.id === id);
    if (r) {
      const now = new Date();
      const next = new Date(now.getTime() + 15 * 60000);
      r.nextTrigger = next.toISOString();
      r.notified = false;
      saveReminders(reminders);
      console.log(`⏱ Snoozed ${r.medicine} for ${r.user} until ${next.toLocaleTimeString()}`);
    }
  }
  
  // ✅ Daily Reset
  function resetRemindersDaily() {
    const reminders = getReminders();
    const now = new Date();
    const today = now.toDateString();
  
    reminders.forEach(r => {
      const triggerDate = new Date(r.nextTrigger || now);
      if (triggerDate.toDateString() !== today) {
        r.notified = false;
        r.nextTrigger = null;
      }
    });
  
    saveReminders(reminders);
  }
  
  // ✅ Main Loop to Check Reminder Time
  setInterval(() => {
    const now = new Date();
    const reminders = getReminders();
  
    reminders.forEach(r => {
      const id = `${r.user}_${r.medicine}_${r.time}`;
  
      if (!r.nextTrigger) {
        r.nextTrigger = new Date(`${now.toDateString()} ${r.time}`).toISOString();
      }
  
      const triggerTime = new Date(r.nextTrigger);
      if (now >= triggerTime && !r.notified) {
        showReminder(r.user, r.medicine, id);
        r.notified = true;
      }
    });
  
    saveReminders(reminders);
    displayRemindersInDashboard(); // 🔄 Update UI
  }, 30000); // Every 30 seconds
  
  resetRemindersDaily(); // ✅ Run reset once daily
  
  // ✅ Add Reminder When User Adds Med
  function addNewReminder(user, medicine, time) {
    const id = `${user.toLowerCase()}_${medicine.toLowerCase().replace(/\s+/g, "")}_${time}`;
    const newReminder = {
      user,
      medicine,
      time,
      id,
      nextTrigger: null,
      notified: false
    };
  
    const all = getReminders();
    all.push(newReminder);
    saveReminders(all);
    displayRemindersInDashboard();
    console.log(`✅ New reminder added for ${user} at ${time}`);
  }
  
  // ✅ BONUS: Connect this to a form
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("medReminderForm");
  
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
  
        const userFromInput = document.getElementById("userInput").value;
        const medicineFromInput = document.getElementById("medicineInput").value;
        const timeFromInput = document.getElementById("timeInput").value;
  
        if (userFromInput && medicineFromInput && timeFromInput) {
          addNewReminder(userFromInput, medicineFromInput, timeFromInput);
          alert(`✅ Reminder set for ${userFromInput} at ${timeFromInput}`);
          form.reset();
        } else {
          alert("Please fill all fields");
        }
      });
    }
  
    displayRemindersInDashboard(); // Initial load
  });
  
  // ✅ Render Reminders in Dashboard UI
  function displayRemindersInDashboard() {
    const reminders = getReminders();
    const container = document.getElementById("reminderDisplayArea");
  
    if (!container) return;
  
    container.innerHTML = "<h5 class='text-primary'>📅 Active Reminders:</h5>";
  
    if (reminders.length === 0) {
      container.innerHTML += "<p>No reminders added yet.</p>";
      return;
    }
  
    reminders.forEach(r => {
      const nextTime = r.nextTrigger
        ? new Date(r.nextTrigger).toLocaleTimeString()
        : "Today at " + r.time;
  
      container.innerHTML += `
        <div class="card mb-2 shadow-sm">
          <div class="card-body p-2">
            <strong>👤 ${r.user}</strong><br>
            💊 <strong>${r.medicine}</strong> @ ${r.time} <br>
            ⏰ Next: ${nextTime} <br>
            ${r.notified ? `<span class="badge badge-success">✔️ Reminded</span>` : `<span class="badge badge-warning">🕒 Pending</span>`}
          </div>
        </div>
      `;
    });
  }
  