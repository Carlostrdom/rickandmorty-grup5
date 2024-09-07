const { createApp, ref, onMounted } = Vue

createApp({
  setup() {
    const character = ref(null)
    const loading = ref(true)
    const error = ref(null)

    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search)
      const id = urlParams.get('id')

      if (id) {
        fetch(`https://rickandmortyapi.com/api/character/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('No se pudo obtener la información del personaje')
            }
            return response.json()
          })
          .then(data => {
            character.value = data
            loading.value = false
            console.log('Datos del personaje:', data) // Para depuración
          })
          .catch(e => {
            error.value = e.message
            loading.value = false
            console.error('Error al obtener el personaje:', e)
          })
      } else {
        error.value = 'No se proporcionó un ID de personaje'
        loading.value = false
      }
    })

    return {
      character,
      loading,
      error
    }
  }
}).mount('#app')