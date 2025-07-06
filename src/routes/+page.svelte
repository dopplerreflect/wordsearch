<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import HexGrid from '$lib/HexGrid.svelte';
  import { placeWords } from '$lib/wordPlacement';
  import { getWordLists, shuffle } from '$lib/words';
  import { swipe } from '$lib/swipe';

  const wordLists = getWordLists();
  
  let selectedWordList = $derived(wordLists[Math.floor(Math.random() * wordLists.length)].name);

  let currentWords = $derived(shuffle(wordLists.find((wordList) => wordList.name === selectedWordList)?.words || []).slice(0, 24));

  const cols = 15;
  const rows = 20;

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

  let activePanel: 'wordlist' | 'hexgrid' = $state('wordlist');

  function showWordList() {
    activePanel = 'wordlist';
  }

  function showHexGrid() {
    activePanel = 'hexgrid';
  }
</script>

<div class="container">
  <div class="mobile-nav-header">
    <button class:active={activePanel === 'wordlist'} onclick={showWordList}>Words</button>
    <button class:active={activePanel === 'hexgrid'} onclick={showHexGrid}>Puzzle</button>
  </div>

  <div class="panel-wrapper" use:swipe onswipeleft={showHexGrid} onswiperight={showWordList}>
    <div class="panel-track" class:show-wordlist={activePanel === 'wordlist'} class:show-hexgrid={activePanel === 'hexgrid'}>
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
        <HexGrid {hexGridData} {wordPlacementData} {hoveredWord} {cols} {rows} {highlightAll} {foundWords} onWordFound={handleWordFound} />
      </div>
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
</div>

<style>
  .container {
    display: flex;
    justify-content: space-around;
  }

  .mobile-nav-header {
    display: none; /* Hidden by default, shown on mobile */
  }

  .panel-track {
    display: flex;
  }

  .left-panel {
    flex: 1;
  }

  .center-panel {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right-panel {
    flex: 1;
    display: none; /* only used for debugging. leave it none. */
  }

  .controls label {
    display: block;
  }

  .word-list {
    font-family: sans-serif;
  }

  .word-list h2 {
    color: var(--dark);
    text-align: center;
  }

  .word-list ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 20ch);
    gap: 0.5em;
  }

  .word-list li {
    background-color: var(--light);
    width: 20ch;
    border: 1px solid var(--medium);
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
    background-color: var(--light);
    border: 1px solid var(--medium);
    border-radius: 0.25em; 
    color: var(--dark);
    padding: 0.25em 1em;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    .container {
      display: flex;
      flex-direction: column; /* Stack panels vertically */
      padding: 0; /* Remove horizontal padding from container */
      width: 100vw; /* Ensure container takes full viewport width */
      box-sizing: border-box; /* Include padding in width calculation */
      overflow: hidden; /* Re-add overflow for mobile sliding */
    }

    .mobile-nav-header {
      display: flex; /* Show header on mobile */
      width: 100%;
      justify-content: center;
      gap: 10px;
      position: sticky; /* Keep header at the top */
      top: 0;
      background-color: var(--dark); /* Ensure header is visible */
      z-index: 100; /* Ensure header is above other content */
    }

    .mobile-nav-header button {
      padding: 8px 15px;
      border: 1px solid var(--light);
      background-color: var(--medium);
      color: var(--light);
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .mobile-nav-header button.active {
      background-color: var(--green);
      color: var(--dark);
    }

    .panel-wrapper {
      width: 100vw; /* Two panels side-by-side */
      overflow: hidden;
      position: relative;
    }

    .panel-track {
      box-sizing: border-box;
      display: flex;
      width: 200vw;
      transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }

    .panel-track.show-wordlist {
      transform: translateX(0%);
    }

    .panel-track.show-hexgrid {
      transform: translateX(-100vw); /* Slide left to show hexgrid */
    }

    .left-panel,
    .center-panel {
      flex-shrink: 0; /* Prevent shrinking during transition */
      min-width: 100vw; /* Each panel takes half the wrapper width */
      box-sizing: border-box; /* Include padding in width calculation */
    }
    .word-list ul {
      grid-template-columns: repeat(2, 20ch);
    }
    .right-panel {
      display: none; /* Hide right panel on mobile */
    }
  }

  @media print {
    @page {
      margin: 0;
    }
    body {
      width: 8.5in;
    }
    .container {
      display: block;
      width: 7.0in; 
      margin: 0.75in;
      box-sizing: border-box;
    }

    .mobile-nav-header {
      display: none;
    }

    .panel-track {
      display: block;
      width: auto;
      transform: none !important;
    }

    .left-panel {
      display: block;
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
    }

    .controls {
      display: none;
    }

    .word-list {
      width: 7in;
      padding: 0;
      text-align: center;
      margin-bottom: 1em;
    }

    .word-list h2 {
      color: black;
      border-bottom: 1px solid black;
      text-align: center;
      margin-bottom: 5px;
      margin-top: 0;
      padding-top: 0;
    }

    .word-list ul {
      display: inline;
      list-style: none;
      padding-left: 0;
      margin-left: 0;
    }

    .word-list li {
      display: inline;
      border: none;
      padding-right: 1em;
    }
    ul li:not(:last-child)::after {
      content: " ";
    }
    select {
      display: none;
    }
  }
</style>
