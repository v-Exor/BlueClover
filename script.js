let highestZ = 100;
let dragData = {
  active: false,
  offsetX: 0,
  offsetY: 0,
  windowId: null
};

let processes = [];

// ---------------- LOGIN / BOOT ----------------
document.addEventListener("DOMContentLoaded", () => {
  // Boot screen logic for index.html
  const bootScreen = document.getElementById("bootScreen");
  const loginScreen = document.getElementById("loginScreen");
  const loginForm = document.getElementById("loginForm");

  if (bootScreen && loginScreen) {
    setTimeout(() => {
      bootScreen.style.opacity = "0";
      setTimeout(() => {
        bootScreen.style.display = "none";
        loginScreen.classList.remove("hidden");
      }, 800);
    }, 2500);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const loginError = document.getElementById("loginError");

      if (username === "admin" && password === "1234") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "desktop.html";
      } else {
        loginError.classList.remove("hidden");
      }
    });
  }

  // Protect desktop page
  if (window.location.pathname.includes("desktop.html")) {
    if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "index.html";
      return;
    }
  }

  // Initialize desktop-only features
  initDesktop();
});

// ---------------- DESKTOP INIT ----------------
function initDesktop() {
  updateClock();
  setInterval(updateClock, 1000);

  updateTaskManagerStats();
  setInterval(updateTaskManagerStats, 2000);

  const startMenu = document.getElementById("startMenu");
  const startBtn = document.querySelector(".start-btn");

  document.addEventListener("click", function(event) {
    if (startMenu && startBtn) {
      if (!startMenu.contains(event.target) && !startBtn.contains(event.target)) {
        startMenu.classList.add("hidden");
      }
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragData.active) return;

    const win = document.getElementById(dragData.windowId);
    if (!win) return;

    win.style.left = (e.clientX - dragData.offsetX) + "px";
    win.style.top = (e.clientY - dragData.offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragData.active = false;
  });

  document.querySelectorAll(".window").forEach(win => {
    win.addEventListener("mousedown", () => {
      win.style.zIndex = ++highestZ;
    });
  });

  // Load saved notes
  const notesArea = document.getElementById("notesArea");
  if (notesArea) {
    notesArea.value = localStorage.getItem("blueclover_notes") || "";
    notesArea.addEventListener("input", () => {
      localStorage.setItem("blueclover_notes", notesArea.value);
    });
  }
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

// ---------------- WINDOW FUNCTIONS ----------------
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.remove("hidden");
  win.style.zIndex = ++highestZ;

  const startMenu = document.getElementById("startMenu");
  if (startMenu) startMenu.classList.add("hidden");
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) win.classList.add("hidden");
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (win) win.classList.add("hidden");
}

function toggleStartMenu() {
  const menu = document.getElementById("startMenu");
  if (menu) menu.classList.toggle("hidden");
}

function dragStart(e, id) {
  const win = document.getElementById(id);
  if (!win) return;

  dragData.active = true;
  dragData.windowId = id;
  dragData.offsetX = e.clientX - win.offsetLeft;
  dragData.offsetY = e.clientY - win.offsetTop;
  win.style.zIndex = ++highestZ;
}

// ---------------- CLOCK ----------------
function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ---------------- CALCULATOR ----------------
function appendCalc(value) {
  const display = document.getElementById("calcDisplay");
  if (display) display.value += value;
}

function clearCalc() {
  const display = document.getElementById("calcDisplay");
  if (display) display.value = "";
}

function calculateResult() {
  const display = document.getElementById("calcDisplay");
  if (!display) return;

  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}

// ---------------- TERMINAL ----------------
function handleTerminal(event) {
  if (event.key === "Enter") {
    const input = document.getElementById("terminalInput");
    const output = document.getElementById("terminalOutput");
    if (!input || !output) return;

    const command = input.value.trim().toLowerCase();
    output.innerHTML += `<p>> ${command}</p>`;

    switch (command) {
      case "help":
        output.innerHTML += `
          <p>Available commands:</p>
          <p>- help</p>
          <p>- date</p>
          <p>- clear</p>
          <p>- files</p>
          <p>- version</p>
          <p>- processes</p>
        `;
        break;

      case "date":
        output.innerHTML += `<p>${new Date()}</p>`;
        break;

      case "files":
        output.innerHTML += `
          <p>boot_config.sys</p>
          <p>fcfs_processes.txt</p>
          <p>memory_map.log</p>
          <p>user_accounts.json</p>
        `;
        break;

      case "version":
        output.innerHTML += `<p>BlueClover OS v2.0</p>`;
        break;

      case "processes":
        output.innerHTML += `
          <p>PID 101 - explorer.exe</p>
          <p>PID 102 - terminal.exe</p>
          <p>PID 103 - notes.exe</p>
          <p>PID 104 - calculator.exe</p>
          <p>PID 105 - scheduler.exe</p>
          <p>PID 106 - memory_manager.exe</p>
          <p>PID 107 - system_ui.exe</p>
        `;
        break;

      case "clear":
        output.innerHTML = "";
        input.value = "";
        return;

      default:
        output.innerHTML += `<p>Command not recognized. Type 'help'.</p>`;
    }

    output.scrollTop = output.scrollHeight;
    input.value = "";
  }
}

// ---------------- FCFS CPU SCHEDULING ----------------
function addProcess() {
  const pid = document.getElementById("pid")?.value.trim();
  const arrival = parseInt(document.getElementById("arrival")?.value);
  const burst = parseInt(document.getElementById("burst")?.value);

  if (!pid || isNaN(arrival) || isNaN(burst)) {
    alert("Please enter valid process details.");
    return;
  }

  processes.push({ pid, arrival, burst });

  const tableBody = document.querySelector("#processTable tbody");
  if (tableBody) {
    const row = `<tr><td>${pid}</td><td>${arrival}</td><td>${burst}</td></tr>`;
    tableBody.innerHTML += row;
  }

  document.getElementById("pid").value = "";
  document.getElementById("arrival").value = "";
  document.getElementById("burst").value = "";
}

function clearProcesses() {
  processes = [];
  const tableBody = document.querySelector("#processTable tbody");
  const ganttChart = document.getElementById("ganttChart");
  const fcfsResults = document.getElementById("fcfsResults");

  if (tableBody) tableBody.innerHTML = "";
  if (ganttChart) ganttChart.innerHTML = "";
  if (fcfsResults) fcfsResults.innerHTML = "";
}

function runFCFS() {
  if (processes.length === 0) {
    alert("Please add at least one process.");
    return;
  }

  let sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);

  let currentTime = 0;
  let totalWT = 0;
  let totalTAT = 0;
  let ganttHTML = "";
  let resultHTML = `
    <table class="styled-table">
      <thead>
        <tr>
          <th>PID</th>
          <th>Arrival</th>
          <th>Burst</th>
          <th>Start</th>
          <th>Completion</th>
          <th>Waiting Time</th>
          <th>Turnaround Time</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedProcesses.forEach(p => {
    if (currentTime < p.arrival) currentTime = p.arrival;

    const start = currentTime;
    const completion = start + p.burst;
    const waiting = start - p.arrival;
    const turnaround = completion - p.arrival;

    totalWT += waiting;
    totalTAT += turnaround;

    ganttHTML += `<div class="gantt-block">${p.pid}<br>${start} - ${completion}</div>`;

    resultHTML += `
      <tr>
        <td>${p.pid}</td>
        <td>${p.arrival}</td>
        <td>${p.burst}</td>
        <td>${start}</td>
        <td>${completion}</td>
        <td>${waiting}</td>
        <td>${turnaround}</td>
      </tr>
    `;

    currentTime = completion;
  });

  resultHTML += `</tbody></table>`;
  resultHTML += `<p><strong>Average Waiting Time:</strong> ${(totalWT / sortedProcesses.length).toFixed(2)}</p>`;
  resultHTML += `<p><strong>Average Turnaround Time:</strong> ${(totalTAT / sortedProcesses.length).toFixed(2)}</p>`;

  document.getElementById("ganttChart").innerHTML = ganttHTML;
  document.getElementById("fcfsResults").innerHTML = resultHTML;
}

// ---------------- MEMORY MANAGEMENT (FIRST FIT) ----------------
function runMemoryManagement() {
  const blockInput = document.getElementById("blockInput")?.value.trim();
  const processInput = document.getElementById("processInput")?.value.trim();

  if (!blockInput || !processInput) {
    alert("Please enter memory blocks and process sizes.");
    return;
  }

  let blocks = blockInput.split(",").map(x => parseInt(x.trim()));
  let processesMem = processInput.split(",").map(x => parseInt(x.trim()));

  if (blocks.some(isNaN) || processesMem.some(isNaN)) {
    alert("Please enter valid numeric values separated by commas.");
    return;
  }

  let allocation = new Array(processesMem.length).fill(-1);
  let remainingBlocks = [...blocks];

  for (let i = 0; i < processesMem.length; i++) {
    for (let j = 0; j < remainingBlocks.length; j++) {
      if (remainingBlocks[j] >= processesMem[i]) {
        allocation[i] = j;
        remainingBlocks[j] -= processesMem[i];
        break;
      }
    }
  }

  let resultHTML = `
    <table class="styled-table">
      <thead>
        <tr>
          <th>Process</th>
          <th>Size</th>
          <th>Allocated Block</th>
          <th>Remaining Space</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let i = 0; i < processesMem.length; i++) {
    if (allocation[i] !== -1) {
      resultHTML += `
        <tr>
          <td>P${i + 1}</td>
          <td>${processesMem[i]}</td>
          <td>Block ${allocation[i] + 1}</td>
          <td>${remainingBlocks[allocation[i]]}</td>
        </tr>
      `;
    } else {
      resultHTML += `
        <tr>
          <td>P${i + 1}</td>
          <td>${processesMem[i]}</td>
          <td>Not Allocated</td>
          <td>—</td>
        </tr>
      `;
    }
  }

  resultHTML += `</tbody></table>`;
  document.getElementById("memoryResults").innerHTML = resultHTML;
}

// ---------------- TASK MANAGER ----------------
function updateTaskManagerStats() {
  const cpu = document.getElementById("cpuUsage");
  const memory = document.getElementById("memoryUsage");
  const tasks = document.getElementById("taskCount");

  if (!cpu || !memory || !tasks) return;

  cpu.textContent = `${Math.floor(Math.random() * 35) + 25}%`;
  memory.textContent = `${Math.floor(Math.random() * 30) + 45}%`;
  tasks.textContent = `7`;
}