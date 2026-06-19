import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {

        localStorage.setItem(
          "username",
          result.name
        );

        localStorage.setItem(
          "email",
          result.email
        );

        alert("Login Successful");

        window.location.href = "/dashboard";

      } else {
        alert(result.message);
      }

    } catch (error) {
      console.log(error);
      alert("Backend Not Running");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <div className="card">

        <h1>Welcome Back</h1>

        <input
          className="input-box"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="input-box"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleLogin}
        >
          {loading ? "Logging In..." : "Login"}
        </button>

      </div>

    </div>
  );
}

export default Login;