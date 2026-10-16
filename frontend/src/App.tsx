import './App.css'
import SiteLayout from './components/SiteLayout'

function App() {
  return (
    <SiteLayout>
      <main className="home">
        <p className="eyebrow">Travel planning, made simple</p>
        <h1>Find a trip that fits you.</h1>
        <p>
          Pick a place, compare your options, and build an itinerary around
          what you like. We are putting the first pages together now.
        </p>
      </main>
    </SiteLayout>
  )
}

export default App
