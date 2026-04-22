const {
    calculateDecayWeight,
    buildWeightedProfile,
    getPersonalizedFeed,
    recordClick,
    pruneDecayedTags
} = require('../src/engines/RecommendationEngine');

// ─────────────────────────────────────────────
// DECAY CALCULATOR TESTS
// ─────────────────────────────────────────────

describe('Discovery Engine — calculateDecayWeight', () => {

    test('Click today should return weight close to 1.0', () => {
        const weight = calculateDecayWeight(new Date().toISOString());
        expect(weight).toBeCloseTo(1.0, 1);
    });

    test('Click 10 days ago should return ~0.60', () => {
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
        const weight = calculateDecayWeight(tenDaysAgo);
        expect(weight).toBeCloseTo(Math.pow(0.95, 10), 2);
    });

    test('Click 44 days ago should return weight near prune threshold', () => {
    const fortyFourDaysAgo = new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString();
    const weight = calculateDecayWeight(fortyFourDaysAgo);
    expect(weight).toBeGreaterThan(0.1);
    expect(weight).toBeLessThan(0.2);
});

    test('Future date should return weight of 1.0 (clamped)', () => {
        const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
        const weight = calculateDecayWeight(future);
        expect(weight).toBeCloseTo(1.0, 1);
    });

});

// ─────────────────────────────────────────────
// WEIGHTED PROFILE TESTS
// ─────────────────────────────────────────────

describe('Discovery Engine — buildWeightedProfile', () => {

    test('Signup tags should have fixed weight 0.6', () => {
        const user = {
            signupTags: ['cse', 'electronics'],
            viewHistoryTags: []
        };
        const profile = buildWeightedProfile(user);
        profile.forEach(entry => {
            expect(entry.weight).toBe(0.6);
        });
    });

    test('Recent history tags should have weight close to 1.0', () => {
        const user = {
            signupTags: [],
            viewHistoryTags: [
                { tag: 'laptop', lastSeen: new Date().toISOString() }
            ]
        };
        const profile = buildWeightedProfile(user);
        const laptopEntry = profile.find(e => e.tag === 'laptop');
        expect(laptopEntry.weight).toBeCloseTo(1.0, 1);
    });

    test('Heavily decayed tags below 0.1 should be pruned from profile', () => {
        const user = {
            signupTags: [],
            viewHistoryTags: [
                {
                    tag: 'oldtag',
                    lastSeen: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        const profile = buildWeightedProfile(user);
        const oldTag = profile.find(e => e.tag === 'oldtag');
        expect(oldTag).toBeUndefined();
    });

});

// ─────────────────────────────────────────────
// PERSONALIZED FEED TESTS
// ─────────────────────────────────────────────

describe('Discovery Engine — getPersonalizedFeed', () => {

    // Mock item helper
    const makeItem = (id, sellerId, tags, fairPrice = 100) => ({
        _id: { toString: () => id },
        sellerId: { toString: () => sellerId },
        tags,
        status: 'active',
        fairPrice,
        listedAt: new Date().toISOString(),
        _doc: {
            _id: { toString: () => id },
            tags,
            fairPrice,
            listedAt: new Date().toISOString()
        }
    });

    const user = {
        _id: { toString: () => 'user1' },
        signupTags: ['cse', 'electronics'],
        viewHistoryTags: []
    };

    test('Relevant items should score higher than irrelevant ones', () => {
        const inventory = [
            makeItem('item1', 'user2', ['cse', 'laptop']),
            makeItem('item2', 'user2', ['sports', 'cricket'])
        ];
        const feed = getPersonalizedFeed(user, inventory);
        const cseItem = feed.find(i => i._id.toString() === 'item1');
        const sportsItem = feed.find(i => i._id.toString() === 'item2');
        expect(cseItem.relevanceScore).toBeGreaterThan(sportsItem?.relevanceScore ?? 0);
    });

    test('Seller should not see their own items in feed', () => {
        const inventory = [
            makeItem('item1', 'user1', ['cse']),
            makeItem('item2', 'user2', ['cse'])
        ];
        const feed = getPersonalizedFeed(user, inventory);
        const ownItem = feed.find(i => i._id.toString() === 'item1');
        expect(ownItem).toBeUndefined();
    });

    test('Non-active items should be excluded', () => {
        const soldItem = makeItem('item1', 'user2', ['cse']);
        soldItem.status = 'sold';
        soldItem._doc.status = 'sold';
        const feed = getPersonalizedFeed(user, [soldItem]);
        expect(feed.length).toBe(0);
    });

    test('Fallback should trigger when scored results are below 5', () => {
        const inventory = [
            makeItem('item1', 'user2', ['sports', 'cricket']),
            makeItem('item2', 'user2', ['furniture', 'chair']),
        ];
        const feed = getPersonalizedFeed(user, inventory);
        const fallbackItems = feed.filter(i => i.isFallback === true);
        expect(fallbackItems.length).toBeGreaterThan(0);
    });

    test('Feed should be sorted by relevance score descending', () => {
        const inventory = [
            makeItem('item1', 'user2', ['sports']),
            makeItem('item2', 'user2', ['cse', 'electronics', 'laptop']),
            makeItem('item3', 'user2', ['cse'])
        ];
        const feed = getPersonalizedFeed(user, inventory);
        for (let i = 0; i < feed.length - 1; i++) {
            expect(feed[i].relevanceScore).toBeGreaterThanOrEqual(feed[i + 1].relevanceScore);
        }
    });

});

// ─────────────────────────────────────────────
// RECORD CLICK TESTS
// ─────────────────────────────────────────────

describe('Discovery Engine — recordClick', () => {

    test('New tag should be added to history', () => {
        const updated = recordClick([], ['cse', 'laptop']);
        expect(updated.length).toBe(2);
        expect(updated.map(e => e.tag)).toContain('cse');
    });

    test('Existing tag click should refresh lastSeen', () => {
        const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        const history = [{ tag: 'cse', lastSeen: oldDate }];
        const updated = recordClick(history, ['cse']);
        const entry = updated.find(e => e.tag === 'cse');
        expect(new Date(entry.lastSeen).getTime()).toBeGreaterThan(new Date(oldDate).getTime());
    });

});

// ─────────────────────────────────────────────
// PRUNE DECAYED TAGS TESTS
// ─────────────────────────────────────────────

describe('Discovery Engine — pruneDecayedTags', () => {

    test('Recent tags should be kept', () => {
        const history = [{ tag: 'cse', lastSeen: new Date().toISOString() }];
        const pruned = pruneDecayedTags(history);
        expect(pruned.length).toBe(1);
    });

    test('Tags older than ~90 days should be pruned', () => {
        const history = [{
            tag: 'oldtag',
            lastSeen: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
        }];
        const pruned = pruneDecayedTags(history);
        expect(pruned.length).toBe(0);
    });

});