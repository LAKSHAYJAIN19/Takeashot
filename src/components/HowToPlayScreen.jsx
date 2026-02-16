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
                    <li>Select a difficulty level.</li>
                    <li>Adjust arrow speed using the vertical slider.</li>
                    <li>Use magnifier slider to zoom the target.</li>
                    <li>Wind speed is generated automatically.</li>
                    <li>Press Shoot when ready.</li>
                    <li>Confirm your arrow speed.</li>
                    <li>Watch the slow-motion arrow shot.</li>
                    <li>Score ranges from 1 to 10.</li>
                    <li>Hints appear after two scores below 7.</li>
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
