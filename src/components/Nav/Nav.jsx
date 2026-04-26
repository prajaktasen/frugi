import FrogLogo from '../FrogLogo.jsx'
import './Nav.css'

const TABS = [
  { id: 'search',  label: 'Search' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'cart',    label: 'Cart' },
  { id: 'deals',   label: 'Deals' },
]

export default function Nav({ activeTab, onTabChange, cartCount }) {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <FrogLogo size={30} className="nav-frog" />
        <span className="nav-title">frugi</span>
      </div>
      <div className="nav-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'nav-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.id === 'cart' && cartCount > 0 && (
              <span className="nav-badge">{cartCount}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
