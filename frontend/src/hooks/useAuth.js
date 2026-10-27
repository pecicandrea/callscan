import { useEffect, useState } from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";


function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [user, setUser] = useState(null);


  useEffect(() => {
    if (!token) {
      return;
    }

    const loadUser = async () => {
      const response = await getCurrentUser(token);

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    };

    loadUser();
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
  };
}


export default useAuth;
