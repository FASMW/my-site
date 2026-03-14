import "./mobile.css"

import bgImage from "./assets/bg.png"
import image1 from "./assets/1.png"
import image2 from "./assets/2.png"

import { aboutLinks, letters } from "./content"

export default function MobileApp() {
  return (
    <div className="mobile-page">
      <section className="mobile-hero">
        <div className="mobile-hero-inner">
          <div className="mobile-brand">{letters.join("")}</div>

          <div className="mobile-scene">
            <div className="mobile-bg-layer">
              <img src={bgImage} alt="" className="mobile-bg-image" />
              <div className="mobile-fog mobile-fog-1" />
              <div className="mobile-fog mobile-fog-2" />
              <div className="mobile-light" />
            </div>

            <img src={image1} alt="Картинка" className="mobile-hero-image" />
          </div>
        </div>
      </section>

      <section className="mobile-about-section">
        <div className="mobile-about-visual">
          <img src={image2} alt="Сакура" className="mobile-about-image" />
        </div>

        <aside className="mobile-about-block" aria-label="About">
          <p className="mobile-about-label">ABOUT</p>
          <h2 className="mobile-about-title">FASMW</h2>

          <div className="mobile-about-links">
            {aboutLinks.map((link) => (
              <a
                key={link.name}
                className="mobile-about-link"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="mobile-about-link-name">{link.name}</span>
                <span className="mobile-about-link-value">{link.value}</span>
              </a>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}