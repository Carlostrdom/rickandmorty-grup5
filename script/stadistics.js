new Vue({
    //objeto data
    el: '#app',
    data: {
        characters: [],
        loading: true,
        filters: {
            species: [],
            status: []
        },
        //array para almacenar los personajes seleccionados
        selectedCharacters: []
    },
    computed: {
        charactersWithStats() {
            return this.characters.map(c => ({
                //operador spread, permite copiar todas las propiedades a un nuevo objeto
                ...c,
                //
                intelligence: this.getRandomStat(100),
                chaosLevel: this.getRandomStat(100),
                popularity: this.getRandomStat(100),
                dimensionsVisited: this.getRandomStat(50)
            }));
        },
        filteredCharacters() {
            //filtramos y utilizamos el operador and (&&)
            return this.charactersWithStats.filter(c => 
                //filtramos y utilizamos el operador or (||)
                //sino hay filtrador, devuelve todos los personajes
                //includes y c.especies devuelve un nuevo array con las especies que coincidan con el filtro
                (!this.filters.species.length || this.filters.species.includes(c.species)) &&
                (!this.filters.status.length || this.filters.status.includes(c.status))
            );
        },
        speciesComparison() {
            const calc = arr => ({
                //recorremos el array y retornamos un objeto
                //con las propiedades good, bad y total
                //filtramos , y contamos cuantos personajes hay vivos, cuantos muertos. array antes del filter
                good: this.getPercentage(arr.filter(c => c.status === "Alive").length, arr.length),
                bad: this.getPercentage(arr.filter(c => c.status !== "Alive").length, arr.length),
                total: this.getPercentage(arr.length, this.filteredCharacters.length),
                ...['intelligence', 'chaosLevel', 'popularity', 'dimensionsVisited'].reduce((acc, stat) => ({
                    ...acc,
                    [`avg${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: (arr.reduce((sum, c) => sum + c[stat], 0) / arr.length).toFixed(2)
                }), {})
            });
            return {
                humans: calc(this.filteredCharacters.filter(c => c.species === "Human")),
                aliens: calc(this.filteredCharacters.filter(c => c.species !== "Human"))
            };
        }
    },
    methods: {
        fetchCharacters() {
            fetch('https://rickandmortyapi.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'query { characters(page: 1) { results { id name species status image } } }' }),
            })
            .then(res => res.json())
            .then(data => {
                this.characters = data.data.characters.results;
                this.loading = false;
                this.loadSelectedCharacters();
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                this.loading = false;
            });
        },
        getRandomStat: max => Math.floor(Math.random() * max) + 1,
        getProgressBarColor: v => v < 30 ? 'bg-danger' : v < 70 ? 'bg-warning' : 'bg-success',
        getPercentage: (part, total) => ((part / total) * 100).toFixed(2),
        removeCharacter(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
                this.saveSelectedCharacters();
            }
        },
        toggleCharacterSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id);
            if (index > -1) {
                this.selectedCharacters.splice(index, 1);
            } else {
                const characterWithStats = this.charactersWithStats.find(c => c.id === character.id);
                this.selectedCharacters.push(characterWithStats);
            }
            this.saveSelectedCharacters();
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
            localStorage.removeItem('selectedCharacters');
        }
    },
    mounted() {
        this.fetchCharacters();
    }
});