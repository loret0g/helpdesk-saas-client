import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand">
            Helpdesk
          </Link>

          <nav className="navbar__nav" aria-label="Main navigation">
            <NavLink
              to="/tickets"
              className={({ isActive }) =>
                `navlink ${isActive ? "navlink--active" : ""}`
              }
            >
              Tickets
            </NavLink>
            <NavLink
              to="/kb"
              className={({ isActive }) =>
                `navlink ${isActive ? "navlink--active" : ""}`
              }
            >
              Knowledge Base
            </NavLink>
          </nav>
        </div>

        <div className="navbar__right">
          {user ? (
            <>
              <div className="userchip" title={user.email}>
                <span className="userchip__name">{user.name}</span>
                <span className="badge badge--muted">{user.role}</span>
              </div>

              <button className="btn btn--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn--primary">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
