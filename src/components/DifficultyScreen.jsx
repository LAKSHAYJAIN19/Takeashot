import { useEffect, useRef } from "react";
import gsap from "gsap";
import difficultybg from "../assets/multibga.png";
import "../styles/mainScreen.css";

export default function DifficultyScreen({ goBack, onSelectDifficulty }) {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6 }
        );
    }, []);

    return (
        <div
            className="difficulty-container"
            style={{ backgroundImage: `url(${difficultybg})` }}
            ref={containerRef}
        >
            <div className="difficulty-overlay" />

            <div className="difficulty-card">
                <h2 className="difficulty-title">Select Difficulty</h2>

                <div className="difficulty-options">

                    <div className="difficulty-option-item">
                        <button className="difficulty-btn easy-btn" onClick={() => onSelectDifficulty("easy")}>
                            Easy
                        </button>
                        <p className="difficulty-description">
                            Light wind, steady aim, stationary target.
                        </p>
                    </div>

                    <div className="difficulty-option-item">
                        <button className="difficulty-btn medium-btn" onClick={() => onSelectDifficulty("medium")}>
                            Medium
                        </button>
                        <p className="difficulty-description">
                            Shifting wind, slight target movement.
                        </p>
                    </div>

                    <div className="difficulty-option-item">
                        <button className="difficulty-btn hard-btn" onClick={() => onSelectDifficulty("hard")}>
                            Hard
                        </button>
                        <p className="difficulty-description">
                            Strong wind, moving targets, fast arrows.
                        </p>
                    </div>

                    <div className="difficulty-option-item">
                        <button className="difficulty-btn expert-btn" onClick={() => onSelectDifficulty("expert")}>
                            Expert
                        </button>
                        <p className="difficulty-description">
                            Rapid wind shifts, unpredictable moving targets.
                        </p>
                    </div>

                </div>

                <button
                    className="difficulty-back-btn-small"
                    onClick={goBack}
                >
                    Back
                </button>
            </div>
        </div>
    );
}
