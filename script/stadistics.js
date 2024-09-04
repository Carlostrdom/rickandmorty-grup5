let apiUrl = "https://rickandmortyapi.com/api/character"
const { createApp } = Vue
const app = createApp({
    data() {
        return {
            characters: [],
            episodes: [],
            locations: [],
            searchTerm: '',
            filteredCharacters: []
        }
    },
    created() {
        this.fetchCharacters()
    },
    methods: {


        fetchCharacters() {
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    this.characters = data.results
                    this.filteredCharacters = this.characters
                })
                console.log(this.characters);
        },
        filterCharacters() {
            this.filteredCharacters = this.characters.filter(character =>
                character.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
        }
    }
}).mount('#appStadistics')