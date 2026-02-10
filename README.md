# Rally

A full-stack application combining a React frontend, Python Flask backend, and worker service for AI-powered chat and transcript processing using Google Gemini.

## Project Structure

```
rally/
├── backend/           # Flask API server
├── frontend/          # React web application
└── worker/            # Background job processor
```

## Prerequisites

- **Python 3.8+**
- **Node.js 14+** and npm
- **Google API Key** (for Gemini API access)

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

## Running the Application

### 0. Activate virtual environment
Windows: `.venv\Scripts\activate`
MacOS: `source .venv/bin/activate`

### 1. Start the Backend Server

```bash
cd backend
python app.py
# Backend runs on http://localhost:8000
```

### 2. Open the Frontend

Simply open `frontend/index.html` in your web browser. You can do this by:
- Double-clicking the file in Finder, or
- Right-clicking the file and selecting "Open with" > your preferred browser, or
- Using the command: `open frontend/index.html`

The frontend will communicate with the backend server running on `http://localhost:8000`.

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
- **Worker**: Edit workflow in `worker/graph/nodes/`

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