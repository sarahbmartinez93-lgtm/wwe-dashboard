import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Compare from "./pages/Compare.jsx";
import Matches from "./pages/Matches.jsx";
import Wrestlers from "./pages/Wrestlers.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-mark" aria-label="WWE Analytics"><span className="dot" aria-hidden="true" /> WWE ANALYTICS</div>
        <NavLink to="/" end className="nav-link">Dashboard</NavLink>
        <NavLink to="/wrestlers" className="nav-link">Wrestlers</NavLink>
        <NavLink to="/matches" className="nav-link">Matches</NavLink>
        <NavLink to="/compare" className="nav-link">Compare</NavLink>
        <NavLink to="/admin" className="nav-link">Admin</NavLink>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wrestlers" element={<Wrestlers />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
