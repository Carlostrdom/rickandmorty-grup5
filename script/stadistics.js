// URLs de la API de Rick and Morty
const urlCharacters = "https://rickandmortyapi.com/api/character";
const urlLocations = "https://rickandmortyapi.com/api/location";
const urlEpisodes = "https://rickandmortyapi.com/api/episode";

// Importación de la función createApp de Vue
const { createApp } = Vue;

// Creación de la aplicación Vue
createApp({
    data() {
        return {
            characters: [],
            locations: [],
            episodes: [],
            characterStatusStats: {},
            locationTypeStats: {},
            episodeSeasonStats: {},
            speciesStatsBySpecies: {},
            availableSpecies: [],
            availableGenders: []
        };
    },

    created() {
        this.fetchAllData();
    },

    methods: {
        fetchAllData() {
            // Usamos Promise.all para esperar a que todas las promesas se resuelvan
            Promise.all([
                this.fetchCharacters(),
                this.fetchLocations(),
                this.fetchEpisodes()
            ]).then(() => {
                this.calculateCharacterStatusStats();
                this.calculateEpisodeSeasonStats();
                this.calculateSpeciesDistribution();
            });
        },

        fetchCharacters() {
            let allCharacters = [];
            let nextUrl = urlCharacters;

            const fetchNext = () => {
                if (nextUrl) {
                    return fetch(nextUrl)
                        .then(response => response.json())
                        .then(data => {
                            allCharacters = [...allCharacters, ...data.results];
                            nextUrl = data.info.next;
                            return fetchNext(); // Llamar recursivamente
                        });
                } else {
                    this.characters = allCharacters;
                }
            };

            return fetchNext();
        },

        fetchLocations() {
            let allLocations = [];
            let nextUrl = urlLocations;

            const fetchNext = () => {
                if (nextUrl) {
                    return fetch(nextUrl)
                        .then(response => response.json())
                        .then(data => {
                            allLocations = [...allLocations, ...data.results];
                            nextUrl = data.info.next;
                            return fetchNext(); // Llamar recursivamente
                        });
                } else {
                    this.locations = allLocations;
                }
            };

            return fetchNext();
        },

        fetchEpisodes() {
            let allEpisodes = [];
            let nextUrl = urlEpisodes;

            const fetchNext = () => {
                if (nextUrl) {
                    return fetch(nextUrl)
                        .then(response => response.json())
                        .then(data => {
                            allEpisodes = [...allEpisodes, ...data.results];
                            nextUrl = data.info.next;
                            return fetchNext(); // Llamar recursivamente
                        });
                } else {
                    this.episodes = allEpisodes;
                }
            };

            return fetchNext();
        },

        calculateCharacterStatusStats() {
            // Calcula la distribución de estados de personajes
            this.characterStatusStats = this.getDistribution(this.characters, 'status');
        },

        calculateEpisodeSeasonStats() {
            // Calcula la cantidad de episodios por temporada
            const seasonStats = this.episodes.reduce((acc, episode) => {
                const season = episode.episode.split('E')[0];
                acc[season] = (acc[season] || 0) + 1;
                return acc;
            }, {});
            this.episodeSeasonStats = seasonStats;
        },

        calculateSpeciesDistribution() {
            // Inicializa el objeto para almacenar estadísticas por especie
            const speciesStats = this.characters.reduce((acc, character) => {
                const species = character.species;
                const status = character.status;

                // Asegura que la especie exista en el objeto
                if (!acc[species]) {
                    acc[species] = { total: 0, alive: 0, dead: 0, unknown: 0 };
                }

                // Actualiza las estadísticas para la especie
                acc[species].total += 1;
                if (status === 'Alive') acc[species].alive += 1;
                if (status === 'Dead') acc[species].dead += 1;
                if (status === 'unknown') acc[species].unknown += 1;

                return acc;
            }, {});

            this.speciesStatsBySpecies = speciesStats;
            this.availableSpecies = Object.keys(speciesStats);
            this.availableGenders = [...new Set(this.characters.map(character => character.gender))].filter(g => g); // Eliminar valores vacíos
        },

        getDistribution(array, property) {
            return array.reduce((acc, item) => {
                acc[item[property]] = (acc[item[property]] || 0) + 1;
                return acc;
            }, {});
        }
    }
}).mount('#appStadistics');
