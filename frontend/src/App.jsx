import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import Portfolio from "./pages/Portfolio";
import Advisor from "./pages/Advisor";
import Alerts from "./pages/Alerts";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./styles/App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case "login": return <Login onNavigate={setCurrentPage} />;
      case "register": return <Register onNavigate={setCurrentPage} />;
      case "dashboard": return <Dashboard />;
      case "prediction": return <Prediction />;
      case "portfolio": return <Portfolio />;
      case "advisor": return <Advisor />;
      case "alerts": return <Alerts />;
      default: return <Dashboard />;
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          renderPage={renderPage}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, renderPage }) {
  // Check for auth pages - if on login/register, don't check token
  if (currentPage === "login" || currentPage === "register") {
    return (
      <div className="app-auth">
        {currentPage === "register"
          ? <Register onNavigate={setCurrentPage} />
          : <Login onNavigate={setCurrentPage} />}
      </div>
    );
  }

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="main-area">
        <Navbar
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setCurrentPage("login");
          }}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
        />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
