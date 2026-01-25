/**
 * RESEARCH MODULE 2: RELEVANCE RECOMMENDATION ENGINE
 * * Logic: Content-Based Filtering using Jaccard Similarity Index.
 * Formula: J(A,B) = |Intersection| / |Union|
 * Purpose: Solves "Cold Start" problem by using static metadata (Tags) 
 * instead of behavioral history.
 */

// --- 1. The Math Helper (Jaccard Index) ---
const calculateJaccardScore = (userTags, itemTags) => {
    // A. Find the Intersection (Common tags)
    // We lowercase everything to ensure "CSE" matches "cse"
    const intersection = userTags.filter(tag => 
        itemTags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
    );

    // B. Find the Union (All unique tags combined)
    // Set() automatically removes duplicates
    const union = new Set([...userTags, ...itemTags]);

    // C. Calculate Score (Prevent division by zero)
    if (union.size === 0) return 0;
    return intersection.length / union.size;
};

// --- 2. The Main Function ---
const getPersonalizedFeed = (user, inventory) => {
    // Step A: Combine User's Explicit (Signup) and Implicit (History) interests
    const userProfileTags = [
        ...user.signupTags, 
        ...(user.viewHistoryTags || []) // Safety check if history is empty
    ];

    // Step B: Score every item in the inventory
    const scoredItems = inventory.map(item => {
        const score = calculateJaccardScore(userProfileTags, item.tags);
        return { ...item, relevanceScore: score }; // Attach score to item
    });

    // Step C: Filter & Sort
    return scoredItems
        .filter(item => item.relevanceScore > 0) // Optional: Remove 0% matches (Noise)
        .sort((a, b) => {
            // Priority 1: High Relevance Score first
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            // Priority 2: Tie-Breaker - Lowest Price first
            return a.fairPrice - b.fairPrice;
        });
};

// --- TEST SIMULATION  ---
const currentUser = {
    name: "Dushyant",
    signupTags: ["CSE", "Sem 6"], // Explicit: What you are
    viewHistoryTags: ["Cricket"]   // Implicit: What you do
};

const database = [
    { title: "Data Structures (Cormen)", tags: ["CSE", "Sem 3"], fairPrice: 300 },
    { title: "SS Cricket Bat", tags: ["Sports", "Cricket"], fairPrice: 800 },
    { title: "Maybelline Lipstick", tags: ["Fashion"], fairPrice: 500 },
    { title: "Algorithm Notes", tags: ["CSE", "Sem 6"], fairPrice: 100 }, // Perfect Match
    { title: "Engineering Physics", tags: ["ECE", "Sem 1"], fairPrice: 200 } // Noise
];

console.log(`\n🔍 RELEVANCE ENGINE DIAGNOSTIC REPORT`);
console.log(`=========================================`);
console.log(`User Profile: ${currentUser.name}`);
console.log(`User Signal:  [${[...currentUser.signupTags, ...currentUser.viewHistoryTags].join(", ")}]`);

// Generate Feed
const feed = getPersonalizedFeed(currentUser, database);

// Create a pretty table for the console
const displayFeed = feed.map(item => {
    const percentage = (item.relevanceScore * 100).toFixed(0) + "%";
    
    // logic to visually flag good/bad matches
    let status = "⚪ Neutral";
    if (item.relevanceScore >= 0.5) status = "✅ Highly Relevant";
    else if (item.relevanceScore >= 0.2) status = "⚠️ Moderate";
    else status = "❌ Irrelevant";

    return {
        "Item Name": item.title,
        "Matched Tags": item.tags.join(", "),
        "Jaccard Score": percentage,
        "Status": status,
        "Price": `₹${item.fairPrice}`
    };
});

console.log("\n--- ALGORITHM OUTPUT ---");
console.table(displayFeed);