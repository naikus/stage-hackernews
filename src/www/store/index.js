const Vue = require("vue"),
    Vuex = require("vuex"),

    mutations = require("./mutations"),
    actions = require("./actions");

Vue.use(Vuex);

const state = {
  stories: {
    type: "top",
    items: [],
    firstPage: true,
    lastPage: true
  }
};

const getters = {
  currentStories(state, getters) {
    return state.stories;
  }
}

module.exports = () => new Vuex.Store({
  state,
  mutations,
  actions
});
