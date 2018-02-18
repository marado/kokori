// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

var _loadScript = function(link, callback) {
    var script = document.createElement("script");
    script.src = link;
    if (callback) {
        script.addEventListener("load", callback);
    }
    document.head.appendChild(script);
};

_loadScript("js/handlebars-v4.0.5.js", function() {
    _loadScript("js/utils.js", function() {
        utils.loadTemplate("basebody.html", function(response) {
            document.getElementById("app").innerHTML = response.html;
            _loadScript("js/kokori.js", function() {
                init();
            });
        });
    });
});

// @license-end
