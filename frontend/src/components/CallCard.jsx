function CallCard({
  call,
  setSelectedCall,
  deleteCall,
}) {
  return (
    <div
      className="call-card"
      onClick={() => setSelectedCall(call)}
    >
      <div className="call-header">
        <div>
          <h3>{call.filename}</h3>

          <div className="metadata">
            {call.category || "Uncategorized"}

            {call.sentiment && (
              <span> · {call.sentiment}</span>
            )}
          </div>
        </div>

        <span
          className={`priority ${call.priority?.toLowerCase()}`}
        >
          {call.priority}
        </span>
      </div>

      <p>{call.summary}</p>

      <div className="card-footer">
        <span className="view-details">
          View analysis →
        </span>

        <button
          className="delete-button"
          onClick={(event) => deleteCall(event, call.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default CallCard;