
window.DEBUG = false;
window.BASE_URL = document.getElementsByTagName("base")[0].getAttribute("href");
if (BASE_URL[BASE_URL.length - 1] !== "/") BASE_URL += "/";

window.debug = function(what) {
    if (DEBUG) console.log(what);
}

var ajax = function() {
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
    if (window.ActiveXObject) {
        for (var i=0; i<activexmodes.length; i++){
            try{
                return new ActiveXObject(activexmodes[i]);
            } catch(e) {
                return false;
            }
        }
    } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else {
        return false;
    }
};

var __cache = {};
var res = function(link, callback) {
    if (__cache[link]) {
        callback(__cache[link]);
    }
    var req = utils.createAjaxRequest();
    req.open("GET", BASE_URL + link);
    req.onload = function() {
        if (req.status === 200) {
            __cache[link] = {
                html: req.responseText,
                xml: req.responseXML
            };
            callback(__cache[link]);
        } else {
            callback(null);
        }
    }
    req.send();
}

var link = function(item, limit) {
    if (!limit) {
        limit = 50;
    }
    return item.title.toLowerCase().replace(/[\/\!"'\(\)\[\]\{\}:;,\.]/g, "").replace(/[\ \_\-]/g, "_").substr(0, limit) + "_" + (new Date(item.pubDate)).getTime();
}

window.utils = {
    loadResource: res,
    loadTemplate: function(link, callback) {
        return res("templates/" + link, callback);
    },
    createAjaxRequest: ajax,
    generatePermalink: link,
};
