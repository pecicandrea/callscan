import { useEffect, useState } from "react";

import "./App.css";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  getCalls,
  uploadCall as uploadCallRequest,
  deleteCall as deleteCallRequest,
} from "./services/api";


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
    const response = await getCalls(token);

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
      const callsResponse = await getCalls(token);

      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        setCalls(callsData);
      }

      const userResponse = await getCurrentUser(token);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    };

    loadData();
  }, [token]);


  const login = async () => {
    setAuthError("");

    const response = await loginUser(email, password);
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

    const response = await registerUser(email, password);
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

    const response = await uploadCallRequest(token, file);

    if (response.ok) {
      await loadCalls();
      setFile(null);
    }

    setLoading(false);
  };


  const deleteCall = async (event, id) => {
    event.stopPropagation();

    const response = await deleteCallRequest(token, id);

    if (response.ok) {
      setCalls(calls.filter((call) => call.id !== id));

      if (selectedCall?.id === id) {
        setSelectedCall(null);
      }
    }
  };


  if (!token) {
    return (
      <Auth
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        registerMode={registerMode}
        setRegisterMode={setRegisterMode}
        authError={authError}
        setAuthError={setAuthError}
        login={login}
        register={register}
      />
    );
  }


  return (
    <Dashboard
      calls={calls}
      user={user}
      profileOpen={profileOpen}
      setProfileOpen={setProfileOpen}
      logout={logout}
      setFile={setFile}
      loading={loading}
      uploadCall={uploadCall}
      setSelectedCall={setSelectedCall}
      deleteCall={deleteCall}
      selectedCall={selectedCall}
    />
  );
}


export default App;