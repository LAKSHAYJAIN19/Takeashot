import { useState } from "react";
import MainScreen from "./components/MainScreen";
import HowToPlayScreen from "./components/HowToPlayScreen";
import DifficultyScreen from "./components/DifficultyScreen";
import EasyLevel from "./levels/EasyLevel";

function App() {
    const [screen, setScreen] = useState("main");

    return (
        <>
            {screen === "main" && (
                <MainScreen
                    goToHowToPlay={() => setScreen("howto")} />
            )}

            {screen === "howto" && (
                <HowToPlayScreen
                    onBack={() => setScreen("main")}
                    onPlay={() => setScreen("difficulty")}/>
            )}
            {screen === "difficulty" && (
                <DifficultyScreen
                    goBack={() => setScreen("howto")}
                    onSelectDifficulty={(level) => setScreen(level)}
                />
            )}
            {screen === "easy" && (
                <EasyLevel
                    goToDifficulty={() => setScreen("difficulty")}
                    goToMain={() => setScreen("main")}
                />
            )}
        </>
    );
}

export default App;
