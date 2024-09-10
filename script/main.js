const urlEpisodes = `https://rickandmortyapi.com/api/episode`; // URL para obtener episodios
const urlCharacters = `https://rickandmortyapi.com/api/character`; // URL para obtener personajes
// Importación de la función createApp de Vue
const { createApp } = Vue;

const app = createApp({
    // Datos reactivos de la aplicación
    data() {
        return {
            characters: [], // Lista de personajes
            episodes: [], // Lista de episodios
            textSearch: "", // Texto para búsqueda
            statusFilter: [], // Filtros de estado (vivo, muerto, etc.)
            speciesFilter: [], // Filtros de especie
            currentPage: 1, // Página actual para paginación
            loading: false, // Indicador de estado de carga
            rowsPerPage: 20, // Número de elementos por página
            nextPage: null, // URL de la siguiente página de la API
            prevPage: null, // URL de la página anterior de la API
            isCharacters: true, // Indica si se están mostrando personajes (true) o episodios (false)
            selectedCharacters: [], // Lista de personajes seleccionados
            audio: { // Sonidos asociados a los personajes
                alive: new Audio('../assets/sounds/woooooaah-199849.mp3'), // Sonido para personajes vivos
                dead: new Audio('../assets/sounds/zombie-6851.mp3') // Sonido para personajes muertos
            }
        };
    },

    // Función que se ejecuta al crear el componente
    created() {
        this.loadSavedState(); // AGREGADO: Carga el estado guardado
        // MODIFICADO: Usa la página guardada para la URL inicial
        const initialUrl = this.isCharacters
            ? `${urlCharacters}?page=${this.currentPage}` // Si isCharacters es true, carga personajes
            : `${urlEpisodes}?page=${this.currentPage}`; // Si isCharacters es false, carga episodios
        this.fetchData(initialUrl); // Llama a la función fetchData para obtener datos de la API
        this.loadSelectedCharacters(); // Carga los personajes seleccionados del almacenamiento local
    },

    methods: {

        // Método para obtener todos los resultados de la API, recorriendo todas las páginas
        fetchAllPages(url) {
            let allResults = [];

            // Función recursiva para obtener cada página de resultados
            function fetchPage(url) {
                return fetch(url)
                    .then(response => response.json()) // Convertir la respuesta a JSON
                    .then(data => {
                        // Acumular los resultados de la página actual
                        allResults = allResults.concat(data.results);

                        // Verificar si hay más páginas para recorrer
                        if (data.info.next) {
                            // Si hay una página siguiente, se llama a sí misma para continuar con la siguiente página
                            return fetchPage(data.info.next);
                        } else {
                            // Si no hay más páginas, retornar todos los resultados
                            return allResults;
                        }
                    })
                    .catch(error => {
                        // Capturar y mostrar errores de la solicitud
                        console.error('Error fetching data:', error);
                    });
            }

            return fetchPage(url); // Iniciar la búsqueda de la primera página
        },

        // Método para obtener datos (personajes o episodios) de la API
        fetchData(url) {
            this.speciesFilter = []; // Reiniciar el filtro de especies
            this.loading = false; // Indicar que se está cargando

            const data = this.fetchAllPages(url); // Llamar a fetchAllPages para obtener todos los resultados

            // Verificar si la URL contiene el número de página, si no es así, extraerlo
            if (!url.includes(`page=${this.currentPage}`)) {
                const urlParams = new URLSearchParams(new URL(url).search); // Obtener parámetros de la URL
                this.currentPage = parseInt(urlParams.get('page')) || 1; // Establecer la página actual
            }

            // Procesar los datos obtenidos
            data.then(data => {
                if (this.isCharacters) {
                    // Si estamos en la vista de personajes, asignar los datos a characters
                    this.characters = data;
                } else {
                    // Si estamos en la vista de episodios, asignar los datos a episodes
                    this.episodes = data;
                }
                this.loading = false; // Finalizar el estado de carga
            });
        },

        // Método para alternar entre personajes y episodios
        toggleData() {
            this.isCharacters = !this.isCharacters; // Alternar el valor de isCharacters
            const url = this.isCharacters ? urlCharacters : urlEpisodes; // Establecer la URL en función del tipo de datos
            this.fetchData(url); // Llamar a fetchData con la nueva URL
        },

        // Método para obtener la imagen de un episodio a partir del primer personaje en él
        getEpisodeImage(episodeId) {
            const episode = this.episodes.find(ep => ep.id === episodeId); // Buscar el episodio por ID

            if (!episode) {
                // Si no se encuentra el episodio, devolver una imagen por defecto
                return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId;
            }

            const characterUrls = episode.characters; // Obtener las URLs de los personajes en el episodio
            if (characterUrls.length > 0) {
                const characterUrl = characterUrls[0]; // Tomar la URL del primer personaje
                const characterId = characterUrl.split('/').pop(); // Extraer el ID del personaje

                const character = this.characters.find(char => char.id == characterId); // Buscar el personaje por ID
                return character ? character.image : 'https://via.placeholder.com/300x200?text=Episode+' + episodeId; // Retornar la imagen del personaje o una por defecto
            }

            return 'https://via.placeholder.com/300x200?text=Episode+' + episodeId; // Si no hay personajes, retornar una imagen por defecto
        },

        // Método para alternar la selección de un personaje
        toggleSelection(character) {
            const index = this.selectedCharacters.findIndex(c => c.id === character.id); // Buscar el personaje seleccionado
            if (index === -1) {
                this.selectedCharacters.push(character); // Si no está seleccionado, agregarlo
            } else {
                this.selectedCharacters.splice(index, 1); // Si ya está seleccionado, quitarlo
            }
            this.saveSelectedCharacters(); // Guardar los personajes seleccionados en localStorage
        },

        // Método para verificar si un personaje está seleccionado
        isSelected(character) {
            return this.selectedCharacters.some(c => c.id === character.id); // Retorna true si el personaje está seleccionado
        },

        // Método para guardar los personajes seleccionados en localStorage
        saveSelectedCharacters() {
            localStorage.setItem('selectedCharacters', JSON.stringify(this.selectedCharacters)); // Guardar la lista en formato JSON
        },

        // Método para cargar los personajes seleccionados desde localStorage
        loadSelectedCharacters() {
            const saved = localStorage.getItem('selectedCharacters'); // Obtener los personajes guardados
            if (saved) {
                this.selectedCharacters = JSON.parse(saved); // Si existen, asignarlos a selectedCharacters
            }
        },

        // Método para limpiar la selección de personajes
        clearSelectedCharacters() {
            this.selectedCharacters = []; // Vaciar la lista de personajes seleccionados
            this.saveSelectedCharacters(); // Guardar los cambios en localStorage
        },

        // Método para reproducir un sonido basado en la acción (vivo o muerto)
        playSound(action) {
            const sound = this.audio[action]; // Obtener el sonido correspondiente a la acción
            if (sound) {
                sound.play(); // Reproducir el sonido si existe
            }
        },

        // AGREGADO: Método para guardar el estado actual (página y tipo de datos)
        saveCurrentState() {
            localStorage.setItem('currentPage', this.currentPage.toString()); // Guardar la página actual en localStorage
            localStorage.setItem('isCharacters', this.isCharacters.toString()); // Guardar si se está mostrando personajes o episodios
        },

        // AGREGADO: Método para cargar el estado guardado
        loadSavedState() {
            const savedPage = localStorage.getItem('currentPage'); // Cargar la página guardada desde localStorage
            const savedIsCharacters = localStorage.getItem('isCharacters'); // Cargar el estado de isCharacters desde localStorage
            if (savedPage) {
                this.currentPage = parseInt(savedPage); // Si existe una página guardada, asignarla
            }
            if (savedIsCharacters !== null) {
                this.isCharacters = savedIsCharacters === 'true'; // Si se guardó isCharacters, asignarlo
            }
        }
    },


    computed: {
        // Computed para filtrar los datos (personajes o episodios) en base a los filtros aplicados
        filteredData() {
            // Selecciona los personajes o episodios en función de si estamos en la vista de personajes (isCharacters)
            const data = this.isCharacters ? this.characters : this.episodes;

            // Filtrar los datos en base a los filtros activos
            let filteredData = data.filter(item => {
                // Filtra por coincidencia en el nombre, convirtiéndolo a minúsculas para evitar problemas de mayúsculas/minúsculas
                const nameMatch = item.name.toLowerCase().includes(this.textSearch.toLowerCase());

                // Si estamos filtrando personajes (isCharacters = true)
                if (this.isCharacters) {
                    // Verificar coincidencia con el filtro de estado (si está vacío, se acepta cualquier valor)
                    const statusMatch = this.statusFilter.length === 0 || this.statusFilter.includes(item.status);
                    // Verificar coincidencia con el filtro de especie (si está vacío, se acepta cualquier valor)
                    const speciesMatch = this.speciesFilter.length === 0 || this.speciesFilter.includes(item.species);
                    // Retorna verdadero si el nombre, estado y especie coinciden con los filtros
                    return nameMatch && statusMatch && speciesMatch;
                } else {
                    // Si es la vista de episodios, solo filtra por el nombre
                    return nameMatch;
                }
            });

            // Calcular el total de elementos filtrados
            const total = filteredData.length;
            // Calcular el número total de páginas basándose en el número de filas por página
            const totalPages = Math.ceil(total / this.rowsPerPage);
            // Hacer una paginación de los datos, mostrando solo los elementos de la página actual
            filteredData = filteredData.slice((this.currentPage - 1) * this.rowsPerPage, this.currentPage * this.rowsPerPage);

            // Retorna un objeto con la data filtrada y la información de la paginación
            return {
                data: filteredData, // Los datos filtrados para la página actual
                total: total, // El total de elementos filtrados
                totalPages: totalPages, // Número total de páginas
                perPage: this.rowsPerPage, // Número de filas por página
                page: this.currentPage // La página actual
            }
        },

        // Computed para obtener todas las especies únicas de los personajes
        allSpecies() {
            // Utiliza Set para asegurarse de que no haya especies duplicadas y retorna un array con las especies únicas
            return [...new Set(this.characters.map(char => char.species))];
        }
    },

    watch: {
        // Vigilar cambios en currentPage y guardar el estado actual en localStorage
        currentPage(prev, next) {
            this.saveCurrentState(); // Guarda el estado de la página actual
        },

        // Vigilar cambios en textSearch y reiniciar la página a 1
        textSearch(prev, next) {
            this.currentPage = 1; // Cuando el texto de búsqueda cambia, se resetea la paginación
        },

        // Vigilar cambios en isCharacters y reiniciar la página a 1
        isCharacters(prev, next) {
            this.currentPage = 1; // Al cambiar entre personajes y episodios, se resetea la paginación
        },

        // Vigilar cambios en statusFilter y reiniciar la página a 1
        statusFilter(prev, next) {
            this.currentPage = 1; // Al cambiar el filtro de estado, se resetea la paginación
        },

        // Vigilar cambios en speciesFilter y reiniciar la página a 1
        speciesFilter(prev, next) {
            this.currentPage = 1; // Al cambiar el filtro de especies, se resetea la paginación
        }
    }

}).mount('#appHome');