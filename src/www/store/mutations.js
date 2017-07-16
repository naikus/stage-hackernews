module.exports = {
  SET_STORIES(state, {type = "top", items = [], firstPage = true, lastPage = true}) {
    // const {stories} = state;
    state.stories = {
      type,
      items,
      firstPage,
      lastPage
    };
  },
  
  CLEAR_STORY_ITEMS(state, type = state.stories.type) {
    state.stories = {
      type,
      items: [],
      firstPage: true,
      lastPage: true
    }
  }
};
