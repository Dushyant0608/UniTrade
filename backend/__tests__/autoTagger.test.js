const {
    extractTagsWithFallback,
    generateTags,
    extractTagsFromText,
    extractTagsFromImage,
    VALID_TAGS
} = require('../src/engines/autoTagger');

// ─────────────────────────────────────────────
// RULE-BASED FALLBACK TESTS
// ─────────────────────────────────────────────

describe('AutoTagger — extractTagsWithFallback', () => {

    // Test 1: Known category returns category tag
    test('Electronics category should include electronics tag', () => {
        const tags = extractTagsWithFallback('Laptop', 'Good condition laptop', 'Electronics');
        expect(tags).toContain('electronics');
    });

    // Test 2: CSE keyword detection in books
    test('CS book should include cse tag', () => {
        const tags = extractTagsWithFallback(
            'Data Structures Book',
            'algorithms and programming guide',
            'Books'
        );
        expect(tags).toContain('cse');
        expect(tags).toContain('books');
    });

    // Test 3: ECE keyword detection in electronics
    test('ECE hardware item should include ece tag', () => {
        const tags = extractTagsWithFallback(
            'Arduino Kit',
            'microcontroller and sensors bundle',
            'Electronics'
        );
        expect(tags).toContain('ece');
        expect(tags).toContain('electronics');
    });

    // Test 4: ECE keyword detection in books
    test('ECE book should include ece tag', () => {
        const tags = extractTagsWithFallback(
            'Circuit Theory',
            'embedded systems and signals textbook',
            'Books'
        );
        expect(tags).toContain('ece');
        expect(tags).toContain('books');
    });

    // Test 5: Unknown category falls back to general
    test('Unknown category should return general tags', () => {
        const tags = extractTagsWithFallback('Random Item', 'something random', 'Unknown');
        expect(tags).toContain('general');
        expect(tags).toContain('misc');
        expect(tags).toContain('second-hand');
    });

    // Test 6: All returned tags must be valid taxonomy tags
    test('All returned tags should be from valid taxonomy', () => {
        const tags = extractTagsWithFallback('Football', 'used football', 'Sports');
        tags.forEach(tag => {
            expect(VALID_TAGS.has(tag)).toBe(true);
        });
    });

    // Test 7: Never returns null
    test('Should never return null', () => {
        const tags = extractTagsWithFallback(null, null, null);
        expect(tags).not.toBeNull();
    });

    // Test 8: No duplicate tags
    test('Should not return duplicate tags', () => {
        const tags = extractTagsWithFallback('Laptop charger', 'electronics accessories', 'Electronics');
        const unique = [...new Set(tags)];
        expect(tags.length).toBe(unique.length);
    });

});

// ─────────────────────────────────────────────
// FALLBACK CHAIN TESTS (Gemini mocked)
// ─────────────────────────────────────────────

describe('AutoTagger — generateTags fallback chain', () => {

    // Test 9: Falls back to rule-based when Gemini fails
    test('Should return rule-based tags when Gemini text fails', async () => {
        // Mock extractTagsFromText to return null (Gemini failure)
        jest.spyOn(require('../src/engines/autoTagger'), 'extractTagsFromText')
            .mockResolvedValueOnce(null);

        const tags = await generateTags(null, 'Python Book', 'programming guide', 'Books');
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
    });

    // Test 10: Returns empty array as last resort — never throws
    test('Should return empty array and never throw on complete failure', async () => {
        jest.spyOn(require('../src/engines/autoTagger'), 'extractTagsFromText')
            .mockResolvedValueOnce(null);
        jest.spyOn(require('../src/engines/autoTagger'), 'extractTagsFromImage')
            .mockResolvedValueOnce(null);

        const tags = await generateTags(null, null, null, null);
        expect(Array.isArray(tags)).toBe(true);
        expect(tags).not.toBeNull();
    });

});