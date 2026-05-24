export default function Field({ label, required, error, children }) {
  return (
    <div className={`form-row${error ? " has-err" : ""}`}>
      <label>{label}{required && <span className="req">*</span>}</label>
      {children}
      {error && <span className="field-err">{error}</span>}
    </div>
  );
}
