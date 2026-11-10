# Multi-Media Post Scheduler

Repository for Multi-Media Post Scheduler: A modern full-stack web application for creating, previewing, and scheduling multi-media posts across multiple social media platforms.

---

## 📁 Project Architecture

```
Multi-Media Post Scheduler/
├── Backend/                       # Node.js + Express (TypeScript) API
│   ├── src/
│   │   ├── controllers/           # Request handlers (post.controller.ts)
│   │   ├── routes/                # API routes (post.routes.ts, media.routes.ts)
│   │   ├── services/              # Scheduler engine (scheduler.service.ts using node-cron)
│   │   ├── types/                 # Shared TypeScript interfaces & types
│   │   └── index.ts               # Express server entry point
│   ├── data/                      # Persistent JSON storage
│   ├── uploads/                   # Stored multi-media files
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/                      # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── App.tsx                # Post composer, live preview & schedule queue
│   │   ├── index.css              # Tailwind CSS directives
│   │   └── main.tsx               # Application root
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite config with backend API proxy (/api)
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Start the Backend API

```bash
cd Backend
npm run dev
```

- Server starts at **`http://localhost:5000`**
- Health check available at **`http://localhost:5000/api/health`**
- Automatically executes scheduled posts every minute via background cron

### 2. Start the Frontend Application

In a separate terminal window:

```bash
cd Frontend
npm run dev
```

- Web UI opens at **`http://localhost:5173`**
- Proxies `/api/*` requests to the Backend automatically

---

## 🛠 Features

- **Multi-Platform Support**: Toggle targets for Twitter / X, LinkedIn, Instagram, Facebook, and YouTube.
- **Media Uploads**: Attach multiple image and video files.
- **Live Social Feed Preview**: Real-time rendering of your post card formatted for the selected platform.
- **Automated Scheduling Engine**: Background cron daemon runs every minute to publish queued posts when due.
- **RESTful Endpoints**:
  - `GET /api/health`: Service health check
  - `GET /api/posts`: Retrieve all scheduled and published posts
  - `POST /api/posts`: Schedule a new post
  - `DELETE /api/posts/:id`: Remove a post
  - `POST /api/media/upload`: Upload images and videos
