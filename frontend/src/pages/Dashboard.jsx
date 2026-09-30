import Navbar from "../components/Navbar";
import UploadCall from "../components/UploadCall";
import CallCard from "../components/CallCard";
import CallDetails from "../components/CallDetails";


function Dashboard({
  calls,
  user,
  profileOpen,
  setProfileOpen,
  logout,
  setFile,
  loading,
  uploadCall,
  setSelectedCall,
  deleteCall,
  selectedCall,
}) {
  return (
    <div className="app">
      <Navbar
        calls={calls}
        user={user}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        logout={logout}
      />

      <UploadCall
        setFile={setFile}
        loading={loading}
        uploadCall={uploadCall}
      />

      <section className="calls-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              RECENT ANALYSES
            </span>

            <h2>Your calls</h2>
          </div>

          <span className="analysis-count">
            {calls.length} total
          </span>
        </div>

        <div className="calls-list">
          {calls.length === 0 && (
            <div className="empty-state">
              <h3>No calls yet</h3>

              <p>
                Upload your first customer call to analyze it.
              </p>
            </div>
          )}

          {calls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              setSelectedCall={setSelectedCall}
              deleteCall={deleteCall}
            />
          ))}
        </div>
      </section>

      <CallDetails
        selectedCall={selectedCall}
        setSelectedCall={setSelectedCall}
        deleteCall={deleteCall}
      />
    </div>
  );
}


export default Dashboard;