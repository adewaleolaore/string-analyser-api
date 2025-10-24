import crypto from "crypto";

export function analyzeString(value) {
  const length = value.length;
  const is_palindrome =
    value.toLowerCase().replace(/\s+/g, "") ===
    value.toLowerCase().replace(/\s+/g, "").split("").reverse().join("");
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).filter(Boolean).length;
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  const character_frequency_map = {};
  for (let char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}