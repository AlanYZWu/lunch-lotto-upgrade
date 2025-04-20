
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const options = ["", "", "", "", "", "", "", ""];
const colors = ["#F69C9E", "#BCECE6", "#73D5D1", "#FFEED9"];
// #051F20 #0B2B26 #163832 #235347 #8EB69B #DAF1DE #F2F2F2
let startAngle = 0;
let arc = 2 * Math.PI / options.length;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

function scaleCanvas(canvas, ctx) {
  const pixelRatio = window.devicePixelRatio || 1;

  // Save the original canvas dimensions
  const width = canvas.width;
  const height = canvas.height;

  // Set the canvas width and height to the scaled dimensions
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  // Scale the canvas context
  // ctx.scale(pixelRatio, pixelRatio);

  // Restore the original canvas dimensions for CSS styling
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function isColorDark(color) {
  // Convert hex color to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate brightness using the luminance formula
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
  return brightness < 128; // Return true if the color is dark
}

function truncateOption(option) {
  if (!option) {
    return "Loading..."; // Provide a fallback for empty options
  }

  if (option.length > 13) {
    return option.slice(0, 10) + "..."; // Keep the first 12 characters and add "..."
  }
  return option; // Return the original string if it's 15 characters or less
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

  // Set the font size and style
  ctx.font = "bold 24px Poppins";

  options.forEach((option, i) => {
    const truncatedOption = truncateOption(option.name); // Truncate the option if necessary
    const angle = startAngle + i * arc;

    // Draw the segment
    ctx.fillStyle = colors[i % colors.length];
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
  
    // Add a border (with shadow)
    ctx.lineWidth = 15; // Border thickness
    ctx.strokeStyle = "#ffffff"; // Border color
    ctx.stroke();
    ctx.restore(); // Restore the context state to remove shadow effects for subsequent drawings
  }  
  
  function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
      clearTimeout(spinTimeout);
  
      // Calculate the winning segment based on the final angle
      const degrees = (startAngle * 180) / Math.PI + 90;
      const normalizedDegrees = degrees % 360;
      const selectedIndex = Math.floor(normalizedDegrees / (360 / options.length));
      const selectedOption = options[options.length - 1 - selectedIndex];
      
      // Save to history
      const historyItem = {
        name: selectedOption.name,
        timestamp: new Date().toLocaleDateString()
      };
      
      chrome.storage.sync.get({ history: [] }, (data) => {
        const history = data.history;
        history.unshift(historyItem); // Add new item to the beginning
        // Keep only the last 50 items
        if (history.length > 50) {
          history.pop();
        }
        chrome.storage.sync.set({ history }, () => {
          // Update history display
          displayHistory();
        });
      });
        
      // Motivational messages to encourage the user
      const messages = [
        "Time to fuel your body with something nutritious! 🍎",
        "Great choice! Enjoy your healthy meal. 🌱",
        "A healthy lunch keeps the energy flowing! 💪",
        "Your body will thank you for this meal. 🥗",
        "Eating healthy today sets you up for success! 🏆",
        "Tasty and healthy? You've got it! 🍽️",
        "Healthy food, happy mood! 😊",
      ];
  
      // Select a random motivational message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
      // Show result + motivational message
      swal({
        title: `Selected Option: ${selectedOption.name}`,
        content: (() => {
          const content = document.createElement("div");
          const paragraph = document.createElement("p");
          const link = document.createElement("a");
          
          paragraph.style.fontSize = "12px";
          paragraph.textContent = randomMessage; // Add the motivational message
      
          link.href = selectedOption.googleMapsLink; // Set the Google Maps link
          link.target = "_blank"; // Open the link in a new tab
          link.textContent = "View on Google Maps"; // Text for the link
          link.style.color = "#a2a2a2"; // Optional: Add a color to the link
          link.style.fontSize = "10px";
      
          content.appendChild(paragraph);
          content.appendChild(link);
      
          return content;
        })(),
        icon: "success",
        button: false, // Hide the default OK button
      });
      
      return;
    }
  
    startAngle += (spinAngleStart * Math.PI) / 180;
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);

  }

  startAngle += (spinAngleStart * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function finalizeWheel() {
  const degrees = (startAngle * 180) / Math.PI + 90; // Convert radians to degrees
  const index = Math.floor((360 - (degrees % 360)) / (360 / options.length)); // Calculate the selected segment
  const selectedOption = options[index];

  alert(`Selected option: ${selectedOption}`); // Display the result
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 3000; // Spin duration between 3-6 seconds
  rotateWheel();
}

document.getElementById("spin").addEventListener("click", () => spin());
scaleCanvas(canvas, ctx);
drawWheel();

// Add function to display history
function displayHistory() {
  const historyList = document.getElementById('history-list');
  chrome.storage.sync.get({ history: [] }, (data) => {
    const history = data.history;
    historyList.innerHTML = ''; // Clear current history
    
    history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const restaurantName = document.createElement('span');
      restaurantName.className = 'restaurant-name';
      restaurantName.textContent = item.name;
      
      const timestamp = document.createElement('span');
      timestamp.className = 'timestamp';
      timestamp.textContent = item.timestamp;
      
      historyItem.appendChild(restaurantName);
      historyItem.appendChild(timestamp);
      historyList.appendChild(historyItem);
    });
  });
}

// Add function to clear history
function clearHistory() {
  chrome.storage.sync.set({ history: [] }, () => {
    displayHistory(); // Refresh the display
    // Show a brief success message
    swal({
      title: "History Cleared!",
      icon: "success",
      button: false,
      timer: 1500
    });
  });
}

// Call displayHistory when the page loads
document.addEventListener('DOMContentLoaded', () => {
  displayHistory();
  // Add clear history button listener
  document.getElementById('clear-history').addEventListener('click', clearHistory);
});
