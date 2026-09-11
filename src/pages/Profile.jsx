import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitness_goal: "",
  });

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in.");
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
      } else {
        setProfile({
          full_name: data.full_name || "",
          age: data.age || "",
          gender: data.gender || "",
          height: data.height || "",
          weight: data.weight || "",
          fitness_goal: data.fitness_goal || "",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    setMessage("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        age: profile.age ? Number(profile.age) : null,
        gender: profile.gender || null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        fitness_goal: profile.fitness_goal || null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully! ✅");
    }

    setSaving(false);
  }

  const heightInMeters = Number(profile.height) / 100;
  const weight = Number(profile.weight);

  const bmi =
    heightInMeters > 0 && weight > 0
      ? (weight / (heightInMeters * heightInMeters)).toFixed(1)
      : "--";

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "U";

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        {/* HEADER */}
        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">ACCOUNT SETTINGS</p>

            <h1>My Profile</h1>

            <p className="profile-subtitle">
              Manage your personal information and fitness details.
            </p>
          </div>

          <div className="profile-header-avatar">
            {initials}
          </div>
        </header>

        {/* USER CARD */}
        <section className="profile-user-card">
          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-user-info">
            <h2>{profile.full_name || "FitTrack User"}</h2>

            <p>{email}</p>

            <span>FitTrack Member</span>
          </div>
        </section>

        {/* FORM */}
        <form onSubmit={handleSave}>
          {/* PERSONAL INFORMATION */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-icon">👤</div>

              <div>
                <h2>Personal Information</h2>

                <p>Keep your personal details up to date.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field profile-field-full">
                <label htmlFor="full_name">Full Name</label>

                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="age">Age</label>

                <input
                  id="age"
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="gender">Gender</label>

                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* FITNESS INFORMATION */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-icon">💪</div>

              <div>
                <h2>Fitness Information</h2>

                <p>
                  These details help FitTrack calculate your fitness
                  metrics.
                </p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="height">Height</label>

                <div className="profile-input-with-unit">
                  <input
                    id="height"
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    step="0.01"
                    min="1"
                  />

                  <span>cm</span>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="weight">Weight</label>

                <div className="profile-input-with-unit">
                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    step="0.01"
                    min="1"
                  />

                  <span>kg</span>
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="fitness_goal">Fitness Goal</label>

                <select
                  id="fitness_goal"
                  name="fitness_goal"
                  value={profile.fitness_goal}
                  onChange={handleChange}
                >
                  <option value="">Select goal</option>
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Build Muscle">Build Muscle</option>
                  <option value="Maintain Weight">
                    Maintain Weight
                  </option>
                  <option value="Improve Fitness">
                    Improve Fitness
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* BMI */}
          <section className="profile-bmi-card">
            <div>
              <p className="profile-bmi-label">CURRENT BMI</p>

              <h2>{bmi}</h2>
            </div>

            <div className="profile-bmi-info">
              <span>Body Mass Index</span>

              <p>
                {bmi === "--"
                  ? "Add your height and weight to calculate BMI."
                  : "Calculated from your current height and weight."}
              </p>
            </div>
          </section>

          {/* SAVE AREA */}
          <div className="profile-save-area">
            <div>
              {message && (
                <p
                  className={
                    message.includes("successfully")
                      ? "profile-success"
                      : "profile-error"
                  }
                >
                  {message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Profile;