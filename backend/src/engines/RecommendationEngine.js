/**
 * DISCOVERY ENGINE — UniTrade
 *
 * Research Basis: Solves the Cold Start problem (Atlantis Press, 2025).
 * Standard collaborative filtering (Amazon/Netflix style) requires behavioral
 * history and fails for new users. This engine uses Content-Based Filtering
 * with a Weighted Jaccard Similarity Index instead — items are matched against
 * user metadata (branch, semester, interests) so the feed works from day one.
 *
 * As the user interacts with the app, their click history is stored with
 * timestamps and fed back into the scoring — recent behaviour gradually
 * outweighs the static signup profile. Old, ignored tags decay away
 * automatically via exponential decay (weight = 0.95 ^ days).
 *
 * ─── THREE-PHASE BEHAVIOUR ───────────────────────────────────────────────────
 *
 *  Phase 1 — Cold Start (no click history)
 *    Score items using signupTags only (fixed weight 0.6 each).
 *    If fewer than FALLBACK_THRESHOLD results score > 0, pad the feed with
 *    the most recently listed items so the screen is never empty.
 *
 *  Phase 2 — Warming Up (some clicks, history building)
 *    Score items using signupTags (0.6) + viewHistoryTags (decayed weight).
 *    Recent clicks dominate; old clicks fade. Feed becomes personal.
 *
 *  Phase 3 — Active User (rich history)
 *    viewHistoryTags carry enough weight to override the signup profile.
 *    A CSE student who keeps clicking cricket gear sees cricket items first.
 *    Tags with decayed weight < PRUNE_THRESHOLD are removed from DB to
 *    reduce noise and keep the user document lean.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

const SIGNUP_TAG_WEIGHT  = 0.6;   // Fixed weight for demographic tags
                                   // Always present — acts as a floor

const DECAY_BASE         = 0.95;  // Weight = 0.95 ^ daysSinceClick
                                   // After ~45 days a tag reaches ~0.1 weight
                                   // After ~90 days it falls below PRUNE_THRESHOLD

const PRUNE_THRESHOLD    = 0.1;   // Tags whose decayed weight drops below this
                                   // are removed from the user's history in MongoDB

const FALLBACK_THRESHOLD = 5;     // Minimum scored results before fallback triggers


// ─────────────────────────────────────────────
// HELPER — DECAY CALCULATOR
// ─────────────────────────────────────────────

/**
 * Given a past timestamp, returns how much weight that interaction carries today.
 * Weight = DECAY_BASE ^ daysSinceClick
 *
 * @param {Date|string} lastSeen
 * @returns {number} Weight between 0.0 and 1.0
 */
const calculateDecayWeight = (lastSeen) => {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const daysSinceClick = (Date.now() - new Date(lastSeen).getTime()) / MS_PER_DAY;
    const validDays = Math.max(daysSinceClick, 0);
    return Math.pow(DECAY_BASE, validDays);
};


// ─────────────────────────────────────────────
// HELPER — WEIGHTED JACCARD SCORE
// ─────────────────────────────────────────────

/**
 * Calculates weighted Jaccard similarity between user tag profile and item tags.
 *
 * Formula: J(U,I) = Σ min(w_t, 1.0) / Σ max(w_t, 1.0)
 *
 * Where:
 * - t = each tag in the union of User Profile (U) and Item Tags (I)
 * - w_t = tag weight from user profile (0 if tag not in profile)
 * - Signup tag weight = 0.6 (fixed)
 * - History tag weight = 0.95 ^ daysSinceClick (decayed)
 * - Item tag weight = 1.0 (binary)
 * - If tag exists in both signup and history → keep max weight
 *
 * @param {Array<{tag: string, weight: number}>} userWeightedTags
 * @param {Array<string>} itemTags
 * @returns {number} Similarity score between 0.0 and 1.0
 */
const calculateWeightedJaccard = (userWeightedTags, itemTags) => {

    const normalisedItemTags = itemTags.map(t => t.toLowerCase());

    let intersectionWeight = 0;
    let unionWeight        = 0;

    // Build lookup: tag → weight for user profile
    // If same tag appears twice, keep higher weight — no double counting
    const userTagMap = {};
    for (const entry of userWeightedTags) {
        const key = entry.tag.toLowerCase();
        userTagMap[key] = Math.max(userTagMap[key] || 0, entry.weight);
    }

    // Gather all unique tags across both sets
    const allTags = new Set([
        ...Object.keys(userTagMap),
        ...normalisedItemTags
    ]);

    for (const tag of allTags) {
        const userWeight = userTagMap[tag]                       || 0;
        const itemWeight = normalisedItemTags.includes(tag) ? 1.0 : 0;

        intersectionWeight += Math.min(userWeight, itemWeight);
        unionWeight        += Math.max(userWeight, itemWeight);
    }

    if (unionWeight === 0) return 0;
    return intersectionWeight / unionWeight;
};


// ─────────────────────────────────────────────
// HELPER — BUILD WEIGHTED PROFILE
// ─────────────────────────────────────────────

/**
 * Converts raw user data from MongoDB into weighted tag array for scoring.
 *
 * signupTags in DB     : ["CSE", "Sem 6"]  — plain strings, immutable
 * viewHistoryTags in DB: [{ tag, lastSeen }] — objects with timestamps
 *
 * @param {Object} user — User document from MongoDB
 * @returns {Array<{tag: string, weight: number}>}
 */
const buildWeightedProfile = (user) => {
    const profile = [];

    // Signup tags — fixed weight, always present
    for (const tag of user.signupTags) {
        profile.push({ tag, weight: SIGNUP_TAG_WEIGHT });
    }

    // History tags — decayed weight based on recency
    for (const entry of (user.viewHistoryTags || [])) {
        const weight = calculateDecayWeight(entry.lastSeen);
        if (weight >= PRUNE_THRESHOLD) {
            profile.push({ tag: entry.tag, weight });
        }
        // Tags below PRUNE_THRESHOLD excluded here
        // Actual removal from MongoDB happens in pruneDecayedTags()
    }

    return profile;
};


// ─────────────────────────────────────────────
// CORE ALGORITHM — PERSONALISED FEED
// ─────────────────────────────────────────────

/**
 * Generates a personalised ranked feed for a user.
 *
 * @param {Object}   user      — User document from MongoDB
 * @param {Object[]} inventory — Active items from MongoDB
 * @returns {Object[]} Ranked array of items with relevanceScore attached
 */
const getPersonalizedFeed = (user, inventory) => {

    // Step 1 — Pre-filter: only active items enter the algorithm
    // sold, deleted, donated, claimed never appear in main feed
    const activeInventory = inventory.filter(item => item.status === "active");

    // Step 2 — Exclude seller's own items
    // A seller should not see their own listings in their buying feed
    const filteredInventory = activeInventory.filter(
        item => item.sellerId.toString() !== user._id.toString()
    );

    // Step 3 — Build weighted tag profile
    const weightedProfile = buildWeightedProfile(user);

    // Step 4 — Score every item
    const scoredItems = filteredInventory.map(item => ({
        ...item._doc,
        relevanceScore: calculateWeightedJaccard(weightedProfile, item.tags)
    }));

    // Step 5 — Filter zero-score items
    let feed = scoredItems.filter(item => item.relevanceScore > 0);

    // Step 6 — Fallback if results below threshold
    if (feed.length < FALLBACK_THRESHOLD) {
        const feedIds = new Set(feed.map(item => item._id.toString()));

        const recentItems = filteredInventory
            .filter(item => !feedIds.has(item._id.toString()))
            .sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt))
            .slice(0, FALLBACK_THRESHOLD - feed.length)
            .map(item => ({
                ...item._doc,
                relevanceScore : 0,
                isFallback     : true
                // isFallback flag lets frontend label these differently
                // e.g. "You might also like" instead of personalised picks
            }));

        feed = [...feed, ...recentItems];
    }

    // Step 7 — Sort: relevance score desc, fairPrice asc as tie-breaker
    feed.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }
        return (a.fairPrice || 0) - (b.fairPrice || 0);
    });

    return feed;
};


// ─────────────────────────────────────────────
// UTILITY — PRUNE DECAYED TAGS
// ─────────────────────────────────────────────

/**
 * Returns viewHistoryTags with fully decayed entries removed.
 * Call after recordClick and save result back to MongoDB.
 *
 * @param {Array<{tag: string, lastSeen: string}>} viewHistoryTags
 * @returns {Array<{tag: string, lastSeen: string}>} Cleaned array
 */
const pruneDecayedTags = (viewHistoryTags = []) => {
    return viewHistoryTags.filter(entry => {
        return calculateDecayWeight(entry.lastSeen) >= PRUNE_THRESHOLD;
    });
};


// ─────────────────────────────────────────────
// UTILITY — RECORD A CLICK
// ─────────────────────────────────────────────

/**
 * Updates viewHistoryTags when a user clicks an item.
 * If tag already exists — refreshes lastSeen (resets decay).
 * If tag is new — adds it to history.
 *
 * @param {Array<{tag: string, lastSeen: string}>} existingHistory
 * @param {string[]} clickedItemTags
 * @returns {Array<{tag: string, lastSeen: string}>} Updated history
 */
const recordClick = (existingHistory = [], clickedItemTags = []) => {
    const now     = new Date().toISOString();
    const updated = [...existingHistory];

    for (const tag of clickedItemTags) {
        const existing = updated.find(
            entry => entry.tag.toLowerCase() === tag.toLowerCase()
        );

        if (existing) {
            existing.lastSeen = now;  // refresh — resets decay
        } else {
            updated.push({ tag, lastSeen: now });  // new tag
        }
    }

    return updated;
};


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
    getPersonalizedFeed,
    recordClick,
    pruneDecayedTags,
    calculateDecayWeight,
    buildWeightedProfile,
};