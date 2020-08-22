import uniqid from 'uniqid'

export default class List {
    constructor() {
        this.items = []
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item)
        return item
    }

    deleteItem (id) {
        const index = this.items.findIndex(el => el.id === id)
        //[2,4,8] splice(start index 1,2 no.of elemnts) -> returns [4,8] and og array is now mutated [2]
        //[2,4,8] slice(start index 1,2 end element and not included) -> returns 4 and og array is unchanged [2,4,8]
        this.items.splice(index, 1)
    }

    updateCount (id, newCount) {
            this.items.find(el => el.id === id).count = newCount
    }
}