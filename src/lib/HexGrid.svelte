<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { Hex, HexagonLayout, Point } from './hexUtils'; // Group all types
  import { hexToPixel, getHexVertices, pointy_top } from './hexUtils'; // Group all values
  import type { HexGridData, WordPlacementData } from './wordPlacement';

  type Props = {
    hexGridData: HexGridData;
    wordPlacementData: WordPlacementData;
    hoveredWord: string | null;
    cols: number;
    rows: number;
    highlightAll: boolean;
    foundWords: Set<string>;
    onWordFound: Function;
  }
  let { hexGridData, wordPlacementData, hoveredWord = null, cols, rows, highlightAll, foundWords, onWordFound }: Props = $props();
  
  const inch = 96;
  const gridWidth = 7 * inch;
  const hexRadius = gridWidth / ((cols + 0.75) * Math.sqrt(3) );
  const gridHeight = (rows + 0 ) * hexRadius * 1.5 + hexRadius * Math.sqrt(3);
  const layout: HexagonLayout = {
    orientation: pointy_top,
    size: { x: hexRadius, y: hexRadius },
    origin: { x: 0 + hexRadius, y: 0 + hexRadius }, // Adjust origin to 0, 0 with buffer to edge of hex cell
  };
  let selectedHexes = $state(new SvelteSet([]));
  
  // Create a Set of all placed hexes for efficient lookup when highlightAll is true
  let allPlacedHexes = $derived(new Set(
    Array.from(wordPlacementData.values()).flatMap(wordHexes =>
      wordHexes.map(hex => `${hex.q},${hex.r},${hex.s}`)
    )
  ));

  // Helper to convert string key back to Hex
  function stringToHex(s: string): Hex {
    const parts = s.split(',').map(Number);
    return { q: parts[0], r: parts[1], s: parts[2] };
  }

  function getPoints(hex: Hex): string {
    const vertices = getHexVertices(hex, layout);
    return vertices.map(p => `${p.x},${p.y}`).join(' ');
  }

  function getHexCenter(hex: Hex): Point {
    return hexToPixel(hex, layout);
  }

  function handleHexClick(hex: Hex): void {
    selectedHexes.add(hex);
    if (selectedHexes.size < 2) return;

    const selectedArray = Array.from(selectedHexes);
    const first = selectedArray[0];
    const last = selectedArray[selectedArray.length - 1];

    const line = getHexesBetween(first, last);
    if (line.length > 0) {
      const word = line.map(h => hexGridData.get(`${h.q},${h.r},${h.s}`)).join('');
      if (wordPlacementData.has(word)) {
        // Word found, add all hexes in the line to selectedHexes
        line.forEach(h => selectedHexes.add(h));
        // dispatch('wordFound', word);
        onWordFound && onWordFound(word);
        // Clear selection for next word
        selectedHexes.clear();
      }
    }
    // if the word is not found, clear the selection
    if (selectedHexes.size > 1) {
      selectedHexes.clear();
    }
  }

  // Gets all hexes between two hexes, including the start and end hexes.
  // Returns an empty array if the hexes are not on a straight line.
  function getHexesBetween(start: Hex, end: Hex): Hex[] {
    const distance = Math.max(Math.abs(start.q - end.q), Math.abs(start.r - end.r), Math.abs(start.s - end.s));
    if (distance === 0) return [start];

    const line: Hex[] = [];
    for (let i = 0; i <= distance; i++) {
      const q = Math.round(start.q + (end.q - start.q) * i / distance);
      const r = Math.round(start.r + (end.r - start.r) * i / distance);
      const s = -q - r;
      line.push({ q, r, s });
    }

    // Verify that the line is straight
    if (line.some(h => (h.q + h.r + h.s) !== 0)) {
      return [];
    }
    return line;
  }

</script>

<svg width={gridWidth} height={gridHeight} viewBox={`0 0 ${gridWidth} ${gridHeight}`}>
  {#each Array.from(hexGridData.entries()) as [hexKey, letter], i}
    {@const hex = stringToHex(hexKey)}
    {@const center = getHexCenter(hex)}
    {@const isHighlighted = 
      (highlightAll && allPlacedHexes.has(`${hex.q},${hex.r},${hex.s}`)) ||
      (hoveredWord &&
        wordPlacementData.get(hoveredWord)?.some((h) => h.q === hex.q && h.r === hex.r && h.s === hex.s))}
    {@const wordForHex = Array.from(wordPlacementData.entries()).find(([, hexes]) => hexes.some(h => h.q === hex.q && h.r === hex.r && h.s === hex.s))?.[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase()}
    {@const isFound = wordForHex && foundWords.has(wordForHex)}
    <g>
      <polygon
        points={getPoints(hex)}
        fill={isFound ? 'var(--green)' : selectedHexes.has(hex) ? 'var(--blue)' : isHighlighted ? 'yellow' : 'var(--light)'}
        stroke="var(--medium)"
        stroke-width="1"
      />
      {#if letter}
        <text
          tabindex={i}
          role='button'
          onclick={() => handleHexClick(hex)}
          onkeypress={(event) => { if(event.key === 'Enter') handleHexClick(hex)}}
          x={center.x}
          y={center.y}
          text-anchor="middle"
          dominant-baseline="middle"
          font-size={Math.floor(hexRadius * 1.25)}
          fill="var(--dark)"
        >
          {letter}
        </text>
      {/if}
    </g>
  {/each}
</svg>

<style>
  svg text {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-weight: bold;
    cursor: pointer;
  }
</style>
