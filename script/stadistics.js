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
            availableGenders: [],
            genderDistribution: {},
            topLocations: [],
            topEpisodes: []
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
                this.calculateAllStats();
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
                            console.log(this[propertyName]);
                        }
                    });
            };
            return fetchNext(url);
        },

        calculateAllStats() {
            this.calculateCharacterStatusStats();
            this.calculateEpisodeSeasonStats();
            this.calculateSpeciesDistribution();
            this.calculateGenderDistribution();
            this.calculateTopLocations();
            this.calculateTopEpisodes();
            this.calculateLocationTypeStats();
            this.calculateDimensionStats();
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

            this.speciesStatsBySpecies = Object.fromEntries(
                Object.entries(this.speciesStatsBySpecies).sort((a, b) => b[1].total - a[1].total)
            );

            this.availableSpecies = Object.keys(this.speciesStatsBySpecies);
            this.availableGenders = [...new Set(this.characters.map(character => character.gender))].filter(Boolean);
        },

        calculateGenderDistribution() {
            this.genderDistribution = this.getDistribution(this.characters, 'gender');
        },

        calculateTopLocations() {
            this.topLocations = this.locations
                .sort((a, b) => b.residents.length - a.residents.length)
                .slice(0, 5);
        },

        calculateTopEpisodes() {
            this.topEpisodes = this.episodes
                .sort((a, b) => b.characters.length - a.characters.length)
                .slice(0, 5);
        },

        calculateLocationTypeStats() {
            this.locationTypeStats = this.getDistribution(this.locations, 'type');
        },

        calculateDimensionStats() {
            this.dimensionStats = this.getDistribution(this.locations, 'dimension');
        },

        getDistribution(array, property) {
            return array.reduce((acc, item) => {
                acc[item[property]] = (acc[item[property]] || 0) + 1;
                return acc;
            }, {});
        },

        getMostPopulatedEpisode(season) {
            return this.episodes
                .filter(episode => episode.episode.startsWith(season))
                .reduce((max, episode) => 
                    episode.characters.length > max.characters.length ? episode : max
                , this.episodes[0]);
        },

        getGenderColor(gender) {
            const colors = {
                'Male': '#4e73df',
                'Female': '#e74a3b',
                'Genderless': '#1cc88a',
                'unknown': '#f6c23e'
            };
            return colors[gender] || '#858796';
        }
    },

    computed: {
        topFiveSpecies() {
            return Object.entries(this.speciesStatsBySpecies)
                .slice(0, 5)
                .reduce((acc, [species, data]) => {
                    acc[species] = data;
                    return acc;
                }, {});
        }
    }
}).mount('#appStadistics');