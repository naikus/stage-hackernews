(function() {
  const Stage = require("stage"),
      Vue = require("vue");

  Stage.defineView("user", function(stageContext, viewUi) {
    let viewData, viewContent, actions;

    return {
      initialize(opts) {
        viewData = {
        };

        viewContent = new Vue({
          data: viewData,
          mounted: function() {
            console.log("Mounted user view");
          },
          methods: {}
        });

        actions = {
          template: "#userActions",
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
      }
    };
  });
})();
