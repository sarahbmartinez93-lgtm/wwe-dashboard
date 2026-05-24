import { useState } from "react";

export function useFormErrors() {
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  function handleApiError(err) {
    if (err.details && Array.isArray(err.details)) {
      const map = {};
      for (const d of err.details) map[d.field] = d.issue;
      setErrors(map);
      setBanner(null);
    } else {
      setErrors({});
      setBanner({ kind: "error", message: err.message });
    }
  }

  function clear() {
    setErrors({});
    setBanner(null);
  }

  return { errors, setErrors, banner, setBanner, handleApiError, clear };
}
