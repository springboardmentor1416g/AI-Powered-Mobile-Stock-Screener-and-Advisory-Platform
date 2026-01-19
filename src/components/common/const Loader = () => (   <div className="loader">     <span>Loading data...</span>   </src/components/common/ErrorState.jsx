const ErrorState = ({ message, onRetry }) => (
  <div className="error-state">
    <p>{message}</p>
    {onRetry && <button onClick={onRetry}>Retry</button>}
  </div>
);

export default ErrorState;
