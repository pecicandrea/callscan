function UploadCall({
  setFile,
  loading,
  uploadCall,
  error,
}) {
  return (
    <section className="upload-section">
      <span className="section-label light-label">
        NEW ANALYSIS
      </span>

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

      {error && <p className="upload-error">{error}</p>}
    </section>
  );
}

export default UploadCall;