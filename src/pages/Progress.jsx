import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../services/supabase";
import "./Progress.css";

function Progress() {
  const [progressRecords, setProgressRecords] = useState([]);

  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [recordedDate, setRecordedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  // Fetch progress records
  const fetchProgress = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_date", { ascending: true });

      if (error) {
        throw error;
      }

      setProgressRecords(data || []);
    } catch (err) {
      console.error("Fetch progress error:", err);
      setError(err.message || "Failed to load progress.");
    } finally {
      setLoading(false);
    }
  };

  // Save progress record
  const saveProgress = async () => {
    setMessage("");
    setError("");

    if (!weight) {
      setError("Please enter your weight.");
      return;
    }

    if (!recordedDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const { error } = await supabase
        .from("progress")
        .insert({
          user_id: user.id,
          recorded_date: recordedDate,
          weight: Number(weight),
          body_fat: bodyFat ? Number(bodyFat) : null,
          notes: notes.trim() || null,
        });

      if (error) {
        throw error;
      }

      setMessage("Progress recorded successfully! 📈");

      setWeight("");
      setBodyFat("");
      setNotes("");

      await fetchProgress();
    } catch (err) {
      console.error("Save progress error:", err);
      setError(err.message || "Failed to save progress.");
    } finally {
      setSaving(false);
    }
  };

  // Latest record
  const latestRecord =
    progressRecords.length > 0
      ? progressRecords[progressRecords.length - 1]
      : null;

  // First record
  const firstRecord =
    progressRecords.length > 0
      ? progressRecords[0]
      : null;

  // Weight change
  const weightChange = useMemo(() => {
    if (!firstRecord || !latestRecord) {
      return null;
    }

    return (
      Number(latestRecord.weight) -
      Number(firstRecord.weight)
    ).toFixed(1);
  }, [firstRecord, latestRecord]);

  // Chart data
  const chartData = progressRecords.map((record) => ({
    date: new Date(
      `${record.recorded_date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    weight: Number(record.weight),
  }));

  return (
    <div className="progress-page">

      {/* Header */}
      <div className="progress-header">
        <div>
          <h1>Progress</h1>
          <p>Track your fitness journey over time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="progress-stats">

        <div className="progress-stat-card">
          <span className="progress-stat-icon">
            ⚖️
          </span>

          <div>
            <span className="progress-stat-label">
              Current Weight
            </span>

            <strong>
              {latestRecord
                ? `${latestRecord.weight} kg`
                : "--"}
            </strong>
          </div>
        </div>

        <div className="progress-stat-card">
          <span className="progress-stat-icon">
            📉
          </span>

          <div>
            <span className="progress-stat-label">
              Weight Change
            </span>

            <strong>
              {weightChange !== null
                ? `${weightChange > 0 ? "+" : ""}${weightChange} kg`
                : "--"}
            </strong>
          </div>
        </div>

        <div className="progress-stat-card">
          <span className="progress-stat-icon">
            📊
          </span>

          <div>
            <span className="progress-stat-label">
              Records
            </span>

            <strong>
              {progressRecords.length}
            </strong>
          </div>
        </div>

      </div>

      {/* Add Progress */}
      <section className="progress-section">

        <h2>Record Progress</h2>

        <div className="progress-form">

          <div className="progress-form-row">

            <div className="progress-form-group">
              <label>Weight (kg)</label>

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="90"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
              />
            </div>

            <div className="progress-form-group">
              <label>Body Fat (%)</label>

              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="20"
                value={bodyFat}
                onChange={(e) =>
                  setBodyFat(e.target.value)
                }
              />
            </div>

            <div className="progress-form-group">
              <label>Date</label>

              <input
                type="date"
                value={recordedDate}
                onChange={(e) =>
                  setRecordedDate(e.target.value)
                }
              />
            </div>

          </div>

          <div className="progress-form-group">
            <label>Notes</label>

            <textarea
              placeholder="Example: Feeling stronger this week..."
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows="3"
            />
          </div>

          {error && (
            <p className="progress-error">
              {error}
            </p>
          )}

          {message && (
            <p className="progress-success">
              {message}
            </p>
          )}

          <button
            className="save-progress-button"
            onClick={saveProgress}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Record Progress 📈"}
          </button>

        </div>
      </section>

      {/* Weight Chart */}
      <section className="progress-section">

        <div className="section-heading">
          <div>
            <h2>Weight Progress</h2>
            <p>
              Your weight changes over time
            </p>
          </div>
        </div>

        {loading ? (
          <div className="progress-loading">
            Loading progress...
          </div>
        ) : chartData.length < 2 ? (
          <div className="progress-empty">
            <div className="empty-icon">📈</div>

            <h3>
              Not enough data yet
            </h3>

            <p>
              Record your weight at least twice
              to see your progress chart.
            </p>
          </div>
        ) : (
          <div className="progress-chart">

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "#818998",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{
                    fill: "#818998",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#151922",
                    border: "1px solid #303746",
                    borderRadius: "8px",
                    color: "#f5f7fa",
                  }}
                  formatter={(value) => [
                    `${value} kg`,
                    "Weight",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#6674ff"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        )}

      </section>

      {/* History */}
      <section className="progress-section">

        <h2>Progress History</h2>

        {loading ? (
          <p className="progress-loading">
            Loading records...
          </p>
        ) : progressRecords.length === 0 ? (

          <div className="progress-empty">
            <div className="empty-icon">⚖️</div>

            <h3>
              No progress records yet
            </h3>

            <p>
              Record your first measurement
              above.
            </p>
          </div>

        ) : (

          <div className="progress-history">

            {progressRecords
              .slice()
              .reverse()
              .map((record) => (

                <div
                  className="progress-history-card"
                  key={record.id}
                >

                  <div className="history-date">
                    <strong>
                      {new Date(
                        `${record.recorded_date}T00:00:00`
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}
                    </strong>

                    <span>
                      {new Date(
                        `${record.recorded_date}T00:00:00`
                      ).getFullYear()}
                    </span>
                  </div>

                  <div className="history-value">
                    <strong>
                      {record.weight} kg
                    </strong>

                    <span>
                      Weight
                    </span>
                  </div>

                  <div className="history-value">
                    <strong>
                      {record.body_fat !== null &&
                      record.body_fat !== undefined
                        ? `${record.body_fat}%`
                        : "--"}
                    </strong>

                    <span>
                      Body Fat
                    </span>
                  </div>

                  <div className="history-notes">
                    {record.notes || "No notes"}
                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Progress;