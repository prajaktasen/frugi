import { useApp } from '../AppContext'

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6"  r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

const PricesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)

const MealsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6"  y1="1" x2="6"  y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

const TABS = [
  { id: 'list',  label: 'List',   Icon: ListIcon },
  { id: 'map',   label: 'Prices', Icon: PricesIcon },
  { id: 'cart',  label: 'Cart',   Icon: CartIcon },
  { id: 'meals', label: 'Meals',  Icon: MealsIcon },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, cart } = useApp()

  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-btn ${activeTab === id ? 'active' : ''}`}
          onClick={() => setActiveTab(id)}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <Icon />
            {id === 'cart' && cart.length > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -7,
                background: 'var(--green)', color: '#fff',
                fontSize: 9, fontWeight: 700, minWidth: 14, height: 14,
                borderRadius: 7, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 3px',
              }}>
                {cart.length}
              </span>
            )}
          </div>
          {label}
        </button>
      ))}
    </nav>
  )
}
