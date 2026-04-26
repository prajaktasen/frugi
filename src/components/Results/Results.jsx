import './Results.css'

function effectivePrice(item) {
  if (!item) return Infinity
  return item.promoPrice ?? item.price ?? Infinity
}

export default function Results({ term, tjResult, krogerResult, storeName, onAddToCart }) {
  const tjPrice = tjResult?.price ?? null
  const krogerPrice = effectivePrice(krogerResult)

  const tjIsBest  = tjPrice !== null && (krogerPrice === Infinity || tjPrice <= krogerPrice)
  const krogerIsBest = krogerResult && krogerPrice !== Infinity && (!tjPrice || krogerPrice < tjPrice)

  return (
    <div className="results">
      <h2 className="results-title">Results for "<em>{term}</em>"</h2>
      <div className="results-grid">

        {/* Trader Joe's column */}
        <div className={`results-col ${tjIsBest ? 'results-col--best' : ''}`}>
          <div className="results-store-header">
            <span className="results-store-name">Trader Joe's</span>
            {tjIsBest && <span className="results-best-badge">BEST PRICE</span>}
          </div>
          {tjResult ? (
            <div className="results-card">
              <p className="results-item-name">{tjResult.name}</p>
              <p className="results-unit">{tjResult.unit}</p>
              <p className={`results-price ${tjIsBest ? 'results-price--best' : ''}`}>
                ${tjResult.price.toFixed(2)}
              </p>
              <button
                className="results-add-btn"
                onClick={() => onAddToCart({
                  id: `tj-${tjResult.id}`,
                  name: tjResult.name,
                  price: tjResult.price,
                  store: "Trader Joe's",
                })}
              >
                + Add to Cart
              </button>
            </div>
          ) : (
            <div className="results-card results-card--empty">
              <p>No match found at Trader Joe's</p>
            </div>
          )}
        </div>

        {/* Kroger column */}
        <div className={`results-col ${krogerIsBest ? 'results-col--best' : ''}`}>
          <div className="results-store-header">
            <span className="results-store-name">{storeName ?? 'Kroger'}</span>
            {krogerIsBest && <span className="results-best-badge">BEST PRICE</span>}
          </div>
          {krogerResult ? (
            <div className="results-card">
              {krogerResult.image && (
                <img className="results-product-img" src={krogerResult.image} alt={krogerResult.name} />
              )}
              <p className="results-item-name">{krogerResult.name}</p>
              {krogerResult.size && <p className="results-unit">{krogerResult.size}</p>}
              <div className="results-prices">
                {krogerResult.promoPrice ? (
                  <>
                    <span className={`results-price ${krogerIsBest ? 'results-price--best' : ''}`}>
                      ${krogerResult.promoPrice.toFixed(2)}
                    </span>
                    <span className="results-price-original">${krogerResult.price.toFixed(2)}</span>
                    <span className="results-promo-label">SALE</span>
                  </>
                ) : (
                  <span className={`results-price ${krogerIsBest ? 'results-price--best' : ''}`}>
                    {krogerResult.price !== null ? `$${krogerResult.price.toFixed(2)}` : 'Price unavailable'}
                  </span>
                )}
              </div>
              <button
                className="results-add-btn"
                onClick={() => onAddToCart({
                  id: `kroger-${krogerResult.name}`,
                  name: krogerResult.name,
                  price: krogerResult.promoPrice ?? krogerResult.price ?? 0,
                  store: storeName ?? 'Kroger',
                })}
              >
                + Add to Cart
              </button>
            </div>
          ) : (
            <div className="results-card results-card--empty">
              <p>{storeName?.includes('unavailable') ? 'Kroger unavailable' : 'No match found at Kroger'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
