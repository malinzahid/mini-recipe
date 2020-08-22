import Search from './models/Search.js'
import List from './models/List.js'
import Likes from './models/Likes.js'
import {
    elements,
    renderLoader,
    clearLoader
} from './views/base.js'
import * as searchView from './views/searchView.js'
import * as recipeView from './views/recipeView.js'
import * as listView from './views/listView.js'
import * as likesView from './views/likesView.js'
import Recipe from './models/Recipe.js'


//Global state of app//
//-Search object
//-Current recipe object
//-Shoping list object
//-Liked recipes

const state = {}

const controlSearch = async () => {
    //Get query from view
    const q = searchView.getInput()

    if (q) {
        //New search object and add to state
        state.search = new Search(q)

        //Prepare UI for result
        searchView.clearInput()
        searchView.clearResult()
        renderLoader(elements.searchRes)

        try {
            //Search for recipies
            await state.search.getResults()

            //Render results on UI
            clearLoader()
            searchView.renderResults(state.search.result)

        } catch (err) {
            alert(`Error in search`)
            clearLoader()
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault()
    controlSearch()
})


window.addEventListener('load', e => {
    e.preventDefault()
    controlSearch()
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10)
        searchView.clearResult()
        searchView.renderResults(state.search.result, goToPage)
    }
})

//RECIPE CONTROLER

const controlRecipe = async () => {
    //Get ID from url
    const id = window.location.hash.replace('#', '')

    if (id) {
        //Prepare UI for change
        recipeView.clearRecipe()
        renderLoader(elements.recipe)

        //Highlight selected
        if (state.search) searchView.highlightSelected(id)

        //Create new recipe object
        state.recipe = new Recipe(id)


        try {
            //Get recipe data
            await state.recipe.getRecipe()
            state.recipe.parseIngredients()

            //Calcu servings and time
            state.recipe.calcTime()
            state.recipe.calcServings()

            //Render recipe
            clearLoader()
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id))
        } catch (error) {
            console.log(error)
            alert(`Error in recipe`)
        }
    }
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))

// LIST CONTROLLER

const controlList = () => {
    //create a new list if none
    if (!state.list) state.list = new List()

    //Add each ingredient to list and UI

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient)
        listView.renderItem(item)
    })
}

//Handle delete and update list item
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid

    //Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete frm state
        state.list.deleteItem(id)
        //Delete frm UI*
        listView.deleteItem(id)
        //Handle Count button
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10)
        state.list.updateCount(id, val)
    }
})


//LIKES controller
const controlLike = () => {
    if (!state.likes) state.likes = new Likes()

    //User has not yet liked cur recipe
    const currentID = state.recipe.id
    if (!state.likes.isLiked(currentID)) {
        //Add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //Toggle like btn
        likesView.toggleLikeBtn(true)
        //Add like to UI
        likesView.renderLike(newLike)


        //User Liked current recipe
    } else {
        //Remove like frm state
        state.likes.deleteLike(currentID)
        //toggle like
        likesView.toggleLikeBtn(false)
        //Remove like frm UI
        likesView.deleteLike(currentID)

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
}
//Restore liked recipes on reload
window.addEventListener('load', () => {
    state.likes = new Likes()

    //Restore likes
    state.likes.readStorage()

    //Toggle Button
    likesView.toggleLikeMenu(state.likes.getNumLikes())
    
    //Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like))
})

//Handle recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Dec btn is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe)
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Inc btn is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)
    } else if (e.target.matches('.recipe__btn--add,.recipte__btn,.recipte__btn *, .recipe__btn--add *')) {
        //Add ing to list
        controlList()
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike()
    }
})