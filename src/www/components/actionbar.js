const Vue = require("vue");

const ActionBarComponent = {
  props: ["content"],
  template:`
  <keep-alive>
    <component :is="content"></component>
  </keep-alive>
  `
};


function ActionBar(element, stage) {
  const viewPort = stage.getViewPort(),
      data = {
        viewActions: null,
        visible: false
      },
      widget = new Vue({
        data: data,
        components: {
          "actionbar": ActionBarComponent
        }
      });

  function getActionsForView(e) {
    const viewId = e.viewId,
        controller = stage.getViewController(viewId),
        viewActionBar = typeof controller.getActionBar === "function" ?
            controller.getActionBar() : (controller.actionBar || null);
    data.viewActions = viewActionBar;

    manageVisibility();
  }

  function manageVisibility(e) {
    data.visible = !!data.viewActions;
  }

  viewPort.addEventListener("beforeviewtransitionin", getActionsForView, false);
  // viewPort.addEventListener("viewtransitionin", manageVisibility, false);

  widget.$mount(element);
  return widget;
}

module.exports = ActionBar;