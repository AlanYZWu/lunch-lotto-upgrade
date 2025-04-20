
// Wheel.js: Draws and spins the restaurant selection wheel
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

// Will be populated via updateWheel()
let options = ["", "", "", "", "", "", "", ""];
// Segment colors
const colors = ["#F69C9E", "#BCECE6", "#73D5D1", "#FFEED9"];

// Spin state variables
let startAngle = 0;
let arc = 2 * Math.PI / options.length;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

/**
 * Adjusts the canvas for high DPI screens.
 */
function scaleCanvas(canvas, ctx) {
  const pixelRatio = window.devicePixelRatio || 1;
  const width = canvas.width;
  const height = canvas.height;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

/**
 * Determines if a hex color is dark (for text contrast).
 */
function isColorDark(color) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 128;
}

/**
 * Truncates a restaurant name if too long.
 */
function truncateOption(name) {
  if (!name) return "Loading...";
  return name.length > 13 ? name.slice(0, 10) + "..." : name;
}

/**
 * Draws the wheel segments, center, and pointer.
 */
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 24px Poppins";
  arc = 2 * Math.PI / options.length;

  options.forEach((opt, i) => {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i % colors.length];

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      angle,
      angle + arc
    );
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fill();

    // Segment border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Draw text
    ctx.save();
    const txt = truncateOption(opt.name);
    ctx.fillStyle = isColorDark(ctx.fillStyle) ? "white" : "black";
    ctx.translate(
      canvas.width / 2 + Math.cos(angle + arc / 2) * (canvas.width / 2 - 120),
      canvas.height / 2 + Math.sin(angle + arc / 2) * (canvas.height / 2 - 120)
    );
    ctx.rotate(angle + arc / 2);
    ctx.fillText(txt, -ctx.measureText(txt).width / 2, 0);
    ctx.restore();
  });

  // Draw center circle
  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();

  // Outer border of center
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  // Draw pointer
  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  const cx = canvas.width / 2;
  ctx.moveTo(cx - 30, 0);
  ctx.lineTo(cx + 30, 0);
  ctx.lineTo(cx, 80);
  ctx.closePath();
  ctx.fillStyle = "#007BFF";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.restore();
}

/**
 * Starts the spinning animation.
 */
function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 3000;
  rotateWheel();
}

document.getElementById("spin").addEventListener("click", spin);

/**
 * Rotates the wheel until it stops.
 */
function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    clearTimeout(spinTimeout);
    finishSpin();
    return;
  }
  startAngle += (spinAngleStart * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

/**
 * Handles logic after the wheel stops spinning.
 */
function finishSpin() {
  // Determine selected segment
  const degrees = (startAngle * 180) / Math.PI + 90;
  const normalized = degrees % 360;
  const idx = Math.floor(normalized / (360 / options.length));
  const selected = options[options.length - 1 - idx];

  // Save to history
  const historyItem = {
    name: selected.name,
    timestamp: new Date().toLocaleDateString()
  };
  chrome.storage.sync.get({ history: [] }, data => {
    const hist = data.history;
    hist.unshift(historyItem);
    if (hist.length > 50) hist.pop();
    chrome.storage.sync.set({ history: hist }, displayHistory);
  });

  // Show result dialog
  const messages = [
    "Time to fuel your body with something nutritious! 🍎",
    "Great choice! Enjoy your healthy meal. 🌱",
    "A healthy lunch keeps the energy flowing! 💪",
    "Your body will thank you for this meal. 🥗",
    "Eating healthy today sets you up for success! 🏆",
    "Tasty and healthy? You've got it! 🍽️",
    "Healthy food, happy mood! 😊"
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  swal({
    title: `Selected Option: ${selected.name}`,
    content: (() => {
      const container = document.createElement("div");
      const p = document.createElement("p");
      p.style.fontSize = "12px";
      p.textContent = msg;
      const a = document.createElement("a");
      a.href = selected.link;
      a.target = "_blank";
      a.textContent = "View on Foursquare";
      a.style.color = "#a2a2a2";
      a.style.fontSize = "10px";
      container.appendChild(p);
      container.appendChild(a);
      return container;
    })(),
    icon: "success",
    button: false
  });
}

/**
 * Populates the options for the wheel.
 */
function updateWheel(restaurants) {
  options = restaurants.map(r => ({ name: r.name, link: r.fsqLink }));
  drawWheel();
}

/**
 * Displays the selection history.
 */
function displayHistory() {
  const list = document.getElementById('history-list');
  chrome.storage.sync.get({ history: [] }, data => {
    list.innerHTML = '';
    data.history.forEach(item => {
      const entry = document.createElement('div');
      entry.className = 'history-item';
      const name = document.createElement('span');
      name.className = 'restaurant-name';
      name.textContent = item.name;
      const time = document.createElement('span');
      time.className = 'timestamp';
      time.textContent = item.timestamp;
      entry.appendChild(name);
      entry.appendChild(time);
      list.appendChild(entry);
    });
  });
}

/**
 * Clears the selection history.
 */
function clearHistory() {
  chrome.storage.sync.set({ history: [] }, () => {
    displayHistory();
    swal({ title: "History Cleared!", icon: "success", button: false, timer: 1500 });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  scaleCanvas(canvas, ctx);
  drawWheel();
  displayHistory();
  document.getElementById('clear-history').addEventListener('click', clearHistory);
});
