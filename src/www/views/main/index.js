(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      firebase = require("firebase-service"),
      busyIndicator = require("app").BusyIndicator,
      store = require("app").Store,
      StoryComponent = require("components").Story;

  Stage.defineView("main", function(stageContext, viewUi) {
    let content, viewData, viewContent, actions;

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
              if(e.target.nodeName === "A" && story.url || this.stories.type === "job") {
                return;
              }
              this.$store.dispatch("SET_STORY", story);
              stageContext.pushView("comments");
            },
            handleStoryAction(type, data) {
              console.log(type, data);
            }
          },
          computed: {
            stories() { 
              return this.$store.state.stories;
            }
          },
          components: {
            "story-card": StoryComponent
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

        viewContent.$mount(viewUi.getElementsByClassName("content")[0]);
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
