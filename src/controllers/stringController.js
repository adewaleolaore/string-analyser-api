import { stringDB } from "../db.js";
import { analyzeString } from "../utils/analyzer.js";
import { parseNaturalLanguageQuery } from "../utils/parser.js";

export const createString = (req, res) => {
  const { value } = req.body;

  if (typeof value !== "string") {
    return res.status(422).json({ error: "Value must be a string" });
  }

  const props = analyzeString(value);
  if (stringDB.has(props.sha256_hash)) {
    return res.status(409).json({ error: "String already exists" });
  }

  const record = {
    id: props.sha256_hash,
    value,
    properties: props,
    created_at: new Date().toISOString(),
  };

  stringDB.set(props.sha256_hash, record);
  res.status(201).json(record);
};

export const getString = (req, res) => {
  const value = decodeURIComponent(req.params.value);
  const hash = [...stringDB.values()].find((r) => r.value === value);

  if (!hash) return res.status(404).json({ error: "String not found" });
  res.json(hash);
};

export const deleteString = (req, res) => {
  const value = decodeURIComponent(req.params.value);
  const found = [...stringDB.values()].find((r) => r.value === value);
  if (!found) return res.status(404).json({ error: "String not found" });

  stringDB.delete(found.id);
  res.status(204).send();
};

export const getAllStrings = (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  // Validate query parameters
  const filters_applied = {};
  let data = [...stringDB.values()];

  try {
    if (is_palindrome !== undefined) {
      const boolVal = is_palindrome === "true";
      data = data.filter((r) => r.properties.is_palindrome === boolVal);
      filters_applied.is_palindrome = boolVal;
    }

    if (min_length !== undefined) {
      const val = parseInt(min_length, 10);
      if (isNaN(val)) throw new Error("Invalid min_length");
      data = data.filter((r) => r.properties.length >= val);
      filters_applied.min_length = val;
    }

    if (max_length !== undefined) {
      const val = parseInt(max_length, 10);
      if (isNaN(val)) throw new Error("Invalid max_length");
      data = data.filter((r) => r.properties.length <= val);
      filters_applied.max_length = val;
    }

    if (word_count !== undefined) {
      const val = parseInt(word_count, 10);
      if (isNaN(val)) throw new Error("Invalid word_count");
      data = data.filter((r) => r.properties.word_count === val);
      filters_applied.word_count = val;
    }

    if (contains_character !== undefined) {
      if (contains_character.length !== 1)
        throw new Error("contains_character must be a single character");
      data = data.filter((r) =>
        r.value.toLowerCase().includes(contains_character.toLowerCase())
      );
      filters_applied.contains_character = contains_character;
    }

    return res.status(200).json({
      data,
      count: data.length,
      filters_applied,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const filterByNaturalLanguage = (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const parsed = parseNaturalLanguageQuery(query);
    let results = [...stringDB.values()];

    // Apply parsed filters using same logic as getAllStrings
    if (parsed.is_palindrome !== undefined) {
      results = results.filter(r => r.properties.is_palindrome === parsed.is_palindrome);
    }
    if (parsed.min_length !== undefined) {
      results = results.filter(r => r.properties.length > parsed.min_length);
    }
    if (parsed.max_length !== undefined) {
      results = results.filter(r => r.properties.length < parsed.max_length);
    }
    if (parsed.word_count !== undefined) {
      results = results.filter(r => r.properties.word_count === parsed.word_count);
    }
    if (parsed.contains_character !== undefined) {
      const c = parsed.contains_character.toLowerCase();
      results = results.filter(r => r.value.toLowerCase().includes(c));
    }

    return res.json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsed
      }
    });
  } catch (err) {
    if (err.message.includes("Unable to parse"))
      return res.status(400).json({ error: err.message });
    res.status(422).json({ error: err.message });
  }
};
