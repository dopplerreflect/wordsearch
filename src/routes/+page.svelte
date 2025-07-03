<script lang="ts">
  import { skydivingWords } from '$lib/words';
  import { transformersWords } from '$lib/transformers';
  import HexGrid from '$lib/HexGrid.svelte';
  import { placeWords, type HexGridData, type WordPlacementData } from '$lib/wordPlacement';

  let selectedWordList: 'skydiving' | 'transformers' = 'skydiving';

  $: currentWords = selectedWordList === 'skydiving' ? skydivingWords : transformersWords;

  const rows = 23;
  const cols = 20;
  $: ({ hexGridData, wordPlacementData } = placeWords(currentWords, rows, cols));

  let hoveredWord: string | null = null;
  let highlightAll: boolean = false;

  function handleMouseEnter(word: string) {
    hoveredWord = word.toUpperCase();
  }

  function handleMouseLeave() {
    hoveredWord = null;
  }
</script>

<div class="container">
  <div class="left-panel">
    <div class="word-list">
      <h2>{selectedWordList === 'skydiving' ? 'Skydiving Words' : 'Transformers Words'}</h2>
      <ul>
        {#each currentWords as word}
          <li
            on:mouseenter={() => handleMouseEnter(word)}
            on:mouseleave={handleMouseLeave}
          >
            {word}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="center-panel">
    <HexGrid {hexGridData} {wordPlacementData} {hoveredWord} {rows} {cols} {highlightAll} />
  </div>

  <div class="right-panel">
    <div class="controls">
      <label>
        <input type="radio" name="wordList" value="skydiving" bind:group={selectedWordList} /> Skydiving Words
      </label>
      <label>
        <input type="radio" name="wordList" value="transformers" bind:group={selectedWordList} /> Transformers Words
      </label>
      <label>
        <input type="checkbox" bind:checked={highlightAll} /> Highlight All Words
      </label>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: space-around;
    padding: 20px;
  }

  .left-panel {
    flex: 1;
    padding-right: 20px;
  }

  .center-panel {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right-panel {
    flex: 1;
    padding-left: 20px;
  }

  .controls label {
    display: block;
    margin-bottom: 10px;
  }

  .word-list {
    font-family: sans-serif;
    padding: 20px;
  }

  .word-list h2 {
    color: #333;
    margin-bottom: 15px;
  }

  .word-list ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .word-list li {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    padding: 8px 12px;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9em;
  }

  @media print {
    .container {
      display: block;
      width: 7.5in; /* Approximately 720px at 96dpi, leaving 0.5in margins on 8.5in page */
      margin: 0.5in auto; /* Center with 0.5 inch top/bottom margins */
      padding: 0;
      box-sizing: border-box;
    }

    .left-panel,
    .right-panel {
      flex: none;
      width: auto;
      padding: 0;
    }

    .center-panel {
      flex: none;
      width: auto;
      display: block;
      text-align: center;
    }

    .controls {
      display: none;
    }

    .word-list {
      padding: 0;
    }

    .word-list h2 {
      text-align: center;
      margin-bottom: 5px;
    }

    .word-list ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
    }

    .word-list li {
      background-color: transparent;
      border: none;
      padding: 2px 5px;
      font-size: 0.8em;
    }

  }
</style>
