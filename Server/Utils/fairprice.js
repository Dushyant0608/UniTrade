// --- CONFIGURATION (The Research Logic) ---
// This object holds the "Depreciation Rules" for every category.
// Rate: How much value it loses per year (0.10 = 10%)
const CATEGORY_RULES = {
    "Books": {
        depreciationRate: 0.10,
        conditionWeights: { "New": 1.0, "Like New": 0.9, "Good": 0.7, "Fair": 0.5, "Poor": 0.2 }
    },
    "Electronics": {
        depreciationRate: 0.20, // Electronics drop faster!
        conditionWeights: { "New": 1.0, "Like New": 0.8, "Good": 0.6, "Fair": 0.4, "Poor": 0.1 }
    },
    "Furniture": {
        depreciationRate: 0.05, // Furniture holds value well
        conditionWeights: { "New": 1.0, "Like New": 0.9, "Good": 0.8, "Fair": 0.6, "Poor": 0.4 }
    },
    // The "Safety Net" for unknown items (Guitars, Lab Coats, etc.)
    "General": {
        depreciationRate: 0.15,
        conditionWeights: { "New": 1.0, "Like New": 0.8, "Good": 0.6, "Fair": 0.5, "Poor": 0.2 }
    }
};

// --- THE ALGORITHM ---
const calculateFairPrice = (item) => {
    // 1. Identify the Rules to use
    // If the category exists in our rules, use it. Otherwise, use "General".
    const rules = CATEGORY_RULES[item.category] || CATEGORY_RULES["General"];

    // 2. Calculate Age (Dynamic)
    const currentYear = new Date().getFullYear();
    const age = currentYear - item.purchaseYear;

    // Safety: Age cannot be negative (in case user typos 2028). Minimum age is 0.
    const validAge = Math.max(age, 0);

    // 3. Calculate Base Value (Exponential Decay)
    // Formula: Original * (1 - Rate)^Age
    let value = item.originalPrice * Math.pow((1 - rules.depreciationRate), validAge);

    // 4. Apply Condition Multiplier
    // If condition is weird/missing, default to 0.5 (Average)
    const conditionFactor = rules.conditionWeights[item.condition] || 0.5;
    value = value * conditionFactor;

    // 5. Final Formatting (Remove decimals)
    return Math.floor(value);
};

// --- TEST DATA (Simulation) ---
const inventory = [
    {
        id: 1,
        title: 'Keyboard',
        category: 'Electronics',
        originalPrice: 4297,
        purchaseYear: 2019,
        condition: 'Like New',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 2,
        title: 'Mouse',
        category: 'Electronics',
        originalPrice: 913,
        purchaseYear: 2024,
        condition: 'Poor',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 3,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 4276,
        purchaseYear: 2025,
        condition: 'Good',
        tags: ['General']
    },
    {
        id: 4,
        title: 'Digital Logic',
        category: 'Books',
        originalPrice: 2921,
        purchaseYear: 2020,
        condition: 'Fair',
        tags: ['ECE', 'Sem 5']
    },
    {
        id: 5,
        title: 'Digital Logic',
        category: 'Books',
        originalPrice: 1695,
        purchaseYear: 2023,
        condition: 'New',
        tags: ['CSE', 'Sem 3']
    },
    {
        id: 6,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 808,
        purchaseYear: 2020,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 7,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 1570,
        purchaseYear: 2022,
        condition: 'New',
        tags: ['General']
    },
    {
        id: 8,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 3117,
        purchaseYear: 2019,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 9,
        title: 'Kettle',
        category: 'Electronics',
        originalPrice: 3391,
        purchaseYear: 2021,
        condition: 'Fair',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 10,
        title: 'Data Structures',
        category: 'Books',
        originalPrice: 4913,
        purchaseYear: 2021,
        condition: 'New',
        tags: ['CE', 'Sem 5']
    },
    {
        id: 11,
        title: 'Kettle',
        category: 'Electronics',
        originalPrice: 4717,
        purchaseYear: 2024,
        condition: 'Poor',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 12,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 3498,
        purchaseYear: 2021,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 13,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 3429,
        purchaseYear: 2024,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 14,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 1575,
        purchaseYear: 2018,
        condition: 'Poor',
        tags: ['General']
    },
    {
        id: 15,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 1436,
        purchaseYear: 2022,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 16,
        title: 'Scientific Calculator',
        category: 'Electronics',
        originalPrice: 1230,
        purchaseYear: 2024,
        condition: 'Good',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 17,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 1373,
        purchaseYear: 2023,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 18,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 1370,
        purchaseYear: 2025,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 19,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 3082,
        purchaseYear: 2025,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 20,
        title: 'Engineering Physics',
        category: 'Books',
        originalPrice: 537,
        purchaseYear: 2019,
        condition: 'Like New',
        tags: ['ECE', 'Sem 2']
    },
    {
        id: 21,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 3014,
        purchaseYear: 2025,
        condition: 'New',
        tags: ['General']
    },
    {
        id: 22,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 4683,
        purchaseYear: 2018,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 23,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 4479,
        purchaseYear: 2018,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 24,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 2669,
        purchaseYear: 2024,
        condition: 'Good',
        tags: ['General']
    },
    {
        id: 25,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 1681,
        purchaseYear: 2021,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 26,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 3235,
        purchaseYear: 2018,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 27,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 3124,
        purchaseYear: 2019,
        condition: 'Poor',
        tags: ['General']
    },
    {
        id: 28,
        title: 'Calculus',
        category: 'Books',
        originalPrice: 1190,
        purchaseYear: 2019,
        condition: 'Like New',
        tags: ['ECE', 'Sem 7']
    },
    {
        id: 29,
        title: 'Digital Logic',
        category: 'Books',
        originalPrice: 4433,
        purchaseYear: 2025,
        condition: 'Poor',
        tags: ['ECE', 'Sem 3']
    },
    {
        id: 30,
        title: 'Extension Board',
        category: 'Electronics',
        originalPrice: 1261,
        purchaseYear: 2021,
        condition: 'Fair',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 31,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 924,
        purchaseYear: 2018,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 32,
        title: 'Mechanics',
        category: 'Books',
        originalPrice: 2248,
        purchaseYear: 2023,
        condition: 'Like New',
        tags: ['ECE', 'Sem 4']
    },
    {
        id: 33,
        title: 'Kettle',
        category: 'Electronics',
        originalPrice: 4535,
        purchaseYear: 2023,
        condition: 'Poor',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 34,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 3393,
        purchaseYear: 2018,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 35,
        title: 'Extension Board',
        category: 'Electronics',
        originalPrice: 2115,
        purchaseYear: 2018,
        condition: 'Like New',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 36,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 544,
        purchaseYear: 2024,
        condition: 'Poor',
        tags: ['General']
    },
    {
        id: 37,
        title: 'Data Structures',
        category: 'Books',
        originalPrice: 666,
        purchaseYear: 2022,
        condition: 'Poor',
        tags: ['ECE', 'Sem 5']
    },
    {
        id: 38,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 4099,
        purchaseYear: 2022,
        condition: 'Fair',
        tags: ['General']
    },
    {
        id: 39,
        title: 'Scientific Calculator',
        category: 'Electronics',
        originalPrice: 1431,
        purchaseYear: 2024,
        condition: 'Poor',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 40,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 2406,
        purchaseYear: 2019,
        condition: 'New',
        tags: ['General']
    },
    {
        id: 41,
        title: 'Scientific Calculator',
        category: 'Electronics',
        originalPrice: 4152,
        purchaseYear: 2025,
        condition: 'Good',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 42,
        title: 'Data Structures',
        category: 'Books',
        originalPrice: 728,
        purchaseYear: 2022,
        condition: 'Good',
        tags: ['ECE', 'Sem 3']
    },
    {
        id: 43,
        title: 'Mechanics',
        category: 'Books',
        originalPrice: 1958,
        purchaseYear: 2019,
        condition: 'Fair',
        tags: ['CE', 'Sem 8']
    },
    {
        id: 44,
        title: 'Scientific Calculator',
        category: 'Electronics',
        originalPrice: 1647,
        purchaseYear: 2023,
        condition: 'Poor',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 45,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 959,
        purchaseYear: 2019,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 46,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 2467,
        purchaseYear: 2022,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 47,
        title: 'Mouse',
        category: 'Electronics',
        originalPrice: 4152,
        purchaseYear: 2019,
        condition: 'Fair',
        tags: ['Tech', 'Hostel Life']
    },
    {
        id: 48,
        title: 'Used Furniture Item',
        category: 'Furniture',
        originalPrice: 3330,
        purchaseYear: 2021,
        condition: 'Good',
        tags: ['General']
    },
    {
        id: 49,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 3280,
        purchaseYear: 2023,
        condition: 'Like New',
        tags: ['General']
    },
    {
        id: 50,
        title: 'Used Sports Item',
        category: 'Sports',
        originalPrice: 2454,
        purchaseYear: 2020,
        condition: 'New',
        tags: ['General']
    }
];

// Run the Test
console.log("--- FAIR PRICE ESTIMATOR ---");
inventory.forEach(item => {
    const predictedPrice = calculateFairPrice(item);
    console.log(`Item: ${item.title} (${item.category})`);
    console.log(`Original: ₹${item.originalPrice} -> Fair Price: ₹${predictedPrice}`);
    console.log("--------------------------");
});