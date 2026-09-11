import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    /*
     * Email confirmation is enabled in Supabase.
     * Send the user to the OTP verification page.
     */
    sessionStorage.setItem(
      "fittrack_verification_email",
      cleanEmail
    );

    navigate("/verify-email", {
      state: {
        email: cleanEmail,
      },
    });

    setLoading(false);
  }

  return (
    <div className="auth-page">
      {/* Left side */}
      <div className="auth-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <span>💪</span>
          </div>

          <h1>FitTrack</h1>

          <h2>
            Build better habits.
            <br />
            Become a stronger you.
          </h2>

          <p>
            Track your workouts, monitor your progress and stay consistent
            with your fitness journey.
          </p>

          <div className="brand-features">
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

      {/* Right side */}
      <div className="auth-form-side">
        <div className="register-card">
          <div className="mobile-logo">
            <span>💪</span>
            <strong>FitTrack</strong>
          </div>

          <div className="register-header">
            <p className="auth-eyebrow">GET STARTED</p>

            <h2>Create your account</h2>

            <p>
              Start your fitness journey with FitTrack.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉️</span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  minLength="6"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <span className="password-hint">
                Password must contain at least 6 characters.
              </span>
            </div>

            {error && (
              <div className="auth-message error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {message && (
              <div className="auth-message success">
                <span>✓</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="login-link">
            Sign in to FitTrack
          </Link>

          <p className="auth-footer">
            By creating an account, you can start tracking your
            fitness journey with FitTrack.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;