// =====================================
// ARDUINO UNO R4 WIFI ADDRESS
// =====================================

const ARDUINO_IP = "10.177.97.215";

// =====================================
// SEND COMMAND TO ARDUINO
// =====================================

async function sendCommand(command) {
  try {
    const response = await fetch(
      `http://${ARDUINO_IP}/command?cmd=${encodeURIComponent(command)}`
    );

    if (!response.ok) {
      throw new Error("Arduino did not respond");
    }

    const result = await response.text();
    console.log("Arduino:", result);

    return result;
  } catch (error) {
    console.error(error);

    document.getElementById("robotStatus").textContent =
      "Connection Failed";

    document.getElementById("deliveryStatus").textContent =
      "❌ Could not connect to robot.";

    return null;
  }
}

// =====================================
// SEND MEDICINE
// =====================================

async function sendMedicine() {
  const bed = document.getElementById("bed").value;

  if (!bed) {
    alert("Please select a patient bed.");
    return;
  }

  const command = `DELIVER_${bed.replace(/\s+/g, "")}`;
  const result = await sendCommand(command);

  if (result !== null) {
    document.getElementById("robotStatus").textContent = "Moving";
    document.getElementById("location").textContent = bed;
    document.getElementById("deliveryStatus").textContent =
      `🚚 Robot is going to ${bed}.`;
  }
}

// =====================================
// ROBOT CONTROLS
// =====================================

async function startRobot() {
  const result = await sendCommand("START");

  if (result !== null) {
    document.getElementById("robotStatus").textContent = "Running";
    document.getElementById("deliveryStatus").textContent =
      "▶ Robot started.";
  }
}

async function stopRobot() {
  const result = await sendCommand("STOP");

  if (result !== null) {
    document.getElementById("robotStatus").textContent = "Stopped";
    document.getElementById("deliveryStatus").textContent =
      "⏹ Robot stopped.";
  }
}

async function emergencyStop() {
  const result = await sendCommand("EMERGENCY_STOP");

  if (result !== null) {
    document.getElementById("robotStatus").textContent =
      "Emergency Stop";

    document.getElementById("deliveryStatus").textContent =
      "🚨 Emergency stop activated.";
  }
}

// =====================================
// GET ROBOT STATUS
// =====================================

async function getRobotStatus() {
  try {
    const response = await fetch(`http://${ARDUINO_IP}/status`);

    if (!response.ok) {
      throw new Error("Status request failed");
    }

    const data = await response.json();

    document.getElementById("robotStatus").textContent = data.status;
    document.getElementById("location").textContent = data.location;
    document.getElementById("deliveryStatus").textContent =
      data.deliveryStatus;

    const batteryText = document.querySelector(".card:nth-child(2) p");
    if (batteryText) {
      batteryText.textContent = `🔋 ${data.battery}%`;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("robotStatus").textContent = "Offline";
  }
}

setInterval(getRobotStatus, 2000);
getRobotStatus();
