import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/home.css";

export default function HomePage() {
  const { user } = useAuth();
  const isAuthed = !!user;

  return (
    <div className="page homePage">
      <div className="container home__layout">
        {/* Hero */}
        <section className="homeHero">
          <div className="homeHero__bg" aria-hidden />

          <div className="homeHero__content">
            <div className="homeHero__badge">
              <span className="badge badge--muted">MVP</span>
              <span className="homeHero__badgeText">
                Simple, clean support workflow
              </span>
            </div>

            <h1 className="homeHero__title">
              Helpdesk that feels <span className="homeHero__accent">modern</span>.
            </h1>

            <p className="homeHero__subtitle">
              Manage tickets, reply faster, and keep your knowledge base tidy — all in one place.
            </p>

            {!isAuthed ? (
              <div className="homeHero__actions">
                <Link className="btn btn--primary" to="/login">
                  Sign in
                </Link>
                <div className="homeHero__hint">
                  Use your demo credentials to access the app.
                </div>
              </div>
            ) : (
              <div className="homeHero__actions">
                <Link className="btn btn--primary" to="/tickets">
                  Go to Tickets
                </Link>
                <Link className="btn btn--ghost" to="/kb">
                  Open Knowledge Base
                </Link>

                <div className="homeHero__user">
                  <div className="userchip" title={user.email}>
                    <span className="userchip__name">{user.name}</span>
                    <span className="badge badge--muted">{user.role}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side preview */}
          <aside className="homePreview card card--pad">
            <div className="homePreview__top">
              <div className="homePreview__dot" />
              <div className="homePreview__dot" />
              <div className="homePreview__dot" />
              <div className="homePreview__title">Quick view</div>
            </div>

            <div className="homePreview__body">
              <div className="homeMetric">
                <div className="homeMetric__label">Tickets</div>
                <div className="homeMetric__value">Inbox-ready</div>
              </div>

              <div className="homeMetric">
                <div className="homeMetric__label">Knowledge Base</div>
                <div className="homeMetric__value">Searchable articles</div>
              </div>

              <div className="homeMetric">
                <div className="homeMetric__label">Workflow</div>
                <div className="homeMetric__value">Assign • Status • Reply</div>
              </div>

              <div className="homePreview__note">
                Built with your design system (tokens + components).
              </div>
            </div>
          </aside>
        </section>

        {/* Features */}
        <section className="homeGrid">
          <div className="card card--pad homeCard">
            <div className="homeCard__icon">🎫</div>
            <div className="homeCard__title">Tickets</div>
            <div className="homeCard__text">
              Filter by status & priority, keep an organized inbox, and reply clearly.
            </div>
          </div>

          <div className="card card--pad homeCard">
            <div className="homeCard__icon">📚</div>
            <div className="homeCard__title">Knowledge Base</div>
            <div className="homeCard__text">
              Create articles, publish updates, and make answers reusable.
            </div>
          </div>

          <div className="card card--pad homeCard">
            <div className="homeCard__icon">⚡</div>
            <div className="homeCard__title">Fast MVP</div>
            <div className="homeCard__text">
              Clean UI, clear roles, and everything focused on shipping.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}