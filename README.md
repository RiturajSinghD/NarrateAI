# NarrateAI 🔊

[![Production Ready](https://img.shields.io/badge/status-production--ready-emerald?style=for-the-badge)]()
[![Framework: Express](https://img.shields.io/badge/Backend-Express.js-bg-blue?style=for-the-badge&logo=express)]()
[![Framework: React](https://img.shields.io/badge/Frontend-React.js--Vite-bg-cyan?style=for-the-badge&logo=react)]()
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB--Atlas-bg-green?style=for-the-badge&logo=mongodb)]()
[![AI Service: Azure Speech](https://img.shields.io/badge/AI--Engine-Azure--Cognitive--TTS-purple?style=for-the-badge&logo=microsoftazure)]()

NarrateAI is an enterprise-grade Knowledge Synthesis & Neural Text-to-Speech (TTS) Studio. Engineered for high-throughput translation workloads, the platform securely ingests raw copy scripts, crawls and filters web addresses, and handles multi-part binary document assets via an optimized backend extraction matrix. Extracted knowledge tokens are funneled through a high-fidelity Neural TTS pipeline and persistently structured inside a central secure storage layer.

---

## 💎 Core Feature Architecture

### 1. 📝 Deep Text Studio

- **Glassmorphic Compositor:** Rich visual interface built with optimized state synchronization for managing long-form scripts or blog copy blocks.
- **Persona Profiles:** Dynamic voice selection drawer utilizing explicit fallback data-hooks supporting a diverse roster of expressive multi-lingual voice characters.
- **Low-Latency Previewing:** Dedicated micro-engine that lets users quickly test and listen to voice samples before kicking off a full narration generation sequence.

### 2. 🔗 Web Scraper Link Engine

- **Semantic Extraction:** Utilizes an asynchronous parser powered by `@mozilla/readability` and a virtualized `JSDOM` window tree to isolate central core article bodies while stripping away noisy headers, sidebars, and ads.
- **Fail-Safe Abort Thresholds:** Implements an automated `AbortController` network gate. If a target web address hangs, the request automatically breaks on an 8-second execution barrier to protect active threads.

### 3. 📁 Knowledge Store Document RAG Matrix

- **Binary Stream Ingestion:** High-performance drag-and-drop file upload container supporting multipart `form-data` uploads for `.txt`, `.md`, `.docx`, and `.pdf` document profiles.
- **Atomic Workspace Purges:** Instantly reads plain text data maps directly out of temp target disk uploads, processes content tokens, and immediately runs disk-wipe cleanups to completely prevent server storage pollution.

### 4. 🗄️ Persistent Media Knowledge Vault

- **Unified Database Tracking:** Tracks and binds historical narration asset logs directly to separate authenticated database schemas using Mongoose collections.
- **Cross-Origin Streaming Core:** Customized audio controller utilizing direct browser binary blob stream generation, bypassing proxy data path traps and ensuring bulletproof downloads.
- **Inline Dynamic Status:** Replaces absolute browser alerts with elegant success/error feedback widgets embedded directly into the player workflow container block.

### 🔐 5. Session Gate & Cache Synchronization

- **JWT Guard Middleware:** Every operational data-generation and storage route is secured behind an asymmetric HTTP Authorization header gate (`protect`).
- **Dynamic Cache Relays:** Custom account mutation profile views that auto-sync name, email, and password records, seamlessly refreshing memory matrices inside local caches.

---

## 🛠️ Technology Stack Matrix

### ☁️ Cloud & AI Infrastructure Services

- **Azure Speech Service:** Leverages Microsoft Cognitive Services Neural Speech SDK for realistic audio synthesis with advanced human-like inflection, multi-accent configurations, and low-latency rendering.
- **Azure Blob Storage Matrix:** Provides persistent cloud hosting infrastructure to warehouse, stream, secure, and deliver exported track binaries safely at scale.

### Core Application Layer

- **Frontend Framework:** React.js (v18+) compiled with an ultra-fast Vite optimization pipeline.
- **Backend Runtime:** Node.js environment utilizing the modular Express.js server router.
- **Database Modeling:** MongoDB Atlas cloud cluster structured via object data modeling (ODM) Mongoose abstraction layers.

### Interface & Data Engineering

- **Styling Foundation:** Tailwind CSS v4 Utility Engine.
- **Motion Core:** Framer Motion (managing custom modular form transitions and view animations).
- **Asset Vectors:** Lucide React Icon Engineering package.
- **Stream Processing:** Multer engine integration for incoming binary document file streams.

---

## 📂 Production Code Blueprint

````text
NarrateAI/
├── backend/
│   ├── controllers/      # Route logic handlers (authController.js)
│   ├── middleware/       # Token authorization guard gates (authMiddleware.js)
│   ├── models/           # Mongoose schemas (User.js, Track.js)
│   ├── routes/           # REST endpoints (vaultRoutes.js, audioRoutes.js)
│   ├── services/         # Infrastructure workers (scraperService.js, ttsService.js)
│   └── server.js         # Express app entry configuration mount point
└── frontend/src/
    ├── components/       # Reusable layout fragments (AudioConsole.jsx, InputPanel.jsx)
    ├── constants/        # System configuration data records (voices.js)
    ├── pages/            # Workflow dashboard views (HomeHub.jsx, MyVault.jsx)
    ├── App.jsx           # Client-side SPA routing orchestration layout
    └── main.jsx          # React virtual DOM initialization root


## ⚡ Local Setup & Deployment Orchestration

### 1. Repository Initializing
Clone down the source code project layout and check the working directory:
```bash
git clone [https://github.com/RiturajSinghD/NarrateAI.git](https://github.com/RiturajSinghD/NarrateAI.git)
cd NarrateAI

### 2. Backend Environment Cryptographic Keys
Navigate inside your backend directory, install packages, and create an operational tracking .env variable configuration mapping details explicitly:

```bash
cd backend
npm install

#### Configure your environmental .env file structure:

```bash
Code snippet
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/narrateai
JWT_SECRET=your_high_entropy_alphanumeric_jwt_secret_signing_key
AZURE_SPEECH_KEY=your_microsoft_azure_cognitive_speech_subscription_key
AZURE_SPEECH_REGION=your_speech_resource


#### Kickstart your backend pipeline service:
```bash
npm run dev


### 3. Frontend App Core Spinup
Open a secondary terminal process split path window, check inside your frontend module workspace folder block, install dependencies, and run your Vite local deployment worker:

```bash
cd frontend
npm install
npm run dev
Open your browser engine portal link directly to http://localhost:5173 to interact with your local environment!

### 🔒 Security & Code Compliance Regulations
Zero Dotenv Exposure: Your local .gitignore is fully hardened to exclude operational .env variables from ever leaking to public online repository streams.

Stream Buffer Optimizations: Implements explicit native server cleaning sweeps (fs.unlinkSync), immediately erasing binary uploads to maintain clean operating memory constraints.

Asymmetric Data Protection: No data read/write transactions are executed without running a JWT decryption gate checkout, making sure user records stay fully isolated.

### 📄 License
Distributed under the MIT Enterprise Studio License.
````
