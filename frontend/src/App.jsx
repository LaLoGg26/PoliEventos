import { Routes, Route } from "react-router-dom";

// ==========================================
//                 PAGES
// ==========================================

import HomePage from "./pages/HomePage";
import EventDetailPage from "./pages/EventDetailPage";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import SellerDashboard from "./pages/SellerDashboard";
import EditEventPage from "./pages/EditEventPage";
import MyTicketsPage from "./pages/MyTicketPage";

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
          {/*  Rutas del Vendedor  */}
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/edit-event/:id" element={<EditEventPage />} />
          <Route path="/mis-tickets" element={<MyTicketsPage />} />
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
