new Vue({
    el: '#app',
    data: {
        characters: [],
        loading: true,
        filters: {
            species: [],
            status: []
        },
        selectedCharacters: [],
        generatedStats: {},
        pagination: {
            count: 0,
            pages: 0,
            next: null,
            prev: null
        }
    },
    computed: {
        charactersWithStats() {
            return this.characters.map(c => ({
                ...c,
                ...this.getOrGenerateStats(c.id)
            }));
        },
        filteredCharacters() {
            return this.charactersWithStats.filter(c => 
                (!this.filters.species.length || this.filters.species.includes(c.species)) &&
                (!this.filters.status.length || this.filters.status.includes(c.status))
            );
        },
        speciesComparison() {
            const calc = arr => ({
                good: this.getPercentage(arr.filter(c => c.status === "Alive").length, arr.length),
                bad: this.getPercentage(arr.filter(c => c.status !== "Alive").length, arr.length),
                total: this.getPercentage(arr.length, this.filteredCharacters.length),
                ...['intelligence', 'chaosLevel', 'popularity', 'dimensionsVisited'].reduce((acc, stat) => ({
                    ...acc,
                    [`avg${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: (arr.reduce((sum, c) => sum + c[stat], 0) / arr.length).toFixed(2)
                }), {})
            });
            return {
                humans: calc(this.filteredCharacters.filter(c => c.species === "Human")),
                aliens: calc(this.filteredCharacters.filter(c => c.species !== "Human"))
            };
        }
    },
    methods: {
        fetchCharacters(url = 'https://rickandmortyapi.com/api/character') {
            this.loading = true;
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    this.characters = data.results;
                    this.pagination = {
                        count: data.info.count,
                        pages: data.info.pages,
                        next: data.info.next,
                        prev: data.info.prev
                    };
                    this.loading = false;
                    this.loadGeneratedStats();
                    this.loadSelectedCharacters();
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                    this.loading = false;
                });
        },
        loadNextPage() {
            if (this.pagination.next) {
                this.fetchCharacters(this.pagination.next);
            }
        },
        loadPrevPage() {
            if (this.pagination.prev) {
                this.fetchCharacters(this.pagination.prev);
            }
        },
        getOrGenerateStats(characterId) {
            if (!this.generatedStats[characterId]) {
                this.generatedStats[characterId] = {
                    intelligence: this.getRandomStat(100),
                    chaosLevel: this.getRandomStat(100),
                    popularity: this.getRandomStat(100),
                    dimensionsVisited: this.getRandomStat(50)
                };
                this.saveGeneratedStats();
            }
            return this.generatedStats[characterId];
        },
        saveGeneratedStats() {
            localStorage.setItem('generatedStats', JSON.stringify(this.generatedStats));
        },
        loadGeneratedStats() {
            const saved = localStorage.getItem('generatedStats');
            if (saved) {
                this.generatedStats = JSON.parse(saved);
            }
        },
        getRandomStat: max => Math.floor(Math.random() * max) + 1,
        getProgressBarColor: v => v < 30 ? 'bg-danger' : v < 70 ? 'bg-warning' : 'bg-success',
        getPercentage: (part, total) => ((part / total) * 100).toFixed(2),
        removeCharacter(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
                this.saveSelectedCharacters();
            }
        },
        toggleCharacterSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
            } else {
                const characterWithStats = this.charactersWithStats.find(c => c.id === character.id);
                this.selectedCharacters.push(characterWithStats);
            }
            this.saveSelectedCharacters();
        },
        saveSelectedCharacters() {
            localStorage.setItem('selectedCharacters', JSON.stringify(this.selectedCharacters));
        },
        loadSelectedCharacters() {
            const saved = localStorage.getItem('selectedCharacters');
            if (saved) {
                this.selectedCharacters = JSON.parse(saved);
            }
        },
        clearSelectedCharacters() {
            this.selectedCharacters = [];
            localStorage.removeItem('selectedCharacters');
        }
    },
    mounted() {
        this.fetchCharacters();
    }
});