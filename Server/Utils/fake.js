// --- 1. The Generators (Mimicking Faker.js) ---
const branches = ["CSE", "ECE", "ME", "CE"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
const categories = ["Books", "Electronics", "Furniture", "Sports"];
const bookTitles = ["Engineering Physics", "Data Structures", "Mechanics", "Calculus", "Digital Logic"];
const elecTitles = ["Scientific Calculator", "Kettle", "Extension Board", "Mouse", "Keyboard"];

// Helper to get random item from an array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number between min and max
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- 2. The Main Generator Function ---
const generateFakeInventory = (count) => {
    const fakeInventory = [];

    for (let i = 0; i < count; i++) {
        // Randomly decide if this item is a Book, Electronics, etc.
        const category = getRandom(categories);
        
        let title;
        let tags = [];

        // Give it a realistic title and tags based on category
        if (category === "Books") {
            title = getRandom(bookTitles);
            tags = [getRandom(branches), `Sem ${getRandomInt(1, 8)}`]; // e.g. ["CSE", "Sem 3"]
        } else if (category === "Electronics") {
            title = getRandom(elecTitles);
            tags = ["Tech", "Hostel Life"];
        } else {
            title = `Used ${category} Item`;
            tags = ["General"];
        }

        // Create the Item Object
        const item = {
            id: i + 1,
            title: title,
            category: category,
            originalPrice: getRandomInt(500, 5000), // Random price between 500 and 5000
            purchaseYear: getRandomInt(2018, 2025), // Random year
            condition: getRandom(conditions),
            tags: tags
        };

        fakeInventory.push(item);
    }

    return fakeInventory;
};

// --- 3. RUN IT ---
// Generate 50 items
const bigDatabase = generateFakeInventory(50);

// Show the first 5 just to check
console.log(bigDatabase.slice(0, 5));