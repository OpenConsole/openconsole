function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
}

function GameLoad() {
  this.strict = true;
  this.consolePageLocation = "https://openconsole.github.io";
  this.gameIFrame = null;
  //this.gameLocation = "https://openconsole-games.github.io/Games/CrystalControl/index.html";
  this.gameLocation = getQueryVariable("loc");//"https://v6p9d9t4.ssl.hwcdn.net/html/844189/titonic web/index.html";
  //this.gameLocation = "https://v6p9d9t4.ssl.hwcdn.net/html/989148/index.html"
  this.gameDir = this.gameLocation.substring(0, this.gameLocation.lastIndexOf("/") + 1);
  // this.corsProxy = "https://cors-anywhere.herokuapp.com/";
  this.corsProxy = "https://cors-proxy-oc.glitch.me/";
  
  this.requiredBeforeLoading = [];
  this.iframeContent = "";
  this.replaced = false;
  this.initialized = false;
  
  this.canvasId = "#canvas";
  this.setSize = null;
}

GameLoad.prototype.initialize = function () {
  if(gLoad.initialized) return;
  gLoad.initialized = true;
  gLoad.loadPage(gLoad.corsProxy + gLoad.gameLocation, function (pageData) {
    gLoad.iframeContent = pageData;
    gLoad.replaceRefs();
    if (gLoad.requiredBeforeLoading.length == 0) {
      gLoad.iframeWrite(gLoad.iframeContent);
    }
    gLoad.replaced = true;
  }, 
  function(xhr) { console.error(xhr); });
}
GameLoad.prototype.iframeCanvasSize = function () {
  var canvasElem = gLoad.gameIFrame.contentWindow.document.getElementById(gLoad.canvasId);
  if (canvasElem == null) {
    setTimeout(gLoad.iframeCanvasSize, 200);
    return;
  }
  var canvasContainerElem = null;
  if (gLoad.canvasContainerId)
    canvasContainerElem = gLoad.gameIFrame.contentWindow.document.getElementById(gLoad.canvasContainerId);
  var width = canvasElem.offsetWidth;
  var height = canvasElem.offsetHeight;
  if (height == 0) {
    width = parseInt(canvasElem.style.width);
    height = parseInt(canvasElem.style.height);
  }
  gLoad.setSize = gLoad.setIFrameCanvasSize.bind(null, canvasElem, gLoad.gameIFrame.contentWindow, width / height);
  //gLoad.setSize();
  gLoad.setupGameContainer(canvasElem);
  gLoad.gameIFrame.contentWindow.addEventListener("resize", gLoad.setSize);
}
GameLoad.prototype.setupGameContainer = function (canvasElem) {
  var gameCanvasContainter = canvasElem.parentElement;
  while (gameCanvasContainter.nodeName !== "HTML") {
    gameCanvasContainter.style.position = "absolute";
    gameCanvasContainter.style.top = "0px";
    gameCanvasContainter.style.left = "0px";
    gameCanvasContainter.style.width = "100vw";
    gameCanvasContainter.style.height = "100vh";
    gameCanvasContainter.style.margin = "0px";
    gameCanvasContainter.style.display = "block";
    gameCanvasContainter.style.transform = "none";
    gameCanvasContainter = gameCanvasContainter.parentElement;
  }
  gLoad.setSize();
}
GameLoad.prototype.setIFrameCanvasSize = function (canvasElem, maxWindow, ratio) {
  var max_width = maxWindow.innerWidth;
  var max_height = maxWindow.innerHeight;
  var curr_ratio = max_width / max_height;
  if (curr_ratio > ratio) {
    max_width = ratio * max_height;
  }
  else {
    max_height = max_width / ratio;
  }
  //console.log("Setting: " + max_width + ", " + max_height);
  canvasElem.style.minWidth = max_width + "px"; 
  canvasElem.style.minHeight = max_height + "px"; 
  //setTimeout(gLoad.setSize, 10);
}
GameLoad.prototype.iframeWrite = function (iframeContent) {
  //<iframe id="gameContainer" src="about:blank" class="page" scrolling="no" noresize="noresize" frameborder="0"></iframe>
  document.getElementById("game-content").innerHTML = "<iframe id=\"iframe-game-content\" src=\"about:blank\" class=\"page\" scrolling=\"no\" frameBorder=\"0\"></iframe>";
  gLoad.gameIFrame = document.getElementById("iframe-game-content");
  gLoad.gameIFrame.contentWindow.document.open();
  gLoad.gameIFrame.contentWindow.document.write(iframeContent);
  gLoad.gameIFrame.contentWindow.document.close();
  gLoad.gameIFrame.addEventListener('load', function() {
    gLoad.iframeOverWrite(iframeContent);
  }, true);
}
GameLoad.prototype.iframeOverWrite = function (iframeContent) {
  gLoad.iframeCanvasSize();
}

GameLoad.prototype.loadPage = function (path, success, error) {
  console.log("Attemting to read page at: " + path);
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {
      if (success) success(xhr.responseText);
    }
    else {
      if (error) error(xhr);
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

GameLoad.prototype.replaceSrcs = function (srcMatch) {
  console.log(srcMatch);
  return "src=\"" + gLoad.gameDir + srcMatch.substring(5);
}
GameLoad.prototype.replaceHrefs = function (hrefMatch) {
  console.log(hrefMatch);
  return "href=\"" + gLoad.gameDir + hrefMatch.substring(6);
}
GameLoad.prototype.replaceUnityLoader = function (unityMatch) {
  console.log(unityMatch);
  var firstPart = unityMatch.match(/UnityLoader\.instantiate\(".+", ?"/)[0];
  return firstPart + gLoad.corsProxy + gLoad.gameDir + unityMatch.substring(firstPart.length);
}
GameLoad.prototype.replaceDataInInlineScripts = function (match) {
  var scriptData = match.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
  var myUniqueId = "[" + Math.random() + "@WILL_FILL_IN]";
  gLoad.requiredBeforeLoading.push(myUniqueId);
  console.log("Added I: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
  setTimeout(function() {
    var modifiedScript = gLoad.updateSourcesInScripts(scriptData);
    gLoad.iframeContent = gLoad.iframeContent.replace(myUniqueId, "<script>" + modifiedScript + "</script>");
    var index = gLoad.requiredBeforeLoading.indexOf(myUniqueId);
    if (index > -1) {
      gLoad.requiredBeforeLoading.splice(index, 1);
    }
    console.log("Removed I: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
    if (gLoad.requiredBeforeLoading.length == 0 && gLoad.replaced) {
      gLoad.iframeWrite(gLoad.iframeContent);
    }
  }, 10);
  return myUniqueId;
}

GameLoad.prototype.checkSourceReplace = function (source) {
  return "((" + source + ").match(/^(https?:\\/\\/|blob:)/)?" + source + ":\"" + gLoad.corsProxy + gLoad.gameDir + "\"+" + source + ")";
}
GameLoad.prototype.replaceSrcsScript = function (srcMatch) {
  console.log(srcMatch);
  var firstPart = srcMatch.match(/\.src *= */)[0];
  var changed = firstPart + gLoad.checkSourceReplace(srcMatch.substring(firstPart.length));
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceRequestScript = function (reqMatch) {
  console.log(reqMatch);
  var firstPart = reqMatch.match(/\.open *\( *('|")[^'"]*('|") *,/)[0];
  var middlePart = reqMatch.substring(firstPart.length);
  var changed = firstPart + gLoad.checkSourceReplace(middlePart);
  console.log(changed);
  return changed;
}
GameLoad.prototype.updateSourcesInScripts = function (script) {
  //console.log(window.location.href);
  var updatedScript = script.replace(/\.src *= *[^,;]*/g, gLoad.replaceSrcsScript);
  return updatedScript.replace(/\.open *\( *('|")[^'"]*('|") *,((?!(,|\)(,|;)))[\s\S])*((?=\),(!1|!0))\))?/g, gLoad.replaceRequestScript);
}
GameLoad.prototype.replaceScripts = function (scriptMatch) {
  var scriptSrc = scriptMatch.replace(/<script.*src="/, "").replace(/"><\/script>/, "");
  var myUniqueId = "[" + scriptSrc + Math.random() + "@WILL_FILL_IN]";
  gLoad.requiredBeforeLoading.push(myUniqueId);
  console.log("Added S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
  console.log(scriptMatch);
  gLoad.loadPage(gLoad.corsProxy + gLoad.gameDir + scriptSrc,
    function (script) {
      //console.log(script);
      var modifiedScript = gLoad.updateSourcesInScripts(script);
      gLoad.iframeContent = gLoad.iframeContent.replace(myUniqueId, "<script>" + modifiedScript + "</script>");
      var index = gLoad.requiredBeforeLoading.indexOf(myUniqueId);
      if (index > -1) {
        gLoad.requiredBeforeLoading.splice(index, 1);
      }
      console.log("Removed S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
      if (gLoad.requiredBeforeLoading.length == 0 && gLoad.replaced) {
        gLoad.iframeWrite(gLoad.iframeContent);
      }
    },
    function(xhr) { console.error(xhr); });
  return myUniqueId;
}

GameLoad.prototype.replaceRefs = function (content) {
  //console.log(gLoad.iframeContent);
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script.*src="https?:\/\/static\.itch\.io\/htmlgame\.js"[^>]*><\/script>/, '');
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script[^>]*>((?!<\/script>)[\s\S])+<\/script>/g, gLoad.replaceDataInInlineScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script[^>]*src="[^"]+"[^>]*> *<\/script>/g, gLoad.replaceScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/src="(?!https?:\/\/|data:image|blob:)[^"]+"/g, gLoad.replaceSrcs);
  gLoad.iframeContent = gLoad.iframeContent.replace(/href="(?!https?:\/\/)[^"]+"/g, gLoad.replaceHrefs);
  //gLoad.iframeContent = gLoad.iframeContent.replace(/UnityLoader\.instantiate\(".+", ?".*"/g, gLoad.replaceUnityLoader);
}


var gLoad = new GameLoad();
gLoad.initialize();