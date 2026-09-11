import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "./Workouts.css";

const API_URL = "https://oss.exercisedb.dev/api/v1/exercises";

function Workouts() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  const [search, setSearch] = useState("");
  const [workouts, setWorkouts] = useState([]);

  const [loadingExercises, setLoadingExercises] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Workout details modal
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchExercises();
    fetchWorkouts();
  }, []);

  // Fetch exercises from ExerciseDB
  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);

      const response = await fetch(`${API_URL}?limit=100`);
      const result = await response.json();

      if (result.success) {
        setExercises(result.data || []);
      }
    } catch (err) {
      console.error("Exercise fetch error:", err);
    } finally {
      setLoadingExercises(false);
    }
  };

  // Fetch user's saved workouts
  const fetchWorkouts = async () => {
    try {
      setLoadingWorkouts(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("workout_date", { ascending: false });

      if (error) {
        console.error("Fetch workouts error:", error);
        return;
      }

      setWorkouts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add exercise
  const addExercise = (exercise) => {
    const alreadyAdded = selectedExercises.some(
      (item) => item.exerciseId === exercise.exerciseId
    );

    if (alreadyAdded) return;

    setSelectedExercises([
      ...selectedExercises,
      {
        ...exercise,
        sets: 3,
        reps: 10,
        weight: 0,
      },
    ]);
  };

  // Remove exercise
  const removeExercise = (exerciseId) => {
    setSelectedExercises(
      selectedExercises.filter(
        (exercise) => exercise.exerciseId !== exerciseId
      )
    );
  };

  // Update exercise
  const updateExercise = (exerciseId, field, value) => {
    setSelectedExercises(
      selectedExercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise
      )
    );
  };

  // Save workout
  const saveWorkout = async () => {
    setMessage("");
    setError("");

    if (!workoutName.trim()) {
      setError("Please enter a workout name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise.");
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

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          workout_name: workoutName.trim(),
          duration: duration ? Number(duration) : null,
          calories_burned: calories ? Number(calories) : null,
        })
        .select()
        .single();

      if (workoutError) {
        throw workoutError;
      }

      // Save exercises
      for (const exercise of selectedExercises) {
        const { data: existingExercise, error: findError } = await supabase
          .from("exercises")
          .select("id")
          .eq("name", exercise.name)
          .maybeSingle();

        if (findError) {
          throw findError;
        }

        let exerciseId;

        if (existingExercise) {
          exerciseId = existingExercise.id;
        } else {
          const { data: newExercise, error: exerciseError } = await supabase
            .from("exercises")
            .insert({
              name: exercise.name,
              body_part: exercise.bodyParts?.join(", "),
              target_muscle: exercise.targetMuscles?.join(", "),
              equipment: exercise.equipments?.join(", "),
              instructions: exercise.instructions?.join("\n"),
              gif_url: exercise.gifUrl,
            })
            .select("id")
            .single();

          if (exerciseError) {
            throw exerciseError;
          }

          exerciseId = newExercise.id;
        }

        // Connect exercise with workout
        const { error: workoutExerciseError } = await supabase
          .from("workout_exercises")
          .insert({
            workout_id: workout.id,
            exercise_id: exerciseId,
            sets: Number(exercise.sets),
            reps: Number(exercise.reps),
            weight: Number(exercise.weight) || 0,
          });

        if (workoutExerciseError) {
          throw workoutExerciseError;
        }
      }

      setMessage("Workout saved successfully! 💪");

      // Reset form
      setWorkoutName("");
      setDuration("");
      setCalories("");
      setSelectedExercises([]);

      fetchWorkouts();
    } catch (err) {
      console.error("Save workout error:", err);
      setError(err.message || "Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  // Open workout details
  const openWorkoutDetails = async (workout) => {
    setSelectedWorkout(workout);
    setWorkoutDetails([]);
    setLoadingDetails(true);

    try {
      const { data, error } = await supabase
        .from("workout_exercises")
        .select(`
          id,
          sets,
          reps,
          weight,
          exercise_id,
          exercises (
            id,
            name,
            body_part,
            target_muscle,
            equipment,
            gif_url
          )
        `)
        .eq("workout_id", workout.id)
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      setWorkoutDetails(data || []);
    } catch (err) {
      console.error("Workout details error:", err);
      setWorkoutDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close modal
  const closeWorkoutDetails = () => {
    setSelectedWorkout(null);
    setWorkoutDetails([]);
  };

  return (
    <div className="workouts-page">

      {/* Header */}
      <div className="workouts-header">
        <div>
          <h1>Workouts</h1>
          <p>Create and track your workouts</p>
        </div>
      </div>

      {/* Create Workout */}
      <section className="workout-section">
        <h2>Create Workout</h2>

        <div className="workout-form">

          <div className="form-group">
            <label>Workout Name</label>

            <input
              type="text"
              placeholder="Example: Chest & Triceps"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Duration (minutes)</label>

              <input
                type="number"
                min="0"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Calories Burned</label>

              <input
                type="number"
                min="0"
                placeholder="400"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Add Exercises */}
      <section className="workout-section">

        <h2>Add Exercises</h2>

        <input
          className="exercise-search"
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loadingExercises ? (
          <p className="status-text">
            Loading exercises...
          </p>
        ) : (
          <div className="exercise-selection-grid">

            {filteredExercises.slice(0, 20).map((exercise) => {

              const isAdded = selectedExercises.some(
                (item) =>
                  item.exerciseId === exercise.exerciseId
              );

              return (
                <div
                  className="exercise-selection-card"
                  key={exercise.exerciseId}
                >

                  <div>
                    <h3>{exercise.name}</h3>

                    <p>
                      {exercise.bodyParts?.join(", ")}
                    </p>
                  </div>

                  <button
                    onClick={() => addExercise(exercise)}
                    disabled={isAdded}
                  >
                    {isAdded ? "Added ✓" : "+ Add"}
                  </button>

                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <section className="workout-section">

          <h2>Your Exercises</h2>

          <div className="selected-exercises">

            {selectedExercises.map((exercise) => (

              <div
                className="selected-exercise"
                key={exercise.exerciseId}
              >

                <div className="selected-exercise-info">

                  <h3>{exercise.name}</h3>

                  <p>
                    {exercise.bodyParts?.join(", ")}
                  </p>

                </div>

                <div className="exercise-inputs">

                  <div>
                    <label>Sets</label>

                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(
                          exercise.exerciseId,
                          "sets",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>Reps</label>

                    <input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(
                          exercise.exerciseId,
                          "reps",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>Weight (kg)</label>

                    <input
                      type="number"
                      min="0"
                      value={exercise.weight}
                      onChange={(e) =>
                        updateExercise(
                          exercise.exerciseId,
                          "weight",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    className="remove-exercise"
                    onClick={() =>
                      removeExercise(exercise.exerciseId)
                    }
                  >
                    Remove
                  </button>

                </div>
              </div>

            ))}

          </div>

          <div className="save-workout-container">

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {message && (
              <p className="success-message">
                {message}
              </p>
            )}

            <button
              className="save-workout-button"
              onClick={saveWorkout}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Workout 💪"}
            </button>

          </div>

        </section>
      )}

      {/* Previous Workouts */}
      <section className="workout-section">

        <h2>Previous Workouts</h2>

        {loadingWorkouts ? (
          <p className="status-text">
            Loading workouts...
          </p>
        ) : workouts.length === 0 ? (

          <div className="empty-workouts">
            <h3>No workouts yet</h3>

            <p>
              Create your first workout above.
            </p>
          </div>

        ) : (

          <div className="saved-workouts">

            {workouts.map((workout) => (

              <div
                className="saved-workout-card"
                key={workout.id}
              >

                <div className="saved-workout-info">

                  <h3>
                    {workout.workout_name}
                  </h3>

                  <p>
                    {new Date(
                      workout.workout_date
                    ).toLocaleDateString()}
                  </p>

                </div>

                <div className="saved-workout-right">

                  <div className="saved-workout-stats">

                    <span>
                      ⏱ {workout.duration || 0} min
                    </span>

                    <span>
                      🔥{" "}
                      {workout.calories_burned || 0} kcal
                    </span>

                  </div>

                  <button
                    className="view-workout-button"
                    onClick={() =>
                      openWorkoutDetails(workout)
                    }
                  >
                    View Details →
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* Workout Details Modal */}
      {selectedWorkout && (

        <div
          className="workout-modal-overlay"
          onClick={closeWorkoutDetails}
        >

          <div
            className="workout-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="workout-modal-header">

              <div>
                <h2>
                  {selectedWorkout.workout_name}
                </h2>

                <p>
                  {new Date(
                    selectedWorkout.workout_date
                  ).toLocaleDateString()}
                </p>
              </div>

              <button
                className="close-workout-modal"
                onClick={closeWorkoutDetails}
              >
                ×
              </button>

            </div>

            {/* Workout stats */}
            <div className="workout-detail-stats">

              <div className="workout-detail-stat">
                <span>⏱</span>
                <div>
                  <strong>
                    {selectedWorkout.duration || 0}
                  </strong>
                  <small>Minutes</small>
                </div>
              </div>

              <div className="workout-detail-stat">
                <span>🔥</span>
                <div>
                  <strong>
                    {selectedWorkout.calories_burned || 0}
                  </strong>
                  <small>Calories</small>
                </div>
              </div>

              <div className="workout-detail-stat">
                <span>💪</span>
                <div>
                  <strong>
                    {workoutDetails.length}
                  </strong>
                  <small>Exercises</small>
                </div>
              </div>

            </div>

            {/* Exercises */}
            <div className="workout-details-content">

              <h3>Exercises Performed</h3>

              {loadingDetails ? (

                <div className="workout-details-loading">
                  Loading workout details...
                </div>

              ) : workoutDetails.length === 0 ? (

                <div className="workout-details-empty">
                  No exercise details found.
                </div>

              ) : (

                <div className="workout-detail-exercises">

                  {workoutDetails.map((item) => (

                    <div
                      className="workout-detail-exercise"
                      key={item.id}
                    >

                      <div className="workout-detail-exercise-info">

                        <h4>
                          {item.exercises?.name ||
                            "Exercise"}
                        </h4>

                        <p>
                          {item.exercises?.body_part ||
                            "Unknown body part"}
                        </p>

                      </div>

                      <div className="workout-detail-values">

                        <div>
                          <strong>
                            {item.sets || 0}
                          </strong>
                          <span>Sets</span>
                        </div>

                        <div>
                          <strong>
                            {item.reps || 0}
                          </strong>
                          <span>Reps</span>
                        </div>

                        <div>
                          <strong>
                            {item.weight || 0}
                          </strong>
                          <span>kg</span>
                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            <button
              className="close-workout-button"
              onClick={closeWorkoutDetails}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Workouts;