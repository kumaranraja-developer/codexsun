import { useEffect, useRef, useState } from "react";
import chroma from "chroma-js";


interface BallType {
  x: number;
  y: number;
  r: number;
  fill: number;
  v: { x: number; y: number };
  update: () => void;
  draw: (
    ctx: CanvasRenderingContext2D,
    palette: chroma.Scale,
    darken: number
  ) => void;
}

interface BallCanvasProps {
  ballCount: number;
}

const palets = [
  chroma.scale(["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9"]), // pastel warm
  chroma.scale(["#A0E7E5", "#B4F8C8", "#FBE7C6", "#FFAEBC"]), // fresh
  chroma.scale(["#0F2027", "#203A43", "#2C5364"]), // dark blue shades
];

const Ball = (canvas: HTMLCanvasElement): BallType => {
  const width = canvas.width;
  const height = canvas.height;
  const minR = width * 0.02;
  const maxR = width * 0.1;

  const r = Math.random() * (maxR - minR) + minR;
  const x = Math.random() * (width - r * 1) + r;
  const y = Math.random() * (height - r * 2) + r;
  const fill = Math.random();
  const v = {
    x: (Math.random() * 0.5+ 0.5) * (Math.random() < 0.5 ? -1 : 0.5),
    y: (Math.random() * 0.5 + 0.5) * (Math.random() < 0.5 ? -1 : 0.5),
  };

  return {
    x,
    y,
    r,
    fill,
    v,
    update() {
      if (this.x + this.v.x > width - this.r || this.x + this.v.x < this.r)
        this.v.x *= -1;
      if (this.y + this.v.y > height - this.r || this.y + this.v.y < this.r)
        this.v.y *= -1;
      this.x = Math.max(this.r, Math.min(this.x + this.v.x, width - this.r));
      this.y = Math.max(this.r, Math.min(this.y + this.v.y, height - this.r));
    },
    draw(ctx, palette, darken) {
      ctx.fillStyle = palette(this.fill).darken(darken).hex();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    },
  };
};

export default function BallCanvas({ ballCount }: BallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setBalls] = useState<BallType[]>([]);

  const opts = useRef({
    Darken: 0.5,
    BlendMode: true,
    Palette: 2,
  });

  // Initialize canvas and balls when ballCount changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const newBalls = Array.from({ length: ballCount }, () => Ball(canvas));
    setBalls(newBalls);

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = opts.current.BlendMode
        ? "screen"
        : "source-over";
      ctx.fillStyle = "#F7EFF6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      newBalls.forEach((ball) => {
        ball.update();
        ball.draw(ctx, palets[opts.current.Palette - 2], opts.current.Darken);
      });
      requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [ballCount]); // Re-run when prop changes

  return <canvas ref={canvasRef} className="" />;
}
