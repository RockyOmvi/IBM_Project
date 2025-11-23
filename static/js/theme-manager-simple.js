// Theme Manager - Handles theme switching by redirecting to different pages
class ThemeManager {
    constructor() {
        this.currentTheme = this.getTheme();
        this.init();
    }

    init() {
        // Apply theme on load
        this.applyTheme();

        // Setup toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
            this.updateIcon();
        }
    }

    getTheme() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const urlTheme = urlParams.get('theme');
        if (urlTheme) {
            localStorage.setItem('theme', urlTheme);
            return urlTheme;
        }

        // Otherwise get from localStorage
        return localStorage.getItem('theme') || 'dark';
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Show/hide Spline background based on theme
        const splineBackground = document.getElementById('spline-background');
        if (splineBackground) {
            // Dark mode = Spline background (landing page style)
            // Light mode = No Spline background (minimal style)
            splineBackground.style.display = this.currentTheme === 'dark' ? 'block' : 'none';
        }
    }

    toggle() {
        // Toggle theme
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';

        // Save to localStorage
        localStorage.setItem('theme', newTheme);

        // Reload page with new theme parameter
        const url = new URL(window.location.href);
        url.searchParams.set('theme', newTheme);
        window.location.href = url.toString();
    }

    updateIcon() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const icon = this.currentTheme === 'dark' ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-300">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-300">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
        `;

        toggleBtn.innerHTML = icon;
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
