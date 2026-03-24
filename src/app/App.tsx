import { Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLogin } from "./components/AdminLogin";
import { AdminPanel } from "./components/AdminPanel";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Portfolio } from "./components/Portfolio";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

