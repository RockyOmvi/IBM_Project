// Search History Manager
// Tracks and manages search history

class HistoryManager {
    constructor() {
        this.maxHistory = 50;
        this.history = this.loadHistory();
    }

    loadHistory() {
        const stored = localStorage.getItem('search-history');
        return stored ? JSON.parse(stored) : [];
    }

    saveHistory() {
        localStorage.setItem('search-history', JSON.stringify(this.history));
    }

    add(query) {
        if (!query || query.trim() === '') return;

        // Remove if already exists
        this.history = this.history.filter(item => item.query !== query);

        // Add to beginning
        this.history.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });

        // Keep only max items
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        this.saveHistory();
    }

    getAll() {
        return this.history;
    }

    getRecent(limit = 10) {
        return this.history.slice(0, limit);
    }

    clear() {
        if (confirm('Clear all search history?')) {
            this.history = [];
            this.saveHistory();
            this.updateUI();
        }
    }

    remove(query) {
        this.history = this.history.filter(item => item.query !== query);
        this.saveHistory();
        this.updateUI();
    }

    updateUI() {
        const dropdown = document.getElementById('history-dropdown');
        if (!dropdown) return;

        const recent = this.getRecent(10);

        if (recent.length === 0) {
            dropdown.innerHTML = '<div class="p-3 text-sm text-neutral-500">No recent searches</div>';
            return;
        }

        dropdown.innerHTML = recent.map(item => `
      <button 
        class="w-full text-left px-3 py-2 hover:bg-neutral-800 text-sm flex items-center justify-between group"
        onclick="historyManager.selectHistory('${escapeHtml(item.query)}')"
      >
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="text-neutral-300">${escapeHtml(item.query)}</span>
        </span>
        <button 
          class="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400"
          onclick="event.stopPropagation(); historyManager.remove('${escapeHtml(item.query)}')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </button>
    `).join('');

        // Add clear all button
        dropdown.innerHTML += `
      <div class="border-t border-neutral-800 mt-2 pt-2">
        <button 
          class="w-full text-left px-3 py-2 hover:bg-neutral-800 text-sm text-red-400"
          onclick="historyManager.clear()"
        >
          Clear all history
        </button>
      </div>
    `;
    }

    selectHistory(query) {
        const input = document.getElementById('inputText');
        if (input) {
            input.value = query;
            input.focus();

            // Trigger search
            const form = document.getElementById('inputForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }

        // Hide dropdown
        const dropdown = document.getElementById('history-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize history manager
const historyManager = new HistoryManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
