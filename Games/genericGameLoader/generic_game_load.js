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
  
  this.setSize = [];
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
  var canvasElems = gLoad.gameIFrame.contentWindow.document.getElementsByTagName('canvas');
  if (canvasElems.length == 0) {
    setTimeout(gLoad.iframeCanvasSize, 1000);
    return;
  }
  for (var i = 0; i < canvasElems.length; i++) {
    var canvasElem = canvasElems[i];
    var width = canvasElem.offsetWidth;
    var height = canvasElem.offsetHeight;
    if (height == 0) {
      width = parseInt(canvasElem.style.width);
      height = parseInt(canvasElem.style.height);
    }
    var mySetSize = gLoad.setIFrameCanvasSize.bind(null, canvasElem, gLoad.gameIFrame.contentWindow, width / height, i);
    gLoad.setSize.push(mySetSize);
    //gLoad.setSize();
    gLoad.setupGameContainer(canvasElem, mySetSize);
    gLoad.gameIFrame.contentWindow.addEventListener("resize", mySetSize);
  }
}
GameLoad.prototype.setupGameContainer = function (canvasElem, mySetSize) {
  var gameCanvasContainter = canvasElem.parentElement;
  gameCanvasContainter.style.display = "flex";
  gameCanvasContainter.style.alignItems = "center";
  gameCanvasContainter.style.justifyContent = "center";
  gameCanvasContainter.style.position = "absolute";
  gameCanvasContainter.style.top = "0px";
  gameCanvasContainter.style.left = "0px";
  gameCanvasContainter.style.width = "100vw";
  gameCanvasContainter.style.height = "100vh";
  gameCanvasContainter.style.margin = "0px";
  gameCanvasContainter.style.transform = "none";

  for (var i = 0; i < gameCanvasContainter.children.length; i++) {
    var child = gameCanvasContainter.children[i];
    if (child.nodeName == "CANVAS") continue;
    child.style.display = "none";
  }
  while (gameCanvasContainter.parentElement.nodeName !== "HTML") {
    gameCanvasContainter = gameCanvasContainter.parentElement;
    gameCanvasContainter.style.display = "block";
    gameCanvasContainter.style.position = "absolute";
    gameCanvasContainter.style.top = "0px";
    gameCanvasContainter.style.left = "0px";
    gameCanvasContainter.style.width = "100vw";
    gameCanvasContainter.style.height = "100vh";
    gameCanvasContainter.style.margin = "0px";
    gameCanvasContainter.style.transform = "none";
  }
  mySetSize();
}
GameLoad.prototype.setIFrameCanvasSize = function (canvasElem, maxWindow, ratio, index) {
  var max_width = maxWindow.innerWidth;
  var max_height = maxWindow.innerHeight;
  var curr_ratio = max_width / max_height;
  var canv_width = max_width;
  var canv_height = max_height;
  if (curr_ratio > ratio) {
    canv_width = ratio * max_height;
  }
  else {
    canv_height = max_width / ratio;
  }
  //console.log("Setting: " + max_width + ", " + max_height);
  canvasElem.style.minWidth = canv_width + "px"; 
  canvasElem.style.minHeight = canv_height + "px"; 
  canvasElem.style.maxWidth = canv_width + "px"; 
  canvasElem.style.maxHeight = canv_height + "px"; 
  //canvasElem.style.transform = "translate(" + ((max_width - canv_width) / 2) + "px, " + ((max_height - canv_height) / 2) + "px)";
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
  return "src=\"" + gLoad.corsProxy + gLoad.gameDir + srcMatch.substring(5);
}
GameLoad.prototype.replaceHrefs = function (hrefMatch) {
  console.log(hrefMatch);
  return "href=\"" + gLoad.corsProxy + gLoad.gameDir + hrefMatch.substring(6);
}
GameLoad.prototype.replaceManifests = function (manifestMatch) {
  console.log(manifestMatch);
  return "manifest=\"" + gLoad.corsProxy + gLoad.gameDir + manifestMatch.substring(10);
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
    var pageData = gLoad.iframeContent.split(myUniqueId);
    gLoad.iframeContent = pageData[0] + "<script>" + modifiedScript + "</script>" + pageData[1];
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
  var firstPart = srcMatch.match(/[,;{?]((?!\.src|[,;{?])[\s\S]){1,20}\.src *= */)[0];
  var objectNameWithDelim = firstPart.match(/[,;{?]((?!\.src|[,;{?])[\s\S]){1,20}/)[0];
  var objectName = objectNameWithDelim.substring(1);
  var changed = objectNameWithDelim.charAt(0) + "(" + objectName + ".crossOrigin=\"Anonymous\"," + objectName + ".src=" + gLoad.checkSourceReplace(srcMatch.substring(firstPart.length, srcMatch.length - 1)) + ")" + srcMatch.slice(-1);
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceRequestScript = function (reqMatch) {
  if(reqMatch.includes("/dev/")) return reqMatch;
  console.log(reqMatch);
  var firstPart = reqMatch.match(/\.open *\( *('|")[^'"]*('|") *,/)[0];
  var middlePart = reqMatch.substring(firstPart.length);
  var changed = firstPart + gLoad.checkSourceReplace(middlePart);
  console.log(changed);
  return changed;
}
GameLoad.prototype.updateSourcesInScripts = function (script) {
  //console.log(window.location.href);
  //var updatedScript = script.replace(/\.src *(?!==|=\n*"")= *((?!data:)[^,;:}])*[,;:}]/g, gLoad.replaceSrcsScript);
  var updatedScript = script.replace(/[,;{?]((?!\.src|[,;{?])[\s\S]){1,20}\.src *(?!==|=\n*"")= *((?!data:)(:\/\/|:'|[^,:;}]))*[,:;}]/g, gLoad.replaceSrcsScript);
  return updatedScript.replace(/\.open *\( *('|")[^'"]*('|") *,((?!(,|\)(,|;)))[\s\S])*((?=\)+, *(!1|!0|false|true))\))?/g, gLoad.replaceRequestScript);
}
GameLoad.prototype.replaceScripts = function (scriptMatch) {
  var scriptSrc = scriptMatch.replace(/<script.*src="/, "").replace(/">((?!<\/script>)[\s\S])*<\/script>/, "");
  var myUniqueId = "[" + scriptSrc + Math.random() + "@WILL_FILL_IN]";
  gLoad.requiredBeforeLoading.push(myUniqueId);
  console.log("Added S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
  console.log(scriptMatch);
  gLoad.loadPage(gLoad.corsProxy + gLoad.gameDir + scriptSrc,
    function (script) {
      //console.log(script);
      var modifiedScript = gLoad.updateSourcesInScripts(script);
      //modifiedScript = modifiedScript.replace("BBHtml5Game.prototype.PathToUrl=function( path ){", "BBHtml5Game.prototype.PathToUrl=function( path ){debugger;");
      var pageData = gLoad.iframeContent.split(myUniqueId);
      //if(modifiedScript.includes("sw.js")) console.log(modifiedScript);
      gLoad.iframeContent = pageData[0] + "<script>" + modifiedScript + "</script>" + pageData[1];
      //console.log(gLoad.iframeContent);
      var index = gLoad.requiredBeforeLoading.indexOf(myUniqueId);
      if (index > -1) {
        gLoad.requiredBeforeLoading.splice(index, 1);
      }
      console.log("Removed S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
      if (gLoad.requiredBeforeLoading.length == 0 && gLoad.replaced) {
        gLoad.iframeWrite(gLoad.iframeContent);
      }
    },
    function(xhr) {
      console.error(xhr);
      var index = gLoad.requiredBeforeLoading.indexOf(myUniqueId);
      if (index > -1) {
        gLoad.requiredBeforeLoading.splice(index, 1);
      }
      console.log("Removed S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
      if (gLoad.requiredBeforeLoading.length == 0 && gLoad.replaced) {
        gLoad.iframeWrite(gLoad.iframeContent);
      }
    });
  return myUniqueId;
}

GameLoad.prototype.replaceRefs = function (content) {
  //console.log(gLoad.iframeContent);
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script((?!src=|>)[\s\S])*src="https?:\/\/static\.itch\.io\/htmlgame\.js"[^>]*><\/script>/, '');
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script((?!>|src=)[\s\S])*>((?!<\/script>)[\s\S])+<\/script>/g, gLoad.replaceDataInInlineScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script[^>]*src="[^"]+"[^>]*>((?!<\/script>)[\s\S])*<\/script>/g, gLoad.replaceScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/src="(?!https?:\/\/|data:|blob:)[^"]+"/g, gLoad.replaceSrcs);
  gLoad.iframeContent = gLoad.iframeContent.replace(/href="(?!https?:\/\/)[^"]+"/g, gLoad.replaceHrefs);
  gLoad.iframeContent = gLoad.iframeContent.replace(/manifest="(?!https?:\/\/)[^"]+"/g, gLoad.replaceManifests);
  //gLoad.iframeContent = gLoad.iframeContent.replace(/UnityLoader\.instantiate\(".+", ?".*"/g, gLoad.replaceUnityLoader);
}


var gLoad = new GameLoad();
gLoad.initialize();