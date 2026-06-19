import { useState } from "react";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {

        localStorage.setItem(
          "username",
          name
        );

        localStorage.setItem(
          "email",
          email
        );

        alert("Account Created Successfully");

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

        <h1>Create Account</h1>

        <input
          className="input-box"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          className="input-box"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="input-box"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleSignup}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

      </div>
    </div>
  );
}

export default Signup;