# StudyFlow — Student Planner

A mobile-first student planner built with React + Vite. It is designed for iPhone-sized screens and can be installed as a PWA.

## Requirements
- Node.js 20.19+ (or a current Node.js LTS)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Features
- Home dashboard with task and class overview
- Create, edit, delete, complete and search tasks
- Weekly schedule with add/edit/delete class
- Course list with add/edit/delete
- Browser Local Storage persistence
- PWA manifest and installable app shell

## iPhone testing
1. Put your laptop and iPhone on the same Wi-Fi.
2. Run `npm run dev -- --host 0.0.0.0`.
3. Open the Network URL shown by Vite in Safari on your iPhone.
4. For the final PWA install, deploy the app to an HTTPS host.
5. In Safari, tap Share → Add to Home Screen.

Note: PWA installation and service-worker behavior require HTTPS (localhost is allowed for local development). Data is currently stored per browser/device. It does not sync between devices yet.
