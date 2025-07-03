<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import { skydivingWords } from '$lib/words';
  import { transformersWords } from '$lib/transformers';
  import HexGrid from '$lib/HexGrid.svelte';
  import { placeWords, type HexGridData, type WordPlacementData } from '$lib/wordPlacement';

  let selectedWordList = $state('skydiving');

  let currentWords = $derived(selectedWordList === 'skydiving' ? skydivingWords : transformersWords);

  const rows = 23;
  const cols = 20;
  let { hexGridData, wordPlacementData } = $derived(placeWords(currentWords, rows, cols));

  let hoveredWord: string | null = $state(null);
  let highlightAll: boolean = $state(false);

  function handleMouseEnter(word: string) {
    hoveredWord = word.replace(/[^A-Za-z0-9]/,'').toUpperCase();
  }

  function handleMouseLeave() {
    hoveredWord = null;
  }

  let foundWords = $state(new SvelteSet<string>([]));
  
  function handleWordFound(foundWord: string) {
    const originalWord = currentWords.find(w => w.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === foundWord);
    if (originalWord) {
      foundWords.add(originalWord.replace(/[^A-Za-z0-9]/,'').toUpperCase());
    }
  }
</script>

<div class="container">
  <div class="left-panel">
    <div class="word-list">
      <h2>{selectedWordList === 'skydiving' ? 'Skydiving Words' : 'Transformers Words'}</h2>
      <ul>
        {#each currentWords as word}
          <li
            class:found={foundWords.has(word.replace(/[^A-Za-z0-9]/,'').toUpperCase())}
            onmouseenter={() => handleMouseEnter(word)}
            onmouseleave={handleMouseLeave}
          >
            {word}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="center-panel">
    <HexGrid {hexGridData} {wordPlacementData} {hoveredWord} {rows} {highlightAll} {foundWords} onWordFound={handleWordFound} />
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
    text-align: center;
    color: #333;
    margin-bottom: 15px;
  }

  .word-list ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 20ch);
    gap: 10px;
  }

  .word-list li {
    background-color: #f0f0f0;
    width: 20ch;
    border: 1px solid #ccc;
    padding: 0.25rem 0rem;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9em;
  }

  .word-list li.found {
    background-color: lightgreen;
    text-decoration: line-through;
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
      font-size: 0.8rem;
    }

  }
</style>
