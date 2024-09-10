// URLs de la API de Rick and Morty
const urlCharacters = "https://rickandmortyapi.com/api/character";
const urlLocations = "https://rickandmortyapi.com/api/location";
const urlEpisodes = "https://rickandmortyapi.com/api/episode";

// Importación de la función createApp de Vue
const { createApp } = Vue;

// Creación de la aplicación Vue
createApp({
    // Función data() que retorna un objeto con el estado inicial de la aplicación
    data() {
        return {
            characters: [],            // Array para almacenar los personajes
            textSearch: "",            // Texto para la búsqueda de personajes por nombre
            statusFilter: [],          // Filtros de estado (vivo, muerto, etc.)
            speciesFilter: [],         // Filtros de especies
            availableSpecies: [],      // Lista de especies disponibles para filtrar
            currentPage: 1,            // Página actual para la paginación
            totalPages: 0,             // Número total de páginas
            selectedCharacters: [],    // Array de personajes seleccionados por el usuario
            locations: [],             // Array para almacenar las ubicaciones
            episodes: [],              // Array para almacenar los episodios
            comparisonData: null,      // Datos comparativos entre ubicaciones y episodios
            totalCharacters: 0,        // Número total de personajes
            nextPage: null,            // URL de la siguiente página (si existe)
            prevPage: null,            // URL de la página anterior (si existe)
            isCharacters: true,        // Bandera para determinar si se están mostrando personajes
            allSpecies: [],            // Lista completa de todas las especies de personajes
            audio: {
                alive: new Audio('../assets/sounds/woooooaah-199849.mp3'),
                dead: new Audio('../assets/sounds/zombie-6851.mp3')
            }
        };
    },

    // Método created() que se ejecuta cuando la instancia de Vue es creada
    created() {
        this.loadFromLocalStorage(); // Carga datos desde el localStorage si existen
        this.fetchRickAndMortyData(); // Obtiene los datos iniciales de personajes
        this.fetchComparisonData();   // Obtiene los datos de comparación (ubicaciones y episodios)
    },

    // Objeto methods que contiene todos los métodos de la aplicación
    methods: {
        // Método para obtener datos de personajes de Rick and Morty
        fetchRickAndMortyData() {
            const url = new URL(urlCharacters);
            url.searchParams.set('page', this.currentPage);
            
            // Agregar filtros a la URL si están presentes

            if (this.statusFilter.length > 0) {
                url.searchParams.set('status', this.statusFilter.join(','));
            }
            if (this.speciesFilter.length > 0) {
                url.searchParams.set('species', this.speciesFilter.join(','));
            }
            if (this.textSearch) {
                url.searchParams.set('name', this.textSearch);
            }

            this.fetchData(url.toString());
        },

        // Método para realizar la petición fetch y procesar los datos
        fetchData(url) {
            this.speciesFilter = [];
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (this.isCharacters) {
                        // Procesar datos de personajes
                        this.characters = data.results.map(character => ({
                            ...character,
                            intelligence: this.getRandomStat(100),
                            chaosLevel: this.getRandomStat(100),
                            popularity: this.getRandomStat(100)
                        }));
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;
                        this.currentPage = parseInt(new URL(url).searchParams.get('page')) || 1;
                        this.totalPages = data.info.pages;
                        this.totalCharacters = data.info.count;
                        this.allSpecies = [...new Set(this.characters.map(character => character.species))].sort();
                        this.updateAvailableSpecies();
                        this.saveToLocalStorage();
                    } else {
                        // Procesar datos de episodios
                        this.episodes = data.results;
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;
                        this.currentPage = parseInt(new URL(url).searchParams.get('page')) || 1;
                        this.totalPages = Math.ceil(data.info.count / 20);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        },

        // Método para actualizar la lista de especies disponibles
        updateAvailableSpecies() {
            this.availableSpecies = [...new Set(this.characters.map(char => char.species))].sort();
        },

        // Método para ir a la siguiente página
        goToNextPage() {
            if (this.nextPage) {
                this.fetchData(this.nextPage);
            }
        },

        // Método para ir a la página anterior
        goToPrevPage() {
            if (this.prevPage) {
                this.fetchData(this.prevPage);
            }
        },

        // Método para ir a una página específica
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                const url = this.isCharacters 
                    ? `${urlCharacters}?page=${page}` 
                    : `${urlEpisodes}?page=${page}`;
                this.fetchData(url);
            }
        },

        // Método para ir a una página específica ingresada por el usuario
        goToSpecificPage(event) {
            const page = parseInt(event.target.value);
            if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
                this.goToPage(page);
            }
        },

        // Método para generar una estadística aleatoria
        getRandomStat(max) {
            return Math.floor(Math.random() * max) + 1;
        },

        // Método para obtener el color de la barra de progreso basado en el valor
        getProgressBarColor(value) {
            if (value < 30) return 'bg-danger';
            if (value < 70) return 'bg-warning';
            return 'bg-success';
        },

        // Método para alternar la selección de un personaje
        toggleCharacterSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
            } else {
                this.selectedCharacters.push(character);
            }
            this.saveToLocalStorage();
        },

        // Método para verificar si un personaje está seleccionado
        isCharacterSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id);
        },

        // Método para limpiar la lista de personajes seleccionados
        clearSelectedCharacters() {
            this.selectedCharacters = [];
            this.saveToLocalStorage();
        },
        playSound(action) {
            // Reproduce el sonido correspondiente basado en la acción
            const sound = this.audio[action];
            if (sound) {
                sound.play();
            }
        },

        // Método para aplicar los filtros
        applyFilters() {
            this.currentPage = 1;
            this.fetchRickAndMortyData();
        },

        // Método para calcular el promedio de una estadística para un conjunto de personajes
        calculateAverage(characters, stat) {
            if (characters.length === 0) return 0;
            const sum = characters.reduce((total, character) => total + character[stat], 0);
            return (sum / characters.length).toFixed(2);
        },

        // Método para guardar datos en el localStorage
        saveToLocalStorage() {
            localStorage.setItem('selectedCharacters', JSON.stringify(this.selectedCharacters));
            localStorage.setItem('currentPage', this.currentPage.toString());
        },

        // Método para cargar datos desde el localStorage
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

        // Método para verificar si no hay resultados en la búsqueda
        hasNoResults() {
            return this.filteredCharacters.length === 0 && this.textSearch !== "";
        },

        // Método para obtener datos de comparación
        fetchComparisonData() {
            this.fetchAllLocations();
            this.fetchAllEpisodes();
        },

        // Método para obtener todas las ubicaciones
        fetchAllLocations() {
            this.fetchAllPages(urlLocations, (data) => {
                this.locations = this.locations.concat(data.results);
                if (this.locations.length === data.info.count) {
                    this.prepareComparisonData();
                }
            });
        },

        // Método para obtener todos los episodios
        fetchAllEpisodes() {
            this.fetchAllPages(urlEpisodes, (data) => {
                this.episodes = this.episodes.concat(data.results);
                if (this.episodes.length === data.info.count) {
                    this.prepareComparisonData();
                }
            });
        },

        // Método para obtener todas las páginas de una URL dada
        fetchAllPages(url, callback) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    callback(data);
                    if (data.info.next) {
                        this.fetchAllPages(data.info.next, callback);
                    }
                })
                .catch(error => console.error('Error fetching data:', error));
        },

        // Método para preparar los datos de comparación
        prepareComparisonData() {
            if (this.locations.length > 0 && this.episodes.length > 0) {
                const totalLocations = this.locations.length;
                const totalEpisodes = this.episodes.length;

                const dimensionsCount = new Set(this.locations.map(l => l.dimension)).size;
                const seasonsCount = new Set(this.episodes.map(e => e.episode.split('E')[0])).size;

                const mostPopulatedLocation = this.locations.reduce((max, location) =>
                    location.residents.length > max.residents.length ? location : max, this.locations[0]
                );

                const episodeWithMostCharacters = this.episodes.reduce((max, episode) =>
                    episode.characters.length > max.characters.length ? episode : max, this.episodes[0]
                );

                this.comparisonData = {
                    totalLocations,
                    totalEpisodes,
                    dimensionsCount,
                    seasonsCount,
                    mostPopulatedLocation: mostPopulatedLocation.name,
                    mostPopulatedLocationResidents: mostPopulatedLocation.residents.length,
                    episodeWithMostCharacters: episodeWithMostCharacters.name,
                    episodeWithMostCharactersCount: episodeWithMostCharacters.characters.length
                };
            }
        }
    },

    // objeto computed contiene todas las propiedades computadas
    computed: {
        // Propiedad  para filtrar los personajes
        filteredCharacters() {
            return this.characters.filter(character =>
                (this.statusFilter.length === 0 || this.statusFilter.includes(character.status)) &&
                (this.speciesFilter.length === 0 || this.speciesFilter.includes(character.species)) &&
                (this.textSearch === "" || character.name.toLowerCase().includes(this.textSearch.toLowerCase()))
            );
        },

        // Propiedad  para comparar especies
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
                    percentageOfTotal: totalCharacters > 0 ? ((speciesCount / totalCharacters) * 100).toFixed(2) : "-"
                };
            });
            return speciesData;
        },

        // Propiedad  para comparar ubicaciones y episodios
        locationEpisodeComparison() {
            if (!this.comparisonData) return [];

            const speciesCounts = {};
            let maxCount = 0;
            let mostCommonSpecies = '';

            this.characters.forEach(character => {
                speciesCounts[character.species] = (speciesCounts[character.species] || 0) + 1;
                if (speciesCounts[character.species] > maxCount) {
                    maxCount = speciesCounts[character.species];
                    mostCommonSpecies = character.species;
                }
            });

            return [
                {
                    category: 'Total',
                    characters: this.totalCharacters,
                    locations: this.comparisonData.totalLocations,
                    episodes: this.comparisonData.totalEpisodes
                },
                {
                    category: 'Diversity',
                    characters: `${this.availableSpecies.length} species`,
                    locations: `${this.comparisonData.dimensionsCount} dimensions`,
                    episodes: `${this.comparisonData.seasonsCount} Seasons`
                },
                {
                    category: 'Most Populated/Featured',
                    characters: `${mostCommonSpecies} (${maxCount})`,
                    locations: `${this.comparisonData.mostPopulatedLocation} (${this.comparisonData.mostPopulatedLocationResidents} Residents)`,
                    episodes: `${this.comparisonData.episodeWithMostCharacters} (${this.comparisonData.episodeWithMostCharactersCount} Characters)`
                }
            ];
        }
    }
// Montaje de la aplicación Vue en el elemento con id 'appStadistics'
}).mount('#appStadistics');