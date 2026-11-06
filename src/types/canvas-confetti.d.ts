declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flat?: boolean;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  type CreateTypes = (options?: Options) => Promise<null> | null;

  interface GlobalConfetti extends CreateTypes {
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean }) => CreateTypes;
  }

  const confetti: GlobalConfetti;
  export default confetti;
}
