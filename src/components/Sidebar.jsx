import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="sidebar-logo-icon">💪</span>
        <span className="sidebar-logo-text">FitTrack</span>
      </div>

      <nav>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/exercises"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="sidebar-icon">💪</span>
          <span className="sidebar-label">Exercises</span>
        </NavLink>

        <NavLink
          to="/workouts"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="sidebar-icon">🏋️</span>
          <span className="sidebar-label">Workouts</span>
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="sidebar-icon">📈</span>
          <span className="sidebar-label">Progress</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="sidebar-icon">👤</span>
          <span className="sidebar-label">Profile</span>
        </NavLink>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        <span className="sidebar-icon">🚪</span>
        <span className="sidebar-label">Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;