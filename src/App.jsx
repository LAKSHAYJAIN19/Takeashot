import { useState } from "react";
import MainScreen from "./components/MainScreen";
import HowToPlayScreen from "./components/HowToPlayScreen";
import DifficultyScreen from "./components/DifficultyScreen";
import GameLevel from "./levels/GameLevel";

function App() {
    const [screen, setScreen] = useState("main");
    const [selectedLevel, setSelectedLevel] = useState(null);
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
                <GameLevel
                    level="easy"
                    goToDifficulty={() => setScreen("difficulty")}
                    goToMain={() => setScreen("main")}
                />
            )}

            {/*{screen === "medium" && (*/}
            {/*    <GameLevel*/}
            {/*        level="medium"*/}
            {/*        goToDifficulty={() => setScreen("difficulty")}*/}
            {/*        goToMain={() => setScreen("main")}*/}
            {/*    />*/}
            {/*)}*/}

            {/*{screen === "hard" && (*/}
            {/*    <GameLevel*/}
            {/*        level="hard"*/}
            {/*        goToDifficulty={() => setScreen("difficulty")}*/}
            {/*        goToMain={() => setScreen("main")}*/}
            {/*    />*/}
            {/*)}*/}

            {/*{screen === "expert" && (*/}
            {/*    <GameLevel*/}
            {/*        level="expert"*/}
            {/*        goToDifficulty={() => setScreen("difficulty")}*/}
            {/*        goToMain={() => setScreen("main")}*/}
            {/*    />*/}
            {/*)}*/}
        </>
    );
}

export default App;
