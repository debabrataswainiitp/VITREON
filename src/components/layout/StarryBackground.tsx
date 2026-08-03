"use client";

import { useEffect, useRef } from "react";

class Star {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  hue: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = Math.random() * 2 + 0.5;
    this.density = (Math.random() * 30) + 1;
    this.hue = Math.random() * 360;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, 0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse: { x: number; y: number; radius: number }, time: number) {
    // Slowly shift hue for the color changing effect
    this.hue = (this.hue + 0.5) % 360;

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    
    // Max distance, past that the force is 0
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;

    // Reduce the base pull strength to make it a slow, gentle attraction
    let pullStrength = 0.08; 
    let directionX = forceDirectionX * force * this.density * pullStrength;
    let directionY = forceDirectionY * force * this.density * pullStrength;

    if (distance < mouse.radius) {
      // Gentle attraction towards cursor
      this.x += directionX;
      this.y += directionY;
      
      // Add a very slight tangential (perpendicular) force so they slowly swirl 
      // around the cursor instead of merging directly into the exact center pixel
      this.x += forceDirectionY * force * 1.5;
      this.y -= forceDirectionX * force * 1.5;
    } else {
      // Natural slow drift
      this.x += Math.sin(time * 0.001 + this.baseY) * 0.2;
      this.y += Math.cos(time * 0.001 + this.baseX) * 0.2;
      
      // Return to base position softly
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 20;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 20;
      }
    }
  }
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particleArray: Star[] = [];
    let animationFrameId: number;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 250
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Normalize coordinate system to use css pixels
      ctx.scale(dpr, dpr);
      
      // Set physical display size
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      particleArray = [];
      const numberOfParticles = (window.innerWidth * window.innerHeight) / 6000;
      
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        particleArray.push(new Star(x, y));
      }
    };

    const animate = (time: number) => {
      ctx.fillStyle = "rgba(5, 5, 8, 0.2)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update(mouse, time);
        particleArray[i].draw(ctx);
      }
      
      connect(ctx, particleArray);

      animationFrameId = requestAnimationFrame(animate);
    };
    
    const connect = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
      for (let a = 0; a < stars.length; a++) {
        for (let b = a; b < stars.length; b++) {
          let dx = stars[a].x - stars[b].x;
          let dy = stars[a].y - stars[b].y;
          let distance = dx * dx + dy * dy;
          
          if (distance < 6000) { // Increased connection distance
            let opacityValue = 1 - (distance / 6000);
            ctx.strokeStyle = `rgba(0, 255, 255, ${opacityValue * 0.5})`; // Neon cyan glow
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(stars[a].x, stars[a].y);
            ctx.lineTo(stars[b].x, stars[b].y);
            ctx.stroke();
            
            // Add extra glow for very close connections
            if (distance < 2000) {
                ctx.strokeStyle = `rgba(167, 139, 250, ${opacityValue * 0.8})`; // Purple inner neon
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
          }
        }
      }
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener("resize", handleResize);

    init();
    animate(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050508]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Dark overlay to make text pop, REMOVED blur to keep stars high-res */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,8,0.9)_100%)]" />
    </div>
  );
}
