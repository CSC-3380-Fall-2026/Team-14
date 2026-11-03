import newOrleansPhoto from '../assets/new-orleans.jpg'
import './HomePage.css'

export default function HomePage() {
  return (
    <>
      <section className="home-intro" aria-labelledby="page-title">
        <div className="home-copy">
          <h1 id="page-title">Plan your next trip.</h1>
          <p>
            Choose a destination and plan around your dates, budget, and
            interests. GeauxTravel starts with what you want to do.
          </p>
          <a className="explore-link" href="#destinations">Explore destinations</a>
          <a className="home-login-link" href="#/login">Log in to your account</a>
        </div>
        <figure className="home-photo">
          <img
            src={newOrleansPhoto}
            alt="Colorful buildings and balconies in the French Quarter of New Orleans"
            width="1280"
            height="960"
          />
          <figcaption>New Orleans, Louisiana</figcaption>
        </figure>
      </section>

      <section className="destinations" id="destinations" aria-labelledby="destinations-title">
        <h2 id="destinations-title">A few places to start</h2>
        <p>Stay close to home or make a weekend of it.</p>
        <div className="destination-list">
          <article className="destination">
            <h3>New Orleans</h3>
            <p>Food, music, and a walk through the French Quarter.</p>
            <details>
              <summary>Trip ideas<span className="visually-hidden"> for New Orleans</span></summary>
              <p>Start with a walk, stop for lunch, and leave the evening open for live music.</p>
            </details>
          </article>
          <article className="destination">
            <h3>Baton Rouge</h3>
            <p>A day downtown, local food, and time by the river.</p>
            <details>
              <summary>Trip ideas<span className="visually-hidden"> for Baton Rouge</span></summary>
              <p>Try a downtown lunch spot, visit a museum, and finish with a riverfront walk.</p>
            </details>
          </article>
          <article className="destination">
            <h3>Lafayette</h3>
            <p>Cajun food and music for a weekend away.</p>
            <details>
              <summary>Trip ideas<span className="visually-hidden"> for Lafayette</span></summary>
              <p>Spend an afternoon downtown, try a Cajun restaurant, and look for a local music event.</p>
            </details>
          </article>
        </div>
      </section>

      <p className="home-photo-credit">
        Photo: <a href="https://commons.wikimedia.org/wiki/File:French_Quarter02_New_Orleans.jpg">Sami99tr</a>
        {' · '}<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>
      </p>
    </>
  )
}
