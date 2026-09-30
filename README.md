# CallScan

CallScan is an AI-powered web application for customer support agents to review and analyze their calls.

Agents can create an account, upload customer call recordings, and receive AI-generated insights about each conversation.

Each agent has access only to their own calls.

---

## Features

- User registration and login
- JWT authentication
- Private calls per user
- Audio upload
- AI transcription
- Call summary generation
- Category detection
- Sentiment detection
- Priority detection
- Recommended actions
- Call history
- Call deletion

---

## Tech Stack

### Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT authentication
- WhisperX
- OpenAI API

### Frontend

- React
- Vite
- JavaScript
- CSS

---

## AI Processing Flow

The application processes calls through the following pipeline:

```
Audio Upload
      |
      v
FastAPI Backend
      |
      v
WhisperX Transcription
      |
      v
Transcript Analysis with OpenAI
      |
      v
Summary + Category + Sentiment + Priority + Actions
      |
      v
PostgreSQL Storage
```

---

## Project Structure

```
backend/
├── models/
├── routers/
├── services/
├── database.py
├── security.py
├── create_tables.py
└── main.py

frontend/
└── src/
    ├── components/
    ├── pages/
    ├── services/
    ├── App.jsx
    └── main.jsx
```

---

# How to run the project

The project has two parts:

- **Backend** - FastAPI application responsible for users, calls, database operations, transcription and AI analysis.
- **Frontend** - React application used in the browser.

Both applications need to be running.

---

# Backend Setup

Open a terminal in the main project folder.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/callscan
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET_KEY=your_secret_key
```

Variables:

- `DATABASE_URL` - PostgreSQL database connection
- `OPENAI_API_KEY` - used for AI call analysis
- `JWT_SECRET_KEY` - used for JWT authentication

---

## Database Setup

Create a PostgreSQL database.

Example:

```
callscan
```

Create database tables:

```bash
python backend/create_tables.py
```

---

## Start Backend

Run:

```bash
python -m uvicorn backend.main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

FastAPI documentation:

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal.

Go to frontend:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## Application Flow

1. User creates an account
2. User logs in and receives a JWT token
3. User uploads a customer call recording
4. Backend processes the audio
5. WhisperX generates the transcript
6. OpenAI analyzes the conversation
7. Results are stored in PostgreSQL
8. User can review the call analysis in the dashboard

---

## Example AI Analysis

```json
{
  "summary": "Customer reported a billing issue.",
  "category": "billing",
  "sentiment": "negative",
  "priority": "MEDIUM",
  "action_items": [
    "Review customer invoice",
    "Contact customer with resolution"
  ]
}
```