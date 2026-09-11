const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

export function IconHome(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconMeals(props) {
  return (
    <svg {...common} {...props}>
      <path d="M7 3v7a2 2 0 0 0 2 2v9" />
      <path d="M7 3v5M11 3v5" />
      <path d="M17 3c-1.5 0-2.5 1.5-2.5 4s1 4 2.5 5v9" />
    </svg>
  );
}

export function IconWeight(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15a4 4 0 0 1 6 0" />
      <circle cx="12" cy="10" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPhoto(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

export function IconGym(props) {
  return (
    <svg {...common} {...props}>
      <path d="M2 12h2M20 12h2" />
      <path d="M6 8v8M18 8v8" />
      <path d="M6 12h12" />
      <rect x="3.5" y="9.5" width="2.5" height="5" fill="currentColor" stroke="none" />
      <rect x="18" y="9.5" width="2.5" height="5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.38.68.7.92.32.24.7.38 1.1.38H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconFire(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 1.5 1 3 3.5 3 6a6 6 0 0 1-12 0c0-4 2-6 4-10Z" />
    </svg>
  );
}

export function IconCardio(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

export function IconCamera(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

export function IconScale(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15a4 4 0 0 1 6 0" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
