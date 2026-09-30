function Navbar({
  calls,
  user,
  profileOpen,
  setProfileOpen,
  logout,
}) {
  return (
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
  );
}

export default Navbar;