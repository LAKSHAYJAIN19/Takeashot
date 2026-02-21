import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SettingsModal({
                                          onClose,
                                          musicEnabled,
                                          setMusicEnabled,
                                          soundEnabled,
                                          setSoundEnabled
                                      }) {
    const modalRef = useRef(null);
    const backdropRef = useRef(null);

    // 🎬 Open Animation
    useEffect(() => {
        gsap.fromTo(
            modalRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" }
        );
    }, []);

    // ❌ Close on ESC
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") handleClose();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // 🎬 Close Animation
    const handleClose = () => {
        gsap.to(modalRef.current, {
            scale: 0.8,
            opacity: 0,
            duration: 0.25,
            ease: "power3.in",
            onComplete: onClose
        });
    };

    // Click outside to close
    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) {
            handleClose();
        }
    };

    return (
        <div
            className="modal-backdrop"
            ref={backdropRef}
            onClick={handleBackdropClick}
        >
            <div className="modal glass" ref={modalRef}>
                <h2>Settings</h2>

                {/* 🎵 Game Music Toggle */}
                <div className="toggle-row">
                    <span>Game Music</span>
                    <input
                        type="checkbox"
                        checked={musicEnabled}
                        onChange={() =>
                            setMusicEnabled(prev => !prev)
                        }
                    />
                </div>

                {/* 🔊 Sound Effects Toggle */}
                <div className="toggle-row">
                    <span>Sound Effects</span>
                    <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={() =>
                            setSoundEnabled(prev => !prev)
                        }
                    />
                </div>

                <button
                    className="glow-btn small"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
