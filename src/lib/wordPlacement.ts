import { type Hex, generateHexGrid } from "./hexUtils";

export type HexGridData = Map<string, string>; // Map<"q,r,s", letter>
export type WordPlacementData = Map<string, Hex[]>; // Map<word, Hex[]>

// Helper to convert Hex to a string key for the map
function hexToString(hex: Hex): string {
  return `${hex.q},${hex.r},${hex.s}`;
}

// Helper to convert string key back to Hex
function stringToHex(s: string): Hex {
  const parts = s.split(",").map(Number);
  return { q: parts[0], r: parts[1], s: parts[2] };
}

// Directions for hexagonal grid (axial coordinates)
const directions = [
  { q: 1, r: 0, s: -1 }, // East
  { q: 0, r: 1, s: -1 }, // North-East
  { q: -1, r: 1, s: 0 }, // North-West
  { q: -1, r: 0, s: 1 }, // West
  { q: 0, r: -1, s: 1 }, // South-West
  { q: 1, r: -1, s: 0 }, // South-East
];

function addHex(hex1: Hex, hex2: Hex): Hex {
  return { q: hex1.q + hex2.q, r: hex1.r + hex2.r, s: hex1.s + hex2.s };
}

function getNeighbor(hex: Hex, directionIndex: number): Hex {
  return addHex(hex, directions[directionIndex]);
}

export function placeWords(
  words: string[],
  rows: number,
  cols: number,
  maxAttempts = 10, // Maximum number of attempts to place all words
): { hexGridData: HexGridData; wordPlacementData: WordPlacementData } {
  let attempts = 0;
  let bestGrid: HexGridData | null = null;
  let bestWordPlacements: WordPlacementData | null = null;
  let placedAllWords = false;

  while (attempts < maxAttempts && !placedAllWords) {
    const grid: HexGridData = new Map();
    const wordPlacements: WordPlacementData = new Map();
    const allHexes = generateHexGrid(rows, cols);

    // Initialize grid with empty cells
    allHexes.forEach((hex) => grid.set(hexToString(hex), ""));

    // Shuffle words to get different layouts each time
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    let allWordsInThisAttemptPlaced = true;

    for (const word of shuffledWords) {
      const cleanedWord = word.replace(/[^a-zA-Z0-9]/g, "");
      const wordLetters = cleanedWord.toUpperCase().split("");
      let placed = false;

      const shuffledHexes = allHexes.sort(() => Math.random() - 0.5);
      for (const startHex of shuffledHexes) {
        for (let d = 0; d < directions.length; d++) {
          let currentHex = startHex;
          let canPlace = true;
          const path: Hex[] = [];

          for (let i = 0; i < wordLetters.length; i++) {
            const hexKey = hexToString(currentHex);
            if (!grid.has(hexKey)) {
              canPlace = false;
              break;
            }
            const existingLetter = grid.get(hexKey);
            if (existingLetter !== "" && existingLetter !== wordLetters[i]) {
              canPlace = false;
              break;
            }
            path.push(currentHex);
            if (i < wordLetters.length - 1) {
              currentHex = getNeighbor(currentHex, d);
            }
          }

          if (canPlace) {
            for (let i = 0; i < wordLetters.length; i++) {
              grid.set(hexToString(path[i]), wordLetters[i]);
            }
            wordPlacements.set(cleanedWord.toUpperCase(), path);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }

      if (!placed) {
        allWordsInThisAttemptPlaced = false;
        break; // No need to try placing other words in this failed attempt
      }
    }

    if (allWordsInThisAttemptPlaced) {
      placedAllWords = true;
      bestGrid = grid;
      bestWordPlacements = wordPlacements;
    } else if (!bestWordPlacements || wordPlacements.size > bestWordPlacements.size) {
      // Keep track of the attempt that placed the most words
      bestGrid = grid;
      bestWordPlacements = wordPlacements;
    }

    attempts++;
  }

  if (!placedAllWords) {
    console.warn(
      `Could not place all words after ${maxAttempts} attempts. Falling back to best attempt.`,
    );
    // Log the words that were not placed in the best attempt
    const placedWords = new Set(bestWordPlacements?.keys());
    words.forEach(word => {
      const cleanedWord = word.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (!placedWords.has(cleanedWord)) {
        console.warn(`  - Could not place: ${word}`);
      }
    });
  }

  const finalGrid = bestGrid!;
  const finalWordPlacements = bestWordPlacements!;

  // Fill remaining empty cells with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const hexKey of finalGrid.keys()) {
    if (finalGrid.get(hexKey) === "") {
      finalGrid.set(hexKey, alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
  }

  return { hexGridData: finalGrid, wordPlacementData: finalWordPlacements };
}
