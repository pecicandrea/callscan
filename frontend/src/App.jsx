import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [calls, setCalls] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadCalls = async () => {
    const response = await fetch("http://127.0.0.1:8000/calls", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setCalls(data);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadData = async () => {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const callsResponse = await fetch("http://127.0.0.1:8000/calls", {
        headers,
      });

      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        setCalls(callsData);
      }

      const userResponse = await fetch("http://127.0.0.1:8000/me", {
        headers,
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    };

    loadData();
  }, [token]);

  const login = async () => {
    setAuthError("");

    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        setAuthError("Please enter a valid email address.");
      } else {
        setAuthError(data.detail || "Login failed.");
      }

      return;
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const register = async () => {
    setAuthError("");

    const response = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        setAuthError("Please enter a valid email address.");
      } else {
        setAuthError(data.detail || "Registration failed.");
      }

      return;
    }

    setRegisterMode(false);
    setAuthError("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCalls([]);
    setSelectedCall(null);
    setUser(null);
    setProfileOpen(false);
  };

  const uploadCall = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/calls/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      await loadCalls();
      setFile(null);
    }

    setLoading(false);
  };

  const deleteCall = async (event, id) => {
    event.stopPropagation();

    const response = await fetch(`http://127.0.0.1:8000/calls/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setCalls(calls.filter((call) => call.id !== id));

      if (selectedCall?.id === id) {
        setSelectedCall(null);
      }
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark">C</span>
            <span>CallScan</span>
          </div>

          <h1>{registerMode ? "Create your account" : "Welcome back"}</h1>

          <p className="auth-description">
            {registerMode
              ? "Create an account to start analyzing your calls."
              : "Sign in to access your call analyses."}
          </p>

          <label>Email</label>

          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {authError && <p className="auth-error">{authError}</p>}

          <button
            className="auth-button"
            onClick={registerMode ? register : login}
          >
            {registerMode ? "Create account" : "Sign in"}
          </button>

          <p className="auth-switch">
            {registerMode
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              onClick={() => {
                setRegisterMode(!registerMode);
                setAuthError("");
              }}
            >
              {registerMode ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="brand">
            <span className="brand-mark">C</span>
            <span>CallScan</span>
          </div>

          <p>Review and understand your customer calls</p>
        </div>

        <div className="header-right">
          <span className="call-count">
            {calls.length} {calls.length === 1 ? "call" : "calls"} analyzed
          </span>

          <div className="profile">
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-user">
                  <div className="profile-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>

                  <div>
                    <strong>{user?.email}</strong>
                    <span>Support agent</span>
                  </div>
                </div>

                <div className="profile-stats">
                  {calls.length} analyzed{" "}
                  {calls.length === 1 ? "call" : "calls"}
                </div>

                <button className="profile-logout" onClick={logout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="upload-section">
        <span className="section-label light-label">NEW ANALYSIS</span>

        <h1>Analyze a customer call</h1>

        <p>
          Upload a customer call and we'll analyze the conversation for you.
        </p>

        <div className="upload-box">
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => setFile(event.target.files[0])}
          />

          <button onClick={uploadCall} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze call →"}
          </button>
        </div>
      </section>

      <section className="calls-section">
        <div className="section-heading">
          <div>
            <span className="section-label">RECENT ANALYSES</span>

            <h2>Your calls</h2>
          </div>

          <span className="analysis-count">{calls.length} total</span>
        </div>

        <div className="calls-list">
          {calls.length === 0 && (
            <div className="empty-state">
              <h3>No calls yet</h3>
              <p>Upload your first customer call to analyze it.</p>
            </div>
          )}

          {calls.map((call) => (
            <div
              className="call-card"
              key={call.id}
              onClick={() => setSelectedCall(call)}
            >
              <div className="call-header">
                <div>
                  <h3>{call.filename}</h3>

                  <div className="metadata">
                    {call.category || "Uncategorized"}

                    {call.sentiment && <span> · {call.sentiment}</span>}
                  </div>
                </div>

                <span className={`priority ${call.priority?.toLowerCase()}`}>
                  {call.priority}
                </span>
              </div>

              <p>{call.summary}</p>

              <div className="card-footer">
                <span className="view-details">View analysis →</span>

                <button
                  className="delete-button"
                  onClick={(event) => deleteCall(event, call.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedCall && (
        <div className="modal-overlay">
          <div className="details-card">
            <button
              className="close-button"
              onClick={() => setSelectedCall(null)}
            >
              ×
            </button>

            <div className="details-header">
              <span className="section-label">CALL ANALYSIS</span>

              <h2>{selectedCall.filename}</h2>
            </div>

            <div className="analysis-info">
              <div className="analysis-tags">
                <div className="analysis-tag">
                  <small>Category</small>
                  <span>{selectedCall.category}</span>
                </div>

                <div className="analysis-tag">
                  <small>Sentiment</small>
                  <span>{selectedCall.sentiment}</span>
                </div>
              </div>

              <span
                className={`priority ${selectedCall.priority?.toLowerCase()}`}
              >
                {selectedCall.priority}
              </span>
            </div>

            <div className="detail-section summary-section">
              <h3>Summary</h3>
              <p>{selectedCall.summary}</p>
            </div>

            <div className="detail-section">
              <h3>Transcript</h3>

              <div className="transcript">{selectedCall.transcript}</div>
            </div>

            <div className="detail-section">
              <h3>Recommended actions</h3>

              <div className="actions">
                {selectedCall.action_items?.map((item, index) => (
                  <div className="action-item" key={index}>
                    <span className="action-number">{index + 1}</span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-footer">
              <button
                className="delete-button"
                onClick={(event) => deleteCall(event, selectedCall.id)}
              >
                Delete analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
