import './Cart.css'

export default function Cart({ cartItems, onUpdateQty, onClearCart }) {
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-heading">Your Cart</h1>
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <p>Your cart is empty.</p>
          <p className="cart-empty-hint">Search for items or browse recipes to add things here.</p>
        </div>
      </div>
    )
  }

  const byStore = cartItems.reduce((acc, item) => {
    const store = item.store || 'Other'
    if (!acc[store]) acc[store] = []
    acc[store].push(item)
    return acc
  }, {})

  const storeSubtotals = Object.entries(byStore).map(([store, items]) => ({
    store,
    subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
  }))

  const total = storeSubtotals.reduce((sum, s) => sum + s.subtotal, 0)

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-heading">Your Cart</h1>
        <button className="cart-clear-btn" onClick={onClearCart}>Clear cart</button>
      </div>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-store">{item.store}</span>
            </div>
            <div className="cart-item-controls">
              <div className="cart-qty">
                <button
                  className="cart-qty-btn"
                  onClick={() => onUpdateQty(item.id, item.qty - 1)}
                  aria-label="Decrease"
                >−</button>
                <span className="cart-qty-num">{item.qty}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                  aria-label="Increase"
                >+</button>
              </div>
              <span className="cart-item-price">
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        {storeSubtotals.map(({ store, subtotal }) => (
          <div key={store} className="cart-summary-row">
            <span>{store} subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        ))}
        <div className="cart-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
