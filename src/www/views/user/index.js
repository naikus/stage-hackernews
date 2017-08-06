(function() {
  const Stage = require("stage"),
      Vue = require("vue"),
      busyIndicator = require("app").BusyIndicator,
      store = require("app").Store,
      timeago = require("timeago.js")();

  Stage.defineView("user", function(stageContext, viewUi) {
    let viewContent, actions;

    return {
      initialize(opts) {
        viewContent = new Vue({
          store: store,
          mounted: function() {
            console.log("Mounted user view");
          },
          computed: {
            user() {
              return this.$store.state.user;
            },
            since() {
              const time = this.$store.state.user.created;
              return timeago.format(new Date(time * 1000));
            }
          }
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
      },

      activate() {
      }
    };
  });
})();
