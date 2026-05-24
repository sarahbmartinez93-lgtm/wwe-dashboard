import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Field from "./Field.jsx";
import { useFormErrors } from "./useFormErrors.js";

const blank = { name: "", brand_id: "", debut_date: "", status: "active" };

export default function WrestlerForm({ onCreated }) {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const { errors, setErrors, banner, setBanner, handleApiError, clear } = useFormErrors();

  useEffect(() => { api.brands().then(setBrands).catch(() => {}); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    clear();
    const clientErrs = {};
    if (!form.name.trim()) clientErrs.name = "Name is required.";
    if (Object.keys(clientErrs).length) { setErrors(clientErrs); return; }

    setSubmitting(true);
    try {
      const created = await api.createWrestler({
        name: form.name.trim(),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        debut_date: form.debut_date || null,
        status: form.status,
      });
      setBanner({ kind: "success", message: `Added wrestler "${created.name}".` });
      setForm(blank);
      onCreated?.(created);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {banner?.kind === "success" && <div className="banner success">{banner.message}</div>}
      {banner?.kind === "error" && <div className="error">{banner.message}</div>}

      <Field label="Name" required error={errors.name}>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sami Zayn" />
      </Field>

      <Field label="Brand" error={errors.brand_id}>
        <select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
          <option value="">No brand</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Field>

      <Field label="Debut date" error={errors.debut_date}>
        <input type="date" value={form.debut_date} onChange={(e) => set("debut_date", e.target.value)} />
      </Field>

      <Field label="Status" error={errors.status}>
        <select value={form.status} onChange={(e) => set("status", e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>

      <button className="btn" disabled={submitting}>{submitting ? "Saving…" : "Add wrestler"}</button>
    </form>
  );
}
