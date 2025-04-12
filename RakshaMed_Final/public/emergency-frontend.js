document.getElementById('medForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const time = document.getElementById('time').value;
    const isCritical = document.getElementById('isCritical').checked;
  
    addMedication({ name, time, isCritical });
    alert('Medication added!');
    e.target.reset();
    renderAlerts(); // refresh table
  });
  
  function playAlarm() {
    const audio = document.getElementById('alarm');
    audio.play().catch(err => console.log('Audio play error:', err));
  }
  
  function stopAlarm() {
    const audio = document.getElementById('alarm');
    audio.pause();
    audio.currentTime = 0;
  }
  
  function handleTaken(index, button) {
    const meds = getMedications();
    meds[index].confirmed = true;
    saveMedications(meds);
  
    // Update button appearance
    button.innerText = "✅ Taken";
    button.disabled = true;
    button.style.backgroundColor = "green";
    button.style.color = "white";
  
    // Stop the alarm if no more active
    const anyActive = meds.some(med =>
      med.emergencyNotified && !med.confirmed
    );
    if (!anyActive) stopAlarm();
  }
  
  function renderAlerts() {
    const meds = getMedications();
    const now = new Date();
    const tbody = document.querySelector('#alertTable tbody');
    tbody.innerHTML = '';
    let shouldPlay = false;
  
    meds.forEach((med, index) => {
      const [hour, minute] = med.time.split(':').map(Number);
      const scheduled = new Date();
      scheduled.setHours(hour, minute, 0, 0);
  
      const missed = (
        med.isCritical &&
        !med.confirmed &&
        !med.emergencyNotified &&
        now - scheduled > 10 * 60 * 1000
      );
  
      if (missed) {
        meds[index].emergencyNotified = true;
        saveMedications(meds);
      }
  
      if (med.emergencyNotified) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${med.name}</td>
          <td>${med.time}</td>
          <td style="color:${med.confirmed ? 'green' : 'red'};">
            ${med.confirmed ? 'Taken' : 'Missed (Critical)'}
          </td>
          <td>
            <button
              ${med.confirmed ? 'disabled style="background-color:green;color:white;"' : ''}
              onclick="handleTaken(${index}, this)">
              ${med.confirmed ? '✅ Taken' : 'Mark as Taken'}
            </button>
          </td>
        `;
        tbody.appendChild(row);
  
        if (!med.confirmed) shouldPlay = true;
      }
    });
  
    if (shouldPlay) playAlarm();
    else stopAlarm();
  }
  
  setInterval(renderAlerts, 10 * 1000);
  renderAlerts();
  
  