// Watercolour wash plus a large translucent layer for Klimt's "The Kiss".
// Drop the painting at /public/art/the-kiss.jpg; until then a gold mosaic stands in.
export default function Backdrop() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="wash" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={11} />
            <feDisplacementMap in="SourceGraphic" scale={110} />
            <feGaussianBlur stdDeviation={26} />
          </filter>
        </defs>
        <g filter="url(#wash)" opacity={0.6}>
          <ellipse cx="180" cy="200" rx="430" ry="260" fill="#B7BE93" />
          <ellipse cx="1260" cy="150" rx="380" ry="230" fill="#E1C38C" />
          <ellipse cx="760" cy="520" rx="360" ry="200" fill="#E6CDB0" />
          <ellipse cx="1240" cy="820" rx="420" ry="260" fill="#C9A48A" />
          <ellipse cx="220" cy="860" rx="400" ry="260" fill="#A9B28A" />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "4vh",
          width: "min(1100px, 92vw)",
          height: "92vh",
          transform: "translateX(-50%)",
          opacity: 0.22,
          borderRadius: 6,
          backgroundColor: "#B88A2E",
          backgroundImage: [
            "url(/art/the-kiss.jpg)",
            "radial-gradient(circle at 50% 50%, #1c1a12 0 4px, transparent 4.5px)",
            "radial-gradient(circle at 50% 50%, #E9C877 0 10px, #8B5E1A 10.5px 13px, transparent 13.5px)",
            "linear-gradient(135deg, #D9AE4E 0%, #9C6B1E 35%, #E4BE62 55%, #7E5216 80%, #C99A3A 100%)",
          ].join(","),
          backgroundSize: "cover, 68px 68px, 44px 44px, 100% 100%",
          backgroundPosition: "center top, 0 0, 22px 22px, 0 0",
          backgroundRepeat: "no-repeat, repeat, repeat, no-repeat",
        }}
      />
    </div>
  );
}
