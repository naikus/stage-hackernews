const Vue = require("vue");

 function BusyIndicator(elem) {
  const data = {
      counter: 0
    },
    indicator = new Vue({
      el: elem,
      data: data,
      computed: {
        busy() {
          // console.log("counter", this.counter);
          return this.counter > 0
        }
      }
    });

  return {
    setBusy: function(state = true) {
      data.counter += (state === true ? 1 : -1)
    }
  };
};

module.exports = BusyIndicator;