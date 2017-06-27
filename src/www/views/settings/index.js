(function() {
  const Stage = require("stage"),
      Vue = require("vue");

  Stage.defineView("settings", function(stageContext, viewUi) {
    let viewData, viewContent, actions;

    return {
      initialize: function(opts) {
        viewData = {
        };

        viewContent = new Vue({
          data: viewData,
          mounted: function() {
            console.log("Mounted settings view");
          },
          methods: {}
        });

        actions = {
          template: "#settingsActions",
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

      getActionBar: function() {
        return actions;
      }
    };
  });
})();
