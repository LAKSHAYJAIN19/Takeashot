import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ExitModal({ onClose }) {
    const modalRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            modalRef.current,
            { scale: 0.7, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4 }
        );
    }, []);

    return (
        <div className="modal-backdrop">
            <div className="modal glass" ref={modalRef}>
                <h2>Are you sure you want to exit?</h2>

                <div className="exit-buttons">
                    <button className="danger-btn" onClick={() => window.close()}>
                        Yes
                    </button>

                    <button className="glow-btn small" onClick={onClose}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
