import { useEffect, useState } from "react";

import {
  getCalls,
  uploadCall as uploadCallRequest,
  deleteCall as deleteCallRequest,
} from "../services/callService";


function useCalls(token) {
  const [calls, setCalls] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);


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
      const response = await getCalls(token);

      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    };

    loadData();
  }, [token]);


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


  const resetCalls = () => {
    setCalls([]);
    setSelectedCall(null);
  };


  return {
    calls,
    setFile,
    loading,
    selectedCall,
    setSelectedCall,
    uploadCall,
    deleteCall,
    resetCalls,
  };
}


export default useCalls;
