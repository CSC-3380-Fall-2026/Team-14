import type { ReactNode } from 'react'
import './SiteLayout.css'

type SiteLayoutProps = {
  children: ReactNode
}

function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site">
      <header className="site-header">
        <a className="site-name" href="/">GeauxTravel</a>
      </header>

      {children}

      <footer className="site-footer">
        Plan a trip that fits you.
      </footer>
    </div>
  )
}

export default SiteLayout
