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
            isCharacters: true,
            selectedCharacters: [],
            audio: {
                alive: new Audio('../assets/sounds/woooooaah-199849.mp3'),
                dead: new Audio('../assets/sounds/zombie-6851.mp3')
            }
        };
    },

    created() {
        this.loadSavedState();// AGREGADO: Carga el estado guardado
        // MODIFICADO: Usa la página guardada para la URL inicial
        const initialUrl = this.isCharacters 
            ? `${urlCharacters}?page=${this.currentPage}`
            : `${urlEpisodes}?page=${this.currentPage}`;
        this.fetchData(initialUrl);
        this.loadSelectedCharacters();
    },

    methods: {
        fetchData(url) {
            this.speciesFilter = [];

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (this.isCharacters) {
                        this.characters = data.results;
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;
                        // MODIFICADO: Solo actualiza currentPage si no es una carga inicial
                        if (!url.includes(`page=${this.currentPage}`)) {
                            const urlParams = new URLSearchParams(new URL(url).search);
                            this.currentPage = parseInt(urlParams.get('page')) || 1;
                        }

                        this.totalPages = Math.ceil(data.info.count / 20);

                        const speciesSet = new Set(this.characters.map(character => character.species));
                        this.allSpecies = Array.from(speciesSet);
                    } else {
                        this.episodes = data.results;
                        this.nextPage = data.info.next;
                        this.prevPage = data.info.prev;
                        // MODIFICADO: Solo actualiza currentPage si no es una carga inicial
                        if (!url.includes(`page=${this.currentPage}`)) {
                            const urlParams = new URLSearchParams(new URL(url).search);
                            this.currentPage = parseInt(urlParams.get('page')) || 1;
                        }

                        this.totalPages = Math.ceil(data.info.count / 20);
                    }
                    this.saveCurrentState();// AGREGADO: Guarda el estado actual después de cargar los datos
                });
        },

        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                const url = this.isCharacters ? `${urlCharacters}?page=${page}` : `${urlEpisodes}?page=${page}`;
                this.fetchData(url);
            }
        },

        toggleData() {
            this.isCharacters = !this.isCharacters;
            const url = this.isCharacters ? urlCharacters : urlEpisodes;
            this.fetchData(url);
        },

        getEpisodeImage(episodeId) {
            const episode = this.episodes.find(ep => ep.id === episodeId);

            if (!episode) {
                return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
            }

            const characterUrls = episode.characters;
            if (characterUrls.length > 0) {
                const characterUrl = characterUrls[0];
                const characterId = characterUrl.split('/').pop();

                const character = this.characters.find(char => char.id == characterId);
                return character ? character.image : 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
            }

            return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
        },

        toggleSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index === -1) {
                this.selectedCharacters.push(character);
            } else {
                this.selectedCharacters.splice(index, 1);
            }
            this.saveSelectedCharacters();
        },

        isSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id);
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
            this.saveSelectedCharacters();
        },

        playSound(action) {
            const sound = this.audio[action];
            if (sound) {
                sound.play();
            }
        },
        // AGREGADO: Método para guardar el estado actual
        saveCurrentState() {
            localStorage.setItem('currentPage', this.currentPage.toString());
            localStorage.setItem('isCharacters', this.isCharacters.toString());
        },

        // AGREGADO: Método para cargar el estado guardado
        loadSavedState() {
            const savedPage = localStorage.getItem('currentPage');
            const savedIsCharacters = localStorage.getItem('isCharacters');
            if (savedPage) {
                this.currentPage = parseInt(savedPage);
            }
            if (savedIsCharacters !== null) {
                this.isCharacters = savedIsCharacters === 'true';
            }
        }
    },

    computed: {
        filteredData() {
            const data = this.isCharacters ? this.characters : this.episodes;
            return data.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(this.textSearch.toLowerCase());

                if (this.isCharacters) {
                    const statusMatch = this.statusFilter.length === 0 || this.statusFilter.includes(item.status);
                    const speciesMatch = this.speciesFilter.length === 0 || this.speciesFilter.includes(item.species);
                    return nameMatch && statusMatch && speciesMatch;
                } else {
                    return nameMatch;
                }
            });
        }
    }
}).mount('#appHome');