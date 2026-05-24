import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Field from "./Field.jsx";
import { useFormErrors } from "./useFormErrors.js";

const MATCH_TYPES = [
  { value: "singles", label: "Singles" },
  { value: "tag", label: "Tag" },
  { value: "triple-threat", label: "Triple Threat" },
  { value: "fatal-four-way", label: "Fatal 4-Way" },
  { value: "royal-rumble", label: "Royal Rumble" },
];

const blank = {
  event_id: "",
  match_type: "singles",
  championship_id: "",
  winner_id: "",
  participant_ids: [],
  notes: "",
};

export default function MatchForm({ onCreated }) {
  const [events, setEvents] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [wrestlers, setWrestlers] = useState([]);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const { errors, setErrors, banner, setBanner, handleApiError, clear } = useFormErrors();

  useEffect(() => {
    api.events().then(setEvents).catch(() => {});
    api.championships().then(setChampionships).catch(() => {});
    api.wrestlers().then(setWrestlers).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function toggleParticipant(id) {
    setForm((f) => {
      const has = f.participant_ids.includes(id);
      const next = has ? f.participant_ids.filter((p) => p !== id) : [...f.participant_ids, id];
      const winnerKept = has && f.winner_id === String(id) ? "" : f.winner_id;
      return { ...f, participant_ids: next, winner_id: winnerKept };
    });
  }

  async function submit(e) {
    e.preventDefault();
    clear();
    const errs = {};
    if (!form.event_id) errs.event_id = "Pick an event.";
    if (!form.match_type) errs.match_type = "Pick a match type.";
    if (form.participant_ids.length < 2) errs.participant_ids = "Select at least 2 participants.";
    if (form.winner_id && !form.participant_ids.includes(Number(form.winner_id))) {
      errs.winner_id = "Winner must be one of the participants.";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const created = await api.createMatch({
        event_id: Number(form.event_id),
        match_type: form.match_type,
        championship_id: form.championship_id ? Number(form.championship_id) : null,
        winner_id: form.winner_id ? Number(form.winner_id) : null,
        participant_ids: form.participant_ids,
        notes: form.notes.trim() || null,
      });
      setBanner({ kind: "success", message: `Recorded match at ${created.event.name}.` });
      setForm(blank);
      onCreated?.(created);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedParticipants = wrestlers.filter((w) => form.participant_ids.includes(w.id));

  return (
    <form className="form" onSubmit={submit} noValidate>
      {banner?.kind === "success" && <div className="banner success">{banner.message}</div>}
      {banner?.kind === "error" && <div className="error">{banner.message}</div>}

      <Field label="Event" required error={errors.event_id}>
        <select value={form.event_id} onChange={(e) => set("event_id", e.target.value)}>
          <option value="">Pick…</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>)}
        </select>
      </Field>

      <Field label="Match type" required error={errors.match_type}>
        <select value={form.match_type} onChange={(e) => set("match_type", e.target.value)}>
          {MATCH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>

      <Field label="Championship (optional)" error={errors.championship_id}>
        <select value={form.championship_id} onChange={(e) => set("championship_id", e.target.value)}>
          <option value="">Non-title</option>
          {championships.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Participants" required error={errors.participant_ids}>
        <div className="checkbox-grid">
          {wrestlers.map((w) => (
            <label key={w.id}>
              <input
                type="checkbox"
                checked={form.participant_ids.includes(w.id)}
                onChange={() => toggleParticipant(w.id)}
              />
              {w.name}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Winner (optional)" error={errors.winner_id}>
        <select value={form.winner_id} onChange={(e) => set("winner_id", e.target.value)}>
          <option value="">No decision / draw</option>
          {selectedParticipants.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </Field>

      <Field label="Notes" error={errors.notes}>
        <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      <button className="btn" disabled={submitting}>{submitting ? "Saving…" : "Record match"}</button>
    </form>
  );
}
