const HNFirebase = require("firebase-service"),
    PAGE_SIZE = 20,
    paginations = {
      "top":  HNFirebase.topStories(PAGE_SIZE),
      "new":  HNFirebase.newStories(PAGE_SIZE),
      "show": HNFirebase.showStories(PAGE_SIZE),
      "ask":  HNFirebase.askStories(PAGE_SIZE),
      "job":  HNFirebase.jobStories(PAGE_SIZE)
    };

module.exports = {
  SET_STORY_TYPE(context, type) {
    const {state, dispatch, commit} = context,
        pagination = paginations[type];

    commit("CLEAR_STORY_ITEMS", type);
    if(pagination.data) {
      setTimeout(() => {
        commit("SET_STORIES", {
          type,
          items: pagination.data,
          firstPage: !pagination.hasPrevious(),
          lastPage: !pagination.hasNext()
        });
      }, 200);
      // return Promise.resolve();
    }else {
      return dispatch("NEXT_STORIES");
    }
  },

  NEXT_STORIES(context) {
    const {state, dispatch, commit} = context, 
        {stories: {type}} = state,
        pagination = paginations[type];

    if(pagination.hasNext()) {
      return pagination.next().then(items => commit("SET_STORIES", {
          type,
          items,
          firstPage: !pagination.hasPrevious(),
          lastPage: !pagination.hasNext()
        })
      );
    }
    // return Promise.resolve();
  },
  
  PREVIOUS_STORIES(context) {
    const {state, dispatch, commit} = context, 
        {stories: {type}} = state,
        pagination = paginations[type];

    if(pagination.hasPrevious()) {
      return pagination.previous().then(items => commit("SET_STORIES", {
          type,
          items,
          firstPage: !pagination.hasPrevious(),
          lastPage: !pagination.hasNext()
        })
      );
    }
    // return Promise.resolve();
  }
}