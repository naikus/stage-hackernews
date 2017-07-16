const WhatwgFetch = require("whatwg-fetch"),
    AppStorage = require("store2").namespace("sensorapp"),
    Stage = require("stage"),
    Activables = require("activables"),
    Routes = require("./routes"),
    ActionBar = require("./components/actionbar"),
    BusyIndicator = require("./components/busyindicator"),
    Store = require("./store")();

console.log(Store);

for(let route in Routes) {
  let viewInfo = Routes[route];
  Stage.view(viewInfo.view, viewInfo.templateUrl);
}

const AppStage = Stage({
  viewport: "#viewPort",
  transition: "lollipop"
});


const activables = Activables(document);
window.addEventListener("unload", function() {
  activables.stop();
});


const busyindicator = BusyIndicator("#loading"),
    stageViewPort = AppStage.getViewPort();
stageViewPort.addEventListener("viewloadstart", (e) => busyindicator.setBusy(true), false);
stageViewPort.addEventListener("viewloadend", (e) => busyindicator.setBusy(false), false);


function setupBackButton(AppStage) {
  document.addEventListener("backbutton", function(e) {
    let controller = AppStage.getViewController(AppStage.currentView());
    if(typeof controller.onBackButton === "function") {
      controller.onBackButton();
    }else {
      try {
        AppStage.popView();
      }catch(e) {
        navigator.app.exitApp();
      }
    }
  }, false);
}



const Bootstrap = {
  run: function() {
    setupBackButton(AppStage);
    activables.start();
    AppStage.pushView("main");
  }
};



module.exports = {
  Bootstrap: Bootstrap,
  ActionBar: ActionBar("#actionBar", AppStage),
  BusyIndicator: busyindicator,
  Store: Store
};
