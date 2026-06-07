import { useEffect, useState } from "react";
import arcusLogo from "../assets/arcus_logo.png";

export default function SplashScreen() {
  const [hidden,   setHidden]   = useState(false);
  const [removed,  setRemoved]  = useState(false);

  useEffect(() => {
    const MIN_MS = 2200;
    const start  = Date.now();

    function dismiss() {
      const elapsed   = Date.now() - start;
      const remaining = Math.max(0, MIN_MS - elapsed);
      setTimeout(() => {
        setHidden(true);
        setTimeout(() => setRemoved(true), 450);
      }, remaining);
    }

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss);
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  if (removed) return null;

  return (
    <div className={`arcus-splash${hidden ? " arcus-splash--hidden" : ""}`}>
      <div className="arcus-splash__inner">
        <div className="arcus-splash__logo-wrap">
          <img
            src={arcusLogo}
            alt="Arcus"
            className="arcus-logo arcus-logo--splash"
          />
        </div>
        <p className="arcus-splash__wordmark">arcus</p>
        <p className="arcus-splash__tagline">Campus Companion</p>
      </div>
      <div className="arcus-splash__bar-wrap">
        <div className="arcus-splash__bar" />
      </div>
    </div>
  );
}
