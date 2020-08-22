import axios from 'axios'


export default class Search {
    constructor(q) {
        this.q = q
    }

    async getResults() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.q}`)
            this.result = res.data.recipes
            //console.log(this.result)
        } catch (error) {
            alert(error)
        }
    }
}