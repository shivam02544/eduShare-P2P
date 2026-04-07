"use client";
import { useEffect } from "react";

export default function MouseEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // ── 1. Particle trail ──
    const canvas = document.createElement("canvas");
    canvas.style.cssText = `
      position:fixed;top:0;left:0;
      width:100%;height:100%;
      pointer-events:none;z-index:9999;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#7c6af7", "#a78bfa", "#c4b5fd", "#f59e0b", "#34d399"];
    const particles = [];
    let lastX = 0, lastY = 0;

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 2.5 + 0.5;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2 - 0.4;
        this.alpha = 0.6;
        this.decay = Math.random() * 0.018 + 0.012;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.025;
        this.alpha -= this.decay;
        this.size *= 0.975;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onMouseMove = (e) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 10) {
        const count = Math.min(2, Math.floor(dist / 12));
        for (let i = 0; i < count; i++) particles.push(new Particle(e.clientX, e.clientY));
        lastX = e.clientX; lastY = e.clientY;
      }
    };
    document.addEventListener("mousemove", onMouseMove);

    // ── 2. Magnetic buttons ──
    const magneticEls = [];
    const setupMagnetic = () => {
      document.querySelectorAll(".btn-primary, .btn-accent").forEach((el) => {
        if (el.dataset.magnetic) return;
        el.dataset.magnetic = "1";
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
          el.style.transform = `translate(${dx}px,${dy}px)`;
          el.style.transition = "transform 0.1s ease";
        };
        const onLeave = () => {
          el.style.transform = "";
          el.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        magneticEls.push({ el, onMove, onLeave });
      });
    };
    setupMagnetic();
    const obs = new MutationObserver(setupMagnetic);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
      canvas.remove();
      obs.disconnect();
      magneticEls.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return null;
}
