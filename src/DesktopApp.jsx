import { useEffect, useMemo, useState } from "react"
import "./App.css"

import bgImage from "./assets/bg.png"
import image1 from "./assets/1.png"
import image2 from "./assets/2.png"

import leaf1 from "./assets/leaf1.png"
import leaf2 from "./assets/leaf2.png"
import leaf3 from "./assets/leaf3.png"
import leaf4 from "./assets/leaf4.png"
import leaf5 from "./assets/leaf5.png"

import { aboutLinks, letters } from "./content"

const leafImages = [leaf1, leaf2, leaf3, leaf4, leaf5]

function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function createLeaves(count = 20) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    src: leafImages[Math.floor(Math.random() * leafImages.length)],
    left: `${randomRange(8, 78).toFixed(2)}%`,
    top: `${randomRange(28, 48).toFixed(2)}%`,
    drift: `${randomRange(-140, 180).toFixed(0)}px`,
    duration: `${randomRange(14, 24).toFixed(2)}s`,
    delay: `${randomRange(-24, 0).toFixed(2)}s`,
    size: `${randomRange(24, 52).toFixed(0)}px`,
    opacity: randomRange(0.68, 0.96).toFixed(2),
    rotateEnd: `${Math.round(randomRange(220, 760))}deg`,
  }))
}

export default function DesktopApp() {
  const [showLetters, setShowLetters] = useState(false)
  const [glitchEnabled, setGlitchEnabled] = useState(false)
  const [glitches, setGlitches] = useState({})
  const [scrollProgress, setScrollProgress] = useState(0)

  const fallingLeaves = useMemo(() => createLeaves(20), [])

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setShowLetters(true)
    }, 1400)

    const glitchStartTimer = setTimeout(() => {
      setGlitchEnabled(true)
    }, 2900)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(glitchStartTimer)
    }
  }, [])

  useEffect(() => {
    if (!glitchEnabled) return

    const timers = new Set()

    const scheduleGlitch = (index) => {
      const nextDelay = randomRange(2200, 7000)

      const startTimer = setTimeout(() => {
        const strength = Math.random() < 0.75 ? "normal" : "strong"

        const glitchData = {
          active: true,
          strength,
          dxTop: Math.round(randomRange(-16, 16)),
          dyTop: Math.round(randomRange(-5, 5)),
          dxBottom: Math.round(randomRange(-16, 16)),
          dyBottom: Math.round(randomRange(-5, 5)),
          skew: `${randomRange(-6, 6).toFixed(2)}deg`,
          topStart: `${Math.round(randomRange(4, 18))}%`,
          topEnd: `${Math.round(randomRange(28, 42))}%`,
          bottomStart: `${Math.round(randomRange(58, 72))}%`,
          bottomEnd: `${Math.round(randomRange(82, 96))}%`,
        }

        setGlitches((prev) => ({
          ...prev,
          [index]: glitchData,
        }))

        const stopTimer = setTimeout(() => {
          setGlitches((prev) => ({
            ...prev,
            [index]: null,
          }))

          scheduleGlitch(index)
        }, strength === "strong" ? randomRange(180, 300) : randomRange(120, 220))

        timers.add(stopTimer)
      }, nextDelay)

      timers.add(startTimer)
    }

    letters.forEach((_, index) => scheduleGlitch(index))

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [glitchEnabled])

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight
      const progress = clamp(window.scrollY / maxScroll, 0, 1)
      setScrollProgress(progress)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const heroStyle = {
    transform: `translateY(${scrollProgress * -160}px) scale(${1 - scrollProgress * 0.1})`,
    opacity: clamp(1 - scrollProgress * 1.1, 0, 1),
    filter: `blur(${scrollProgress * 8}px)`,
  }

  return (
    <div className="page">
      <section className="hero-section">
        <div className="container">
          <div className="image-wrapper hero-animated" style={heroStyle}>
            <div className="bg-layer">
              <img src={bgImage} alt="" className="bg-image" />
              <div className="bg-fog fog-1" />
              <div className="bg-fog fog-2" />
              <div className="bg-light" />
            </div>

            <img src={image1} alt="Картинка" className="center-image" />

            <div className={`vertical-text ${showLetters ? "reveal" : ""}`}>
              {letters.map((letter, index) => {
                const glitch = glitches[index]

                const style = glitch
                  ? {
                      "--dx-top": `${glitch.dxTop}px`,
                      "--dy-top": `${glitch.dyTop}px`,
                      "--dx-bottom": `${glitch.dxBottom}px`,
                      "--dy-bottom": `${glitch.dyBottom}px`,
                      "--skew": glitch.skew,
                      "--top-start": glitch.topStart,
                      "--top-end": glitch.topEnd,
                      "--bottom-start": glitch.bottomStart,
                      "--bottom-end": glitch.bottomEnd,
                    }
                  : {}

                return (
                  <span
                    key={index}
                    data-text={letter}
                    style={style}
                    className={`glitch-letter ${glitch?.active ? `is-glitch ${glitch.strength}` : ""}`}
                  >
                    {letter}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="next-section">
        <div className="next-visual">
          <div className="leaves-layer" aria-hidden="true">
            {fallingLeaves.map((leaf) => (
              <img
                key={leaf.id}
                src={leaf.src}
                alt=""
                className="falling-leaf"
                style={{
                  "--leaf-left": leaf.left,
                  "--leaf-top": leaf.top,
                  "--leaf-drift": leaf.drift,
                  "--leaf-duration": leaf.duration,
                  "--leaf-delay": leaf.delay,
                  "--leaf-size": leaf.size,
                  "--leaf-opacity": leaf.opacity,
                  "--leaf-rotate-end": leaf.rotateEnd,
                }}
              />
            ))}
          </div>

          <img src={image2} alt="Сакура" className="next-image" />
        </div>

        <aside className="about-block" aria-label="About">
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
        </aside>
      </section>
    </div>
  )
}