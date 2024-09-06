const urlCharacters = "https://rickandmortyapi.com/api/character";

const { createApp } = Vue;

createApp({
    data() {
        return {
            characters: [],
            textSearch: "",
            statusFilter: [],
            speciesFilter: "",
            availableSpecies: [],
            currentPage: 1,
            totalPages: 0,
            selectedCharacters: [],
            loading: true
        };
    },
    created() {
        this.fetchRickAndMortyData();
    },
    methods: {
        fetchRickAndMortyData() {
            this.loading = true;
            const url = new URL(urlCharacters);
            url.searchParams.set('page', this.currentPage);

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
                    this.totalPages = data.info.pages;
                    this.updateAvailableSpecies();
                    this.loading = false;
                })
                .catch(error => {
                    console.error('Error al obtener los personajes:', error);
                    this.loading = false;
                });
        },
        updateAvailableSpecies() {
            const uniqueSpecies = [...new Set(this.characters.map(char => char.species))];
            this.availableSpecies = uniqueSpecies.sort();
        },
        goToNextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.fetchRickAndMortyData();
            }
        },
        goToPrevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchRickAndMortyData();
            }
        },
        goToSpecificPage(page) {
            if (page > 0 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchRickAndMortyData();
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
        },
        isCharacterSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id);
        },
        clearSelectedCharacters() {
            this.selectedCharacters = [];
        },
        applyFilters() {
            this.currentPage = 1;
            this.fetchRickAndMortyData();
        },
        calculateAverage(characters, stat) {
            if (characters.length === 0) return 0;
            const sum = characters.reduce((total, character) => total + character[stat], 0);
            return (sum / characters.length).toFixed(2);
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
            const speciesData = {};
            this.availableSpecies.forEach(species => {
                const charactersOfSpecies = this.filteredCharacters.filter(c => c.species === species);
                const total = charactersOfSpecies.length;
                const alive = charactersOfSpecies.filter(c => c.status === "Alive").length;
                
                speciesData[species] = {
                    good: ((alive / total) * 100 || 0).toFixed(2),
                    bad: (((total - alive) / total) * 100 || 0).toFixed(2),
                    total: total,
                    avgIntelligence: this.calculateAverage(charactersOfSpecies, 'intelligence'),
                    avgChaosLevel: this.calculateAverage(charactersOfSpecies, 'chaosLevel'),
                    avgPopularity: this.calculateAverage(charactersOfSpecies, 'popularity'),
                    avgDimensionsVisited: this.calculateAverage(charactersOfSpecies, 'dimensionsVisited'),
                    percentageOfTotal: ((total / this.characters.length) * 100 || 0).toFixed(2)
                };
            });
            return speciesData;
        }
    }
}).mount('#appStadistics');