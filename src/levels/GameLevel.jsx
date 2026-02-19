import { useEffect, useRef, useState } from "react";
import { LEVELS } from "./levelConfig";
import "../styles/gameLevel.css";
import arrowImg from "../assets/arrowtwo.png";

export default function GameLevel({ level, goToDifficulty, goToMain }) {
    const config = LEVELS[level];
    if (!config) return null;

    const [timeLeft, setTimeLeft] = useState(config.totalTime / 1000);
    const [shotTaken, setShotTaken] = useState(false);
    const [isAiming, setIsAiming] = useState(false);
    const [score, setScore] = useState(null);

    const [scopePos, setScopePos] = useState({ x: 0, y: 0 });
    const [arrowImpact, setArrowImpact] = useState(null);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const windRef = useRef({ x: 0, y: 0 });

    const SCOPE_SIZE = 110;
    const SCOPE_RADIUS = SCOPE_SIZE / 2;

    /* ---------------- RESET LEVEL ---------------- */

    useEffect(() => {
        setTimeLeft(config.totalTime / 1000);
        setShotTaken(false);
        setScore(null);
        setArrowImpact(null);
        setIsAiming(false);
        startTimeRef.current = null;
        clearInterval(timerRef.current);

        const angle = Math.random() * Math.PI * 2;
        const strength = config.windStrength || 5;

        windRef.current = {
            x: Math.cos(angle) * strength,
            y: Math.sin(angle) * strength
        };
    }, [level]);

    /* ---------------- TIMER ---------------- */

    const startTimer = () => {
        if (startTimeRef.current) return;
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    shootArrow();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    /* ---------------- AIM LOGIC ---------------- */

    const clampToCircle = (clientX, clientY) => {
        const target = document.getElementById("target-image");
        if (!target) return { x: 0, y: 0 };

        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
            return { x: clientX, y: clientY };
        }

        // Clamp to edge of circle
        const angle = Math.atan2(dy, dx);
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    const startAim = (x, y) => {
        const pos = clampToCircle(x, y);
        setScopePos(pos);
        setIsAiming(true);
        startTimer();
    };

    const moveAim = (x, y) => {
        if (!isAiming) return;
        setScopePos(clampToCircle(x, y));
    };

    const endAim = () => {
        if (!isAiming) return;
        shootArrow();
    };

    /* ---------------- SHOOT ---------------- */

    const shootArrow = () => {
        setIsAiming(false);
        clearInterval(timerRef.current);

        const target = document.getElementById("target-image");
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const scaledRadius = rect.width / 2;
        const ringWidth = scaledRadius / 10;

        const impactX = scopePos.x + windRef.current.x;
        const impactY = scopePos.y + windRef.current.y;

        setArrowImpact({ x: impactX, y: impactY });

        setTimeout(() => {

            const dx = impactX - centerX;
            const dy = impactY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let calculatedScore = 0;

            if (distance <= scaledRadius) {
                const ringIndex = Math.min(
                    9,
                    Math.floor((distance + 0.0001) / ringWidth)
                );
                calculatedScore = 10 - ringIndex;
            } else {
                calculatedScore = 0;
            }

            setScore(calculatedScore);
            setShotTaken(true);

        }, 400);
    };

    /* ---------------- EVENTS ---------------- */

    const handleMouseDown = e => startAim(e.clientX, e.clientY);
    const handleMouseMove = e => moveAim(e.clientX, e.clientY);
    const handleMouseUp = () => endAim();

    const handleTouchStart = e => {
        const t = e.touches[0];
        startAim(t.clientX, t.clientY);
    };

    const handleTouchMove = e => {
        const t = e.touches[0];
        moveAim(t.clientX, t.clientY);
    };

    const handleTouchEnd = () => endAim();

    return (
        <div className="game-container">
            <div className="top-ui">
                <div>Level: {level.toUpperCase()}</div>
                <div>Time: {timeLeft}s</div>
            </div>

            <div
                className="play-area"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="world">
                    <img className="game-background" src={config.background} alt="" />

                    <div className="target-container">
                        <img
                            id="target-image"
                            src={config.target}
                            alt=""
                        />

                        {/* Target Stand */}
                        <img
                            id="target-stand"
                            src={config.stand}
                            alt=""
                        />
                    </div>

                    <div className="rig">
                        <img className="bow" src={config.bow} alt="" />
                        <img className="frontHand" src={config.frontHand} alt="" />
                        <img className="backHand" src={config.backHand} alt="" />
                        <img className="string" src={config.string} alt="" />
                    </div>
                </div>

                {isAiming && (
                    <div
                        className="blur-overlay"
                        style={{
                            WebkitMask: `radial-gradient(circle ${SCOPE_RADIUS}px at ${scopePos.x}px ${scopePos.y}px, transparent ${SCOPE_RADIUS}px, black ${SCOPE_RADIUS + 1}px)`,
                            mask: `radial-gradient(circle ${SCOPE_RADIUS}px at ${scopePos.x}px ${scopePos.y}px, transparent ${SCOPE_RADIUS}px, black ${SCOPE_RADIUS + 1}px)`
                        }}
                    />
                )}

                {isAiming && (
                    <div
                        className="scope-container"
                        style={{
                            left: scopePos.x,
                            top: scopePos.y,
                            width: SCOPE_SIZE,
                            height: SCOPE_SIZE,
                            transform: "translate(-50%, -50%)"
                        }}
                    >
                        <img src={config.scope} className="scope-frame" alt="" />
                    </div>
                )}

                {arrowImpact && (
                    <img
                        src={arrowImg}
                        className="arrow"
                        style={{
                            left: arrowImpact.x,
                            top: arrowImpact.y
                        }}
                        alt=""
                    />
                )}
            </div>

            {shotTaken && (
                <div className="score-popup">
                    <h2>Your Score : {score}</h2>
                    <div className="score-buttons">
                        <button onClick={goToDifficulty}>Play Again</button>
                        <button onClick={goToMain}>Main Screen</button>
                    </div>
                </div>
            )}
        </div>
    );
}
