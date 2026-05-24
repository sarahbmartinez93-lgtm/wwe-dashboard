import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Field from "./Field.jsx";
import { useFormErrors } from "./useFormErrors.js";

const blank = { name: "", date: "", venue: "", brand_id: "" };

export default function EventForm({ onCreated }) {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const { errors, setErrors, banner, setBanner, handleApiError, clear } = useFormErrors();

  useEffect(() => { api.brands().then(setBrands).catch(() => {}); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    clear();
    const errs = {};
    if (!form.name.trim()) errs.name = "Event name is required.";
    if (!form.date) errs.date = "Date is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const created = await api.createEvent({
        name: form.name.trim(),
        date: form.date,
        venue: form.venue.trim() || null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
      });
      setBanner({ kind: "success", message: `Added event "${created.name}".` });
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

      <Field label="Event name" required error={errors.name}>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. WrestleMania 41" />
      </Field>
      <Field label="Date" required error={errors.date}>
        <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
      </Field>
      <Field label="Venue" error={errors.venue}>
        <input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Allegiant Stadium" />
      </Field>
      <Field label="Brand" error={errors.brand_id}>
        <select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
          <option value="">Cross-brand</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Field>

      <button className="btn" disabled={submitting}>{submitting ? "Saving…" : "Add event"}</button>
    </form>
  );
}
