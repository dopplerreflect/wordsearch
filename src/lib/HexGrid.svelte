<script lang="ts">
  import type { Hex, HexagonLayout, Point } from './hexUtils'; // Group all types
  import { hexToPixel, getHexVertices, pointy_top } from './hexUtils'; // Group all values
  import type { HexGridData, WordPlacementData } from './wordPlacement';

  export let hexGridData: HexGridData;
  export let wordPlacementData: WordPlacementData;
  export let hoveredWord: string | null = null;
  export let rows: number;
  export let highlightAll: boolean;

  const hexRadius = 800 / (20.5 * Math.sqrt(3) / 1);
  const gridHeight = (rows - 1) * hexRadius * 1.5 + hexRadius * Math.sqrt(3);
  const layout: HexagonLayout = {
    orientation: pointy_top,
    size: { x: hexRadius, y: hexRadius },
    origin: { x: 0 + hexRadius, y: (800 - gridHeight) / 2 + hexRadius}, // Adjust origin to 0, 0 with buffer to edge of hex cell
  };

  // Create a Set of all placed hexes for efficient lookup when highlightAll is true
  $: allPlacedHexes = new Set(
    Array.from(wordPlacementData.values()).flatMap(wordHexes =>
      wordHexes.map(hex => `${hex.q},${hex.r},${hex.s}`)
    )
  );

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
</script>

<svg width="800" height="800" viewBox="0 0 800 800">
  {#each Array.from(hexGridData.entries()) as [hexKey, letter]}
    {@const hex = stringToHex(hexKey)}
    {@const center = getHexCenter(hex)}
    {@const isHighlighted =
      (highlightAll && allPlacedHexes.has(`${hex.q},${hex.r},${hex.s}`)) ||
      (hoveredWord &&
        wordPlacementData.get(hoveredWord)?.some((h) => h.q === hex.q && h.r === hex.r && h.s === hex.s))}
    <g>
      <polygon
        points="{getPoints(hex)}"
        fill="{isHighlighted ? 'yellow' : 'white'}"
        stroke="lightgrey"
        stroke-width="1"
      />
      {#if letter}
        <text
          x="{center.x}"
          y="{center.y}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="20"
          fill="{isHighlighted ? 'black' : 'black'}"
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
  }
</style>
