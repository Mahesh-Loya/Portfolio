"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ShaderField — the hero background.
 *
 * Concept: "noisy reality → structured action". A field of strands begins as
 * incoherent noise and, over ~2.5s, resolves into a single clean horizontal
 * waveform which then breathes. Lime appears only at the resolved crest.
 *
 * Raw WebGL2, no libraries. Falls back to a deliberate static dithered
 * gradient when WebGL2 is unavailable or reduced motion is requested.
 */

type RGB = [number, number, number];

const RESOLVE_MS = 2500;

const VERT_SRC = `#version 300 es
void main() {
  // Fullscreen triangle from gl_VertexID — no attribute buffers needed.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  u_res;
uniform float u_time;     // seconds, excludes paused periods
uniform float u_resolve;  // 0 = pure noise, 1 = resolved waveform
uniform vec3  u_bg;
uniform vec3  u_ink;
uniform vec3  u_accent;
uniform float u_gain;     // theme-dependent ink strength

/* ---- simplex noise (2D) ------------------------------------------------ */
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float amp = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 5; i++) {
    sum += amp * snoise(p);
    p = p * 2.03 + 11.7;
    amp *= 0.5;
  }
  return sum;
}

/* ---- main -------------------------------------------------------------- */
void main() {
  vec2  frag   = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2  p      = vec2((frag.x - 0.5) * aspect, frag.y - 0.5);

  float r = u_resolve;
  float t = u_time;

  // Slow breath once the field has settled.
  float breathe = sin(t * 0.42) * 0.5 + 0.5;

  /* The ordered signal: three harmonics, nothing more. */
  float wave = sin(p.x *  3.10 + t * 0.55) * 0.055
             + sin(p.x *  6.70 - t * 0.37) * 0.028
             + sin(p.x * 12.30 + t * 0.21) * 0.012;
  wave *= 0.84 + 0.16 * breathe;
  wave *= smoothstep(0.0, 0.30, aspect * 0.5 - abs(p.x));

  /* The disordered field. */
  float chaos = fbm(vec2(p.x * 2.20, p.y * 2.20 + t * 0.055)) * 0.40
              + fbm(vec2(p.x * 1.05 - t * 0.035, p.y * 1.40 + 3.3)) * 0.22;

  float disp = mix(chaos, wave, r);

  /* Strands: contour lines through the displaced field. */
  float density = 26.0;
  float coord   = (p.y - disp) * density;
  float d       = abs(fract(coord) - 0.5) * 2.0;
  float aa      = clamp(fwidth(coord) * 2.0, 0.008, 1.6);
  float strand  = 1.0 - smoothstep(0.20, 0.20 + aa, d);
  // Dissolve rather than alias where strands pack tighter than the pixel grid.
  strand *= smoothstep(1.5, 0.45, aa);

  /* Envelope: the field collapses onto the waveform as it resolves. */
  float bandW = mix(0.95, 0.105 + 0.014 * breathe, r);
  float dy    = p.y - mix(0.0, wave, r);
  float env   = exp(-pow(abs(dy) / bandW, 2.2));

  /* The bright core line, only once resolved. */
  float core = exp(-pow(abs(p.y - wave) / 0.016, 2.0)) * r;

  /* Lime is earned: crest of the resolved waveform, close to the line. */
  float crest = clamp(wave / 0.095, -1.0, 1.0);
  float lime  = smoothstep(0.30, 0.95, crest) * r;
  lime *= exp(-pow(abs(p.y - wave) / 0.050, 2.0));

  float ink = strand * env;

  vec3 col = mix(u_bg, u_ink, ink * mix(0.24, 0.38, r) * u_gain);
  col = mix(col, u_ink, core * 0.30 * u_gain);
  col = mix(col, u_accent, clamp(lime * (ink * 0.55 + core * 1.05), 0.0, 1.0) * 0.9);

  /* Vignette toward the page ground — a mix, never a multiply (light-safe). */
  float vig = smoothstep(1.30, 0.20, length(vec2(p.x / max(aspect, 0.001), p.y)) * 1.55);
  col = mix(u_bg, col, 0.25 + 0.75 * vig);

  /* Hash dither kills 8-bit banding in the falloff. */
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  outColor = vec4(col, 1.0);
}`;

function hexToRgb(raw: string, fallback: RGB): RGB {
  const match = /^#?([0-9a-f]{6})$/i.exec(raw.trim());
  if (!match) return fallback;
  const n = parseInt(match[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readToken(name: string, fallback: RGB): RGB {
  return hexToRgb(
    getComputedStyle(document.documentElement).getPropertyValue(name),
    fallback,
  );
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function buildProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function ShaderField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }
    if (!gl) return;

    const ctx = gl;

    let program: WebGLProgram | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uResolve: WebGLUniformLocation | null = null;
    let uBg: WebGLUniformLocation | null = null;
    let uInk: WebGLUniformLocation | null = null;
    let uAccent: WebGLUniformLocation | null = null;
    let uGain: WebGLUniformLocation | null = null;

    let bg: RGB = [0.039, 0.039, 0.043];
    let ink: RGB = [0.929, 0.929, 0.91];
    let accent: RGB = [0.776, 0.949, 0.306];
    let gain = 1;

    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let running = false;
    let visible = true;
    let lost = false;
    let disposed = false;

    const syncTheme = () => {
      bg = readToken("--color-void", bg);
      ink = readToken("--color-bone", ink);
      accent = readToken("--color-signal", accent);
      // Dark ink on a light ground reads much heavier — pull it back.
      gain = document.documentElement.dataset.theme === "light" ? 0.5 : 1;
      ctx.clearColor(bg[0], bg[1], bg[2], 1);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      ctx.viewport(0, 0, w, h);
    };

    const draw = () => {
      if (!program) return;
      ctx.viewport(0, 0, canvas.width, canvas.height);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.useProgram(program);
      ctx.uniform2f(uRes, canvas.width, canvas.height);
      ctx.uniform1f(uTime, elapsed / 1000);
      const linear = Math.min(elapsed / RESOLVE_MS, 1);
      ctx.uniform1f(uResolve, 1 - Math.pow(1 - linear, 3));
      ctx.uniform3f(uBg, bg[0], bg[1], bg[2]);
      ctx.uniform3f(uInk, ink[0], ink[1], ink[2]);
      ctx.uniform3f(uAccent, accent[0], accent[1], accent[2]);
      ctx.uniform1f(uGain, gain);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      if (disposed || lost) return;
      if (last === 0) last = now;
      // Clamped so a backgrounded tab never fast-forwards the resolve.
      elapsed += Math.min(now - last, 50);
      last = now;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || disposed || lost || !program) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const init = (): boolean => {
      program = buildProgram(ctx);
      if (!program) return false;
      uRes = ctx.getUniformLocation(program, "u_res");
      uTime = ctx.getUniformLocation(program, "u_time");
      uResolve = ctx.getUniformLocation(program, "u_resolve");
      uBg = ctx.getUniformLocation(program, "u_bg");
      uInk = ctx.getUniformLocation(program, "u_ink");
      uAccent = ctx.getUniformLocation(program, "u_accent");
      uGain = ctx.getUniformLocation(program, "u_gain");
      syncTheme();
      canvas.width = 0; // force the next resize() to take
      resize();
      return true;
    };

    if (!init()) return;
    setLive(true);

    /* ---- context loss --------------------------------------------------- */
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      stop();
      program = null;
    };

    const onRestored = () => {
      lost = false;
      if (disposed) return;
      if (!init()) return;
      if (visible) start();
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    /* ---- resize --------------------------------------------------------- */
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(canvas);

    /* ---- pause when offscreen ------------------------------------------- */
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ---- theme flips ----------------------------------------------------- */
    const themeObserver = new MutationObserver(() => {
      if (lost || disposed) return;
      syncTheme();
      if (!running) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    start();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (program) ctx.deleteProgram(program);
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  const mask =
    "radial-gradient(ellipse 88% 26% at 50% 56%, #000 8%, rgba(0,0,0,0.35) 45%, transparent 80%)";

  return (
    <div className={className} aria-hidden="true">
      {/* Static fallback — also the ground under the canvas and during context loss. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 65% at 50% 56%, color-mix(in oklab, var(--color-signal) 6%, transparent) 0%, transparent 60%)," +
            "radial-gradient(ellipse 100% 95% at 50% 45%, var(--color-surface) 0%, var(--color-void) 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--color-line-bright) 0px, var(--color-line-bright) 1px, transparent 1px, transparent 9px)",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      {/* Ordered dither — texture, not gradient. */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-conic-gradient(var(--color-line-bright) 0% 25%, transparent 0% 50%)",
          backgroundSize: "3px 3px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <div
        className="absolute inset-x-0 h-px opacity-50"
        style={{
          top: "56%",
          background:
            "linear-gradient(to right, transparent, var(--color-signal) 45%, var(--color-signal) 55%, transparent)",
        }}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
          live ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
