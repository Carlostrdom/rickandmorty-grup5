// URLs base para las API de Rick and Morty
const urlCharacters = "https://rickandmortyapi.com/api/character";
const urlLocations = "https://rickandmortyapi.com/api/location";
const urlEpisodes = "https://rickandmortyapi.com/api/episode";

// Importamos la función createApp de Vue
const { createApp } = Vue;

// Creamos una nueva aplicación Vue
createApp({
    // Definimos el estado inicial de nuestra aplicación
    data() {
        return {
            characters: [],        // Array para almacenar todos los personajes
            locations: [],         // Array para almacenar todas las ubicaciones
            episodes: [],          // Array para almacenar todos los episodios
            characterStatusStats: {}, // Objeto para almacenar estadísticas de estado de personajes
            locationTypeStats: {},    // Objeto para almacenar estadísticas de tipos de ubicaciones
            episodeSeasonStats: {},   // Objeto para almacenar estadísticas de temporadas de episodios
            speciesStatsBySpecies: {}, // Objeto para almacenar estadísticas de especies
            availableSpecies: [],     // Array para almacenar especies disponibles
            availableGenders: [],     // Array para almacenar géneros disponibles
            genderDistribution: {},   // Objeto para almacenar distribución de géneros
            topLocations: [],         // Array para almacenar las 5 ubicaciones principales
            topEpisodes: [],          // Array para almacenar los 5 episodios principales
            statusChart: null         // Variable para almacenar el gráfico de estado de personajes
        };
    },

    // Método que se ejecuta cuando se crea la instancia de Vue
    created() {
        this.fetchAllData(); // Llamamos al método para obtener todos los datos
    },

    // Definimos los métodos de nuestra aplicación
    methods: {
        // Método para obtener todos los datos de la API
        fetchAllData() {
            Promise.all([
                this.fetchCharacters(),
                this.fetchLocations(),
                this.fetchEpisodes()
            ]).then(() => {
                this.calculateAllStats(); // Calculamos todas las estadísticas
                this.createStatusChart(); // Creamos el gráfico de estado de personajes
            });
        },

        // Método para obtener todos los personajes
        fetchCharacters() {
            return this.fetchAllPages(urlCharacters, 'characters');
        },

        // Método para obtener todas las ubicaciones
        fetchLocations() {
            return this.fetchAllPages(urlLocations, 'locations');
        },

        // Método para obtener todos los episodios
        fetchEpisodes() {
            return this.fetchAllPages(urlEpisodes, 'episodes');
        },

        // Método genérico para obtener todas las páginas de una API
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

        // Método para calcular todas las estadísticas
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

        // Método para calcular las estadísticas de estado de los personajes
        calculateCharacterStatusStats() {
            this.characterStatusStats = this.getDistribution(this.characters, 'status');
        },

        // Método para crear el gráfico de estado de los personajes
        createStatusChart() {
            const ctx = document.getElementById('characterStatusChart').getContext('2d');
            const data = Object.entries(this.characterStatusStats);
            const labels = data.map(([status]) => status);
            const values = data.map(([, count]) => count);
            const colors = ['#28a745','#ffc107', '#dc3545'];

            this.statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'white'
                            }
                        },
                        title: {
                            display: true,
                            color: 'white',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        },

        // Método para calcular las estadísticas de temporadas de episodios
        calculateEpisodeSeasonStats() {
            this.episodeSeasonStats = this.episodes.reduce((acc, episode) => {
                const season = episode.episode.split('E')[0];
                acc[season] = (acc[season] || 0) + 1;
                return acc;
            }, {});
        },

        // Método para calcular la distribución de especies
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

            // Ordenamos las especies por total de personajes (de mayor a menor)
            this.speciesStatsBySpecies = Object.fromEntries(
                Object.entries(this.speciesStatsBySpecies).sort((a, b) => b[1].total - a[1].total)
            );

            this.availableSpecies = Object.keys(this.speciesStatsBySpecies);
            this.availableGenders = [...new Set(this.characters.map(character => character.gender))].filter(Boolean);
        },

        // Método para calcular la distribución de géneros
        calculateGenderDistribution() {
            this.genderDistribution = this.getDistribution(this.characters, 'gender');
        },

        // Método para calcular las 5 ubicaciones principales
        calculateTopLocations() {
            this.topLocations = this.locations
                .sort((a, b) => b.residents.length - a.residents.length)
                .slice(0, 5);
        },

        // Método para calcular los 5 episodios principales
        calculateTopEpisodes() {
            this.topEpisodes = this.episodes
                .sort((a, b) => b.characters.length - a.characters.length)
                .slice(0, 5);
        },

        // Método para calcular las estadísticas de tipos de ubicaciones
        calculateLocationTypeStats() {
            this.locationTypeStats = this.getDistribution(this.locations, 'type');
        },

        // Método para calcular las estadísticas de dimensiones
        calculateDimensionStats() {
            this.dimensionStats = this.getDistribution(this.locations, 'dimension');
        },

        // Método genérico para obtener la distribución de una propiedad en un array
        getDistribution(array, property) {
            return array.reduce((acc, item) => {
                acc[item[property]] = (acc[item[property]] || 0) + 1;
                return acc;
            }, {});
        },

        // Método para obtener el episodio más poblado de una temporada
        getMostPopulatedEpisode(season) {
            return this.episodes
                .filter(episode => episode.episode.startsWith(season))
                .reduce((max, episode) => 
                    episode.characters.length > max.characters.length ? episode : max
                , this.episodes[0]);
        },

        // Método para obtener el color correspondiente a un género
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

    // Definimos las propiedades computadas
    computed: {
        // Propiedad computada para obtener las 5 especies principales
        topFiveSpecies() {
            return Object.entries(this.speciesStatsBySpecies)
                .slice(0, 5)
                .reduce((acc, [species, data]) => {
                    acc[species] = data;
                    return acc;
                }, {});
        }
    }
// Montamos la aplicación Vue en el elemento con id 'appStadistics'
}).mount('#appStadistics');