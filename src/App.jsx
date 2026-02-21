
import { useState, useEffect, useRef } from "react";
import MainScreen from "./components/MainScreen";
import HowToPlayScreen from "./components/HowToPlayScreen";
import DifficultyScreen from "./components/DifficultyScreen";
import GameLevel from "./levels/GameLevel";
import bgmusic from "./assets/sounds/bgmusic.mp3";

function App() {
    const [screen, setScreen] = useState("main");
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const bgMusicRef = useRef(null);

    // 🎵 Create audio once
    useEffect(() => {
        const audio = new Audio(bgmusic);
        audio.loop = true;
        audio.volume = 0.5;
        bgMusicRef.current = audio;

        return () => {
            audio.pause();
        };
    }, []);

    // 🎵 Function to start music (called on user interaction)
    const startMusicIfAllowed = () => {
        if (!bgMusicRef.current) return;
        if (musicEnabled) {
            bgMusicRef.current.play().catch(() => {});
        }
    };

    // 🎵 Screen-based behavior
    useEffect(() => {
        if (!bgMusicRef.current) return;

        // Stop during gameplay
        if (["easy", "medium", "hard", "expert"].includes(screen)) {
            bgMusicRef.current.pause();
        }

        // Resume on main or score
        if ((screen === "main" || screen === "score") && musicEnabled) {
            bgMusicRef.current.play().catch(() => {});
        }
    }, [screen, musicEnabled]);

    // 🎵 Toggle behavior
    useEffect(() => {
        if (!bgMusicRef.current) return;

        if (!musicEnabled) {
            bgMusicRef.current.pause();
        } else if (screen === "main" || screen === "score") {
            bgMusicRef.current.play().catch(() => {});
        }
    }, [musicEnabled, screen]);

    return (
        <>
            {screen === "main" && (
                <MainScreen
                    goToHowToPlay={() => {
                        startMusicIfAllowed(); // 👈 starts music on first click
                        setScreen("howto");
                    }}
                    musicEnabled={musicEnabled}
                    setMusicEnabled={setMusicEnabled}
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                />
            )}

            {screen === "howto" && (
                <HowToPlayScreen
                    onBack={() => setScreen("main")}
                    onPlay={() => setScreen("difficulty")}
                />
            )}

            {screen === "difficulty" && (
                <DifficultyScreen
                    goBack={() => setScreen("howto")}
                    onSelectDifficulty={(level) => setScreen(level)}
                />
            )}

            {["easy", "medium", "hard", "expert"].includes(screen) && (
                <GameLevel
                    level={screen}
                    goToDifficulty={() => setScreen("difficulty")}
                    goToMain={() => setScreen("main")}
                    soundEnabled={soundEnabled}
                    goToScore={() => setScreen("score")}
                />
            )}
        </>
    );
}

export default App;
