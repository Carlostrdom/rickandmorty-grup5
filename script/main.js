// let urlCharacters = "https://rickandmortyapi.com/api/character";

// const { createApp } = Vue;

// const app = createApp({
//     data() {
//         return {
//             characters: [],
//             textSearch: "",
//             statusFilter: [],
//             nextPage: null,
//             prevPage: null,
//         };
//     },

//     created() {
//         this.fetchRickAndMortyData(urlCharacters);
//     },

//     methods: {
//         fetchRickAndMortyData(url) {
//             fetch(url)
//                 .then(response => response.json())
//                 .then(data => {
//                     this.characters = data.results;
//                     this.nextPage = data.info.next;
//                     this.prevPage = data.info.prev;
//                 });
//         }
//     },

//     computed: {
//         filteredCharacters() {
//             return this.characters
//                 .filter(character => {
//                     // Filtra por nombre y estado
//                     const matchesSearch = character.name
//                         .toLowerCase()
//                         .includes(this.textSearch.toLowerCase());
//                     const matchesStatus = this.statusFilter.length === 0 ||
//                         this.statusFilter.includes(character.status);
//                     return matchesSearch && matchesStatus;
//                 });
//         }
//     }
// }).mount('#appHome');
const urlCharacters = "https://rickandmortyapi.com/api/character";

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            characters: [],
            textSearch: "",
            statusFilter: [],
            speciesFilter: [],
            allSpecies: [],
            nextPage: null,
            prevPage: null,
            currentPage: 1,
            totalPages: 1,
        };
    },

    created() {
        this.fetchRickAndMortyData(urlCharacters);
    },

    methods: {
        fetchRickAndMortyData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.characters = data.results;
                    this.nextPage = data.info.next;
                    this.prevPage = data.info.prev;
                    this.currentPage = data.info.page || 1; // Ajustar si la API proporciona el número de página
                    this.totalPages = Math.ceil(data.info.count / 20); // Calcular el total de páginas

                    // Obtener todas las especies únicas
                    const speciesSet = new Set(this.characters.map(character => character.species));
                    this.allSpecies = Array.from(speciesSet);
                });
        }
    },

    computed: {
        filteredCharacters() {
            return this.characters.filter(character => {
                // Filtra por nombre
                const matchesSearch = character.name.toLowerCase().includes(this.textSearch.toLowerCase());

                // Filtra por estado
                const matchesStatus = this.statusFilter.length === 0 || this.statusFilter.includes(character.status);

                // Filtra por especie
                const matchesSpecies = this.speciesFilter.length === 0 || this.speciesFilter.includes(character.species);

                return matchesSearch && matchesStatus && matchesSpecies;
            });
        }
    }
}).mount('#appHome');

// para obtener todas las especies únicas
//


// async function fetchAllSpecies() {
//     let allSpecies = new Set();
//     let url = baseUrl;

//     while (url) {
//         try {
//             const response = await fetch(url);
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
//             data.results.forEach(character => {
//                 allSpecies.add(character.species);
//             });

//             url = data.info.next;
//         } catch (error) {
//             console.error('Error al hacer fetch:', error);
//             url = null; // Salir del bucle si hay un error
//         }
//     }

//     return Array.from(allSpecies);
// }

// async function displaySpecies() {
//     try {
//         const species = await fetchAllSpecies();
//         console.log('Todas las especies:', species);

//         const speciesList = document.getElementById('species-list');
//         species.forEach(species => {
//             const speciesItem = document.createElement('div');
//             speciesItem.textContent = species || 'Desconocida'; // Mostrar 'Desconocida' si la especie es una cadena vacía
//             speciesList.appendChild(speciesItem);
//         });
//     } catch (error) {
//         console.error('Error al obtener las especies:', error);
//     }
// }

// displaySpecies();