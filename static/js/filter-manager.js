class FilterManager {
    constructor() {
        this.filters = {
            language: "",
            stars_min: null,
            stars_max: null,
            created_after: null
        };
        this.sortBy = "stars";
        this.init();
    }

    init() {
        // Initialize UI event listeners if elements exist
        const applyBtn = document.getElementById("apply-filters");
        if (applyBtn) {
            applyBtn.addEventListener("click", () => this.applyFilters());
        }

        const resetBtn = document.getElementById("reset-filters");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => this.resetFilters());
        }
    }

    getFilters() {
        // Gather current values from UI inputs
        const langSelect = document.getElementById("filter-language");
        const starsMinInput = document.getElementById("filter-stars-min");
        const starsMaxInput = document.getElementById("filter-stars-max");
        const dateInput = document.getElementById("filter-date");
        const sortSelect = document.getElementById("filter-sort");

        if (langSelect) this.filters.language = langSelect.value;
        if (starsMinInput) this.filters.stars_min = starsMinInput.value ? parseInt(starsMinInput.value) : null;
        if (starsMaxInput) this.filters.stars_max = starsMaxInput.value ? parseInt(starsMaxInput.value) : null;
        if (dateInput) this.filters.created_after = dateInput.value;
        if (sortSelect) this.sortBy = sortSelect.value;

        return {
            filters: this.filters,
            sort_by: this.sortBy
        };
    }

    applyFilters() {
        // Trigger a new search with current filters
        // This assumes a global search function or event is available
        const searchInput = document.getElementById("inputText");
        if (searchInput && searchInput.value.trim() !== "") {
            // Dispatch a custom event or call the search function directly if accessible
            // For now, we'll simulate a form submit
            const form = document.getElementById("inputForm");
            if (form) form.dispatchEvent(new Event("submit"));
        }
        this.closeFilterPanel();
    }

    resetFilters() {
        document.getElementById("filter-language").value = "";
        document.getElementById("filter-stars-min").value = "";
        document.getElementById("filter-stars-max").value = "";
        document.getElementById("filter-date").value = "";
        document.getElementById("filter-sort").value = "stars";

        this.filters = {
            language: "",
            stars_min: null,
            stars_max: null,
            created_after: null
        };
        this.sortBy = "stars";
    }

    openFilterPanel() {
        const panel = document.getElementById("filter-panel");
        if (panel) {
            panel.classList.remove("hidden");
            panel.style.display = "flex"; // Ensure flex display for centering/layout
        }
    }

    closeFilterPanel() {
        const panel = document.getElementById("filter-panel");
        if (panel) {
            panel.classList.add("hidden");
            panel.style.display = "none";
        }
    }
}

// Initialize
window.filterManager = new FilterManager();
