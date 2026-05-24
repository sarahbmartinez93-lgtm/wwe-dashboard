import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Field from "./Field.jsx";
import { useFormErrors } from "./useFormErrors.js";

const blank = { championship_id: "", new_holder_id: "", won_at: "" };

export default function TitleChangeForm({ onCreated }) {
  const [championships, setChampionships] = useState([]);
  const [wrestlers, setWrestlers] = useState([]);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const { errors, setErrors, banner, setBanner, handleApiError, clear } = useFormErrors();

  function reload() {
    api.championships().then(setChampionships).catch(() => {});
    api.wrestlers().then(setWrestlers).catch(() => {});
  }
  useEffect(reload, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const selectedChamp = championships.find((c) => String(c.id) === form.championship_id);

  async function submit(e) {
    e.preventDefault();
    clear();
    const errs = {};
    if (!form.championship_id) errs.championship_id = "Pick a championship.";
    if (!form.new_holder_id) errs.new_holder_id = "Pick the new champion.";
    if (!form.won_at) errs.won_at = "Pick the date won.";
    if (selectedChamp && !selectedChamp.is_vacant
        && selectedChamp.current_holder?.id === Number(form.new_holder_id)) {
      errs.new_holder_id = `${selectedChamp.current_holder.name} already holds this title.`;
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.createTitleChange({
        championship_id: Number(form.championship_id),
        new_holder_id: Number(form.new_holder_id),
        won_at: form.won_at,
      });
      setBanner({ kind: "success", message: "Title change recorded." });
      setForm(blank);
      reload();
      onCreated?.();
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

      <Field label="Championship" required error={errors.championship_id}>
        <select value={form.championship_id} onChange={(e) => set("championship_id", e.target.value)}>
          <option value="">Pick…</option>
          {championships.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.is_vacant ? "VACANT" : `held by ${c.current_holder.name}`}
            </option>
          ))}
        </select>
      </Field>

      <Field label="New champion" required error={errors.new_holder_id}>
        <select value={form.new_holder_id} onChange={(e) => set("new_holder_id", e.target.value)}>
          <option value="">Pick…</option>
          {wrestlers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </Field>

      <Field label="Won at" required error={errors.won_at}>
        <input type="date" value={form.won_at} onChange={(e) => set("won_at", e.target.value)} />
      </Field>

      <button className="btn" disabled={submitting}>{submitting ? "Saving…" : "Record title change"}</button>
    </form>
  );
}
