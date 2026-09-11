import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./VerifyEmail.css";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!emailFromState) {
      const savedEmail = sessionStorage.getItem("fittrack_verification_email");

      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [emailFromState]);

  async function handleVerify(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanOtp,
      type: "email",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("fittrack_verification_email");

    setMessage("Email verified successfully! Redirecting to your dashboard...");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);

    setLoading(false);
  }

  async function handleResend() {
    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address first.");
      return;
    }

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("A new verification code has been sent to your email.");
    }

    setResending(false);
  }

  return (
    <div className="verify-page">
      <div className="verify-brand-panel">
        <div className="verify-brand-content">
          <div className="verify-brand-icon">💪</div>

          <h1>FitTrack</h1>

          <p>
            You're one step away from starting your fitness journey.
            Verify your email to activate your account.
          </p>

          <div className="verify-brand-points">
            <div>✓ Track your workouts</div>
            <div>✓ Monitor your progress</div>
            <div>✓ Reach your fitness goals</div>
          </div>
        </div>
      </div>

      <div className="verify-form-panel">
        <div className="verify-card">
          <div className="verify-header">
            <div className="verify-icon">✉️</div>

            <h2>Verify Your Email</h2>

            <p>
              We've sent a 6-digit verification code to your email
              address.
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="verify-field">
              <label htmlFor="verify-email">Email Address</label>

              <input
                id="verify-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="verify-field">
              <label htmlFor="otp">Verification Code</label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                }}
                disabled={loading}
                className="otp-input"
              />

              <span className="verify-hint">
                Enter the 6-digit code from your email.
              </span>
            </div>

            {error && (
              <div className="verify-message verify-error">
                {error}
              </div>
            )}

            {message && (
              <div className="verify-message verify-success">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="verify-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="verify-spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="resend-section">
            <span>Didn't receive the code?</span>

            <button
              type="button"
              className="resend-button"
              onClick={handleResend}
              disabled={resending || loading}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <div className="verify-footer">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;