import traderJoes from '../../data/traderjoes.json'
import './Deals.css'

const TOP_PICKS = [...traderJoes]
  .sort((a, b) => a.price - b.price)
  .slice(0, 10)

export default function Deals({ onAddToCart }) {
  return (
    <div className="deals-page">
      <h1 className="deals-heading">TJ's Best Value Picks</h1>
      <p className="deals-sub">The 10 lowest-priced items at Trader Joe's — great for stretching your grocery budget.</p>
      <div className="deals-grid">
        {TOP_PICKS.map((item) => (
          <div key={item.id} className="deals-card">
            <div className="deals-card-body">
              <p className="deals-item-name">{item.name}</p>
              <p className="deals-unit">{item.unit}</p>
            </div>
            <div className="deals-card-footer">
              <span className="deals-price">${item.price.toFixed(2)}</span>
              <button
                className="deals-add-btn"
                onClick={() => onAddToCart({
                  id: `deals-tj-${item.id}`,
                  name: item.name,
                  price: item.price,
                  store: "Trader Joe's",
                })}
              >
                + Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
