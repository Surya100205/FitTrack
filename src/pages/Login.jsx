import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      {/* Left Brand Section */}
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span>💪</span>
          </div>

          <h1>FitTrack</h1>

          <h2>
            Welcome back.
            <br />
            Keep getting stronger.
          </h2>

          <p>
            Continue tracking your workouts, monitor your progress and stay
            consistent with your fitness goals.
          </p>

          <div className="login-features">
            <div>
              <span>✓</span>
              Track your workouts
            </div>

            <div>
              <span>✓</span>
              Explore exercises
            </div>

            <div>
              <span>✓</span>
              Monitor your progress
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="login-form-side">
        <div className="login-card">

          <div className="login-mobile-logo">
            <span>💪</span>
            <strong>FitTrack</strong>
          </div>

          <div className="login-header">
            <p className="login-eyebrow">WELCOME BACK</p>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details to continue your fitness journey.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email Address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">✉️</span>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">Password</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="forgot-password-row">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="login-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register */}
          <div className="login-divider">
            <span>Don't have an account?</span>
          </div>

          <Link to="/register" className="register-link">
            Create a FitTrack account
          </Link>

          <p className="login-footer">
            Track your fitness. Build better habits. Become stronger.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;