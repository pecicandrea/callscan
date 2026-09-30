function Auth({
  email,
  setEmail,
  password,
  setPassword,
  registerMode,
  setRegisterMode,
  authError,
  setAuthError,
  login,
  register,
}) {
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

export default Auth;