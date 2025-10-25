export function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid query");
  }

  const lower = query.toLowerCase();
  const filters = {};

  if (lower.includes("palindromic") || lower.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  if (lower.includes("single word")) {
    filters.word_count = 1;
  }

  // Example: “strings longer than 10 characters”
  const longerMatch = lower.match(/longer than (\d+)/);
  if (longerMatch) {
    filters.min_length = parseInt(longerMatch[1]) + 0; // 11+
  }

  // Example: “strings shorter than 10 characters”
  const shorterMatch = lower.match(/shorter than (\d+)/);
  if (shorterMatch) {
    filters.max_length = parseInt(shorterMatch[1]) - 0;
  }

  // Example: “strings containing the letter z”
  const containMatch = lower.match(/containing (?:the letter |the character |letter )?([a-z])/);
  if (containMatch) {
    filters.contains_character = containMatch[1];
  }

  // Example: “contain the first vowel”
  if (lower.includes("first vowel")) {
    filters.contains_character = "a"; // heuristic assumption
  }

  if (Object.keys(filters).length === 0) {
    throw new Error("Unable to parse natural language query");
  }

  return filters;
}
