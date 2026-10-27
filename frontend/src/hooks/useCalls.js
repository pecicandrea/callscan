import { useEffect, useState } from "react";

import {
  getCalls,
  uploadCall as uploadCallRequest,
  deleteCall as deleteCallRequest,
} from "../services/callService";


function useCalls(token, onUnauthorized) {
  const [calls, setCalls] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [error, setError] = useState("");


  const resetCalls = () => {
    setCalls([]);
    setSelectedCall(null);
    setError("");
  };


  const handleUnauthorized = () => {
    resetCalls();
    onUnauthorized();
  };


  const loadCalls = async () => {
    const response = await getCalls(token);

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

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
      try {
        const response = await getCalls(token);

        // An expired token on page load is handled by useAuth through /me.
        if (response.ok) {
          const data = await response.json();
          setCalls(data);
        }
      } catch {
        setError("Could not connect to the server.");
      }
    };

    loadData();
  }, [token]);


  const uploadCall = async () => {
    if (!file) {
      setError("Please choose an audio file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadCallRequest(token, file);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Could not analyze the call. Please try again.");
        return;
      }

      await loadCalls();
      setFile(null);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const deleteCall = async (event, id) => {
    event.stopPropagation();
    setError("");

    try {
      const response = await deleteCallRequest(token, id);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        setError("Could not delete the call. Please try again.");
        return;
      }

      setCalls(calls.filter((call) => call.id !== id));

      if (selectedCall?.id === id) {
        setSelectedCall(null);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    }
  };


  return {
    calls,
    setFile,
    loading,
    selectedCall,
    setSelectedCall,
    error,
    uploadCall,
    deleteCall,
    resetCalls,
  };
}


export default useCalls;
