import { NavLink, Route, Routes } from "react-router-dom";

import NotificationBell from "./components/NotificationBell";
import ProtectedRoute from "./components/ProtectedRoute";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import Register from "./pages/Register";
import { useAuth } from "./lib/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export default function App() {
  const { user, logout } = useAuth();

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
          <nav className="flex gap-1 items-center">
            <NavLink to="/" className={navLinkClass} end>
              Ana Sayfa
            </NavLink>
            {user?.role === "student" && (
              <NavLink to="/projects" className={navLinkClass}>
                Projelerim
              </NavLink>
            )}
            {user?.role === "advisor" && (
              <NavLink to="/advisor" className={navLinkClass}>
                Danışman
              </NavLink>
            )}
            {user ? (
              <>
                <NotificationBell />
                <span className="text-xs text-slate-500 ml-2">{user.full_name}</span>
                <button
                  onClick={logout}
                  className="ml-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Giriş
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Kayıt
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute roles={["student"]}>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advisor"
            element={
              <ProtectedRoute roles={["advisor"]}>
                <AdvisorDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500">
          AcademicGuide · TÜBİTAK 2209 destek aracı · v0.2.0
        </div>
      </footer>
    </div>
  );
}
