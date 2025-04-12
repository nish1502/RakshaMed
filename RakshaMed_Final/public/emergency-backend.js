function getMedications() {
    return JSON.parse(localStorage.getItem('medications') || '[]');
  }
  
  function saveMedications(meds) {
    localStorage.setItem('medications', JSON.stringify(meds));
  }
  
  function addMedication({ name, time, isCritical }) {
    const meds = getMedications();
    meds.push({
      name,
      time,
      isCritical,
      confirmed: false,
      emergencyNotified: false
    });
    saveMedications(meds);
  }
  