import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResetRequest(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo:
          "https://fit-track-aash-if0enizvm-surya100205s-projects.vercel.app/reset-password",
      }
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password reset link sent! Please check your email and follow the instructions."
    );

    setLoading(false);
  }

  return (
    <div className="forgot-page">

      {/* Brand Section */}
      <div className="forgot-brand">
        <div className="forgot-brand-content">

          <div className="forgot-brand-logo">
            <span>💪</span>
          </div>

          <h1>FitTrack</h1>

          <h2>
            Get back on track.
            <br />
            Keep moving forward.
          </h2>

          <p>
            Don't worry if you forgot your password. We'll help you get back
            into your FitTrack account securely.
          </p>

          <div className="forgot-features">
            <div>
              <span>✓</span>
              Secure password recovery
            </div>

            <div>
              <span>✓</span>
              Quick email verification
            </div>

            <div>
              <span>✓</span>
              Continue your fitness journey
            </div>
          </div>

        </div>
      </div>

      {/* Form Section */}
      <div className="forgot-form-side">

        <div className="forgot-card">

          <div className="forgot-mobile-logo">
            <span>💪</span>
            <strong>FitTrack</strong>
          </div>

          <div className="forgot-header">

            <div className="forgot-icon">
              🔐
            </div>

            <p className="forgot-eyebrow">
              PASSWORD RECOVERY
            </p>

            <h2>Forgot your password?</h2>

            <p>
              Enter the email address associated with your FitTrack account
              and we'll send you a password reset link.
            </p>

          </div>

          <form onSubmit={handleResetRequest}>

            <div className="forgot-field">

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <div className="forgot-input-wrapper">

                <span className="forgot-input-icon">
                  ✉️
                </span>

                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>

            {error && (
              <div className="forgot-message error">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="forgot-message success">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              className="forgot-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="forgot-spinner"></span>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

          </form>

          <div className="forgot-divider">
            <span>Remember your password?</span>
          </div>

          <Link to="/login" className="back-login-link">
            ← Back to Login
          </Link>

          <p className="forgot-footer">
            Your account security is important to us.
          </p>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;