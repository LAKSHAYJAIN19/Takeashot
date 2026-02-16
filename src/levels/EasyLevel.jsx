import { useState, useRef, useEffect } from "react";
import easyBg from "../assets/levels/easy.png";
import arrowImg from "../assets/finalarrow.png";
import targetImg from "../assets/target_easy.png";
import bowImg from "../assets/bow.png";
import scoreBg from "../assets/scorebgablur.png";
import "./EasyLevel.css";

export default function EasyLevel({ goToDifficulty, goToMain }) {

    const [isAiming, setIsAiming] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [aimY, setAimY] = useState(0);

    const arrowRef = useRef(null);
    const targetRef = useRef(null);
    const aimAnim = useRef(null);
    const holding = useRef(false);

    /* ---------------- AIM OSCILLATION ---------------- */

    useEffect(() => {
        if (!isAiming) return;

        let dir = 1;
        let pos = -85;

        aimAnim.current = setInterval(() => {
            pos += dir * 2.5;

            if (pos > 85) dir = -1;
            if (pos < -85) dir = 1;

            setAimY(pos);
        }, 16);

        return () => clearInterval(aimAnim.current);
    }, [isAiming]);

    /* ---------------- SCORE ---------------- */

    const calculateScore = (hitY, height) => {
        const center = height / 2;
        const radius = height / 2;

        const dist = Math.abs(hitY - center);

        // ❌ Missed target
        if (dist > radius) return 0;

        // 🎯 Continuous score (1–10)
        const normalized = dist / radius;          // 0 → center, 1 → edge
        let score = Math.round(10 - normalized * 9);

        // safety clamp
        score = Math.max(1, Math.min(10, score));

        return score;

    };

    /* ---------------- HOLD START ---------------- */

    const startAim = () => {
        if (showScore) return;
        holding.current = true;
        setIsAiming(true);
    };

    /* ---------------- RELEASE = SHOOT ---------------- */

    const releaseAim = () => {
        if (!holding.current) return;
        holding.current = false;

        clearInterval(aimAnim.current);
        setIsAiming(false);

        const arrow = arrowRef.current;
        const target = targetRef.current;
        if (!arrow || !target) return;

        const a = arrow.getBoundingClientRect();
        const t = target.getBoundingClientRect();

        const hitY = t.height / 2 + aimY;
        const finalScore = calculateScore(hitY, t.height);
        setScore(finalScore);

        const deltaX = t.left - a.left + 40;
        const deltaY = t.top + hitY - a.top;

        arrow.style.transition = "transform 0.9s cubic-bezier(.2,.8,.2,1)";
        arrow.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        setTimeout(() => setShowScore(true), 900);
    };

    /* ---------------- RESET ---------------- */

    const closeScore = () => {
        setShowScore(false);

        const arrow = arrowRef.current;
        if (arrow) {
            arrow.style.transition = "none";
            arrow.style.transform = "translate(0px,0px)";
        }
    };

    const getScoreMessage = (score) => {
        if (score === 0) return "You missed it completely, try again !";
        if (score <= 4) return "Ahh, not so perfect, Try again";
        if (score <= 7) return "Good, but you can do better";
        if (score <= 9) return "Great,you are few inches away from hitting the bullseye";
        return "Excellent, you have got an eagle eye";
    };

    return (
        <div className="easy-level-container" style={{ backgroundImage: `url(${easyBg})` }}>

            <div className="easy-overlay" />

            {/* GAME WORLD */}
            <div className={`easy-game-layer ${isAiming ? "aim-mode" : ""}`}>

                <div className="easy-bow-wrapper">
                    <img src={bowImg} className="easy-bow" alt="bow" />
                    <img ref={arrowRef} src={arrowImg} className="easy-arrow" alt="arrow" />
                </div>

                <img ref={targetRef} src={targetImg} className="easy-target" alt="target" />

                {/* AIM LINE */}
                {isAiming && (
                    <div className="aim-line" style={{ transform: `translateY(${aimY}px)` }} />
                )}
            </div>

            {/* HOLD BUTTON */}
            {!showScore && (
                <button
                    className="easy-shoot-btn"

                    onMouseDown={startAim}
                    onMouseUp={releaseAim}
                    onMouseLeave={releaseAim}

                    onTouchStart={startAim}
                    onTouchEnd={releaseAim}
                >
                    <span className="shoot-main">Shoot</span>
                    <span className="shoot-sub">(Hold & Release)</span>
                </button>
            )}

            {/* SCORE */}
            {showScore && (
                <div className="easy-popup">
                    <div className="easy-popup-box easy-score-box" style={{ backgroundImage: `url(${scoreBg})` }}>
                        <h2 className="score-title">Your Score : {score}</h2>
                        <p className="score-message">{getScoreMessage(score)}</p>

                        <div className="easy-popup-buttons">
                            <button className="score-btn play-again" onClick={() => { closeScore(); goToDifficulty(); }}>
                                Play Again
                            </button>

                            <button className="score-btn main-menu" onClick={() => { closeScore(); goToMain(); }}>
                                Main Screen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
