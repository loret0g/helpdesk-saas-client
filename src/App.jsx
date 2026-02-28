import { Routes, Route } from "react-router-dom";
import RequireAuth from "./auth/requireAuth";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import KbPage from "./pages/KbPage";
import KbArticlePage from "./pages/KbArticlePage";
import CreateTicketPage from "./pages/CreateTicketPage";
import CreateKbArticlePage from "./pages/CreateKbArticlePage";
import EditKbArticlePage from "./pages/EditKbArticlePage";

export default function App() {
  return (
    <div className="appShell">
      <Navbar />

      <main className="appMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/tickets"
            element={
              <RequireAuth>
                <TicketsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/tickets/new"
            element={
              <RequireAuth>
                <CreateTicketPage />
              </RequireAuth>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <RequireAuth>
                <TicketDetailPage />
              </RequireAuth>
            }
          />

          <Route
            path="/kb"
            element={
              <RequireAuth>
                <KbPage />
              </RequireAuth>
            }
          />

          <Route
            path="/kb/:slug"
            element={
              <RequireAuth>
                <KbArticlePage />
              </RequireAuth>
            }
          />

          <Route
            path="/kb/new"
            element={
              <RequireAuth>
                <CreateKbArticlePage />
              </RequireAuth>
            }
          />

          <Route
            path="/kb/:id/edit"
            element={
              <RequireAuth>
                <EditKbArticlePage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<p className="container" style={{ padding: 16 }}>404</p>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}