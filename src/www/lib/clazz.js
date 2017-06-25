  function classRe(clazz) {
    // new RegExp("\\b" + clazz + "[^\w-]")
    return clsRegExps[clazz] || (clsRegExps[clazz] =
        new RegExp("(^|\\s+)" + clazz + "(?:\\s+|$)")); // thank you xui.js :) 
  }

  function addClass(elem, clName) {
    var cList = elem.classList;
    if(!cList || !clName) {
      return false;
    }
    cList.add(clName);
    return true;
  }

  function removeClass(elem, clName) {
    var cList = elem.classList;
    if(!cList || !clName) {
      return false;
    }
    cList.remove(clName);
    return true;
  }
  
  function hasClass(element, clName) {
    return classRe(clName).test(element.className);
  }

module.exports = {
  hasClass,
  addClass,
  removeClass
};