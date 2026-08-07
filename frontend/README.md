# CropGuard AI — Frontend

A multilingual plant disease detection platform for Ethiopian smallholder farmers.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- shadcn/ui components
- Framer Motion (animations)
- i18next (English, Amharic, Tigrinya)
- Wouter (routing)
- TanStack Query

## Setup

### Requirements

- Node.js 18 or later
- npm, yarn, or pnpm

### Install and run

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Auth

Authentication uses localStorage — any email/password combination works for demo login and registration. Replace `src/context/AuthContext.jsx` with your real API calls when connecting a backend.

## Project Structure

```
src/
  pages/          Public pages (Home, About, Contact, DiseaseGuide)
                  Auth pages (SignIn, Register)
                  App shell + all authenticated pages
  components/     Shared UI components + shadcn/ui components
  context/        AuthContext (localStorage-based auth)
  i18n/           Translation files (en.json, am.json, ti.json)
  i18n.js         App shell translations
  App.tsx         Root router — public vs. authenticated views
  App.css         App shell design system
  index.css       Tailwind CSS v4 variables
```
