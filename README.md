# Proyecto Rick and Morty

Este proyecto web utiliza la [API de Rick and Morty](https://rickandmortyapi.com/) para mostrar información detallada sobre los personajes de la serie. Está construido con tecnologías modernas como JavaScript, HTML, CSS, Bootstrap y Vue.js.

## Estructura del Proyecto

### Home

La página de inicio contiene:

- Una breve descripción de la serie Rick and Morty.
- Cards que muestran información básica de todos los personajes.
- Un modal que permite agregar personajes a favoritos, almacenando la información en el `localStorage`.
- Botones en cada card para ver más detalles sobre el personaje.

### Details

La página de detalles muestra:

- Información ampliada de cada personaje en una presentación más detallada, implementada con `URLSearchParams` para obtener los datos del personaje seleccionado desde la página anterior.

### Stadistics

La página de estadísticas incluye:

- Tablas que relacionan la información proporcionada por la API, como características de los personajes.
- Grafico relacionando los estados de vivos, muertos y desconocidos.

## Mockups y Diseño

El diseño está basado en los mockups que se desarrollaron previamente, siguiendo una estética inspirada en la serie Rick and Morty, manteniendo consistencia visual a través del uso de colores vibrantes y gráficos del show.
Link: <https://www.canva.com/design/DAGQVp5TFq0/7a24dcTydW9cM21JpWe5-Q/edit?utm_content=DAGQVp5TFq0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton>

## Herramientas Usadas

- **HTML**
- **CSS** (con Bootstrap para el diseño responsivo)
- **JavaScript** (para la lógica de interacción)
- **Vue.js** (para la reactividad y modularización del código)
- **LocalStorage** (para guardar los personajes favoritos)
- **Rick and Morty API** (para consumir datos en tiempo real)

## Instalación y Ejecución

1. Clona este repositorio: `git clone https://github.com/Carlostrdom/rickandmorty-grup5.git`
2. Abir la carpeta del respositorio con VScode
3. Abre `index.html` en tu navegador con el uso de Live Server (extension de VScode)

## Colaboradores

Este proyecto ha sido desarrollado por:

- Gabriel Fernandez
- Carlos Torreyes
- Karina Gonzalez
- Edison Madrid
