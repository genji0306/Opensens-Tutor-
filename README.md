
# Opensens Tutor

<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/hexagon.svg" width="80" height="80" alt="Opensens Logo" style="filter: invert(47%) sepia(85%) saturate(366%) hue-rotate(124deg) brightness(93%) contrast(101%);">
  <h1 style="margin-top: 10px;">Opensens Tutor Manager</h1>
  <p>
    <strong>AI-Powered Learning Device Management System</strong>
  </p>
</div>

---

## 📖 Overview

**Opensens Tutor** is a comprehensive web application designed for parents to manage **Xiaozhi (ESP32-S3)** based AI learning companions. It acts as a control center, allowing parents to configure AI personalities, manage hardware settings via USB (Web Serial), generate lesson plans, and monitor their child's learning progress.

The application leverages the **Google Gemini API** for intelligence—powering both the lesson generation tools and the real-time voice simulator (Gemini Live) used to preview tutor personalities before deploying them to the hardware.

## ✨ Key Features

### 1. 🛡️ Parent Dashboard
- At-a-glance view of active devices, children profiles, and learning statistics.
- Activity charts to monitor engagement over time.

### 2. 👶 Child & Tutor Management
- **Child Profiles:** Create profiles for each child (Age, Grade, Interests).
- **Tutor Configuration:** customized the AI agent:
  - **Tone:** Encouraging, Strict, Socratic, or Playful.
  - **Model:** Switch between Gemini 2.5 Flash (Speed) and Gemini 3.0 Pro (Reasoning).
  - **Simulator:** Test the tutor's personality using **Real-time Voice** (Gemini Live API) or Text Chat directly in the browser.

### 3. 🤖 Device Manager (Hardware Bridge)
- **Web Serial Integration:** Connect directly to ESP32 devices via USB.
- **Wi-Fi Provisioning:** Push network credentials to the device without external tools.
- **OTA Updates:** Simulate firmware updates and track version status.
- **Simulation Mode:** Automatically falls back to a simulated device interface if Web Serial is blocked (e.g., in secure iframe previews).

### 4. 📚 AI Lesson Builder
- Generate complete lesson plans on any topic using Gemini.
- Includes explanations, quiz questions, and AI-generated header images.
- Export to PDF or send directly to the child's device (simulated).

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite (implied structure)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI Integration:** Google GenAI SDK (`@google/genai`)
- **Hardware Comms:** Web Serial API

## 🚀 Getting Started

### Prerequisites
1.  **Node.js** (v18 or higher)
2.  **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudiocdn.google.com))
3.  **Hardware (Optional):** ESP32-S3 device running compatible Xiaozhi firmware.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/opensens-tutor.git
    cd opensens-tutor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    REACT_APP_API_KEY=your_gemini_api_key_here
    ```
    *(Note: The current build uses `process.env.API_KEY` directly from the bundler configuration).*

4.  **Run the application**
    ```bash
    npm start
    ```

## 🔌 Hardware Integration (Xiaozhi / ESP32)

The **Device Manager** uses the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) to communicate with hardware.

### Connection Steps:
1.  Navigate to the **Devices** tab.
2.  Connect your ESP32 device via USB.
3.  Click **"Connect via USB"**.
4.  Select the COM port/Device from the browser prompt.
5.  Use the **Hardware Console** to view logs or push Wi-Fi credentials.

**Note:** This feature requires a Chromium-based browser (Chrome, Edge, Opera). Safari does not support Web Serial.

## 🧪 Simulation Mode

If you are running this app in a constrained environment (like a cloud IDE preview or CodeSandbox) where access to USB ports is blocked by permission policies, the app will automatically trigger **Simulation Mode**. 

- Clicking "Connect via USB" will simulate a connection sequence.
- You will see fake boot logs and device data in the console window.

## 📄 License

This project is open-source.

---

<div align="center">
  <sub>Built with ❤️ for Open Source AI Hardware</sub>
</div>
