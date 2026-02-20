import { useEffect, useRef, useState } from "react";
import { LEVELS } from "./levelConfig";
import "../styles/gameLevel.css";
import arrowImg from "../assets/arrowtwo.png";
import windImg from "../assets/winddirection.png";

import bowLoadSound from "../assets/sounds/bowload.mp3";
import arrowReleaseSound from "../assets/sounds/arrowrelease.mp3";
import normalHitSound from "../assets/sounds/normal.mp3";
import perfectHitSound from "../assets/sounds/perfect.mp3";
import missSound from "../assets/sounds/miss.mp3";

const DIRECTIONS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];

const getRotation = (direction) => {
    switch (direction) {
        case "N": return -90;
        case "S": return 90;
        case "E": return 0;
        case "W": return 180;
        case "NE": return -45;
        case "NW": return -135;
        case "SE": return 45;
        case "SW": return 135;
        default: return 0;
    }
};

const getDirectionalOffset = (direction, magnitude, radius) => {
    const value = magnitude * radius;

    switch (direction) {
        case "N": return { x: 0, y: -value };
        case "S": return { x: 0, y: value };
        case "E": return { x: value, y: 0 };
        case "W": return { x: -value, y: 0 };
        case "NE": return { x: value, y: -value };
        case "NW": return { x: -value, y: -value };
        case "SE": return { x: value, y: value };
        case "SW": return { x: -value, y: value };
        default: return { x: 0, y: 0 };
    }
};
export default function GameLevel({ level, goToDifficulty, goToMain }) {
    const config = LEVELS[level];
    if (!config) return null;

    const [timeLeft, setTimeLeft] = useState(config.totalTime / 1000);
    const [shotTaken, setShotTaken] = useState(false);
    const [isAiming, setIsAiming] = useState(false);
    const [score, setScore] = useState(null);
    const [perfectShake, setPerfectShake] = useState(false);
    const [isArrowFlying, setIsArrowFlying] = useState(false);

    const [scopePos, setScopePos] = useState({ x: 0, y: 0 });
    const [arrowImpact, setArrowImpact] = useState(null);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const windRef = useRef({ x: 0, y: 0 });

    // 🔥 AUDIO REFS (created once)
    const bowLoad = useRef(null);
    const arrowRelease = useRef(null);
    const normalHit = useRef(null);
    const perfectHit = useRef(null);
    const miss = useRef(null);

    const [stabilityOffset, setStabilityOffset] = useState({ x: 0, y: 0 });
    const stabilityStartRef = useRef(null);
    const stabilityFrameRef = useRef(null);

    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(true);
    const [showDragMessage, setShowDragMessage] = useState(false);

    const SCOPE_SIZE = 110;
    const SCOPE_RADIUS = SCOPE_SIZE / 2;
    const [currentDeviation, setCurrentDeviation] = useState(null);

    const dragStartRef = useRef({ x: 0, y: 0 });
    const scopeStartRef = useRef({ x: 0, y: 0 });

    /* ---------------- COUNTDOWN BEFORE START ---------------- */
    useEffect(() => {
        let timer;

        if (showCountdown) {
            if (countdown > 0) {
                timer = setTimeout(() => {
                    setCountdown(prev => prev - 1);
                }, 1000);
            } else {
                // show GO briefly
                timer = setTimeout(() => {
                    setShowCountdown(false);
                    setShowDragMessage(true);
                }, 700);
            }
        }

        return () => clearTimeout(timer);
    }, [countdown, showCountdown]);


    /* ---------------- CREATE AUDIO ONCE ---------------- */
    useEffect(() => {
        bowLoad.current = new Audio(bowLoadSound);
        arrowRelease.current = new Audio(arrowReleaseSound);
        normalHit.current = new Audio(normalHitSound);
        perfectHit.current = new Audio(perfectHitSound);
        miss.current = new Audio(missSound);

        bowLoad.current.preload = "auto";
        arrowRelease.current.preload = "auto";
        normalHit.current.preload = "auto";
        perfectHit.current.preload = "auto";
        miss.current.preload = "auto";
    }, []);

    /* ---------------- RESET ---------------- */
    useEffect(() => {
        setTimeLeft(config.totalTime / 1000);
        setShotTaken(false);
        setScore(null);
        setArrowImpact(null);
        setIsAiming(false);
        setPerfectShake(false);
        setIsArrowFlying(false);

        const target = document.getElementById("target-image");
        if (target) {
            const rect = target.getBoundingClientRect();
            setScopePos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }
        startTimeRef.current = null;
        clearInterval(timerRef.current);
    }, [level]);

    /* ---------------- STABILITY OSCILLATION ---------------- */
    useEffect(() => {
        if (!isAiming) {
            cancelAnimationFrame(stabilityFrameRef.current);
            setStabilityOffset({ x: 0, y: 0 });
            return;
        }

        stabilityStartRef.current = Date.now();

        const animateStability = () => {
            const elapsed = Date.now() - stabilityStartRef.current;
            const stabilityTime = config.stabilityTime || 2000;

            let intensity = 0;

            if (elapsed > stabilityTime) {
                // After stability time expires → start shaking
                const overflow = elapsed - stabilityTime;

                // Gradually increase instability
                intensity = Math.min(overflow / 1000, 6);
            }

            setStabilityOffset({
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity
            });

            stabilityFrameRef.current = requestAnimationFrame(animateStability);
        };

        animateStability();

        return () => cancelAnimationFrame(stabilityFrameRef.current);

    }, [isAiming, config.stabilityTime]);

    /* ---------------- TIMER ---------------- */
    const startTimer = () => {
        if (startTimeRef.current) return;
        startTimeRef.current = Date.now();

        // play bowload ONCE
        if (bowLoad.current) {
            bowLoad.current.currentTime = 0;
            bowLoad.current.play();
        }

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

    /*-----------------Wind Deviation-----------------*/
    const generateDeviation = () => {

        const windStrength = config?.windStrength ?? 0.25;
        const maxDeviation = 0.03 + (windStrength * 0.25);

        const pool = [];

        for (let i = 0; i < 25; i++) {
            const val = Number(
                (Math.random() * maxDeviation).toFixed(2)
            );

            // avoid zero / too tiny deviations
            if (val >= 0.02) {
                pool.push(val);
            }
        }

        // Fallback safety (prevents NaN forever)
        const magnitude =
            pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : 0;

        const direction =
            DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)] || "N";

        const deviation = { magnitude, direction };

        setCurrentDeviation(deviation);
        return deviation;
    };


    /* ---------------- AIM ---------------- */
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

        if (distance <= radius) return { x: clientX, y: clientY };

        const angle = Math.atan2(dy, dx);
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    const startAim = (x, y) => {
        const deviation = generateDeviation(); // 🔥 generate immediately
        setCurrentDeviation(deviation);

        dragStartRef.current = { x, y };
        scopeStartRef.current = scopePos;

        // setScopePos(clampToCircle(x, y));
        setIsAiming(true);
        startTimer();
    };

    const moveAim = (x, y) => {
        if (!isAiming) return;
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;

        const newX = scopeStartRef.current.x + dx;
        const newY = scopeStartRef.current.y + dy;

        setScopePos(clampToCircle(newX, newY));
        // setScopePos(clampToCircle(x, y));
    };

    const endAim = () => {
        if (!isAiming) return;
        shootArrow();
    };

    /* ---------------- SHOOT ---------------- */
    const shootArrow = () => {
        setIsAiming(false);
        clearInterval(timerRef.current);

        if (!arrowRelease.current) return;

        arrowRelease.current.currentTime = 0;
        arrowRelease.current.play();

        const releaseDuration =
            (arrowRelease.current.duration || 0.6) * 1000;

        const target = document.getElementById("target-image");
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const scaledRadius = rect.width / 2;
        const ringWidth = scaledRadius / 10;

        // const impactX = scopePos.x + windRef.current.x;
        // const impactY = scopePos.y + windRef.current.y;

        const windOffset = getDirectionalOffset(
            currentDeviation?.direction || "N",
            currentDeviation?.magnitude || 0,
            scaledRadius
        );

        const impactX = scopePos.x + windOffset.x;
        const impactY = scopePos.y + windOffset.y;

        setIsArrowFlying(true);

        // Wait until arrow reaches target
        setTimeout(() => {
            setIsArrowFlying(false);
            setArrowImpact({ x: impactX, y: impactY });

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
            }

            // IMPACT SOUND EXACTLY HERE
            if (calculatedScore === 10) {
                perfectHit.current.currentTime = 0;
                perfectHit.current.play();

                setPerfectShake(true);

                const totalDelay =
                    (perfectHit.current.duration || 1) * 1000 + 300;

                setTimeout(() => {
                    setPerfectShake(false);
                    setScore(calculatedScore);
                    setShotTaken(true);
                }, totalDelay);

            } else {
                const hitSound =
                    calculatedScore > 0 ? normalHit.current : miss.current;

                hitSound.currentTime = 0;
                hitSound.play();

                const delay =
                    (hitSound.duration || 0.6) * 1000;

                setTimeout(() => {
                    setScore(calculatedScore);
                    setShotTaken(true);
                }, delay);
            }

        }, releaseDuration);
    };

    /* ---------------- EVENTS ---------------- */
    const handleMouseDown = e => startAim(e.clientX, e.clientY);
    const handleMouseMove = e => moveAim(e.clientX, e.clientY);
    const handleMouseUp = () => endAim();

    const handleTouchStart = (e) => {

        if (showDragMessage) {
            setShowDragMessage(false);
        }

        startAim(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = e =>
        moveAim(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchEnd = () => endAim();

    return (
        <div className="game-container">

            {showCountdown && (
                <div className="countdown-overlay">
                    {countdown > 0 ? countdown : "GO!!!"}
                </div>
            )}

            {showDragMessage && (
                <div className="drag-overlay">
                    Drag to Start
                </div>
            )}
            <div className="top-ui">
                <div>Level: {level.toUpperCase()}</div>
                <div>Time: {timeLeft}s</div>
            </div>
            {currentDeviation && (
                <div className="deviation-ui">
                    <img
                        src={windImg}
                        alt="wind-direction"
                        style={{
                            width: "40px",
                            transform: `rotate(${getRotation(currentDeviation.direction)}deg)`
                        }}
                    />
                    <div className="deviation-text">
                        Wind: {currentDeviation.magnitude} {currentDeviation.direction}
                    </div>
                </div>
            )}

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
                            className={perfectShake ? "target-shake slow-motion" : ""}
                        />
                        <img id="target-stand" src={config.stand} alt="" />
                    </div>

                    <div className="rig">
                        <img className="bow" src={config.bow} alt="" />
                        <img className="frontHand" src={config.frontHand} alt="" />
                        <img className="backHand" src={config.backHand} alt="" />
                    </div>
                </div>

                {isAiming && (
                    <>
                        <div
                            className="blur-overlay"
                            style={{
                                WebkitMask: `radial-gradient(circle ${SCOPE_RADIUS}px at ${scopePos.x}px ${scopePos.y}px, transparent ${SCOPE_RADIUS}px, black ${SCOPE_RADIUS + 1}px)`,
                                mask: `radial-gradient(circle ${SCOPE_RADIUS}px at ${scopePos.x}px ${scopePos.y}px, transparent ${SCOPE_RADIUS}px, black ${SCOPE_RADIUS + 1}px)`
                            }}
                        />
                        <div
                            className="scope-container"
                            style={{
                                left: scopePos.x+stabilityOffset.x,
                                top: scopePos.y+stabilityOffset.y,
                                width: SCOPE_SIZE,
                                height: SCOPE_SIZE,
                                transform: "translate(-50%, -50%)"
                            }}
                        >
                            <img src={config.scope} className="scope-frame" alt="" />
                        </div>
                    </>
                )}

                {isArrowFlying && (
                    <img src={arrowImg} className="arrow flying" alt="" />
                )}

                {arrowImpact && !isArrowFlying && (
                    <img
                        src={arrowImg}
                        className="arrow"
                        style={{ left: arrowImpact.x, top: arrowImpact.y }}
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



