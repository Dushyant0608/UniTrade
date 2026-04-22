const { calculateFairPrice } = require("../src/engines/fairPrice");

const CURRENT_YEAR = new Date().getFullYear();

describe('Valuation Engine — calculateFairPrice', () => {

    // Test 1: Brand new item, age 0
    test('New item with age 0 should return close to original price', () => {
        const result = calculateFairPrice({
            originalPrice: 1000,
            purchaseYear: CURRENT_YEAR,
            category: 'Electronics',
            condition: 'New'
        });
        expect(result).toBe(1000);
    });

    // Test 2: Old electronics depreciate heavily
    test('3 year old electronics in Poor condition should return very low price', () => {
        const result = calculateFairPrice({
            originalPrice: 10000,
            purchaseYear: CURRENT_YEAR - 3,
            category: 'Electronics',
            condition: 'Poor'
        });
        // 10000 * (0.80)^3 * 0.1 = 10000 * 0.512 * 0.1 = 512 → floor = 512
        expect(result).toBe(512);
    });

    // Test 3: Furniture holds value
    test('2 year old furniture in Good condition should retain most value', () => {
        const result = calculateFairPrice({
            originalPrice: 5000,
            purchaseYear: CURRENT_YEAR - 2,
            category: 'Furniture',
            condition: 'Good'
        });
        // 5000 * (0.95)^2 * 0.8 = 5000 * 0.9025 * 0.8 = 3610
        expect(result).toBe(3610);
    });

    // Test 4: Unknown category falls back to General
    test('Unknown category should use General fallback rules', () => {
        const result = calculateFairPrice({
            originalPrice: 1000,
            purchaseYear: CURRENT_YEAR,
            category: 'RandomCategory',
            condition: 'Good'
        });
        // General: r=0.15, age=0, c=0.6 → 1000 * 1 * 0.6 = 600
        expect(result).toBe(600);
    });

    // Test 5: Unknown condition defaults to 0.5
    test('Unknown condition should default to 0.5 factor', () => {
        const result = calculateFairPrice({
            originalPrice: 1000,
            purchaseYear: CURRENT_YEAR,
            category: 'Books',
            condition: 'Destroyed'
        });
        // Books: r=0.10, age=0, c=0.5 → 1000 * 1 * 0.5 = 500
        expect(result).toBe(500);
    });

    // Test 6: Future purchase year clamped to age 0
    test('Future purchase year should be clamped to age 0', () => {
        const result = calculateFairPrice({
            originalPrice: 1000,
            purchaseYear: CURRENT_YEAR + 5,
            category: 'Books',
            condition: 'New'
        });
        // Age = negative → clamped to 0 → 1000 * 1 * 1.0 = 1000
        expect(result).toBe(1000);
    });

    // Test 7: Books depreciate slowly
    test('5 year old book in Good condition should still have reasonable value', () => {
        const result = calculateFairPrice({
            originalPrice: 500,
            purchaseYear: CURRENT_YEAR - 5,
            category: 'Books',
            condition: 'Good'
        });
        // 500 * (0.90)^5 * 0.7 = 500 * 0.59049 * 0.7 = 206.67 → floor = 206
        expect(result).toBe(206);
    });

});