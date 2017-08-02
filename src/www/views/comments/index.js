(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      firebase = require("firebase-service"),
      busyIndicator = require("app").BusyIndicator,
      store = require("app").Store,
      timeago = require("timeago.js")(),
      StoryComponent = require("components").Story,
      CommentComponent = require("components").Comment;


  Stage.defineView("comments", function(stageContext, viewUi) {
    let viewData, viewContent, actions;

    function fetchComments() {
      const story = store.state.currentStory;
      if(story.kids.length) {
        busyIndicator.setBusy(true);
        store.dispatch("COMMENTS").then(() => busyIndicator.setBusy(false));
      }
    }

    function clearComments() {
      store.dispatch("CLEAR_COMMENTS");
    }

    function fetchReplies(comment) {
      if(comment.kids.length && !comment.replies.length) {
        busyIndicator.setBusy(true);
        store.dispatch("REPLIES", comment).then(() => busyIndicator.setBusy(false));
      }
    }

    return {
      initialize(opts) {
        console.log("initializing comments view");
        viewContent = new Vue({
          data: {},
          store,
          mounted: function() {
            console.log("Mounted comments view");
          },
          computed: {
            story() {
              return this.$store.state.currentStory;
            },
            comments() {
              return this.$store.state.currentComments;
            }
          },
          methods: {
            handleCommentAction(type, data) {
              if(type === "comment") fetchReplies(data);
            }
          },
          components: {
            "story-card": StoryComponent,
            "hn-comment": CommentComponent
          }
        });

        actions = {
          template: "#commentsActions",
          data: function() {
            return {}
          },
          computed: {},
          methods: {
            back: () => stageContext.popView()
          }
        };

        var el = viewUi.getElementsByClassName("content")[0];
        viewContent.$mount(el);
        viewUi.addEventListener("transitionin", e => {
          fetchComments();
        }, false);
        viewUi.addEventListener("transitionout", e => {
          clearComments();
        }, false);
      },

      getActionBar() {
        return actions;
      },

      deactivate(opts) {
        
      }
    };
  });
})();
