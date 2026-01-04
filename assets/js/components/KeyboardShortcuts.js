export class KeyboardShortcuts {
  constructor(shortcuts = []) {
    this.shortcuts = shortcuts;
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    this.shortcuts.forEach(shortcut => {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

      if (
        ctrlMatch &&
        shiftMatch &&
        e.key.toLowerCase() === shortcut.key.toLowerCase()
      ) {
        e.preventDefault();
        shortcut.action();
      }
    });
  }
}
