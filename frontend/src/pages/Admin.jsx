import { useState } from "react";
import WrestlerForm from "../components/admin/WrestlerForm.jsx";
import EventForm from "../components/admin/EventForm.jsx";
import MatchForm from "../components/admin/MatchForm.jsx";
import TitleChangeForm from "../components/admin/TitleChangeForm.jsx";

const TABS = [
  { id: "wrestler", label: "Wrestler" },
  { id: "event", label: "Event" },
  { id: "match", label: "Match" },
  { id: "title", label: "Title change" },
];

export default function Admin() {
  const [active, setActive] = useState("wrestler");

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin</h1>
          <div className="subtitle">Add wrestlers, events, matches, and title changes.</div>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`tab${active === t.id ? " active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {active === "wrestler" && <WrestlerForm />}
        {active === "event" && <EventForm />}
        {active === "match" && <MatchForm />}
        {active === "title" && <TitleChangeForm />}
      </div>
    </>
  );
}
