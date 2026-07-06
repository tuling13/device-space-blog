function CuteAvatar({ isTypingEmail = false, isTypingPassword = false, className = '' }) {
  const eyeOffset = isTypingEmail && !isTypingPassword ? 5 : 0

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 220 260"
        className="h-56 w-56 animate-float drop-shadow-xl sm:h-72 sm:w-72"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 阴影 */}
        <ellipse cx="110" cy="245" rx="55" ry="8" fill="#cbd5e1" opacity="0.5" />

        {/* 身体 */}
        <ellipse cx="110" cy="205" rx="48" ry="42" fill="#fbbf24" />

        {/* 头 */}
        <circle cx="110" cy="115" r="72" fill="#fde68a" />

        {/* 耳朵 */}
        <circle cx="48" cy="75" r="20" fill="#fde68a" />
        <circle cx="172" cy="75" r="20" fill="#fde68a" />
        <circle cx="48" cy="75" r="10" fill="#fbbf24" opacity="0.6" />
        <circle cx="172" cy="75" r="10" fill="#fbbf24" opacity="0.6" />

        {/* 腮红 */}
        <circle cx="58" cy="130" r="9" fill="#fca5a5" opacity="0.6" />
        <circle cx="162" cy="130" r="9" fill="#fca5a5" opacity="0.6" />

        {/* 眼睛：正常或看输入框 */}
        <g className={`transition-opacity duration-300 ${isTypingPassword ? 'opacity-0' : 'opacity-100'}`}>
          <circle cx="82" cy="110" r="15" fill="white" />
          <circle cx="138" cy="110" r="15" fill="white" />
          <circle
            cx={82 + eyeOffset}
            cy="110"
            r="7"
            fill="#1e293b"
            className="transition-all duration-200"
          />
          <circle
            cx={138 + eyeOffset}
            cy="110"
            r="7"
            fill="#1e293b"
            className="transition-all duration-200"
          />
        </g>

        {/* 眼睛：捂眼时变成弯弯的笑眼 */}
        <g className={`transition-opacity duration-300 ${isTypingPassword ? 'opacity-100' : 'opacity-0'}`}>
          <path d="M 70 112 Q 82 120 94 112" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 126 112 Q 138 120 150 112" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>

        {/* 嘴巴 */}
        <path
          d={isTypingPassword ? 'M 95 150 Q 110 142 125 150' : 'M 95 148 Q 110 160 125 148'}
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* 手臂：自然垂下 */}
        <g className={`transition-all duration-300 ${isTypingPassword ? 'opacity-0' : 'opacity-100'}`}>
          <path d="M 70 195 Q 50 215 45 240" stroke="#f59e0b" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M 150 195 Q 170 215 175 240" stroke="#f59e0b" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>

        {/* 手臂：抬起捂眼 */}
        <g className={`transition-all duration-300 ${isTypingPassword ? 'opacity-100' : 'opacity-0'}`}>
          <path d="M 68 195 Q 52 165 60 132" stroke="#f59e0b" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M 152 195 Q 168 165 160 132" stroke="#f59e0b" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>

        {/* 手掌：捂眼小手 */}
        <g className={`transition-all duration-300 ${isTypingPassword ? 'opacity-100' : 'opacity-0'}`}>
          <g transform="translate(64, 128) rotate(-25)">
            <ellipse cx="0" cy="0" rx="15" ry="18" fill="#fbbf24" />
            <ellipse cx="-7" cy="-12" rx="5" ry="9" fill="#fbbf24" transform="rotate(-20)" />
            <ellipse cx="0" cy="-15" rx="5" ry="10" fill="#fbbf24" />
            <ellipse cx="7" cy="-12" rx="5" ry="9" fill="#fbbf24" transform="rotate(20)" />
          </g>
          <g transform="translate(156, 128) rotate(25)">
            <ellipse cx="0" cy="0" rx="15" ry="18" fill="#fbbf24" />
            <ellipse cx="7" cy="-12" rx="5" ry="9" fill="#fbbf24" transform="rotate(20)" />
            <ellipse cx="0" cy="-15" rx="5" ry="10" fill="#fbbf24" />
            <ellipse cx="-7" cy="-12" rx="5" ry="9" fill="#fbbf24" transform="rotate(-20)" />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default CuteAvatar
