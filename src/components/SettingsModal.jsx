import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function SettingsModal({ onClose }) {
    const modalRef = useRef(null);
    const [music, setMusic] = useState(true);
    const [sound, setSound] = useState(true);

    useEffect(() => {
        gsap.fromTo(
            modalRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4 }
        );
    }, []);

    return (
        <div className="modal-backdrop">
            <div className="modal glass" ref={modalRef}>
                <h2>Settings</h2>

                <div className="toggle-row">
                    <span>Music</span>
                    <input
                        type="checkbox"
                        checked={music}
                        onChange={() => setMusic(!music)}
                    />
                </div>

                <div className="toggle-row">
                    <span>Sound Effects</span>
                    <input
                        type="checkbox"
                        checked={sound}
                        onChange={() => setSound(!sound)}
                    />
                </div>

                <button className="glow-btn small" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}
