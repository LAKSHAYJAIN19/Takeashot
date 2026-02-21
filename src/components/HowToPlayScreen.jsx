import { useEffect, useRef } from "react";
import gsap from "gsap";
import howtoplaybga from "../assets/howtoplaybga.png";
import "../styles/mainScreen.css";

export default function HowToPlayScreen({ onBack,onPlay }) {
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            cardRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
        );
    }, []);

    return (
        <div
            className="howtoplay-container"
            style={{ backgroundImage: `url(${howtoplaybga})` }}
        >
            <div className="howtoplay-overlay" />

            <div className="howtoplay-card" ref={cardRef}>
                <h2>How To Play</h2>

                <ul className="howtoplay-instructions">
                    <li>Choose your difficulty and get ready.</li>
                    <li>After the countdown, drag anywhere on the screen to aim.</li>
                    <li>Keep your scope steady inside the target circle.</li>
                    <li>Wind will push your aim — and it may shift direction mid-shot.</li>
                    <li>Stay alert and adjust quickly as conditions change.</li>
                    <li>Hold too long and your aim may become unstable.</li>
                    <li>Release to shoot before time runs out.</li>
                    <li>Hit closer to the center to score between 0 and 10.</li>
                </ul>

                <div className="howtoplay-buttons">
                    <button
                        className="glow-btn small"
                        onClick={onBack}
                    >
                        Back
                    </button>

                    <button
                        className="glow-btn small"
                        onClick={onPlay}
                    >
                        Play Game
                    </button>
                </div>
            </div>
        </div>
    );
}
