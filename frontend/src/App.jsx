import { Routes, Route } from "react-router-dom";

// ==========================================
//                 PAGES
// ==========================================

import HomePage from "./pages/HomePage";
import EventDetailPage from "./pages/EventDetailPage";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";

// ==========================================
//                 COMPONENTS
// ==========================================

import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "3rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/evento/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route
            path="*"
            element={
              <h1 style={{ textAlign: "center" }}>
                404 | Página no encontrada
              </h1>
            }
          />
        </Routes>
      </div>
    </>
  );
}
export default App;
