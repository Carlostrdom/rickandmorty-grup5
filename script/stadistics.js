const urlCharacters = "https://rickandmortyapi.com/api/character";
const { createApp } = Vue;

createApp({
    data() {
        return {
            characters: [],
            textSearch: "",
            statusFilter: [],
            speciesFilter: [],
            availableSpecies: [],
            currentPage: 1,
            totalPages: 0,
            selectedCharacters: [],
        };
    },
    created() {
        this.loadFromLocalStorage();
        this.fetchRickAndMortyData();
    },
    methods: {
        fetchRickAndMortyData() {
            const url = new URL(urlCharacters);
            url.searchParams.set('page', this.currentPage);
            
            if (this.statusFilter.length > 0) {
                url.searchParams.set('status', this.statusFilter.join(','));
            }
            if (this.speciesFilter.length > 0) {
                url.searchParams.set('species', this.speciesFilter.join(','));
            }
            if (this.textSearch) {
                url.searchParams.set('name', this.textSearch);
            }

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
                    this.saveToLocalStorage();
                })
                .catch(error => {
                    console.error('Error al obtener los personajes:', error);
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
            this.saveToLocalStorage();
        },
        isCharacterSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id);
        },
        clearSelectedCharacters() {
            this.selectedCharacters = [];
            this.saveToLocalStorage();
        },
        applyFilters() {
            this.currentPage = 1;
            this.fetchRickAndMortyData();
        },
        calculateAverage(characters, stat) {
            if (characters.length === 0) return 0;
            const sum = characters.reduce((total, character) => total + character[stat], 0);
            return (sum / characters.length).toFixed(2);
        },
        saveToLocalStorage() {
            localStorage.setItem('selectedCharacters', JSON.stringify(this.selectedCharacters));
            localStorage.setItem('currentPage', this.currentPage.toString());
        },
        loadFromLocalStorage() {
            const savedCharacters = localStorage.getItem('selectedCharacters');
            if (savedCharacters) {
                this.selectedCharacters = JSON.parse(savedCharacters);
            }
            const savedPage = localStorage.getItem('currentPage');
            if (savedPage) {
                this.currentPage = parseInt(savedPage);
            }
        },
        hasNoResults() {
            return this.filteredCharacters.length === 0 && this.textSearch !== "";
        }
    },
    computed: {
        filteredCharacters() {
            return this.characters.filter(character => 
                (this.statusFilter.length === 0 || this.statusFilter.includes(character.status)) &&
                (this.speciesFilter.length === 0 || this.speciesFilter.includes(character.species)) &&
                (this.textSearch === "" || character.name.toLowerCase().includes(this.textSearch.toLowerCase()))
            );
        },
        speciesComparison() {
            const speciesData = {};
            const totalCharacters = this.filteredCharacters.length;
            this.availableSpecies.forEach(species => {
                const charactersOfSpecies = this.filteredCharacters.filter(c => c.species === species);
                const speciesCount = charactersOfSpecies.length;
                const alive = charactersOfSpecies.filter(c => c.status === "Alive").length;
                
                speciesData[species] = {
                    good: ((alive / speciesCount) * 100 || 0).toFixed(2),
                    bad: (((speciesCount - alive) / speciesCount) * 100 || 0).toFixed(2),
                    avgIntelligence: this.calculateAverage(charactersOfSpecies, 'intelligence'),
                    avgChaosLevel: this.calculateAverage(charactersOfSpecies, 'chaosLevel'),
                    avgPopularity: this.calculateAverage(charactersOfSpecies, 'popularity'),
                    avgDimensionsVisited: this.calculateAverage(charactersOfSpecies, 'dimensionsVisited'),
                    percentageOfTotal: ((speciesCount / totalCharacters) * 100).toFixed(2)
                };
            });
            return speciesData;
        }
    }
}).mount('#appStadistics');
