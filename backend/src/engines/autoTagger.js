/**
 * AUTO-TAGGER ENGINE — UniTrade
 *
 * Purpose: Extracts taxonomy-constrained tags from item listings using
 * Google Gemini 1.5 Flash. Tags feed the Discovery Engine (weighted
 * Jaccard similarity) that powers recommendations. Free-form tags
 * break recommendations, so every tag MUST come from the controlled
 * taxonomy defined below.
 *
 * Fallback chain (guaranteed to never throw):
 *   1. extractTagsFromImage  — Gemini vision + text context
 *   2. extractTagsFromText   — Gemini text-only
 *   3. extractTagsWithFallback — pure rule-based, zero API calls
 *   4. [] (empty array)
 *
 * Main export: generateTags(imageUrl, title, description, category)
 *   → always returns string[], never throws, never returns null
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const {GEMINI_API_KEY} = require("../config/serverConfig");

// ─────────────────────────────────────────────
// CONTROLLED TAXONOMY
// ─────────────────────────────────────────────

const TAXONOMY = {
    categories: [
        "books", "electronics", "furniture", "sports",
        "clothing", "stationery", "academic", "appliances", "general"
    ],

    subTags: {
        sports: ["volleyball", "cricket", "badminton", "football", "gym", "outdoor", "equipment", "fitness"],
        electronics: ["laptop", "phone", "charger", "earphones", "keyboard", "mouse", "tablet", "cable", "accessories"],
        books: ["textbook", "novel", "notes", "academic", "competitive-exam", "fiction", "non-fiction", "reference"],
        furniture: ["chair", "table", "desk", "shelf", "bed", "storage", "wooden", "plastic"],
        clothing: ["tshirt", "jacket", "formal", "casual", "shoes", "accessories", "winter", "summer"],
        stationery: ["pen", "notebook", "marker", "art-supplies", "files", "organizer"],
        academic: ["notes", "assignments", "lab-manual", "project", "semester", "exam-prep"],
        appliances: ["fan", "lamp", "kettle", "iron", "heater", "extension-cord", "adapter"],
        general: ["misc", "second-hand", "bundle", "set", "collectible"]
    }
};

/** Flat set of every valid tag for O(1) validation */
const VALID_TAGS = new Set([
    ...TAXONOMY.categories,
    ...Object.values(TAXONOMY.subTags).flat()
]);


// ─────────────────────────────────────────────
// GEMINI CLIENT
// ─────────────────────────────────────────────

let _model = null;

/**
 * Lazy-initialises and returns the Gemini 1.5 Flash model.
 * Deferred so the module can be required even when the API key
 * is not yet set (e.g. during tests).
 */
const getModel = () => {
    if (!_model) {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        _model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    return _model;
};


// ─────────────────────────────────────────────
// SHARED PROMPT
// ─────────────────────────────────────────────

/**
 * Builds the taxonomy-constrained system prompt reused by both
 * image and text extraction functions.
 */
const buildPrompt = (title, description, category) => {
    const taxonomyBlock = Object.entries(TAXONOMY.subTags)
        .map(([cat, tags]) => `  ${cat}: ${tags.join(", ")}`)
        .join("\n");

    return `You are a tag extraction engine for a college campus marketplace called UniTrade.

Given the following item listing, return the most relevant tags.

TITLE: ${title || ""}
DESCRIPTION: ${description || ""}
CATEGORY: ${category || ""}

ALLOWED TAGS (you must ONLY return tags from this list):
Categories: ${TAXONOMY.categories.join(", ")}
Sub-tags:
${taxonomyBlock}

Rules:
1. Return ONLY tags that exist in the allowed list above.
2. Include the category tag itself if it matches.
3. Pick 3-8 tags that best describe this item.
4. Return ONLY a valid JSON array of strings. No explanation. No markdown. No backticks.`;
};


// ─────────────────────────────────────────────
// RESPONSE PARSER
// ─────────────────────────────────────────────

/**
 * Safely parses Gemini's response text into a validated tag array.
 * Strips markdown fences, backticks, and any surrounding prose
 * before attempting JSON.parse.
 *
 * @param {string} raw  Raw response text from Gemini
 * @returns {string[]|null}  Validated tags or null on failure
 */
const parseTagResponse = (raw) => {
    try {
        // Strip markdown code fences and backticks
        let cleaned = raw
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .replace(/`/g, "")
            .trim();

        // Extract the JSON array if surrounded by prose
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            cleaned = arrayMatch[0];
        }

        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed)) return null;

        // Filter to only valid taxonomy tags (lowercase, trimmed)
        const validated = parsed
            .map(tag => String(tag).toLowerCase().trim())
            .filter(tag => VALID_TAGS.has(tag));

        // Deduplicate
        return [...new Set(validated)];
    } catch {
        return null;
    }
};


// ─────────────────────────────────────────────
// 1. IMAGE + TEXT EXTRACTION
// ─────────────────────────────────────────────

/**
 * Calls Gemini 1.5 Flash with the item image + text context.
 *
 * @param {string} imageUrl    Public URL of the item image
 * @param {string} title       Item title
 * @param {string} description Item description
 * @param {string} category    Item category
 * @returns {Promise<string[]|null>}  Tags or null on failure
 */
const extractTagsFromImage = async (imageUrl, title, description, category) => {
    try {
        const model = getModel();
        const prompt = buildPrompt(title, description, category);

        // Fetch remote image and convert to base64 for Gemini inlineData
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]);

        const response = await result.response;
        const text = response.text();
        return parseTagResponse(text);
    } catch (err) {
        console.error("[AutoTagger] extractTagsFromImage failed:", err.message);
        return null;
    }
};


// ─────────────────────────────────────────────
// 2. TEXT-ONLY EXTRACTION
// ─────────────────────────────────────────────

/**
 * Calls Gemini 1.5 Flash with title + description + category only.
 *
 * @param {string} title       Item title
 * @param {string} description Item description
 * @param {string} category    Item category
 * @returns {Promise<string[]|null>}  Tags or null on failure
 */
const extractTagsFromText = async (title, description, category) => {
    try {
        const model = getModel();
        const prompt = buildPrompt(title, description, category);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseTagResponse(text);
    } catch (err) {
        console.error("[AutoTagger] extractTagsFromText failed:", err.message);
        return null;
    }
};


// ─────────────────────────────────────────────
// 3. RULE-BASED FALLBACK
// ─────────────────────────────────────────────

/**
 * Pure rule-based fallback — zero API calls.
 * Maps the category string to a default tag array from the taxonomy.
 *
 * @param {string} title       Item title (used for keyword matching)
 * @param {string} description Item description (used for keyword matching)
 * @param {string} category    Item category
 * @returns {string[]|null}    Tags or null if category is unrecognised
 */
const extractTagsWithFallback = (title, description, category) => {
    try {
        const cat = (category || "").toLowerCase().trim();
        const tags = [];

        // Add the category itself if valid
        if (TAXONOMY.categories.includes(cat)) {
            tags.push(cat);
        }

        // Map category to its default sub-tags
        const subTags = TAXONOMY.subTags[cat];
        if (!subTags) {
            // Unknown category — fall back to "general"
            tags.push("general", "misc", "second-hand");
            return tags;
        }

        // Keyword scan: check title + description against sub-tags
        const corpus = `${title || ""} ${description || ""}`.toLowerCase();

        const matched = subTags.filter(tag => corpus.includes(tag));

        if (matched.length > 0) {
            tags.push(...matched);
        } else {
            // No keyword hits — include first 3 sub-tags as sensible defaults
            tags.push(...subTags.slice(0, 3));
        }

        return [...new Set(tags)];
    } catch (err) {
        console.error("[AutoTagger] extractTagsWithFallback failed:", err.message);
        return null;
    }
};


// ─────────────────────────────────────────────
// MAIN ENTRYPOINT — FALLBACK CHAIN
// ─────────────────────────────────────────────

/**
 * Generates tags for an item listing using a cascading fallback chain.
 * Guarantees: always returns string[], never throws, never returns null.
 *
 * Fallback order:
 *   1. Gemini vision  (if imageUrl provided)
 *   2. Gemini text-only
 *   3. Rule-based mapping
 *   4. Empty array
 *
 * @param {string|null} imageUrl    Public URL of the item image (optional)
 * @param {string}      title       Item title
 * @param {string}      description Item description
 * @param {string}      category    Item category
 * @returns {Promise<string[]>}     Always resolves, never rejects
 */
const generateTags = async (imageUrl, title, description, category) => {
    try {
        // Step 1 — Try image + text extraction (if image available)
        if (imageUrl) {
            const imageTags = await extractTagsFromImage(imageUrl, title, description, category);
            if (imageTags && imageTags.length > 0) {
                return imageTags;
            }
        }

        // Step 2 — Try text-only extraction
        const textTags = await extractTagsFromText(title, description, category);
        if (textTags && textTags.length > 0) {
            return textTags;
        }

        // Step 3 — Rule-based fallback
        const fallbackTags = extractTagsWithFallback(title, description, category);
        if (fallbackTags && fallbackTags.length > 0) {
            return fallbackTags;
        }

        // Step 4 — Absolute safety net
        return [];
    } catch (err) {
        console.error("[AutoTagger] generateTags unexpected error:", err.message);
        return [];
    }
};


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
    generateTags,
    extractTagsFromImage,
    extractTagsFromText,
    extractTagsWithFallback,
    TAXONOMY,
    VALID_TAGS
};
