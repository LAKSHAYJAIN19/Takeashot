import { useEffect, useRef, useState } from "react";
import { LEVELS } from "./levelConfig";
import "../styles/gameLevel.css";
import arrowImg from "../assets/arrowtwo.png";
import windImg from "../assets/winddirection.png";
import scoreBg from "../assets/scorebgablur.png";

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
const getScoreMessage = (s) => {
    if (s === 0) return "You missed it completely, try again !";
    if (s <= 4) return "Ahh, not so perfect, Try again";
    if (s <= 7) return "Good, but you can do better";
    if (s <= 9) return "Great, you are few inches away from hitting the bullseye";
    return "Excellent, you have got an eagle eye";
};
export default function GameLevel({ level, goToDifficulty, goToMain , soundEnabled}) {
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

    const [targetOffset, setTargetOffset] = useState(0); // NEW

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

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

    const targetMoveFrameRef = useRef(null);
    const [adaptiveError, setAdaptiveError] = useState(config.errorMultiplier); // NEW

    const [timeUp, setTimeUp] = useState(false);
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

    useEffect(() => {
        if (!soundEnabled) {
            bowLoad.current?.pause();
            arrowRelease.current?.pause();
            normalHit.current?.pause();
            perfectHit.current?.pause();
            miss.current?.pause();
        }
    }, [soundEnabled]);

    /* ---------------- RESET ---------------- */
    useEffect(() => {
        setTimeLeft(config.totalTime / 1000);
        setShotTaken(false);
        setScore(null);
        setArrowImpact(null);
        setIsAiming(false);
        setPerfectShake(false);
        setIsArrowFlying(false);
        setTimeUp(false);

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


    /* ---------------- DYNAMIC WIND ---------------- */
    useEffect(() => {
        if (!isAiming) return;
        if (!config.dynamicWind) return;

        const interval = setInterval(() => {
            generateDeviation();
        }, 2000);

        return () => clearInterval(interval);
    }, [isAiming, config.dynamicWind]);

    /* ---------------- MOVING TARGET ---------------- */
    useEffect(() => {
        if (!config.movingTarget) return;

        let start = Date.now();

        const animate = () => {
            if (!isAiming) return; // 🔥 STOP when not aiming

            const elapsed = (Date.now() - start) / 1000;

            let amplitude = 10;
            let speed = 1;

            if (config.movingTarget === "advanced") {
                amplitude = 25;
                speed = 2;
            }

            setTargetOffset(Math.sin(elapsed * speed) * amplitude);

            targetMoveFrameRef.current = requestAnimationFrame(animate);
        };

        if (isAiming) {
            targetMoveFrameRef.current = requestAnimationFrame(animate);
        }

        return () => cancelAnimationFrame(targetMoveFrameRef.current);

    }, [config.movingTarget, isAiming]);

    /* ---------------- STABILITY ---------------- */
    useEffect(() => {
        if (!isAiming) {
            cancelAnimationFrame(stabilityFrameRef.current);
            setStabilityOffset({ x: 0, y: 0 });
            return;
        }

        stabilityStartRef.current = Date.now();

        const animateStability = () => {
            const elapsed = Date.now() - stabilityStartRef.current;
            const fatiguePoint = config.fatigueAfter ?? config.stabilityTime;

            let intensity = 0;

            if (elapsed > fatiguePoint) {
                const overflow = elapsed - fatiguePoint;
                intensity = Math.min(overflow / 800, 8);
            }

            setStabilityOffset({
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity
            });

            stabilityFrameRef.current = requestAnimationFrame(animateStability);
        };

        animateStability();
        return () => cancelAnimationFrame(stabilityFrameRef.current);

    }, [isAiming, config.stabilityTime, config.fatigueAfter]);

    /* ---------------- TIMER ---------------- */
    const startTimer = () => {
        if (startTimeRef.current) return;
        startTimeRef.current = Date.now();

        if (bowLoad.current && soundEnabled) {
            bowLoad.current.currentTime = 0;
            bowLoad.current.play();
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setTimeUp(true);
                    setIsAiming(false);
                    setScore(0);
                    setShotTaken(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    /* ---------------- WIND ---------------- */
    const generateDeviation = () => {
        const windStrength = config?.windStrength ?? 0.25;
        const maxDeviation = 0.03 + (windStrength * 0.25);

        const magnitude = Number(
            (Math.random() * maxDeviation).toFixed(2)
        );

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
        generateDeviation();
        dragStartRef.current = { x, y };
        scopeStartRef.current = scopePos;
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
    };

    const endAim = () => {
        if (!isAiming) return;
        if (timeUp || timeLeft <= 0) return; // 🔥 block release

        shootArrow();
    };

    /* ---------------- SHOOT ---------------- */
    const shootArrow = () => {
        setIsAiming(false);
        cancelAnimationFrame(targetMoveFrameRef.current);
        clearInterval(timerRef.current);

        if (!arrowRelease.current) return;

        if(soundEnabled){
            arrowRelease.current.currentTime = 0;
            arrowRelease.current.play();
        }

        const releaseDuration =
            (arrowRelease.current.duration || 0.6) * 1000;

        const target = document.getElementById("target-image");
        const rect = target.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const scaledRadius =
            (rect.width / 2) * (config.shrinkingHitbox || 1);

        const ringWidth = scaledRadius / 10;

        const windOffset = getDirectionalOffset(
            currentDeviation?.direction || "N",
            currentDeviation?.magnitude || 0,
            scaledRadius
        );

        const errorOffsetX =
            (Math.random() - 0.5) * adaptiveError * scaledRadius * 0.05;

        const errorOffsetY =
            (Math.random() - 0.5) * adaptiveError * scaledRadius * 0.05;

        const impactX = scopePos.x + windOffset.x + errorOffsetX;
        const impactY = scopePos.y + windOffset.y + errorOffsetY;

        setIsArrowFlying(true);

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
            if (calculatedScore === 10) {
                setPerfectShake(true);
                setTimeout(() => setPerfectShake(false), 800);
            }

            // Adaptive Expert
            if (config.adaptiveDifficulty) {
                if (calculatedScore >= 9) {
                    setAdaptiveError(prev => prev + 0.05);
                }
                if (calculatedScore <= 4) {
                    setAdaptiveError(prev =>
                        Math.max(config.errorMultiplier, prev - 0.05)
                    );
                }
            }

            const hitSound =
                calculatedScore === 10
                    ? perfectHit.current
                    : calculatedScore > 0
                        ? normalHit.current
                        : miss.current;

            if(soundEnabled)
            {
                hitSound.currentTime = 0;
                hitSound.play();
            }

            setTimeout(() => {
                setTargetOffset(0);
                setScore(calculatedScore);
                setShotTaken(true);
            }, (hitSound.duration || 0.6) * 1000);

        }, releaseDuration);
    };

    /* ---------------- EVENTS ---------------- */
    const handleMouseDown = e => startAim(e.clientX, e.clientY);
    const handleMouseMove = e => moveAim(e.clientX, e.clientY);
    const handleMouseUp = () => endAim();

    const handleTouchStart = (e) => {
        if (showDragMessage) setShowDragMessage(false);
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

                    <div
                        className="target-container"
                        style={{
                            transform: `translateX(${targetOffset}px) scale(0.8)`,
                            transformOrigin: "left center",
                            marginTop: "-80px"}}
                    >
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
                                left: scopePos.x + stabilityOffset.x,
                                top: scopePos.y + stabilityOffset.y,
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
                <div className="score-overlay">
                    <div
                        className="score-card"
                        style={{ backgroundImage: `url(${scoreBg})` }}
                    >
                        <div className="score-inner">
                            <h1 className="score-title">
                                Your Score : {score}
                            </h1>

                            <p className="score-message">
                                {getScoreMessage(score)}
                            </p>

                            <div className="score-buttons">
                                <button
                                    className="score-btn"
                                    onClick={goToDifficulty}
                                >
                                    Play Again
                                </button>

                                <button
                                    className="score-btn"
                                    onClick={goToMain}
                                >
                                    Main Screen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
