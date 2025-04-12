const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true; // ✅ Keep listening for longer
recognition.interimResults = false;
recognition.lang = 'en-US';

let alarmTimeout = null;
let isWaitingForInitialCommand = true;

// ✅ Speak output
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

// ✅ Parse voice command like: "Set alarm at 10:30 AM for Paracetamol"
function parseAlarmCommand(command) {
  const timeMatch = command.match(/at (\d{1,2}:\d{2}) ?(am|pm)?/i);
  const medMatch = command.match(/for ([a-zA-Z0-9 ]+)/i);

  if (!timeMatch || !medMatch) return null;

  let [_, time, ampm] = timeMatch;
  const medName = medMatch[1].trim();

  let [hours, minutes] = time.split(':').map(Number);
  if (ampm?.toLowerCase() === 'pm' && hours < 12) hours += 12;
  if (ampm?.toLowerCase() === 'am' && hours === 12) hours = 0;

  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1); // next day

  return { medName, alarmTime };
}

// ✅ Set alarm
function setAlarm(alarmTime, medName) {
  const delay = alarmTime - Date.now();
  document.getElementById('status').textContent = `⏰ Alarm set for ${alarmTime.toLocaleTimeString()} to take ${medName}`;
  speak(`Okay. I will remind you to take ${medName} at ${alarmTime.toLocaleTimeString()}.`);

  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    triggerAlarm(medName);
  }, delay);
}

// ✅ Trigger alarm
function triggerAlarm(medName) {
  const audio = new Audio('alarm.mp3');
  audio.play();

  document.getElementById('status').textContent = `🔔 Time to take ${medName}`;
  setTimeout(() => {
    speak(`It's time to take your ${medName}. You can say 'I have taken my medicine', 'Remind me later', or 'Cancel'.`);
    listenForFollowUpCommands(medName);
  }, 4000);
}

// ✅ Listen for follow-up like "Taken", "Remind me later"
function listenForFollowUpCommands(medName) {
  recognition.start();

  recognition.onresult = (event) => {
    const reply = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Follow-up:", reply);

    if (reply.includes('taken')) {
      speak(`Great! I've marked your ${medName} as taken.`);
      document.getElementById('status').textContent = `✅ ${medName} marked as taken.`;
    } else if (reply.includes('remind')) {
      speak("Okay, I will remind you again in 10 minutes.");
      document.getElementById('status').textContent = `🔁 ${medName} snoozed.`;
      setTimeout(() => triggerAlarm(medName), 10 * 60 * 1000);
    } else if (reply.includes('cancel')) {
      speak("Okay, the alarm has been cancelled.");
      document.getElementById('status').textContent = `🚫 Alarm cancelled.`;
    } else {
      speak("Sorry, I didn't catch that.");
      document.getElementById('status').textContent = `🤔 Unrecognized response.`;
    }

    recognition.stop();
  };

  recognition.onerror = (event) => {
    console.log("Follow-up error:", event.error);
  };
}

// ✅ One-time voice command on page load
function listenForAlarmCommandOnce() {
  isWaitingForInitialCommand = true;
  recognition.start();
  document.getElementById('status').textContent = "🎙️ Listening for alarm command...";

  recognition.onresult = function (event) {
    if (!isWaitingForInitialCommand) return;
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Command:", command);

    const parsed = parseAlarmCommand(command);
    if (parsed) {
      setAlarm(parsed.alarmTime, parsed.medName);
      isWaitingForInitialCommand = false;
      recognition.stop();
    } else {
      speak("Sorry, I couldn't understand. Try saying 'Set alarm at 10:30 AM for Paracetamol'.");
      document.getElementById('status').textContent = "❌ Invalid voice input.";
    }
  };

  recognition.onerror = function (event) {
    console.log("Error:", event.error);
    document.getElementById('status').textContent = "❌ Voice error. Try again.";
  };
}

// ✅ Start listening only when page is open
window.onload = () => {
  speak("Welcome. Please say your medicine alarm time.");
  setTimeout(() => {
    listenForAlarmCommandOnce();
  }, 1500);
};
