function Utils() {
  this.maximizedEvent = new Event('maximized');
  this.screenBase = document.getElementById("screen");
  this.rotationBase = document.getElementById("rotation");
  this.targetRotation = orientations.LANDSCAPE;
  this.rotationMargins = {left:0, top:0};
  this.prevRot = {width:0, height:0};
  this.screenRect = {width:0, height:0};
}
Utils.prototype.initialize = function() {
  window.addEventListener("resize", function() { utils.forceRotation(utils.targetRotation) });
  window.addEventListener("orientationchange", function() { utils.forceRotation(utils.targetRotation) });
  window.addEventListener("focus", function() { utils.forceRotation(utils.targetRotation) });
  
  //window.setInterval(function() { utils.forceRotation(utils.targetRotation) }, 500);
  utils.forceRotation(utils.targetRotation);
}

Utils.prototype.funhash = function (s) {
    for(var i = 0, h = 0xdeadbeef; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    return btoa((h ^ h >>> 16) >>> 0).slice(0, -2); 
};
Utils.prototype.getId = function (a, b) {
    return utils.funhash("a" + a) + utils.funhash("b" + b);
};


Utils.prototype.save_object = function (name, obj) {
  localStorage.setItem(name, JSON.stringify(obj));
}
Utils.prototype.load_object = function (name) {
  var value = localStorage.getItem(name);
  return value && JSON.parse(value);
}


Utils.prototype.doneScreenChange = function () {
    document.dispatchEvent(utils.maximizedEvent);
}
    
/* View in fullscreen */
Utils.prototype.openFullscreen = function () {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().then(e => { utils.doneScreenChange(); });
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen().then(e => { utils.doneScreenChange(); });
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen().then(e => { utils.doneScreenChange(); });
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen().then(e => { utils.doneScreenChange(); });
  }
}

/* Close fullscreen */
Utils.prototype.closeFullscreen = function () {
  if (document.exitFullscreen) {
    document.exitFullscreen().then(e => { utils.doneScreenChange(); });
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen().then(e => { utils.doneScreenChange(); });
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen().then(e => { utils.doneScreenChange(); });
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen().then(e => { utils.doneScreenChange(); });
  }
}

/* Toggle fullscreen */
Utils.prototype.toggleFullscreen = function () {
  if (document.exitFullscreen) {
    document.exitFullscreen().then(e => { doneScreenChange(); }).catch(e => { utils.openFullscreen(); });
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen().then(e => { doneScreenChange(); }).catch(e => { utils.openFullscreen(); });
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen().then(e => { doneScreenChange(); }).catch(e => { utils.openFullscreen(); });
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen().then(e => { doneScreenChange(); }).catch(e => { utils.openFullscreen(); });
  }
}

const orientations = {
  PORTRAIT: 0,
  LANDSCAPE: 1
};

Utils.prototype.forceRotation = function (target) {
  if (screen == null) {
    window.setTimeout(function() {
        utils.forceRotation(target);
    }, 0);
    return;
  }
  var rect = utils.screenBase.getBoundingClientRect();
  var width = rect.width;
  var height = rect.height;
  if (utils.prevRot.width == width && utils.prevRot.height == height && utils.targetRotation == target) return;
  utils.targetRotation = target;
  try {
    if (target == orientations.PORTRAIT)
      screen.orientation.lock("portrait-primary").catch(function(){});
    else if (target == orientations.LANDSCAPE)
      screen.orientation.lock("landscape-primary").catch(function(){});
  } catch (k) {}
  try {
    if (target == orientations.PORTRAIT)
      screen.lockOrientation("portrait-primary");
    else if (target == orientations.LANDSCAPE)
      screen.lockOrientation("landscape-primary");
  } catch (k) {}
  var rotation = "none";
  if (width > height) {
    if (target == orientations.PORTRAIT) {
      width = rect.height;
      height = rect.width;
      rotation = "rotate(-90deg)";
    }
  } else {
    if (target == orientations.LANDSCAPE) {
      width = rect.height;
      height = rect.width;
      rotation = "rotate(90deg)";
    }
  }
  utils.rotationBase.style.transform = rotation;
  utils.rotationBase.style.webkitTransform = rotation;
  utils.rotationBase.style.width = width + "px";
  utils.rotationBase.style.height = height + "px";
  utils.screenRect = {width:width, height:height};
  window.setTimeout(function() {
    var rectPost = utils.rotationBase.getBoundingClientRect();
    utils.rotationMargins.left = utils.rotationMargins.left - rectPost.left;
    utils.rotationMargins.top = utils.rotationMargins.top - rectPost.top;
    utils.rotationBase.style.marginLeft = utils.rotationMargins.left + "px";
    utils.rotationBase.style.marginTop = utils.rotationMargins.top + "px";
  }, 10);
}

var utils = new Utils();
utils.initialize();