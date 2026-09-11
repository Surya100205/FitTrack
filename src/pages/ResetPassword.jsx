import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setRecoveryReady(true);
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully! Redirecting to login...");

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

    setLoading(false);
  }

  if (checkingSession) {
    return (
      <div className="reset-page">
        <div className="reset-loading">
          Checking password reset session...
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-brand-panel">
        <div className="reset-brand-content">
          <div className="reset-brand-icon">💪</div>

          <h1>FitTrack</h1>

          <p>
            Your fitness journey starts with the right habits,
            consistent workouts, and measurable progress.
          </p>

          <div className="reset-brand-points">
            <div>✓ Track your workouts</div>
            <div>✓ Monitor your progress</div>
            <div>✓ Reach your fitness goals</div>
          </div>
        </div>
      </div>

      <div className="reset-form-panel">
        <div className="reset-card">
          <div className="reset-header">
            <div className="reset-lock-icon">🔐</div>

            <h2>Set New Password</h2>

            <p>
              Create a new password for your FitTrack account.
            </p>
          </div>

          {!recoveryReady ? (
            <div className="reset-session-error">
              <strong>Reset session not found</strong>

              <p>
                Please open the password reset link from your email
                again.
              </p>

              <Link to="/forgot-password">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="reset-field">
                <label htmlFor="password">New Password</label>

                <div className="reset-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="reset-field">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="reset-password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="password-requirement">
                Password must contain at least 6 characters.
              </div>

              {error && (
                <div className="reset-message reset-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="reset-message reset-success">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="reset-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="reset-spinner"></span>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          )}

          <div className="reset-footer">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;