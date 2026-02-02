'use client';

export default function AnimatedBackground() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      <svg
        width="200%"
        height="200%"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="login-bg-animate"
      >
        <defs>
          {/* Gradient for the glow effect */}
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8">
              <animate
                attributeName="stopOpacity"
                values="0.8;1;0.8"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3">
              <animate
                attributeName="stopOpacity"
                values="0.3;0.5;0.3"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Body fill gradient */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#141414" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#0b0b0b" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#050505" stopOpacity="1" />
          </linearGradient>

          {/* Light beam gradient */}
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Filter for outer glow */}
          <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="45" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filter for inner glow */}
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft blur for light beams */}
          <filter id="beamBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" />
          </filter>

          {/* Animated gradient for the hexagon stroke */}
          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff">
              <animate
                attributeName="stopOpacity"
                values="1;0.6;1"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#e0e0e0">
              <animate
                attributeName="stopOpacity"
                values="0.8;1;0.8"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ffffff">
              <animate
                attributeName="stopOpacity"
                values="1;0.6;1"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>

        {/* Background ambient light */}
        <ellipse
          cx="400"
          cy="560"
          rx="380"
          ry="230"
          fill="url(#glowGradient)"
          opacity="0.12"
        >
          <animate
            attributeName="opacity"
            values="0.12;0.2;0.12"
            dur="5s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Subtle background light beams */}
        <rect x="230" y="80" width="55" height="520" fill="url(#beamGradient)" opacity="0.08" filter="url(#beamBlur)" />
        <rect x="535" y="90" width="45" height="520" fill="url(#beamGradient)" opacity="0.08" filter="url(#beamBlur)" />

        {/* Main hexagon with glow */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 400 420"
            to="360 400 420"
            dur="90s"
            repeatCount="indefinite"
          />
          <polygon
            points="400,130 585,265 615,550 400,705 185,550 215,265"
            fill="url(#bodyGradient)"
          />
          <polygon
            points="400,130 585,265 615,550 400,705 185,550 215,265"
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#outerGlow)"
          >
            <animate
              attributeName="stroke-width"
              values="3;4;3"
              dur="3s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Inner hexagon for depth */}
        <g opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 400 420"
            to="0 400 420"
            dur="110s"
            repeatCount="indefinite"
          />
          <polygon
            points="400,175 545,295 570,515 400,640 230,515 255,295"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#innerGlow)"
          >
            <animate
              attributeName="opacity"
              values="0.6;0.9;0.6"
              dur="4s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Floating particles */}
        <circle cx="320" cy="325" r="2" fill="#ffffff" opacity="0.4">
          <animate
            attributeName="cy"
            values="325;270;325"
            dur="6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.8;0.4"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="485" cy="340" r="1.5" fill="#ffffff" opacity="0.3">
          <animate
            attributeName="cy"
            values="340;300;340"
            dur="7s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="350" cy="535" r="1.8" fill="#ffffff" opacity="0.35">
          <animate
            attributeName="cy"
            values="535;485;535"
            dur="8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.35;0.75;0.35"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="450" cy="440" r="1.2" fill="#ffffff" opacity="0.3">
          <animate
            attributeName="cy"
            values="440;400;440"
            dur="5.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="5.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Corner accent lights */}
        <circle cx="215" cy="265" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="585" cy="265" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="615" cy="550" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="400" cy="705" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="185" cy="550" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="400" cy="130" r="3" fill="#ffffff" opacity="0.6" filter="url(#innerGlow)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
