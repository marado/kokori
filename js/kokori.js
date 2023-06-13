// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

var cache = null;
function loadRSS(path, callback) {
	if (cache) {
		callback(cache);
	}
	utils.loadResource(path, function(res) {
		if (!res.xml && res.html) {
			var parser = new DOMParser();
			res.xml = parser.parseFromString(res.html, "application/xml");
		}
		processRSS(res.xml, function(data) {
			cache = data;
			callback(cache);
		});
	});
}

function processRSSInformationNode(node, name) {
	try {
		return node.querySelector(name).textContent.trim();
	} catch (e) {
		return null;
	}
}

function processRSSNode(node) {
	return {
		title: processRSSInformationNode(node, "title"),
		description: processRSSInformationNode(node, "description"),
		pubDate: processRSSInformationNode(node, "pubDate"),
		link: processRSSInformationNode(node, "link"),
	}
}

// this function reads xml and turns it into a nice and sweet parsable object
function processRSS(result, callback) {
	var data = {
		list: Array.prototype.slice.apply(result.documentElement.querySelectorAll("item")).map(processRSSNode),
		permalinks: [],
		map: {},
	};
	data.list.forEach(function(item, index) {
		var permalink = utils.generatePermalink(item);
		data.permalinks[index] = permalink;
		data.map[permalink] = item;
		data.map[permalink].permalink = permalink;
	});
	callback(data);
}

APP_SECTIONS = [
	"news",
	"about",
	"discography",
	"events",
	"shop",
	"contact"
];

STATIC_SECTIONS = [
	"about",
	"discography",
	"events",
	"shop",
	"contact",
	"404"
];

mainContentElement = document.getElementById("maincontent");

// initialize website
function init() {
	loadContent();
	loadSidebar();
}

function normalizeSection(section) {
	var path = (section || window.location.pathname).replace(new RegExp("^" + BASE_URL), "").split("/");
	var link = "";
	if (path[0] !== "") path.unshift("");
	var _section = _section || path.splice(1, 1)[0] || "news";
	link = path.join("/");
	link = BASE_URL + _section + link;
	if (APP_SECTIONS.indexOf(_section) < 0) _section = "404";
	return {
		section: _section,
		link: link,
	}
}

function trigger404() {
	utils.loadTemplate("404.html", function(data) {
		mainContentElement.innerHTML = data.html;
	});
}

// change what's displayed on container
function loadContent(section) {
	var data = normalizeSection(section);
	console.log("REDIRECT", data);
	if (window.history) {
		window.history.pushState({}, data.section, data.link);
	}
	if (STATIC_SECTIONS.indexOf(data.section) >= 0) {
		utils.loadTemplate(data.section + ".html", function(data) {
			mainContentElement.innerHTML = data.html;
		})
	} else {
		if (data.section === "news") {
			handleRSSRequest(data.link, function(data) {
				mainContentElement.innerHTML = data.html;
			});
		} else {
			trigger404();
		}
	}
}

function loadSidebar() {
	// var template = "bandcamp.html";
	// var template = "youtube.html";
	var template = "shop-sidebar.html";
	utils.loadTemplate(template, function(data) {
		document.getElementById("sidebar").innerHTML = data.html;
	});
}

function handleRSSRequest(link, callback) {
	var post = link.replace(new RegExp("^" + BASE_URL), "").split("/")[1];
	loadRSS("news.rss", function(data) {
		if (!post) {
			utils.loadTemplate("list.hbs", function(res) {
				mainContentElement.innerHTML = Handlebars.compile(res.html)({items: data.map});
			});
		} else {
			var index = data.permalinks.indexOf(post);
			if (index < 0) {
				trigger404();
			} else {
				var previousPermalink = (index > 0) && data.permalinks[index - 1] || null;
				var nextPermalink = (index < data.permalinks.length - 1) && data.permalinks[index + 1] || null;
				utils.loadTemplate("item.hbs", function(res) {
					mainContentElement.innerHTML = Handlebars.compile(res.html)({
						item: data.map[post],
						previous: previousPermalink,
						next: nextPermalink,
					})
				});
			}
		}
	});
	callback({html: "... working on it"});
}

// @license-end
