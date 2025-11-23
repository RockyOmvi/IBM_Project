// Favorites Manager
// Handles repository bookmarking and favorites management

class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        const stored = localStorage.getItem('repo-favorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem('repo-favorites', JSON.stringify(this.favorites));
        this.updateUI();
    }

    add(repo) {
        if (!this.isFavorite(repo.url)) {
            this.favorites.push({
                url: repo.url,
                owner: repo.owner,
                name: repo.name,
                description: repo.description,
                stars: repo.stars,
                language: repo.language,
                addedAt: new Date().toISOString()
            });
            this.saveFavorites();
            return true;
        }
        return false;
    }

    remove(url) {
        this.favorites = this.favorites.filter(fav => fav.url !== url);
        this.saveFavorites();
    }

    isFavorite(url) {
        return this.favorites.some(fav => fav.url === url);
    }

    getAll() {
        return this.favorites;
    }

    clear() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
        }
    }

    export() {
        const dataStr = JSON.stringify(this.favorites, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `repo-favorites-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    import(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.favorites = [...this.favorites, ...imported];
                    this.saveFavorites();
                    alert(`Imported ${imported.length} favorites!`);
                }
            } catch (error) {
                alert('Error importing favorites. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    updateUI() {
        // Update favorites count badge
        const badge = document.getElementById('favorites-count');
        if (badge) {
            badge.textContent = this.favorites.length;
            badge.style.display = this.favorites.length > 0 ? 'block' : 'none';
        }

        // Update all favorite buttons
        document.querySelectorAll('[data-repo-url]').forEach(btn => {
            const url = btn.getAttribute('data-repo-url');
            const isFav = this.isFavorite(url);
            btn.classList.toggle('favorited', isFav);

            const icon = btn.querySelector('svg');
            if (icon && isFav) {
                icon.setAttribute('fill', 'currentColor');
            } else if (icon) {
                icon.setAttribute('fill', 'none');
            }
        });
    }
}

// Initialize favorites manager
const favoritesManager = new FavoritesManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}
