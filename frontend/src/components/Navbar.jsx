import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const username = localStorage.getItem("username");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") !== "light"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("username");
    localStorage.removeItem("email");

    window.location.href = "/";
  };

  return (
    <nav>
      <h1
        className="logo"
        style={{
          cursor: "pointer"
        }}
      >
        🤖 AI Interview Coach
      </h1>

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/history">History</Link>
        </li>
      </ul>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Theme Toggle */}
        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            background: darkMode
              ? "#1f2937"
              : "#ffffff",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {username ? (
          <>
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#60a5fa,#a855f7)",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>

            <span
              style={{
                color: "#60a5fa",
                fontWeight: "600",
                fontSize: "18px",
              }}
            >
              {username}
            </span>

            <button
              className="login-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="login-btn">
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button className="login-btn">
                Signup
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;