import React from 'react';

interface Kill2WinLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function Kill2WinLogo({ className = "", size = 48, showText = true }: Kill2WinLogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Cool Interactive SVG Ninja Mascot Logo with Orange/Black theme */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_12px_rgba(249,115,22,0.35)] hover:scale-105 transition duration-300"
      >
        {/* Outer Circular Ring with Metal and Orange accents */}
        <circle cx="256" cy="256" r="240" fill="#09090b" stroke="#1f2937" strokeWidth="8" />
        <circle cx="256" cy="256" r="226" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="30 15 10 15" className="animate-[spin_120s_linear_infinite]" />
        
        {/* Shield background */}
        <path
          d="M120 180 C120 120, 201 100, 256 70 C311 100, 392 120, 392 180 C392 290, 311 370, 256 422 C201 370, 120 290, 120 180 Z"
          fill="#111827"
          stroke="#4b5563"
          strokeWidth="6"
        />
        
        {/* Shield Inner Orange Border */}
        <path
          d="M136 185 C136 135, 208 116, 256 88 C304 116, 376 135, 376 185 C376 278, 304 348, 256 394 C208 348, 136 278, 136 185 Z"
          fill="none"
          stroke="#ea580c"
          strokeWidth="3"
        />
        
        {/* Katana Handle showing over the shoulder */}
        <g transform="translate(145, 140) rotate(-45)">
          {/* Katana grip guard */}
          <rect x="-10" y="0" width="36" height="8" rx="4" fill="#ea580c" stroke="#1e293b" strokeWidth="2" />
          {/* Katana hilt wrapped */}
          <rect x="-2" y="-35" width="20" height="35" rx="3" fill="#18181b" stroke="#4b5563" strokeWidth="2" />
          {/* Hilt gold accents */}
          <path d="M-2 -30 L18 -26 M-2 -20 L18 -16 M-2 -10 L18 -6" stroke="#f97316" strokeWidth="3" />
        </g>

        {/* Ninja Head outline */}
        <path
          d="M180 250 C180 180, 210 150, 256 150 C302 150, 332 180, 332 250 C332 300, 320 330, 290 350 L256 370 L222 350 C192 330, 180 300, 180 250 Z"
          fill="#18181b"
          stroke="#374151"
          strokeWidth="6"
        />

        {/* Headband wrap */}
        <path
          d="M182 205 C210 195, 240 190, 256 190 C272 190, 302 195, 330 205 L328 238 C300 228, 272 224, 256 224 C240 224, 212 228, 184 238 Z"
          fill="#111827"
          stroke="#ea580c"
          strokeWidth="3"
        />
        
        {/* Headband metal plate */}
        <path
          d="M216 204 C234 199, 250 198, 256 198 C262 198, 278 199, 296 204 L294 226 C276 221, 262 220, 256 220 C250 220, 236 221, 218 226 Z"
          fill="#4b5563"
          stroke="#9ca3af"
          strokeWidth="2"
        />
        
        {/* Lightning logo on metal plate */}
        <path
          d="M258 203 L246 214 H254 L250 223 L262 212 H254 L258 203 Z"
          fill="#ea580c"
          className="animate-pulse"
        />

        {/* Glowing Orange Eyes */}
        {/* Left eye */}
        <path
          d="M205 242 C208 235, 218 235, 230 238 C232 244, 222 249, 210 248 Z"
          fill="#f97316"
          filter="drop-shadow(0 0 6px #ea580c)"
        />
        <circle cx="218" cy="243" r="3" fill="#ffffff" />
        
        {/* Right eye */}
        <path
          d="M307 242 C304 235, 294 235, 282 238 C280 244, 290 249, 302 248 Z"
          fill="#f97316"
          filter="drop-shadow(0 0 6px #ea580c)"
        />
        <circle cx="294" cy="243" r="3" fill="#ffffff" />

        {/* High tech mouth mask */}
        <path
          d="M212 270 L256 260 L300 270 L288 335 L256 350 L224 335 Z"
          fill="#0f172a"
          stroke="#475569"
          strokeWidth="4"
        />
        
        {/* Mask breathing ports / slits */}
        <path
          d="M236 280 L236 305 M244 282 L244 315 M256 280 L256 320 M268 282 L268 315 M276 280 L276 305"
          stroke="#ea580c"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Cyber neck guard */}
        <path
          d="M220 345 L256 360 L292 345 L284 380 H228 L220 345 Z"
          fill="#0c111d"
          stroke="#ea580c"
          strokeWidth="2"
        />
        
        {/* Spark details */}
        <circle cx="95" cy="225" r="3" fill="#f97316" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="410" cy="280" r="2.5" fill="#f97316" className="animate-ping" style={{ animationDuration: '4s' }} />
        <polygon points="135,115 130,123 138,123" fill="#ea580c" />
        <polygon points="370,390 367,398 373,398" fill="#ea580c" />
      </svg>
      
      {showText && (
        <span className="font-display font-[900] tracking-tighter text-base md:text-lg flex flex-col uppercase leading-none text-left">
          <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">KILL</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 font-extrabold flex items-center gap-0.5 mt-[-1px]">
            2 <span className="text-white font-black">WIN</span>
          </span>
        </span>
      )}
    </div>
  );
}
