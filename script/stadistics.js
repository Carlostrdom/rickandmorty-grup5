let urlCharacters = "https://rickandmortyapi.com/api/character";

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            characters: [],
            textSearch: "",
            statusFilter: [],
            speciesFilter: "",
            availableSpecies: [],
            nextPage: null,
            prevPage: null,
            currentPage: 1,
            totalPages: 0,
            selectedCharacters: [],
            loading: true
        };
    },
    created() {
        this.loadState();
        this.fetchRickAndMortyData(this.urlCharactersWithPage());
    },
    methods: {
        fetchRickAndMortyData(url) {
            this.loading = true;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.characters = data.results.map(character => ({
                        ...character,
                        intelligence: this.getRandomStat(100),
                        chaosLevel: this.getRandomStat(100),
                        popularity: this.getRandomStat(100),
                        dimensionsVisited: this.getRandomStat(50)
                    }));
                    this.nextPage = data.info.next;
                    this.prevPage = data.info.prev;
                    this.totalPages = data.info.pages;
                    const urlObj = new URL(url);
                    const pageParam = urlObj.searchParams.get('page');
                    this.currentPage = pageParam ? parseInt(pageParam) : this.currentPage;
                    this.loading = false;
                    this.updateAvailableSpecies();
                    this.saveState();
                })
                .catch(error => {
                    console.error('Error al obtener los personajes:', error);
                    this.loading = false;
                });
        },
        updateAvailableSpecies() {
            const uniqueSpecies = [...new Set(this.characters.map(char => char.species))];
            this.availableSpecies = uniqueSpecies.sort((a, b) => a.localeCompare(b));
        },
        urlCharactersWithPage() {
            const url = new URL(urlCharacters);
            url.searchParams.set('page', this.currentPage);
            return url.toString();
        },
        goToNextPage() {
            if (this.nextPage) {
                this.fetchRickAndMortyData(this.nextPage);
            }
        },
        goToPrevPage() {
            if (this.prevPage) {
                this.fetchRickAndMortyData(this.prevPage);
            }
        },
        getRandomStat(max) {
            return Math.floor(Math.random() * max) + 1;
        },
        getProgressBarColor(value) {
            if (value < 30) return 'bg-danger';
            if (value < 70) return 'bg-warning';
            return 'bg-success';
        },
        toggleCharacterSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
            } else {
                this.selectedCharacters.push(character);
            }
            this.saveState();
        },
        isCharacterSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id);
        },
        saveState() {
            const state = {
                textSearch: this.textSearch,
                statusFilter: this.statusFilter,
                speciesFilter: this.speciesFilter,
                currentPage: this.currentPage,
                selectedCharacters: this.selectedCharacters,
                url: this.urlCharactersWithPage()
            };
            localStorage.setItem('appState', JSON.stringify(state));
        },
        loadState() {
            const savedState = localStorage.getItem('appState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.textSearch = state.textSearch || "";
                this.statusFilter = state.statusFilter || [];
                this.speciesFilter = state.speciesFilter || "";
                this.currentPage = state.currentPage || 1;
                this.selectedCharacters = state.selectedCharacters || [];
                urlCharacters = state.url || urlCharacters;
            }
        },
        clearSelectedCharacters() {
            this.selectedCharacters = [];
            localStorage.removeItem('selectedCharacters');
            this.saveState();
        },
        calculateStats(characters) {
            const total = characters.length;
            const alive = characters.filter(c => c.status === "Alive").length;
            const dead = total - alive;
            
            return {
                good: this.getPercentage(alive, total),
                bad: this.getPercentage(dead, total),
                total: this.getPercentage(total, this.filteredCharacters.length),
                avgIntelligence: this.calculateAverage(characters, 'intelligence'),
                avgChaosLevel: this.calculateAverage(characters, 'chaosLevel'),
                avgPopularity: this.calculateAverage(characters, 'popularity'),
                avgDimensionsVisited: this.calculateAverage(characters, 'dimensionsVisited'),
                percentageOfTotal: this.getPercentage(total, this.characters.length)
            };
        },
        calculateAverage(characters, stat) {
            const sum = characters.reduce((total, character) => total + character[stat], 0);
            return (sum / characters.length).toFixed(2);
        },
        getPercentage(part, total) {
            return ((part / total) * 100).toFixed(2);
        }
    },
    computed: {
        filteredCharacters() {
            return this.characters.filter(character => 
                (this.statusFilter.length === 0 || this.statusFilter.includes(character.status)) &&
                (this.speciesFilter === "" || character.species === this.speciesFilter) &&
                (this.textSearch === "" || character.name.toLowerCase().includes(this.textSearch.toLowerCase()))
            );
        },
        speciesComparison() {
            const speciesSet = new Set(this.filteredCharacters.map(character => character.species));
            const speciesData = {};

            speciesSet.forEach(species => {
                speciesData[species] = this.calculateStats(
                    this.filteredCharacters.filter(character => character.species === species)
                );
            });

            return speciesData;
        }
    }
});

app.mount('#appStadistics');