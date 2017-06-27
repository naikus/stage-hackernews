(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      firebase = require("firebase-service"),
      timeago = require("timeago.js")(),
      busyIndicator = require("app").BusyIndicator;

  Stage.defineView("main", function(stageContext, viewUi) {
    let viewData, viewContent, actions;
    const paginations = {
      "top": firebase.topStories(30),
      "new": firebase.newStories(30),
      "show": firebase.showStories(30),
      "ask": firebase.askStories(30),
      "job": firebase.jobStories(30)
    };

    function showStories(type) {
      viewData.storyType = type;
      const pagination = paginations[type];
      if(pagination.data) {
        viewData.stories = pagination.data;
      }else {
        nextStories();
      }
    }

    function nextStories() {
      const pagination = paginations[viewData.storyType];
      if(pagination.hasNext()) {
        busyIndicator.setBusy(true);
        pagination.next().then(stories => {
          console.log(stories[0].text);
          busyIndicator.setBusy(false);
          viewData.stories = stories;
        });
      }
    }

    function previousStories() {
      const pagination = paginations[viewData.storyType];
      if(pagination.hasPrevious()) {
        busyIndicator.setBusy(true);
        pagination.previous().then(stories => {
          busyIndicator.setBusy(false);
          viewData.stories = stories;
        });
      }
    }

    return {
      initialize: function(opts) {
        viewData = {
          storyTypes: [
            {id: "top", label: "Top"},
            {id: "new", label: "New"},
            {id: "show", label: "Show"},
            {id: "ask", label: "Ask"},
            {id: "job", label: "Jobs"}
          ],
          storyType: "top",
          stories: []
        };

        viewContent = new Vue({
          data: viewData,
          mounted: function() {
            console.log("Mounted home view");
          },
          methods: {
            showStories,
            nextStories,
            previousStories
          },
          filters: {
            timeago: time => timeago.format(new Date(time * 1000))
          }
        });

        actions = {
          template: "#homeActions",
          data: function() {
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
          if(!viewData.stories.length) {
            showStories(viewData.storyType);
          }
        }, false);
      },

      getActionBar: function() {
        return actions;
      }
    };
  });
})();
