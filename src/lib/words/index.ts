const wordModules = import.meta.glob("./*.json", { eager: true });

export function getWordLists() {
  return Object.entries(wordModules).map(([path, module]) => ({
    name: path.replace(/^\.\/|\.json$/g, ""),
    words: module.default,
  }));
}
