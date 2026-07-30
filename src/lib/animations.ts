export const easings = {
  expoOut: [0.16, 1, 0.3, 1] as const,
  power2InOut: "power2.inOut", // For GSAP
};

export const durations = {
  fast: 0.2,   // 200ms
  base: 0.4,   // 400ms
  slow: 0.7,   // 700ms
  verySlow: 2.5 // 2.5s for breathing/idle animations
};

export const pageTransitions = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { 
      duration: durations.base, 
      ease: easings.expoOut 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    filter: "blur(4px)",
    transition: { 
      duration: durations.fast, 
      ease: easings.expoOut 
    }
  }
};

export const microInteractions = {
  hover: { scale: 1.02 },
  tap: { scale: 0.97 }
};
