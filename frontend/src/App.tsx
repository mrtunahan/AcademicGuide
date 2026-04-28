import { NavLink, Route, Routes } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import Home from "./pages/Home";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-brand-600 text-white grid place-items-center font-bold">
              A
            </span>
            <span className="font-semibold text-slate-800">AcademicGuide</span>
            <span className="text-xs text-slate-500 ml-2">2209 Mentor Portalı</span>
          </div>
          <nav className="flex gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Ana Sayfa
            </NavLink>
            <NavLink to="/student" className={navLinkClass}>
              Öğrenci
            </NavLink>
            <NavLink to="/advisor" className={navLinkClass}>
              Danışman
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/advisor" element={<AdvisorDashboard />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500">
          AcademicGuide · TÜBİTAK 2209 destek aracı · v0.1.0
        </div>
      </footer>
    </div>
  );
}
