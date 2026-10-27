import { useEffect, useState } from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";


function useAuth({ onSessionExpired }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [user, setUser] = useState(null);


  const expireSession = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setAuthError("Your session has expired. Please sign in again.");

    onSessionExpired();
  };


  useEffect(() => {
    if (!token) {
      return;
    }

    const loadUser = async () => {
      try {
        const response = await getCurrentUser(token);

        if (response.status === 401 || response.status === 404) {
          localStorage.removeItem("token");
          setToken(null);
          setAuthError("Your session has expired. Please sign in again.");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch {
        // The calls request shows the connection error.
      }
    };

    loadUser();
  }, [token]);


  const login = async () => {
    setAuthError("");

    let response;

    try {
      response = await loginUser(email, password);
    } catch {
      setAuthError("Could not connect to the server.");
      return;
    }

    const data = await response.json().catch(() => ({}));

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

    let response;

    try {
      response = await registerUser(email, password);
    } catch {
      setAuthError("Could not connect to the server.");
      return;
    }

    const data = await response.json().catch(() => ({}));

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
    setUser(null);
  };


  return {
    token,
    email,
    setEmail,
    password,
    setPassword,
    registerMode,
    setRegisterMode,
    authError,
    setAuthError,
    user,
    login,
    register,
    logout,
    expireSession,
  };
}


export default useAuth;
