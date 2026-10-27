import { useState } from "react";

import "./App.css";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

import useAuth from "./hooks/useAuth";
import useCalls from "./hooks/useCalls";


function App() {
  const auth = useAuth();
  const calls = useCalls(auth.token);

  const [profileOpen, setProfileOpen] = useState(false);


  const logout = () => {
    auth.logout();
    calls.resetCalls();
    setProfileOpen(false);
  };


  if (!auth.token) {
    return (
      <Auth
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        registerMode={auth.registerMode}
        setRegisterMode={auth.setRegisterMode}
        authError={auth.authError}
        setAuthError={auth.setAuthError}
        login={auth.login}
        register={auth.register}
      />
    );
  }


  return (
    <Dashboard
      calls={calls.calls}
      user={auth.user}
      profileOpen={profileOpen}
      setProfileOpen={setProfileOpen}
      logout={logout}
      setFile={calls.setFile}
      loading={calls.loading}
      uploadCall={calls.uploadCall}
      setSelectedCall={calls.setSelectedCall}
      deleteCall={calls.deleteCall}
      selectedCall={calls.selectedCall}
    />
  );
}


export default App;
