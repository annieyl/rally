# Rally

A full-stack application combining a React frontend and Python Flask backend for AI-powered chat and transcript processing using Google Gemini.

## Project Structure

```
rally/
├── backend/           # Flask API server
└── frontend/          # React web application
```

## Prerequisites

- **Python 3.8+**
- **Node.js 14+** and npm
- **Google API Key** (for Gemini API access)

## Quick Start (Shared Supabase)

Use this if you want the fastest onboarding without creating a Python virtual environment.

### 1) Install dependencies

```bash
# Backend
cd backend
pip3 install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2) Configure backend environment

Create or update `backend/.env`:

```env
GOOGLE_API_KEY=your_google_api_key
SUPABASE_URL=your_shared_supabase_project_url
SUPABASE_KEY=your_shared_supabase_service_or_project_key
```

### 3) Configure frontend environment

Create `frontend/.env.local`:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=your_shared_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_shared_supabase_anon_key
```

### 4) One-time shared Supabase setup (if not already initialized)

In Supabase SQL Editor, run:
- `backend/migrations/001_initial_schema.sql`
- `backend/migrations/002_team_members.sql`

In Supabase Storage, ensure bucket `transcripts` exists.

### 5) Run the app

```bash
# Terminal 1
cd backend
python3 app.py

# Terminal 2
cd frontend
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## Setup Instructions

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY (use the one provided)

# Install dependencies
pip install -r requirements.txt
```

**Backend Dependencies:**
- Flask - Web framework
- Flask-CORS - Cross-origin resource sharing
- LangChain - LLM framework
- Langchain-Google-GenAI - Gemini API integration
- python-dotenv - Environment variable management

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# (Optional) Install Tailwind CSS and Vite plugin if not already installed
npm install -D tailwindcss @tailwindcss/vite
```

**Frontend Dependencies:**
- React - UI library
- Vite - Build tool and dev server
- Tailwind CSS - Utility-first CSS framework
- TypeScript - Type-safe JavaScript

## Running the Application

### 0. (Optional) Activate virtual environment
Windows: `.venv\Scripts\activate`
MacOS: `source .venv/bin/activate`

### 1. Start the Backend Server

```bash
cd backend
python app.py
# Backend runs on http://localhost:8000
```

### 2. Start the Frontend Dev Server

```bash
cd frontend
npm run dev
# Frontend dev server runs on http://localhost:5173 (or similar)
```

Open your browser and navigate to the URL displayed in the terminal (typically `http://localhost:5173`). The frontend will automatically communicate with the backend server running on `http://localhost:8000`.

### 3. Build Frontend for Production

```bash
cd frontend
npm run build
# Creates optimized build in dist/ directory
```

### Available npm Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Create production build
npm run preview  # Preview production build locally
npm run lint     # Run linter (if configured)
```

## API Endpoints

- **POST /api/chat** - Send messages to the AI chatbot
- **POST /api/transcript** - Process transcript files

## Environment Variables

### Backend (.env)
```
GOOGLE_API_KEY=your_google_api_key_here
```

## Development

- **Backend**: Edit files in `backend/routes/` and `backend/services/`
- **Frontend**: Edit files in `frontend/src/`

## Troubleshooting

**API Key Issues:**
- Ensure .env file is in the correct directory
- Verify the API key has Gemini API enabled

**CORS Errors:**
- Backend should have CORS enabled (see app.py)
- Ensure frontend is making requests to the correct backend URL

**Module Import Errors:**
- Verify all dependencies are installed: `pip install -r requirements.txt`
- For frontend: `npm install`

## Project Notes

..