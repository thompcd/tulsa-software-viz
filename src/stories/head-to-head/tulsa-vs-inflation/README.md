# Tulsa vs Inflation

**Interactive data visualization comparing Tulsa's cost of living against peer metros**

**Live URL:** https://tulsasoftware.com/data-projects/tulsa-vs-inflation/

## Hook
> "Your dollar stretches further in Tulsa — but by how much?"

## Key Findings

### 1. Housing: The Biggest Difference
- **Tulsa median home: $255K** vs Austin ($521K), Denver ($598K), Nashville ($459K)
- 63% steady growth over 5 years without boom-bust volatility
- **Save $343K** on equivalent home vs Denver

### 2. Gas Prices: Oklahoma Stays Cheap
- Current OK price: **$2.30** (63¢ below national average)
- Annual savings: **$650+** vs Colorado for typical driver

### 3. Overall Cost of Living (Regional Price Parities)
| Metro | RPP Index | vs National |
|-------|-----------|-------------|
| Tulsa | 89.4 | 10.6% below |
| Nashville | 97.6 | 2.4% below |
| Austin | 101.8 | 1.8% above |
| Denver | 107.3 | 7.3% above |

### 4. Real Purchasing Power of $100K Salary
| Metro | Equivalent Value |
|-------|------------------|
| Tulsa | $111,872 |
| Nashville | $102,459 |
| Austin | $98,232 |
| Denver | $93,197 |

**Annual savings vs Denver: $18,675**

## Data Sources

- **Housing:** [Zillow ZHVI](https://www.zillow.com/research/data/) - Typical Home Value Index
- **Cost of Living:** [BEA Regional Price Parities](https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area)
- **Inflation:** [BLS Consumer Price Index](https://www.bls.gov/cpi/)
- **Gas Prices:** [AAA Gas Prices](https://gasprices.aaa.com/) & EIA

## Visualization Features

- **D3.js scrollytelling** with animated charts
- **Responsive design** for mobile and desktop
- **Interactive salary calculator** - see real purchasing power
- **5 data sections:**
  1. Housing price racing line chart
  2. Gas price trends
  3. Cost of living comparison bars
  4. Purchasing power calculator
  5. $100 basket comparison

## Design System

Uses the portfolio design system:
- **Primary accent:** Cyan-turquoise gradient (`#50bff5` → `rgb(49, 245, 227)`)
- **Fonts:** Playfair Display (headings), Poppins (labels), Lato (body)
- **Light theme** with subtle shadows and clean spacing

## Files

```
tulsa-vs-inflation/
├── index.html          # Main visualization
├── README.md           # This file
└── data/
    ├── housing-zhvi.json
    ├── regional-price-parities.json
    ├── cpi-inflation.json
    ├── gas-prices.json
    └── purchasing-power.json
```

---

*Created: February 2026*
