const urlCharacters = "https://rickandmortyapi.com/api/character";
const urlEpisodes = "https://rickandmortyapi.com/api/episode";

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            characters: [],
            episodes: [],
            textSearch: "",
            statusFilter: [],
            speciesFilter: [],
            allSpecies: [],
            currentPage: 1,
            totalPages: 0,
            nextPage: null,
            prevPage: null,
            isCharacters: true // Controla si estamos viendo personajes o episodios
        };
    },

    created() {
        this.fetchData(urlCharacters);
    },

    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (this.isCharacters) {
                        this.characters = data.results;
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;

                        // Determinar la página actual
                        const urlParams = new URLSearchParams(new URL(url).search);
                        this.currentPage = parseInt(urlParams.get('page')) || 1;

                        this.totalPages = Math.ceil(data.info.count / 20); // Ajuste según la cantidad total de personajes

                        // Obtener todas las especies únicas
                        const speciesSet = new Set(this.characters.map(character => character.species));
                        this.allSpecies = Array.from(speciesSet);
                    } else {
                        this.episodes = data.results;
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;

                        // Determinar la página actual
                        const urlParams = new URLSearchParams(new URL(url).search);
                        this.currentPage = parseInt(urlParams.get('page')) || 1;

                        this.totalPages = Math.ceil(data.info.count / 20); // Ajuste según la cantidad total de episodios
                    }
                });
        },

        goToPage(page) {
            // Verificar que la página esté dentro del rango válido
            if (page >= 1 && page <= this.totalPages) {
                const url = this.isCharacters ? `https://rickandmortyapi.com/api/character?page=${page}` : `https://rickandmortyapi.com/api/episode?page=${page}`;
                this.fetchData(url);
            }
        },

        toggleData() {
            // Alternar entre personajes y episodios
            this.isCharacters = !this.isCharacters;
            const url = this.isCharacters ? urlCharacters : urlEpisodes;
            this.fetchData(url);
        },

        getEpisodeImage(episodeId) {
            // Encontrar el episodio correspondiente
            const episode = this.episodes.find(ep => ep.id === episodeId);

            if (!episode) {
                return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
            }

            // Extraer los IDs de los personajes de la URL del episodio
            const characterUrls = episode.characters;
            if (characterUrls.length > 0) {
                // Suponiendo que el primer personaje en la lista es suficiente
                const characterUrl = characterUrls[0];
                const characterId = characterUrl.split('/').pop(); // Extrae el ID de la URL

                // Buscar el personaje por ID
                const character = this.characters.find(char => char.id == characterId);
                return character ? character.image : 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
            }

            return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
        }
    }
    ,
    computed: {
        filteredData() {
            const data = this.isCharacters ? this.characters : this.episodes;
            return data.filter(item => {
                // Filtra por nombre
                const nameMatch = item.name.toLowerCase().includes(this.textSearch.toLowerCase());

                if (this.isCharacters) {
                    // Filtra por estado
                    const statusMatch = this.statusFilter.length === 0 || this.statusFilter.includes(item.status);

                    // Filtra por especies
                    const speciesMatch = this.speciesFilter.length === 0 || this.speciesFilter.includes(item.species);

                    return nameMatch && statusMatch && speciesMatch;
                } else {
                    return nameMatch;
                }
            });
        }
    }

}).mount('#appHome');
