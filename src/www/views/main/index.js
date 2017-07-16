(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      firebase = require("firebase-service"),
      timeago = require("timeago.js")(),
      busyIndicator = require("app").BusyIndicator,
      store = require("app").Store;

  Stage.defineView("main", function(stageContext, viewUi) {
    let viewData, viewContent, actions;

    return {
      initialize(opts) {
        viewData = {
          storyTypes: [
            {id: "top", label: "Top"},
            {id: "new", label: "New"},
            {id: "show", label: "Show"},
            {id: "ask", label: "Ask"},
            {id: "job", label: "Jobs"}
          ]
        };

        viewContent = new Vue({
          data: viewData,
          store,
          mounted() {
            console.log("Mounted home view");
          },
          methods: {
            showStories(type) {
              busyIndicator.setBusy(true);
              this.$store.dispatch("SET_STORY_TYPE", type).then(() => busyIndicator.setBusy(false));
            },
            nextStories() {
              busyIndicator.setBusy(true);
              this.$store.dispatch("NEXT_STORIES").then(() => busyIndicator.setBusy(false));
            },
            previousStories() {
              busyIndicator.setBusy(true);
              this.$store.dispatch("PREVIOUS_STORIES").then(() => busyIndicator.setBusy(false));
            },
            showComments(story, e) {
              if(e.target.nodeName === "A" || this.stories.type === "job") {
                return;
              }
              stageContext.pushView("comments", {story: story});
            }
          },
          computed: {
            stories() { 
              return this.$store.state.stories;
            }
          },
          filters: {
            timeago: time => timeago.format(new Date(time * 1000))
          }
        });

        actions = {
          template: "#homeActions",
          data() {
            return {}
          },
          computed: {},
          methods: {
            about: () => stageContext.pushView("about", {
              transition: "slide-up"
            }),
            settings: () => stageContext.pushView("settings")
          }
        };

        var el = viewUi.getElementsByClassName("content")[0];
        viewContent.$mount(el);

        viewUi.addEventListener("transitionin", e => {
          const {items, type} = viewContent.stories;
          if(!items.length) {
            viewContent.showStories(type);
          }
        }, false);
      },

      getActionBar() {
        return actions;
      }
    };
  });
})();
