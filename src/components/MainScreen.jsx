import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import SettingsModal from "./SettingsModal";
import ExitModal from "./ExitModal";
import "../styles/mainScreen.css";
import mainbg from "../assets/mainbga.png";

export default function MainScreen({ goToHowToPlay, musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showExit, setShowExit] = useState(false);

    const titleRef = useRef(null);
    const buttonsRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            titleRef.current,
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );

        if (buttonsRef.current) {
            gsap.fromTo(
                buttonsRef.current.children,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, delay: 0.5 }
            );
        }
    }, []);

    return (
        <div
            className="main-container"
            style={{ backgroundImage: `url(${mainbg})` }}
        >
            <div className="overlay" />

            <h1 ref={titleRef} className="game-title">
                Take a Shot
            </h1>

            <div className="button-stack" ref={buttonsRef}>
                <button
                    className="glow-btn"
                    onClick={goToHowToPlay}
                >
                    How To Play
                </button>

                <button
                    className="glow-btn"
                    onClick={() => setShowSettings(true)}
                >
                    Settings
                </button>

                <button
                    className="exit-btn"
                    onClick={() => setShowExit(true)}
                >
                    Exit
                </button>
            </div>

            {showSettings && (
                <SettingsModal
                               onClose={() => setShowSettings(false)}
                               musicEnabled={musicEnabled}
                               setMusicEnabled={setMusicEnabled}
                               soundEnabled={soundEnabled}
                               setSoundEnabled={setSoundEnabled}/>
            )}

            {showExit && (
                <ExitModal onClose={() => setShowExit(false)} />
            )}
        </div>
    );
}
