# CallScan

CallScan is a web application that helps customer support teams analyze their customer calls.

Users can create an account, upload call recordings, and get an AI-generated analysis of each conversation. Every user can only see and manage their own calls.

The goal of this project was to build a complete AI-powered workflow, from uploading an audio file to generating useful insights from the conversation.

---

## Features

- User registration and login
- JWT authentication
- Private calls for each user
- Audio file upload
- Automatic speech transcription
- AI-generated call summary
- Category detection
- Sentiment analysis
- Priority detection
- Recommended actions
- Call history
- Delete analyzed calls

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

## How AI Processing Works

The main idea behind CallScan is taking an audio recording and turning it into useful information for support teams.

The process works like this:

```
Customer call recording
          |
          v
     Audio upload
          |
          v
       FastAPI
          |
          v
      WhisperX
          |
          v
    Text transcript
          |
          v
     OpenAI analysis
          |
          v
 Summary, category, sentiment,
 priority and recommended actions
          |
          v
      PostgreSQL
          |
          v
     React dashboard
```

### Speech transcription

When a user uploads a call recording, the backend temporarily processes the audio file and sends it through WhisperX.

WhisperX converts the spoken conversation into text, creating a transcript of the call.

Example:

```
Audio recording
        ↓
WhisperX
        ↓
"This customer called because they have a billing problem..."
```

The generated transcript is then used as input for the AI analysis step.

### AI call analysis

After transcription, the transcript is sent to the OpenAI API.

The model analyzes the conversation and extracts structured information:

- Short summary of the call
- Main category of the issue
- Customer sentiment
- Priority level
- Recommended next steps

Example result:

```json
{
  "summary": "Customer reported an unexpected billing charge.",
  "category": "billing",
  "sentiment": "negative",
  "priority": "MEDIUM",
  "action_items": [
    "Review customer invoice",
    "Contact customer with resolution"
  ]
}
```

The final result is stored in PostgreSQL and displayed in the React dashboard.

---

## Project Structure

```
backend/
├── app/
│   ├── api/          # routes: auth, calls
│   ├── core/         # config, security
│   ├── db/           # base, database
│   ├── models/       # User, Call
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # transcription, analysis
│   └── main.py
├── .env.example
└── requirements.txt


frontend/
├── src/
│   ├── components/
│   ├── hooks/        # useAuth, useCalls
│   ├── pages/        # AuthPage, DashboardPage
│   ├── services/     # api, authService, callService
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
└── .env.example
```

---

# Running the Project

The project has two separate parts:

- **Backend** - handles authentication, database operations, audio processing and AI analysis.
- **Frontend** - React application used by users in the browser.

Both applications need to be running.

---

# Backend Setup

Open a terminal and go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the `backend` folder (see `backend/.env.example`).

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/callscan
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_secret_key
```

`DATABASE_URL` is used for connecting to PostgreSQL.

`OPENAI_API_KEY` is required for AI call analysis.

`SECRET_KEY` is used for signing and validating authentication tokens. Use a long random string, for example the output of `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

---

## Database Setup

Create a PostgreSQL database:

```
callscan
```

Database tables are created automatically when the backend starts.

---

## Start Backend

From the `backend` folder, run:

```bash
python -m uvicorn app.main:app --reload
```

Backend runs on:

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

Create a `.env` file in the `frontend` folder (see `frontend/.env.example`):

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the application:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Application Flow

1. User creates an account
2. User logs in and receives an authentication token
3. User uploads a customer call recording
4. Backend processes the audio
5. WhisperX creates the transcript
6. OpenAI analyzes the transcript
7. Results are saved in PostgreSQL
8. User can review the analysis in the dashboard