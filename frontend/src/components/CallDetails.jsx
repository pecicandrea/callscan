function CallDetails({
  selectedCall,
  setSelectedCall,
  deleteCall,
}) {
  if (!selectedCall) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="details-card">
        <button
          className="close-button"
          onClick={() => setSelectedCall(null)}
        >
          ×
        </button>

        <div className="details-header">
          <span className="section-label">CALL ANALYSIS</span>
          <h2>{selectedCall.filename}</h2>
        </div>

        <div className="analysis-info">
          <div className="analysis-tags">
            <div className="analysis-tag">
              <small>Category</small>
              <span>{selectedCall.category}</span>
            </div>

            <div className="analysis-tag">
              <small>Sentiment</small>
              <span>{selectedCall.sentiment}</span>
            </div>
          </div>

          <span
            className={`priority ${selectedCall.priority?.toLowerCase()}`}
          >
            {selectedCall.priority}
          </span>
        </div>

        <div className="detail-section summary-section">
          <h3>Summary</h3>
          <p>{selectedCall.summary}</p>
        </div>

        <div className="detail-section">
          <h3>Transcript</h3>

          <div className="transcript">
            {selectedCall.transcript}
          </div>
        </div>

        <div className="detail-section">
          <h3>Recommended actions</h3>

          <div className="actions">
            {selectedCall.action_items?.map((item, index) => (
              <div className="action-item" key={index}>
                <span className="action-number">
                  {index + 1}
                </span>

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="details-footer">
          <button
            className="delete-button"
            onClick={(event) =>
              deleteCall(event, selectedCall.id)
            }
          >
            Delete analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallDetails;