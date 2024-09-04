let urlCharacters = "https://rickandmortyapi.com/api/character";
let urlEpisodes = "https://rickandmortyapi.com/api/episode";
let urlLocations = "https://rickandmortyapi.com/api/location";

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            characters: [],
            episodes: [],
            locations: [],
            charactersSelected: [],
            episodesSelected: [],
            locationsSelected: [],
            textSearch: "",
        };
    },

    created() {
        this.fetchRickAndMortyData(urlCharacters, 'characters');
        this.fetchRickAndMortyData(urlEpisodes, 'episodes');
        this.fetchRickAndMortyData(urlLocations, 'locations');
    },

    methods: {
        fetchRickAndMortyData(url, type) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (type === 'characters') {
                        this.characters = data.results;
                    } else if (type === 'episodes') {
                        this.episodes = data.results.map(episode => episode.name);
                    } else if (type === 'locations') {
                        this.locations = data.results.map(location => location.name);
                    }
                });
        }
    },

    computed: {
        filteredCharacters() {
            return this.characters.filter(character =>
                character.name.toLowerCase().includes(this.textSearch.toLowerCase())
            );
        },
        filteredEpisodes() {
            return this.episodes.filter(episode =>
                this.charactersSelected.some(character => character.episode.includes(episode))
            );
        },
        filteredLocations() {
            return this.locations.filter(location =>
                location.toLowerCase().includes(this.textSearch.toLowerCase())
            );
        }
    }
}).mount('#appHome');
