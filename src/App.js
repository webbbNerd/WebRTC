import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./components/Auth";
import HomePage from "./components/Home";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Wrapper component for protected routes
  function ProtectedRoute({ path, element }) {
    return isLoggedIn ? element : <Navigate to="/login" />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route
            path="/login"
            element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route
            path="/home"
            element={<ProtectedRoute element={<HomePage />} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
