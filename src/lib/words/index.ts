const wordModules: Record<string, { default: string[] }> = import.meta.glob(
  "./*.json",
  { eager: true },
);

export function getWordLists() {
  return Object.entries(wordModules).map(([path, module]) => ({
    name: path.replace(/^\.\/|\.json$/g, ""),
    words: module.default,
  }));
}

export function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
