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
  canvasElem.style.imageRendering = "optimizespeed";

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
GameLoad.prototype.replaceUrls = function (urlMatch, prefix, g2, urlData) {
  //console.log(urlMatch);
  return prefix + gLoad.corsProxy + gLoad.gameDir + urlData;
}
GameLoad.prototype.replaceDataInInlineStyles = function (match, prefix, g2, style, g4, postfix) {
  var newStyle = style.replace(/(url\(('|"))([^'"]+)/g, gLoad.replaceUrls);
  return prefix + newStyle + postfix;
}
GameLoad.prototype.replaceDataInInlineScripts = function (match, prefix, g2, scriptData, g3, postfix) {
  var myUniqueId = "[" + Math.random() + "@WILL_FILL_IN]";
  gLoad.requiredBeforeLoading.push(myUniqueId);
  console.log("Added I: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
  setTimeout(function() {
    var modifiedScript = gLoad.updateSourcesInScripts(scriptData);
    var pageData = gLoad.iframeContent.split(myUniqueId);
    gLoad.iframeContent = pageData[0] + prefix + modifiedScript + postfix + pageData[1];
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
  return "(chkSrc(" + source + "))";
}
GameLoad.prototype.replaceSrcsScript = function (srcMatch, prefix, name, g3, assignment, g5, g6, ending) {
  console.log(srcMatch);
  var changed = prefix + "(" + name + ".crossOrigin=\"Anonymous\"," + name + ".src=" + gLoad.checkSourceReplace(assignment) + ")" + ending;
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceFetchScript = function (fetchMatch, fetchPrefix, fetchName) {
  console.log(fetchMatch);
  console.log(fetchName);
  var changed = fetchPrefix + gLoad.checkSourceReplace(fetchName);
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceUriScript = function (uriMatch, uriPrefix, g2, uriName, g4, g5, uriPostfix) {
  console.log(uriMatch);
  console.log(uriName);
  var changed = uriPrefix + gLoad.checkSourceReplace(uriName) + uriPostfix;
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceSWScript = function (swMatch, swPrefix, swName) {
  console.log(swMatch);
  console.log(swName);
  var changed = swPrefix + gLoad.checkSourceReplace(swName);
  console.log(changed);
  return changed;
}
GameLoad.prototype.replaceUrlInScript = function (urlMatch, urlPrefix, urlDestMatch) {
  console.log(urlMatch);
  console.log(urlPrefix);
  console.log(urlDestMatch);
  var changed = urlPrefix + "\"" + gLoad.corsProxy + gLoad.gameDir + "\"+((" + urlDestMatch + ").includes(\"worker\")?\"scripts/\":\"\")";
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
  var updatedScript = script.replace(/([,;{?(]|return )(((?!\.src|[,;{?(]|return)[\s\S]){1,20})\.src *(?!==|=\n*"")= *(((?!data:|null|\)\);)(:\/\/|:'|,[a-zA-Z.]\)|[^,:;}]))*)([,:;})])/g, gLoad.replaceSrcsScript);
  updatedScript = updatedScript.replace(/(fetch *\( *)(((?!(,|\)(,|;|}|\))))[\s\S])*)/g, gLoad.replaceFetchScript);
  updatedScript = updatedScript.replace(/\.open *\( *('|")[^'"]*('|") *,((?!(,|\)(,|;|})))[\s\S])*((?=\)+, *(!1|!0|false|true))\))?/g, gLoad.replaceRequestScript);
  updatedScript = updatedScript.replace(/(\.(uri|URL) *(?!==)= *)(((?!data:|null|\)\);)(:\/\/|:'|[^,:;})]))*)([,:;})])/g, gLoad.replaceUriScript);
  updatedScript = updatedScript.replace(/(navigator\.serviceWorker\.register *\( *)(((?!,|\))[\s\S])+)/g, gLoad.replaceSWScript);
  //updatedScript = updatedScript.replace(/if *\(e\.baseUrl\) *this/, "debugger;if (e.baseUrl) this");
  updatedScript = updatedScript.replace(/(new +URL *\(([^,]+),)([^)]+)/g, gLoad.replaceUrlInScript);
  return "function chkSrc (source) {  console.log(\"SOURCE IS: \" + source); if (source == null || typeof source == \"object\" || source == \"\") return source;  if (source.match(/^(https?:\\/\\/|blob:|data:)/)) return source;  var tmp = \"" + gLoad.corsProxy + gLoad.gameDir + "\"+source; debugger; console.log(\"RETURNING: \"+tmp); return tmp; }" + updatedScript;
}
GameLoad.prototype.replaceScripts = function (scriptMatch, g1, scriptSrc) {
  var myUniqueId = "[" + scriptSrc + Math.random() + "@WILL_FILL_IN]";
  gLoad.requiredBeforeLoading.push(myUniqueId);
  console.log("Added S: " + myUniqueId + ": " + gLoad.requiredBeforeLoading.length);
  gLoad.loadPage(gLoad.corsProxy + gLoad.gameDir + scriptSrc,
    function (script) {
      console.log(script);
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
  gLoad.iframeContent = gLoad.iframeContent.replace(/(<script((?!>|src=)[\s\S])*>)(((?!<\/script>)[\s\S])+)(<\/script>)/g, gLoad.replaceDataInInlineScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/<script[^>]*src=('|")([^'"]+)('|")[^>]*>((?!<\/script>)[\s\S])*<\/script>/g, gLoad.replaceScripts);
  gLoad.iframeContent = gLoad.iframeContent.replace(/(<style((?!>|src=)[\s\S])*>)(((?!<\/style>)[\s\S])+)(<\/style>)/g, gLoad.replaceDataInInlineStyles);
  gLoad.iframeContent = gLoad.iframeContent.replace(/src="(?!https?:\/\/|data:|blob:)[^"]+"/g, gLoad.replaceSrcs);
  gLoad.iframeContent = gLoad.iframeContent.replace(/href="(?!https?:\/\/)[^"]+"/g, gLoad.replaceHrefs);
  gLoad.iframeContent = gLoad.iframeContent.replace(/manifest="(?!https?:\/\/)[^"]+"/g, gLoad.replaceManifests);
  //gLoad.iframeContent = gLoad.iframeContent.replace(/UnityLoader\.instantiate\(".+", ?".*"/g, gLoad.replaceUnityLoader);
}


var gLoad = new GameLoad();
gLoad.initialize();