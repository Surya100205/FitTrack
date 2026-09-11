import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load workouts
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("workout_date", { ascending: false });

      if (workoutData) {
        setWorkouts(workoutData);
      }

      // Load progress
      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_date", { ascending: false });

      if (progressData) {
        setProgress(progressData);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);


  function goTo(path) {
    navigate(path);
  }

  function formatDate(date) {
    if (!date) return "--";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatWeightChange(value) {
    const number = Number(value);

    if (number > 0) {
      return `+${number.toFixed(1)} kg`;
    }

    return `${number.toFixed(1)} kg`;
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading FitTrack...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="dashboard-loading">
        <h2>Unable to load your profile.</h2>
        <button onClick={() => goTo("/profile")}>
          Go to Profile
        </button>
      </div>
    );
  }

  const heightInMeters = Number(profile.height) / 100;
  const currentProfileWeight = Number(profile.weight);

  const bmi =
    heightInMeters > 0 && currentProfileWeight > 0
      ? (
        currentProfileWeight /
        (heightInMeters * heightInMeters)
      ).toFixed(1)
      : null;

  const totalWorkouts = workouts.length;

  const workoutTime = workouts.reduce(
    (total, workout) =>
      total + Number(workout.duration || 0),
    0
  );

  const caloriesBurned = workouts.reduce(
    (total, workout) =>
      total + Number(workout.calories_burned || 0),
    0
  );

  const currentWeight =
    progress.length > 0
      ? Number(progress[0].weight)
      : currentProfileWeight;

  const oldestWeight =
    progress.length > 1
      ? Number(progress[progress.length - 1].weight)
      : currentWeight;

  const weightChange =
    progress.length > 0
      ? currentWeight - oldestWeight
      : 0;

  return (
    <div className="dashboard-layout">



      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div className="dashboard-heading">

            <p className="welcome-label">
              FITNESS DASHBOARD
            </p>

            <h1>
              Good to see you, {profile.full_name}! 👋
            </h1>

            <p className="subtitle">
              Let's keep working toward your fitness goals.
            </p>

          </div>

          <div className="user-avatar">
            {profile.full_name
              .charAt(0)
              .toUpperCase()}
          </div>

        </header>


        {/* ================= MAIN STATS ================= */}

        <section className="stats-grid main-stats">

          <div className="stat-card">

            <div className="stat-icon">
              ⚖️
            </div>

            <div className="stat-content">
              <p>Current Weight</p>

              <h2>
                {profile.weight
                  ? `${profile.weight} kg`
                  : "--"}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📊
            </div>

            <div className="stat-content">
              <p>BMI</p>

              <h2>
                {bmi || "--"}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🎯
            </div>

            <div className="stat-content">
              <p>Fitness Goal</p>

              <h2 className="goal-text">
                {profile.fitness_goal || "--"}
              </h2>
            </div>

          </div>

        </section>


        {/* ================= WORKOUT STATISTICS ================= */}

        <section className="stats-grid workout-stats">

          <div className="stat-card dark-stat">

            <div className="stat-icon">
              🏆
            </div>

            <div className="stat-content">
              <p>Total Workouts</p>
              <h2>{totalWorkouts}</h2>
            </div>

          </div>


          <div className="stat-card dark-stat">

            <div className="stat-icon">
              ⏱️
            </div>

            <div className="stat-content">
              <p>Workout Time</p>
              <h2>{workoutTime} min</h2>
            </div>

          </div>


          <div className="stat-card dark-stat">

            <div className="stat-icon">
              🔥
            </div>

            <div className="stat-content">
              <p>Calories Burned</p>
              <h2>{caloriesBurned} kcal</h2>
            </div>

          </div>


          <div className="stat-card dark-stat">

            <div className="stat-icon">
              📉
            </div>

            <div className="stat-content">
              <p>Weight Change</p>

              <h2>
                {formatWeightChange(weightChange)}
              </h2>
            </div>

          </div>

        </section>


        {/* ================= PROFILE + QUICK ACTIONS ================= */}

        <section className="content-grid">

          <div className="profile-card">

            <div className="card-header">

              <div>
                <p className="card-label">
                  YOUR PROFILE
                </p>

                <h2>
                  Fitness Information
                </h2>
              </div>

              <button
                className="edit-button"
                onClick={() => goTo("/profile")}
              >
                Edit
              </button>

            </div>


            <div className="profile-grid">

              <div className="profile-item">
                <span>Full Name</span>
                <strong>{profile.full_name}</strong>
              </div>

              <div className="profile-item">
                <span>Age</span>
                <strong>
                  {profile.age || "--"} years
                </strong>
              </div>

              <div className="profile-item">
                <span>Gender</span>
                <strong>
                  {profile.gender || "--"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Height</span>
                <strong>
                  {profile.height
                    ? `${profile.height} cm`
                    : "--"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Weight</span>
                <strong>
                  {profile.weight
                    ? `${profile.weight} kg`
                    : "--"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Goal</span>
                <strong>
                  {profile.fitness_goal || "--"}
                </strong>
              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="quick-card">

            <p className="card-label">
              QUICK ACTIONS
            </p>

            <h2>
              Start your journey
            </h2>

            <button
              onClick={() => goTo("/workouts")}
            >
              🏆 Start a Workout
            </button>

            <button
              onClick={() => goTo("/exercises")}
            >
              💪 Explore Exercises
            </button>

            <button
              onClick={() => goTo("/progress")}
            >
              📈 Track Progress
            </button>

          </div>

        </section>


        {/* ================= RECENT WORKOUTS ================= */}

        <section className="activity-section">

          <div className="activity-header">

            <div>
              <p className="card-label">
                ACTIVITY
              </p>

              <h2>
                Recent Workouts
              </h2>
            </div>

            {workouts.length > 0 && (
              <button
                className="view-all-button"
                onClick={() => goTo("/workouts")}
              >
                View All →
              </button>
            )}

          </div>


          {workouts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🏋️
              </div>

              <h3>
                No workouts yet
              </h3>

              <p>
                Start your first workout to
                see it here.
              </p>

              <button
                onClick={() => goTo("/workouts")}
              >
                Start Workout
              </button>

            </div>

          ) : (

            <div className="recent-workouts-list">

              {workouts
                .slice(0, 5)
                .map((workout) => (

                  <div
                    className="recent-workout-item"
                    key={workout.id}
                  >

                    <div className="workout-icon">
                      🏆
                    </div>


                    <div className="workout-info">

                      <h3>
                        {workout.workout_name}
                      </h3>

                      <p>
                        {formatDate(
                          workout.workout_date
                        )}
                      </p>

                    </div>


                    <div className="workout-meta">

                      <span>
                        ⏱️{" "}
                        {workout.duration || 0} min
                      </span>

                      <span>
                        🔥{" "}
                        {workout.calories_burned || 0} kcal
                      </span>

                      <button
                        onClick={() =>
                          goTo("/workouts")
                        }
                      >
                        View →
                      </button>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* ================= FITNESS TRACKING ================= */}

        <section className="fitness-tracking-section">

          <p className="card-label">
            FITNESS TRACKING
          </p>

          <h2>
            Your fitness journey
          </h2>


          <div className="coming-grid">

            <div
              className="tracking-card"
              onClick={() => goTo("/workouts")}
            >
              <span>🏆</span>

              <h3>
                Workouts
              </h3>

              <p>
                Track your workouts and exercises.
              </p>
            </div>


            <div
              className="tracking-card"
              onClick={() => goTo("/exercises")}
            >
              <span>💪</span>

              <h3>
                Exercises
              </h3>

              <p>
                Discover exercises for every muscle.
              </p>
            </div>


            <div
              className="tracking-card"
              onClick={() => goTo("/progress")}
            >
              <span>📈</span>

              <h3>
                Progress
              </h3>

              <p>
                Monitor your fitness progress over time.
              </p>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;