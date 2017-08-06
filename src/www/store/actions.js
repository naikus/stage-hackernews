const HNFirebase = require("firebase-service"),
    PAGE_SIZE = 20,
    paginations = {
      "top":  HNFirebase.topStories(PAGE_SIZE),
      "new":  HNFirebase.newStories(PAGE_SIZE),
      "show": HNFirebase.showStories(PAGE_SIZE),
      "ask":  HNFirebase.askStories(PAGE_SIZE),
      "job":  HNFirebase.jobStories(PAGE_SIZE)
    };

function fetchReplies(commentOrReply) {
  return HNFirebase.replies(commentOrReply).then(replies => {
    return Promise.all(replies.map(
      rply => {
        rply.kids = rply.kids || [];
        rply.replies = [];
        return new Promise((res, rej) => {
          if(!rply.kids.length) {
            res(rply);
          }else {
            fetchReplies(rply).then(rplies => {
              rply.replies = rplies;
              res(rply);
            })
          }
        });
      }
    ));
  });
}

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
  },

  SET_STORY(context, story) {
    context.commit("SET_STORY",story);
  },

  COMMENTS(context) {
    const {state: {currentStory: story}, dispatch, commit} = context;
    // dispatch("SET_STORY", story);
    return HNFirebase.comments(story).then(comments => {
      const currComments = comments.map(comm => {
        comm.kids = comm.kids || [];
        comm.replies = [];
        return comm;
      });
      // currComments[0].replies = currComments.slice(3, 5);
      // console.log(currComments);
      commit("SET_COMMENTS", currComments);
    });
  },

  CLEAR_COMMENTS({commit}) {
    commit("SET_COMMENTS", []);
  },

  REPLIES(context, comment) {
    return fetchReplies(comment).then(replies => comment.replies = replies);
  },

  USER(context, id) {
    const {commit} = context;
    return HNFirebase.user(id).then(user => {
      commit("SET_USER", user);
    });
  },
  
  USERSUBMISSIONS(context) {
    const {state, commit} = context,
        user = state.user;
    return HNFirebase.userSubmissions(user, (user.submitted || [].length));
  }
}