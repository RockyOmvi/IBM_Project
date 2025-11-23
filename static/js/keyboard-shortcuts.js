// Keyboard Shortcuts Manager
// Global keyboard shortcut handler

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            '/': () => this.focusSearch(),
            'Escape': () => this.handleEscape(),
            '?': () => this.showHelp()
        };

        this.selectedIndex = -1;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleKeydown(e) {
        // Ctrl+K or Cmd+K for quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearch();
            return;
        }

        // Don't handle shortcuts when typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }

        // Handle other shortcuts
        const handler = this.shortcuts[e.key];
        if (handler) {
            e.preventDefault();
            handler();
        }

        // Arrow key navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
        }

        // Enter to open selected
        if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            this.openSelected();
        }
    }

    focusSearch() {
        const input = document.getElementById('inputText');
        if (input) {
            input.focus();
            input.select();
        }
    }

    handleEscape() {
        // Close modals
        const modal = document.getElementById('repoModal');
        if (modal && modal.style.display === 'block') {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) closeBtn.click();
            return;
        }

        // Close help
        const help = document.getElementById('shortcuts-help');
        if (help && !help.classList.contains('hidden')) {
            help.classList.add('hidden');
            return;
        }

        // Blur active element
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }

    navigateResults(direction) {
        const cards = Array.from(document.querySelectorAll('.repo-card'));
        if (cards.length === 0) return;

        // Remove previous selection
        if (this.selectedIndex >= 0 && cards[this.selectedIndex]) {
            cards[this.selectedIndex].classList.remove('keyboard-selected');
        }

        // Update index
        this.selectedIndex += direction;
        if (this.selectedIndex < 0) this.selectedIndex = cards.length - 1;
        if (this.selectedIndex >= cards.length) this.selectedIndex = 0;

        // Add new selection
        const selected = cards[this.selectedIndex];
        if (selected) {
            selected.classList.add('keyboard-selected');
            selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    openSelected() {
        const cards = Array.from(document.querySelectorAll('.repo-card'));
        if (this.selectedIndex >= 0 && cards[this.selectedIndex]) {
            cards[this.selectedIndex].click();
        }
    }

    showHelp() {
        let helpModal = document.getElementById('shortcuts-help');

        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'shortcuts-help';
            helpModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1001]';
            helpModal.innerHTML = `
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
            <button onclick="document.getElementById('shortcuts-help').classList.add('hidden')" class="text-neutral-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Focus search</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">/</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Quick search</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">Ctrl+K</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Navigate results</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">↑ ↓</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Open selected</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">Enter</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Close/Cancel</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">Esc</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-400">Show this help</span>
              <kbd class="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">?</kbd>
            </div>
          </div>
        </div>
      `;
            document.body.appendChild(helpModal);

            // Close on click outside
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.classList.add('hidden');
                }
            });
        }

        helpModal.classList.remove('hidden');
    }
}

// Initialize keyboard shortcuts
const keyboardShortcuts = new KeyboardShortcuts();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcuts;
}
