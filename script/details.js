const params = new URLSearchParams(window.location.search)
const urlDetails = params.get("urlDetails")



const { createApp } = Vue
const app = createApp({
    data() {
        return {
            character: [],


        }
    },
    created() {
        this.fetchUrl(urlDetails)

    },
    methods: {
        fetchUrl(url){
            fetch(url).then(res => res.json()).then(data => {
                this.character = data
                console.log(this.character)
            })
        }



    }
}).mount('#appDetails')