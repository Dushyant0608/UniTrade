/**
 * VALUATION ENGINE — UniTrade
 *
 * Research Basis: Addresses pricing ambiguity caused by seller bias
 * (Endowment Effect, Akerlof 1970). Replaces emotional pricing with a
 * standardized math-based depreciation model.
 *
 * Formula: P_fair = P_orig * (1 - r)^A * c
 *   P_orig  = Original purchase price
 *   r       = Annual depreciation rate (category-specific)
 *   A       = Age of item in years (sanitized to minimum 0)
 *   c       = Condition factor (0.0 – 1.0)
 *
 * NOTE ON DEPRECIATION RATES:
 * These rates are tunable hyperparameters based on general market behaviour.
 * Electronics depreciate fastest (technology obsolescence), furniture slowest
 * (physical durability). Rates can be adjusted as real transaction data
 * accumulates on the platform.
 */

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

const CATEGORY_RULES = {

    Books: {
        depreciationRate: 0.10,  // 10% / year
        conditionWeights: {
            "New":      1.0,
            "Like New": 0.9,
            "Good":     0.7,
            "Fair":     0.5,
            "Poor":     0.2
        }
    },

    Electronics: {
        depreciationRate: 0.20,  // 20% / year — fastest drop
        conditionWeights: {
            "New":      1.0,
            "Like New": 0.8,
            "Good":     0.6,
            "Fair":     0.4,
            "Poor":     0.1
        }
    },

    Furniture: {
        depreciationRate: 0.05,  // 5% / year — holds value longest
        conditionWeights: {
            "New":      1.0,
            "Like New": 0.9,
            "Good":     0.8,
            "Fair":     0.6,
            "Poor":     0.4
        }
    },

    Sports: {
        depreciationRate: 0.12,  // 12% / year — moderate wear
        conditionWeights: {
            "New":      1.0,
            "Like New": 0.85,
            "Good":     0.65,
            "Fair":     0.45,
            "Poor":     0.2
        }
    },

    // Safety net for unlisted categories
    General: {
        depreciationRate: 0.15,
        conditionWeights: {
            "New":      1.0,
            "Like New": 0.8,
            "Good":     0.6,
            "Fair":     0.5,
            "Poor":     0.2
        }
    }
};


// ─────────────────────────────────────────────
// CORE ALGORITHM
// ─────────────────────────────────────────────

/**
 * Calculates a fair resale price for a given item.
 *
 * @param {Object} item
 * @param {number} item.originalPrice  — Price paid when new (₹)
 * @param {number} item.purchaseYear   — Year the item was bought
 * @param {string} item.condition      — New | Like New | Good | Fair | Poor
 * @param {string} item.category       — Must match a key in CATEGORY_RULES
 *
 * @returns {number} Recommended fair price in ₹ (integer)
 */
const calculateFairPrice = (item) => {

    // Step 1 — Fetch rules for this category
    // Unknown categories fall back to General silently
    const rules = CATEGORY_RULES[item.category] || CATEGORY_RULES["General"];

    // Step 2 — Calculate age
    const currentYear = new Date().getFullYear();
    const age = currentYear - item.purchaseYear;

    // Sanitize: negative age clamped to 0
    // Prevents errors from future-dated purchase years
    const validAge = Math.max(age, 0);

    // Step 3 — Apply exponential depreciation
    // Formula: P_orig * (1 - r)^A
    let value = item.originalPrice * Math.pow((1 - rules.depreciationRate), validAge);

    // Step 4 — Apply condition multiplier
    // Unknown condition defaults to 0.5 (mid-range assumption)
    const conditionFactor = rules.conditionWeights[item.condition] ?? 0.5;
    value = value * conditionFactor;

    // Step 5 — Return as clean integer
    return Math.floor(value);
};


// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

module.exports = { calculateFairPrice, CATEGORY_RULES };