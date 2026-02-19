// I will rewrite your component cleanly so mechanics match real archery behaviour
import { useState, useRef, useEffect } from "react";
import easyBg from "../assets/levels/easy.png";
import arrowImg from "../assets/finalarrow.png";
import targetImg from "../assets/target_easy.png";
import bowImg from "../assets/bow.png";
import scoreBg from "../assets/scorebgablur.png";
import "./EasyLevel.css";

export default function EasyLevel({ goToDifficulty, goToMain }) {

    const [isHolding, setIsHolding] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [aimY, setAimY] = useState(0);
    const [holdPower, setHoldPower] = useState(0);

    const arrowRef = useRef(null);
    const targetRef = useRef(null);
    const animRef = useRef(null);

    /* ---------------- AIM OSCILLATION ---------------- */

    useEffect(() => {
        if (!isHolding) return;

        let dir = 1;
        let pos = -90;

        animRef.current = setInterval(() => {
            pos += dir * 2.8;
            if (pos > 90) dir = -1;
            if (pos < -90) dir = 1;
            setAimY(pos);
        }, 16);

        return () => clearInterval(animRef.current);
    }, [isHolding]);

    /* ---------------- HOLD POWER METER ---------------- */

    useEffect(() => {
        if (!isHolding) return;
        let p = 0;
        const meter = setInterval(() => {
            p += 2.2;
            if (p > 100) p = 100;
            setHoldPower(p);
        }, 16);
        return () => clearInterval(meter);
    }, [isHolding]);

    /* ---------------- SCORE FROM REAL HIT POINT ---------------- */

    const computeScore = (impactY, height) => {
        const center = height / 2;
        const radius = height / 2;
        const dist = Math.abs(impactY - center);

        if (dist > radius) return 0;

        const normalized = dist / radius;
        return Math.max(1, Math.round(10 - normalized * 9));
    };

    /* ---------------- SHOOT ---------------- */

    const releaseShot = () => {
        if (!isHolding) return;

        setIsHolding(false);
        clearInterval(animRef.current);

        const arrow = arrowRef.current;
        const target = targetRef.current;
        if (!arrow || !target) return;

        const a = arrow.getBoundingClientRect();
        const t = target.getBoundingClientRect();

        /* ---- 1. BOW POSITION (launch origin) ---- */
        const originX = a.left + a.width * 0.9;
        const originY = a.top + a.height * 0.5;

        /* ---- 2. AIM POINT FROM SCOPE ---- */
        const aimPointY = originY + aimY * 2.2; // converts UI oscillation to world space

        /* ---- 3. CALCULATE ANGLE ---- */
        const dx = t.left - originX;
        const dy = aimPointY - originY;
        const angle = Math.atan2(dy, dx);

        /* ---- 4. INTERSECTION WITH TARGET PLANE ---- */
        const targetPlaneX = t.left;
        const distanceToPlane = targetPlaneX - originX;

        const hitY = originY + Math.tan(angle) * distanceToPlane;

        /* ---- 5. SCORE ---- */
        const impactY = hitY - t.top;
        const finalScore = computeScore(impactY, t.height);
        setScore(finalScore);

        /* ---- 6. ANIMATE ARROW ---- */
        const deltaX = distanceToPlane;
        const deltaY = hitY - originY;

        arrow.style.transition = "transform 0.85s cubic-bezier(.22,.61,.36,1)";
        arrow.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${angle}rad)`;

        setTimeout(() => setShowScore(true), 850);
    };


    /* ---------------- RESET ---------------- */

    const closeScore = () => {
        setShowScore(false);
        setHoldPower(0);
        setAimY(0);

        const arrow = arrowRef.current;
        if (arrow) {
            arrow.style.transition = "none";
            arrow.style.transform = "translate(0,0)";
        }
    };

    const getScoreMessage = (s) => {
        if (s === 0) return "You missed it completely, try again !";
        if (s <= 4) return "Ahh, not so perfect, Try again";
        if (s <= 7) return "Good, but you can do better";
        if (s <= 9) return "Great, you are few inches away from hitting the bullseye";
        return "Excellent, you have got an eagle eye";
    };

    return (
        <div className="easy-level-container" style={{ backgroundImage: `url(${easyBg})` }}>

            <div className="easy-overlay" />

            <div className={`easy-game-layer ${isHolding ? "aim-mode" : ""}`}>

                <div className="easy-bow-wrapper">
                    <img src={bowImg} className="easy-bow" alt="bow" />
                    <img ref={arrowRef} src={arrowImg} className="easy-arrow" alt="arrow" />
                </div>

                <img ref={targetRef} src={targetImg} className="easy-target" alt="target" />

                {isHolding && (
                    <>
                        <div className="scope" style={{ transform: `translateY(${aimY}px)` }} />
                        <div className="hold-meter">
                            <div className="hold-fill" style={{ height: `${holdPower}%` }} />
                        </div>
                    </>
                )}
            </div>

            {!showScore && (
                <button
                    className="easy-shoot-btn"
                    onPointerDown={(e)=>{e.preventDefault();setIsHolding(true)}}
                    onPointerUp={(e)=>{e.preventDefault();releaseShot()}}
                    onContextMenu={(e)=>e.preventDefault()}
                >
                    <span className="shoot-main">Shoot</span>
                    <span className="shoot-sub">(Hold & Release)</span>
                </button>
            )}

            {showScore && (
                <div className="easy-popup">
                    <div className="easy-popup-box easy-score-box" style={{ backgroundImage: `url(${scoreBg})` }}>
                        <h2 className="score-title">Your Score : {score}</h2>
                        <p className="score-message">{getScoreMessage(score)}</p>

                        <div className="easy-popup-buttons">
                            <button className="score-btn play-again" onClick={() => { closeScore(); goToDifficulty(); }}>Play Again</button>
                            <button className="score-btn main-menu" onClick={() => { closeScore(); goToMain(); }}>Main Screen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
