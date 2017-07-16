(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      store = require("app").Store;


  Stage.defineView("comments", function(stageContext, viewUi) {
    let viewData, viewContent, actions;

    return {
      initialize(opts) {
        viewData = {
          story: opts.story
        };

        viewContent = new Vue({
          data: viewData,
          store,
          mounted: function() {
            console.log("Mounted comments view");
          },
          methods: {}
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
      },

      getActionBar() {
        return actions;
      },

      activate(opts) {
        console.log(opts);
        viewData.story = opts.story;
      }
    };
  });
})();
