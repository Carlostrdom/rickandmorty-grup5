const urlCharacters = "https://rickandmortyapi.com/api/character";
const urlLocations = "https://rickandmortyapi.com/api/location";
const urlEpisodes = "https://rickandmortyapi.com/api/episode";

const { createApp } = Vue;

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
            return this.fetchAllPages(urlCharacters, 'characters');
        },

        fetchLocations() {
            return this.fetchAllPages(urlLocations, 'locations');
        },

        fetchEpisodes() {
            return this.fetchAllPages(urlEpisodes, 'episodes');
        },

        fetchAllPages(url, propertyName) {
            let allItems = [];
            const fetchNext = (nextUrl) => {
                return fetch(nextUrl)
                    .then(response => response.json())
                    .then(data => {
                        allItems = [...allItems, ...data.results];
                        if (data.info.next) {
                            return fetchNext(data.info.next);
                        } else {
                            this[propertyName] = allItems;
                        }
                    });
            };
            return fetchNext(url);
        },

        calculateCharacterStatusStats() {
            this.characterStatusStats = this.getDistribution(this.characters, 'status');
        },

        calculateEpisodeSeasonStats() {
            this.episodeSeasonStats = this.episodes.reduce((acc, episode) => {
                const season = episode.episode.split('E')[0];
                acc[season] = (acc[season] || 0) + 1;
                return acc;
            }, {});
        },

        calculateSpeciesDistribution() {
            this.speciesStatsBySpecies = this.characters.reduce((acc, character) => {
                const { species, status } = character;
                if (!acc[species]) {
                    acc[species] = { total: 0, alive: 0, dead: 0, unknown: 0 };
                }
                acc[species].total++;
                acc[species][status.toLowerCase()]++;
                return acc;
            }, {});

            // Ordenar las especies por total de personajes (de mayor a menor)
            this.speciesStatsBySpecies = Object.fromEntries(
                Object.entries(this.speciesStatsBySpecies).sort((a, b) => b[1].total - a[1].total)
            );

            this.availableSpecies = Object.keys(this.speciesStatsBySpecies);
            this.availableGenders = [...new Set(this.characters.map(character => character.gender))].filter(Boolean);
        },

        getDistribution(array, property) {
            return array.reduce((acc, item) => {
                acc[item[property]] = (acc[item[property]] || 0) + 1;
                return acc;
            }, {});
        }
    }
}).mount('#appStadistics');