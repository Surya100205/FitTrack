import { useEffect, useMemo, useState } from "react";
import "./Exercises.css";

function Exercises() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const [nextCursor, setNextCursor] = useState(null);
    const [totalExercises, setTotalExercises] = useState(1500);

    const [search, setSearch] = useState("");
    const [bodyPart, setBodyPart] = useState("All");
    const [target, setTarget] = useState("All");
    const [equipment, setEquipment] = useState("All");

    const [favorites, setFavorites] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Load first page of exercises
    useEffect(() => {
        async function loadExercises() {
            try {
                const response = await fetch(
                    "https://oss.exercisedb.dev/api/v1/exercises"
                );

                if (!response.ok) {
                    throw new Error("Failed to load exercises");
                }

                const result = await response.json();

                console.log("Exercise API response:", result);

                setExercises(result.data || []);
                setNextCursor(result.meta?.nextCursor || null);
                setTotalExercises(result.meta?.total || 1500);
            } catch (error) {
                console.error(error);
                setError("Unable to load exercises.");
            } finally {
                setLoading(false);
            }
        }

        loadExercises();
    }, []);

    // Load more exercises
    async function loadMoreExercises() {
        if (!nextCursor || loadingMore) {
            return;
        }

        try {
            setLoadingMore(true);

            const response = await fetch(
                `https://oss.exercisedb.dev/api/v1/exercises?cursor=${encodeURIComponent(
                    nextCursor
                )}`
            );

            if (!response.ok) {
                throw new Error("Failed to load more exercises");
            }

            const result = await response.json();

            setExercises((currentExercises) => [
                ...currentExercises,
                ...(result.data || []),
            ]);

            setNextCursor(result.meta?.nextCursor || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    }

    // Body part filter options
    const bodyParts = useMemo(() => {
        return [
            "All",
            ...new Set(
                exercises.flatMap(
                    (exercise) => exercise.bodyParts || []
                )
            ),
        ];
    }, [exercises]);

    // Target muscle filter options
    const targets = useMemo(() => {
        return [
            "All",
            ...new Set(
                exercises.flatMap(
                    (exercise) => exercise.targetMuscles || []
                )
            ),
        ];
    }, [exercises]);

    // Equipment filter options
    const equipments = useMemo(() => {
        return [
            "All",
            ...new Set(
                exercises.flatMap(
                    (exercise) => exercise.equipments || []
                )
            ),
        ];
    }, [exercises]);

    // Search and filter
    const filteredExercises = useMemo(() => {
        return exercises.filter((exercise) => {
            const exerciseName =
                exercise.name?.toLowerCase() || "";

            const matchesSearch = exerciseName.includes(
                search.toLowerCase()
            );

            const matchesBodyPart =
                bodyPart === "All" ||
                exercise.bodyParts?.includes(bodyPart);

            const matchesTarget =
                target === "All" ||
                exercise.targetMuscles?.includes(target);

            const matchesEquipment =
                equipment === "All" ||
                exercise.equipments?.includes(equipment);

            return (
                matchesSearch &&
                matchesBodyPart &&
                matchesTarget &&
                matchesEquipment
            );
        });
    }, [
        exercises,
        search,
        bodyPart,
        target,
        equipment,
    ]);

    // Favorite / unfavorite
    function toggleFavorite(exerciseId) {
        setFavorites((currentFavorites) => {
            if (currentFavorites.includes(exerciseId)) {
                return currentFavorites.filter(
                    (id) => id !== exerciseId
                );
            }

            return [...currentFavorites, exerciseId];
        });
    }

    // Reset filters
    function clearFilters() {
        setSearch("");
        setBodyPart("All");
        setTarget("All");
        setEquipment("All");
    }

    // Loading
    if (loading) {
        return (
            <div className="exercise-page">
                <div className="exercise-loading">
                    <div className="loading-spinner"></div>

                    <h2>Loading Exercise Library...</h2>

                    <p>
                        Fetching exercises for you.
                    </p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="exercise-page">
                <div className="exercise-error">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="exercise-page">
            <div className="exercise-container">

                {/* Header */}
                <div className="exercise-header">
                    <div>
                        <p className="exercise-eyebrow">
                            FITNESS LIBRARY
                        </p>

                        <h1>Exercise Library</h1>

                        <p className="exercise-subtitle">
                            Discover exercises, explore movements,
                            and build better workouts.
                        </p>
                    </div>

                    <div className="exercise-count">
                        <strong>{totalExercises}</strong>
                        <span>Exercises</span>
                    </div>
                </div>

                {/* Search */}
                <div className="exercise-search-section">
                    <div className="search-box">
                        <span className="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        {search && (
                            <button
                                className="clear-search"
                                onClick={() => setSearch("")}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="exercise-filters">

                    <div className="filter-group">
                        <label>Body Part</label>

                        <select
                            value={bodyPart}
                            onChange={(event) =>
                                setBodyPart(event.target.value)
                            }
                        >
                            {bodyParts.map((part) => (
                                <option
                                    key={part}
                                    value={part}
                                >
                                    {part}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Target Muscle</label>

                        <select
                            value={target}
                            onChange={(event) =>
                                setTarget(event.target.value)
                            }
                        >
                            {targets.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Equipment</label>

                        <select
                            value={equipment}
                            onChange={(event) =>
                                setEquipment(event.target.value)
                            }
                        >
                            {equipments.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="clear-filters"
                        onClick={clearFilters}
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Results */}
                <div className="results-row">
                    <p>
                        Showing{" "}
                        <strong>
                            {filteredExercises.length}
                        </strong>{" "}
                        exercises
                    </p>
                </div>

                {/* Exercise Cards */}
                {filteredExercises.length > 0 ? (
                    <>
                        <div className="exercise-grid">

                            {filteredExercises.map(
                                (exercise) => {
                                    const isFavorite =
                                        favorites.includes(
                                            exercise.exerciseId
                                        );

                                    return (
                                        <div
                                            className="exercise-card"
                                            key={exercise.exerciseId}
                                        >

                                            {/* Image */}
                                            <div className="exercise-image-wrapper">

                                                {exercise.gifUrl ? (
                                                    <>
                                                        <img
                                                            src={exercise.gifUrl}
                                                            alt={exercise.name}
                                                            className="exercise-image"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display =
                                                                    "none";

                                                                const placeholder =
                                                                    event.currentTarget
                                                                        .parentElement
                                                                        .querySelector(
                                                                            ".image-placeholder"
                                                                        );

                                                                if (placeholder) {
                                                                    placeholder.classList.add(
                                                                        "show-placeholder"
                                                                    );
                                                                }
                                                            }}
                                                        />

                                                        <div className="image-placeholder">
                                                            <span>
                                                                Image unavailable
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="image-placeholder show-placeholder">
                                                        <span>
                                                            Image unavailable
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Favorite */}
                                                <button
                                                    className={`favorite-button ${
                                                        isFavorite
                                                            ? "favorite-active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleFavorite(
                                                            exercise.exerciseId
                                                        )
                                                    }
                                                    aria-label="Favorite exercise"
                                                >
                                                    {isFavorite
                                                        ? "♥"
                                                        : "♡"}
                                                </button>
                                            </div>

                                            {/* Card content */}
                                            <div className="exercise-card-content">

                                                <h2>
                                                    {exercise.name}
                                                </h2>

                                                <div className="exercise-tags">
                                                    {exercise.bodyParts?.map(
                                                        (part) => (
                                                            <span
                                                                key={part}
                                                            >
                                                                {part}
                                                            </span>
                                                        )
                                                    )}
                                                </div>

                                                <div className="exercise-info">

                                                    <div>
                                                        <small>
                                                            Target
                                                        </small>

                                                        <strong>
                                                            {exercise.targetMuscles?.join(
                                                                ", "
                                                            ) ||
                                                                "N/A"}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <small>
                                                            Equipment
                                                        </small>

                                                        <strong>
                                                            {exercise.equipments?.join(
                                                                ", "
                                                            ) ||
                                                                "N/A"}
                                                        </strong>
                                                    </div>

                                                </div>

                                                <button
                                                    className="details-button"
                                                    onClick={() =>
                                                        setSelectedExercise(
                                                            exercise
                                                        )
                                                    }
                                                >
                                                    View Details →
                                                </button>

                                            </div>
                                        </div>
                                    );
                                }
                            )}

                        </div>

                        {/* Load More */}
                        {nextCursor && (
                            <div className="load-more-container">

                                <button
                                    className="load-more-button"
                                    onClick={loadMoreExercises}
                                    disabled={loadingMore}
                                >
                                    {loadingMore
                                        ? "Loading More..."
                                        : "Load More Exercises"}
                                </button>

                                <p>
                                    Showing{" "}
                                    {exercises.length} of{" "}
                                    {totalExercises} exercises
                                </p>

                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">

                        <div className="no-results-icon">
                            🔎
                        </div>

                        <h2>No exercises found</h2>

                        <p>
                            Try changing your search or filters.
                        </p>

                        <button onClick={clearFilters}>
                            Clear Filters
                        </button>

                    </div>
                )}

            </div>

            {/* Exercise Details Modal */}
            {selectedExercise && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedExercise(null)
                    }
                >
                    <div
                        className="exercise-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Close button */}
                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedExercise(null)
                            }
                        >
                            ×
                        </button>

                        {/* Modal image */}
                        <div className="modal-image">

                            {selectedExercise.gifUrl ? (
                                <>
                                    <img
                                        src={
                                            selectedExercise.gifUrl
                                        }
                                        alt={
                                            selectedExercise.name
                                        }
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";

                                            const placeholder =
                                                event.currentTarget
                                                    .parentElement
                                                    .querySelector(
                                                        ".image-placeholder"
                                                    );

                                            if (placeholder) {
                                                placeholder.classList.add(
                                                    "show-placeholder"
                                                );
                                            }
                                        }}
                                    />

                                    <div className="image-placeholder">
                                        <span>
                                            Image unavailable
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="image-placeholder show-placeholder">
                                    <span>
                                        Image unavailable
                                    </span>
                                </div>
                            )}

                        </div>

                        {/* Modal content */}
                        <div className="modal-content">

                            <p className="exercise-eyebrow">
                                EXERCISE DETAILS
                            </p>

                            <h2>
                                {selectedExercise.name}
                            </h2>

                            {/* Main details */}
                            <div className="modal-details">

                                <div>
                                    <span>Body Part</span>

                                    <strong>
                                        {selectedExercise.bodyParts?.join(
                                            ", "
                                        ) || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Target Muscle</span>

                                    <strong>
                                        {selectedExercise.targetMuscles?.join(
                                            ", "
                                        ) || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Secondary Muscles</span>

                                    <strong>
                                        {selectedExercise.secondaryMuscles?.join(
                                            ", "
                                        ) || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Equipment</span>

                                    <strong>
                                        {selectedExercise.equipments?.join(
                                            ", "
                                        ) || "N/A"}
                                    </strong>
                                </div>

                            </div>

                            {/* Instructions */}
                            <div className="exercise-instructions">

                                <h3>
                                    How to Perform
                                </h3>

                                {selectedExercise.instructions?.length >
                                0 ? (
                                    <ol>
                                        {selectedExercise.instructions.map(
                                            (instruction, index) => (
                                                <li
                                                    key={index}
                                                >
                                                    {instruction.replace(
                                                        /^Step:\d+\s*/,
                                                        ""
                                                    )}
                                                </li>
                                            )
                                        )}
                                    </ol>
                                ) : (
                                    <p>
                                        Instructions are not
                                        available for this
                                        exercise.
                                    </p>
                                )}

                            </div>

                            {/* Favorite */}
                            <button
                                className="modal-action"
                                onClick={() =>
                                    toggleFavorite(
                                        selectedExercise.exerciseId
                                    )
                                }
                            >
                                {favorites.includes(
                                    selectedExercise.exerciseId
                                )
                                    ? "♥ Remove from Favorites"
                                    : "♡ Add to Favorites"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Exercises;