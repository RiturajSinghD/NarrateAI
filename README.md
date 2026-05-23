# NarrateAI

[![Production Ready](https://img.shields.io/badge/status-production--ready-emerald?style=for-the-badge)]()
[![Backend: Express](https://img.shields.io/badge/Backend-Express.js-blue?style=for-the-badge&logo=express)]()
[![Frontend: React](https://img.shields.io/badge/Frontend-React.js--Vite-cyan?style=for-the-badge&logo=react)]()
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB--Atlas-green?style=for-the-badge&logo=mongodb)]()
[![AI Service: Azure Speech](https://img.shields.io/badge/AI--Engine-Azure--Speech-purple?style=for-the-badge&logo=microsoftazure)]()

NarrateAI is an AI-powered Text-to-Speech platform that transforms raw text, blog articles, URLs, and uploaded documents into natural-sounding audio using Microsoft Azure Neural Speech Services.

The platform combines modern frontend engineering, secure backend APIs, document parsing pipelines, web article extraction, and cloud-based media storage into a single production-ready application.

---

# Features

## Deep Text Studio

- Convert long-form text into realistic AI-generated speech
- Smooth glassmorphic UI built using React + Tailwind CSS
- Multi-language and multi-voice support
- Real-time voice preview before full narration generation
- Dynamic voice profile selection system

---

## Web Scraper Link Engine

Paste a blog/article URL and NarrateAI automatically extracts the readable content.

### Powered By

- `@mozilla/readability`
- `JSDOM`
- AbortController-based timeout handling

### Capabilities

- Removes ads, sidebars, and unnecessary clutter
- Extracts only the main article body
- Prevents hanging requests using an 8-second timeout guard

---

## Document-to-Audio Pipeline

Upload supported document formats and instantly convert them into speech.

### Supported Formats

- `.txt`
- `.md`
- `.docx`
- `.pdf`

### Features

- Multipart upload support using Multer
- Automatic text extraction
- Temporary file cleanup after processing
- Memory-safe backend handling

---

## Azure-Powered AI Infrastructure

### Azure Speech Service

Uses Microsoft Azure Cognitive Speech Services for:

- Human-like neural voice synthesis
- Multi-accent voice rendering
- Natural speech inflection
- Low-latency audio generation

### Azure Blob Storage

Used for:

- Cloud audio storage
- Secure audio streaming
- Downloadable narration assets
- Persistent media hosting

---

## Persistent Media Vault

- Stores generated narration history
- Secure authenticated user-based access
- Audio playback and download support
- Media tracking using MongoDB + Mongoose

---

## Authentication & Security

### Security Features

- JWT-based route protection
- Protected API middleware
- Secure user authentication
- Isolated user media records
- Automatic local cache synchronization

### File Safety

- Uploaded files are deleted after processing
- `.env` variables excluded using `.gitignore`
- Prevents unnecessary disk storage pollution

---

# Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS v4
- Framer Motion
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Multer

---

## Cloud & AI

- Microsoft Azure Speech Service
- Azure Blob Storage

---

# Project Structure

```text
NarrateAI/
├── backend/
│   ├── controllers/      # Route logic handlers
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Scraper & TTS services
│   └── server.js         # Express entry point
│
└── frontend/
    └── src/
        ├── components/   # Reusable UI components
        ├── constants/    # Voice configs & constants
        ├── pages/        # Application pages
        ├── App.jsx
        └── main.jsx
```

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/RiturajSinghD/NarrateAI.git
cd NarrateAI
```

---

# Backend Setup

## Navigate to Backend

```bash
cd backend
npm install
```

---

## Create `.env` File

```env
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/narrateai

JWT_SECRET=your_high_entropy_jwt_secret

# Azure Speech Service
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
AZURE_STORAGE_CONTAINER_NAME=narrations
```

---

## Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Application Workflow

```text
User Input
   ↓
Text / URL / Document Upload
   ↓
Backend Extraction Pipeline
   ↓
Azure Neural Speech Synthesis
   ↓
Audio Generation
   ↓
Azure Blob Storage Upload
   ↓
Streaming + Download Access
```

---

# Core Highlights

- AI-powered narration platform
- Realistic Azure neural voices
- URL article extraction engine
- Document-to-audio conversion
- Secure JWT authentication
- Cloud-based media storage
- Modern animated UI
- Production-ready architecture

---

# Future Improvements

- Podcast generation mode
- AI summarization before narration
- Voice cloning integration
- Background music mixing
- Multi-file batch processing
- Language translation support
- Audio waveform editor

---

# License

Distributed under the MIT License.
