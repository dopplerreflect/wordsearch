<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import HexGrid from '$lib/HexGrid.svelte';
  import { placeWords, type HexGridData, type WordPlacementData } from '$lib/wordPlacement';

  import { getWordLists} from "$lib/words/index";
  
  const wordLists = getWordLists();
  
  let selectedWordList = $state(wordLists[0].name);

  let currentWords = $derived(wordLists.find((wordList) => wordList.name === selectedWordList)?.words);

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

  function clearFoundWords() {
    foundWords.clear();
  }
</script>

<div class="container">
  <div class="left-panel">
    <div class="word-list">
      <h2>{selectedWordList} Words</h2>
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
    <div class="controls">
      Word list: 
      <select bind:value={selectedWordList} onchange={clearFoundWords}>
        {#each wordLists as wordList}
          <option value={wordList.name}>{wordList.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="center-panel">
    <HexGrid {hexGridData} {wordPlacementData} {hoveredWord} {rows} {highlightAll} {foundWords} onWordFound={handleWordFound} />
  </div>

  <div class="right-panel">
    <div class="controls">
      <label>
        <input type="checkbox" bind:checked={highlightAll} /> Highlight All Words
      </label>
      <button onclick={clearFoundWords}>Clear Found Words</button>
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
    justify-content: start;
    align-items: center;
  }

  .right-panel {
    display: none;
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
    color: var(--light);
    text-align: center;
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
    background-color: var(--medium);
    width: 20ch;
    border: 1px solid var(--light);
    padding: 0.25rem 0rem;
    border-radius: 0.25em;
    text-align: center;
    font-size: 0.9em;
  }

  .word-list li.found {
    background-color: var(--green);
    color: var(--dark);
    text-decoration: line-through;
  }

  select {
    background-color: var(--medium);
    border: 1px solid var(--light);
    border-radius: 0.25em; 
    color: var(--light);
    padding: 0.25em 1em;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    .container {
      flex-direction: column; /* Stack panels vertically */
      padding: 10px; /* Reduce padding */
    }

    .left-panel {
      padding-right: 0; /* Remove right padding */
      padding-bottom: 20px; /* Add some bottom padding */
      flex: auto; /* Allow it to take natural height */
    }

    .center-panel {
      flex: auto; /* Allow it to take natural height */
      justify-content: center; /* Center the grid on mobile */
    }

    .word-list ul {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); /* Make columns flexible */
      gap: 5px; /* Reduce gap */
    }

    .word-list li {
      width: auto; /* Allow width to be determined by grid */
      font-size: 0.8em; /* Slightly smaller font */
    }

    .controls {
      text-align: center; /* Center controls */
    }
  }

  @media print {
    .container {
      display: block;
      width: 7.0in; 
      margin: 0.75in auto; 
      padding: 0;
      box-sizing: border-box;
    }

    .left-panel {
      flex: none;
      width: auto;
      padding: 0;
    }

    .right-panel {
      display: none;
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
      border-bottom: 1px solid black;
      text-align: center;
      margin-bottom: 5px;
      margin-top: 0;
      padding-top: 0;
    }

    .word-list ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
    }

    .word-list li {
      width: auto;
      display: inline;
      background-color: transparent;
      border: none;
      padding: 0px 5px;
      font-size: 0.8rem;
    }

    select {
      display: none;
    }
  }
</style>
