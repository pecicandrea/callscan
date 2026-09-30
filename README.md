# CallScan

CallScan is a web application for customer support agents to review and analyze their calls.

Agents can create their own account, upload call recordings and view the analysis for each call. Each agent has access only to their own calls.

## Features

- User registration and login
- Private calls for each support agent
- Audio upload
- Call transcription
- Call summary
- Category and sentiment detection
- Priority detection
- Recommended actions
- Call history
- Call deletion

## Tech Stack
## How to run the project

The project has two parts:

- **Backend** is the FastAPI application. It handles users, calls, the database, transcription and call analysis.
- **Frontend** is the React application that you see in the browser.

Both need to be running for CallScan to work.

### 1. Set up the backend

Open a terminal in the main project folder.

Create a virtual environment:

```bash
python -m venv .venv
```

A virtual environment keeps the Python packages for this project separate from the rest of your computer.

On Windows, activate it with:

```bash
.venv\Scripts\activate
```

Then install the Python packages used by CallScan:

```bash
pip install -r requirements.txt
```

The `requirements.txt` file contains the Python packages that the backend needs.

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
- CSS

### 2. Set up PostgreSQL

CallScan uses PostgreSQL to store users and their call analyses.

Create a PostgreSQL database for the project. For example:

```text
callscan
```

Create a `.env` file in the main project folder.

You can use `.env.example` to see which environment variables are required.

Add your own values:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/callscan
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET_KEY=your_secret_key

Replace `username` and `password` with your PostgreSQL credentials.

`DATABASE_URL` tells the backend how to connect to PostgreSQL.

`OPENAI_API_KEY` is used when CallScan analyzes a call.

`JWT_SECRET_KEY` is used to create and verify login tokens.

Now create the database tables:

```bash
python create_tables.py
```

This creates the `users` and `calls` tables inside the database.


### 3. Start the backend

Make sure the virtual environment is active.

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

You can also open the FastAPI documentation at:

```text
http://127.0.0.1:8000/docs
```

The `/docs` page can be used to view and test the API endpoints.



### 4. Start the frontend

Keep the backend running and open a second terminal.

Go to the frontend folder:

```bash
cd frontend
```

Install the frontend packages:

```bash
npm install
```

Then start the React application:

```bash
npm run dev
```

Vite will show the address where the frontend is running. By default, it is usually:

```text
http://localhost:5173
```

Open that address in your browser.

You can now register an account, sign in and upload a customer call for analysis.