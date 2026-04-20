import { useEffect, useState } from "react";
import "./App.css";

import bgImage from "./assets/bg.png";
import image1 from "./assets/1.png";
import image2 from "./assets/2.png";
import { aboutLinks } from "./content";

const letters = ["F", "A", "S", "M", "W"];
const glitchGlyphs = ["士", "義", "力", "切", "魂"];
const SWAP_OUT_DURATION = 220;
const SWAP_IN_DURATION = 240;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function useViewportSize() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return viewport;
}

function createGlitchData(displayChar, variant, strength = "normal") {
  return {
    active: true,
    leaving: false,
    variant,
    strength,
    displayChar,
    dxTop: `${Math.round(randomRange(-12, 12))}px`,
    dyTop: `${Math.round(randomRange(-4, 4))}px`,
    dxBottom: `${Math.round(randomRange(-12, 12))}px`,
    dyBottom: `${Math.round(randomRange(-4, 4))}px`,
    skew: `${randomRange(-4, 4).toFixed(2)}deg`,
    topStart: `${Math.round(randomRange(6, 16))}%`,
    topEnd: `${Math.round(randomRange(30, 40))}%`,
    bottomStart: `${Math.round(randomRange(60, 70))}%`,
    bottomEnd: `${Math.round(randomRange(84, 94))}%`,
  };
}

function createSwapData(fromChar, toChar, variant, strength = "normal") {
  return {
    ...createGlitchData(toChar, variant, strength),
    fromChar,
    toChar,
  };
}

export default function App() {
  const [glitchEnabled, setGlitchEnabled] = useState(false);
  const [glitches, setGlitches] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);

  const viewport = useViewportSize();
  const isCompactHero = viewport.width <= 768 || viewport.height <= 760;

  useEffect(() => {
    const glitchStartTimer = setTimeout(() => {
      setGlitchEnabled(true);
    }, 2900);

    return () => {
      clearTimeout(glitchStartTimer);
    };
  }, []);

  useEffect(() => {
    if (!glitchEnabled) return undefined;

    const timers = new Set();
    let glyphSwapLocked = false;

    const queueTimer = (fn, delay) => {
      const timer = setTimeout(fn, delay);
      timers.add(timer);
      return timer;
    };

    const scheduleGlitch = (index) => {
      const nextDelay = randomRange(2200, 7000);

      queueTimer(() => {
        const strength = Math.random() < 0.75 ? "normal" : "strong";
        const showAlternateGlyph = !glyphSwapLocked && Math.random() < 0.12;

        if (!showAlternateGlyph) {
          setGlitches((prev) => ({
            ...prev,
            [index]: createGlitchData(letters[index], "latin", strength),
          }));

          queueTimer(() => {
            setGlitches((prev) => ({
              ...prev,
              [index]: null,
            }));

            scheduleGlitch(index);
          }, strength === "strong" ? randomRange(180, 300) : randomRange(120, 220));

          return;
        }

        const glyph = glitchGlyphs[Math.floor(Math.random() * glitchGlyphs.length)];
        const holdDuration = 50;
        glyphSwapLocked = true;

        setGlitches((prev) => ({
          ...prev,
          [index]: createSwapData(letters[index], glyph, "swap-to-glyph", "normal"),
        }));

        queueTimer(() => {
          setGlitches((prev) => ({
            ...prev,
            [index]: createGlitchData(glyph, "glyph", "normal"),
          }));
        }, Math.max(SWAP_OUT_DURATION, SWAP_IN_DURATION));

        queueTimer(() => {
          setGlitches((prev) => ({
            ...prev,
            [index]: createSwapData(glyph, letters[index], "swap-to-latin", strength),
          }));
        }, Math.max(SWAP_OUT_DURATION, SWAP_IN_DURATION) + holdDuration);

        queueTimer(() => {
          setGlitches((prev) => ({
            ...prev,
            [index]: null,
          }));

          glyphSwapLocked = false;
          scheduleGlitch(index);
        }, Math.max(SWAP_OUT_DURATION, SWAP_IN_DURATION) * 2 + holdDuration);
      }, nextDelay);
    };

    letters.forEach((_, index) => scheduleGlitch(index));

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [glitchEnabled]);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight;
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heroStyle = {
    transform: `translateY(${scrollProgress * (isCompactHero ? -70 : -160)}px) scale(${
      1 - scrollProgress * (isCompactHero ? 0.04 : 0.1)
    })`,
    opacity: clamp(1 - scrollProgress * (isCompactHero ? 0.55 : 1.1), 0, 1),
    filter: `blur(${scrollProgress * (isCompactHero ? 4 : 8)}px)`,
  };

  return (
    <div className="page">
      <section className={`hero-section ${isCompactHero ? "is-compact" : ""}`}>
        <div className="scene-viewport">
          <div className="hero-backdrop" aria-hidden="true">
            <img src={bgImage} alt="" className="bg-image" />
            <div className="bg-fog fog-1" />
            <div className="bg-fog fog-2" />
            <div className="bg-light" />
          </div>

          <div className="hero-animated" style={heroStyle}>
            <div className={`hero-layout ${isCompactHero ? "is-compact" : ""}`}>
              <img src={image1} alt="" className="center-image" />

              <div className="vertical-text">
                {letters.map((letter, index) => {
                  const glitch = glitches[index];

                  const style = glitch
                    ? {
                        "--dx-top": glitch.dxTop,
                        "--dy-top": glitch.dyTop,
                        "--dx-bottom": glitch.dxBottom,
                        "--dy-bottom": glitch.dyBottom,
                        "--skew": glitch.skew,
                        "--top-start": glitch.topStart,
                        "--top-end": glitch.topEnd,
                        "--bottom-start": glitch.bottomStart,
                        "--bottom-end": glitch.bottomEnd,
                      }
                    : undefined;

                  if (glitch?.variant === "swap-to-glyph" || glitch?.variant === "swap-to-latin") {
                    const incomingClass =
                      glitch.variant === "swap-to-latin"
                        ? `glyph-face incoming is-latin-swap ${glitch.strength}`
                        : "glyph-face incoming is-glyph-swap";

                    return (
                      <span
                        key={index}
                        style={style}
                        className="glitch-letter is-symbol-swap-stack"
                      >
                        <span className="glyph-face outgoing" aria-hidden="true">
                          {glitch.fromChar}
                        </span>
                        <span className={incomingClass}>{glitch.toChar}</span>
                      </span>
                    );
                  }

                  let glitchClass = "";

                  if (glitch?.active && glitch?.variant !== "glyph") {
                    glitchClass = `is-glitch ${glitch.strength}`;
                  }

                  return (
                    <span
                      key={index}
                      data-text={glitch?.displayChar ?? letter}
                      style={style}
                      className={`glitch-letter ${glitchClass}`}
                    >
                      {glitch?.displayChar ?? letter}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" aria-label="About me">
        <div className="about-shell">
          <div className="about-copy">
            <p className="about-label">ABOUT</p>
            <h2 className="about-title">FASMW</h2>

            <div className="about-links">
              {aboutLinks.map((link) => (
                <a
                  key={link.name}
                  className="about-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="about-link-name">{link.name}</span>
                  <span className="about-link-value">{link.value}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="about-visual">
            <div className="about-scene">
              <img src={image2} alt="" className="about-image" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
