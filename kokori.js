/* This is the big bag of javascript for kokori's website. 
 * Yeah, it's ugly, it's called "improvisation", something 
 * we're at Kokori are used to. */

/* ****************************************************************
 * js generic functions (should get their own class and js file...)
 * ****************************************************************/

// DEBUG = true will give you debugging messages to firebug. 
// If you don't use it, then this variable is useless to you until you change the "debug" function
DEBUG = false;

function debug(what) {
	if (DEBUG) console.log(what);
}

// Many browsers are simply silly. Let's try to workaround that...
function ajaxRequest() {
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];   //activeX versions to check for in IE

    // Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    if (window.ActiveXObject) { 
        for (var i=0; i<activexmodes.length; i++){
            try{
                return new ActiveXObject(activexmodes[i]);
            } catch(e) {
                // We should handle with the error appropriatelly
            }
        }
    } else if (window.XMLHttpRequest) { // if Mozilla, Safari etc
        return new XMLHttpRequest();
    } else {
        return false;
    }
}

// this function gets the path for the RSS, goes an AJAX call to get it, and
// then calls the processRSS function with the result
function loadRSS(path, elem, which) {
    var req = new ajaxRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4){
            if (req.status == 200){
                var xmldata = req.responseXML; //retrieve result as an XML object
                processRSS(xmldata, elem, which);
            } else {
                // TODO: deal with failures
            }
        }
    }

    try {
        req.open("GET", path, true);
        req.send(null);
    } catch (e) {
        // TODO 
    }

}

function parseXML(xml){
    var result=null;
    if (xml !== null){
        switch(xml.nodeType){
            case 3:
                if(!xml.nextSibling && !xml.previousSibling){
                    result = xml.nodeValue;
                }
                break;
            case 1:
                var a, b=0, att;
                var nodes = xml.childNodes;
                var len = nodes.length;
                result = [];
                for(a=0; a < len; a++){
                    var i = parseXML(nodes[a]);
                    if (i !== null) {
                        if(len <= 1){
                            result=i;
                        } else {
                            att = getAttribute(nodes[a],"id");
                            att = (att !== null ? att : b++);
                            result[att]=i;
                        }
                    }
                }
                break;
        }
    }
    return result;
}

function getAttribute(obj, elem) {
    if(typeof(obj)=="object"){
        return obj.getAttribute(elem);
    }
    return null;
}

// this function reads xml and turns it into a nice and sweet parsable object
function processRSS(result, elem, bypass) {
    result = parseXML(result.documentElement);
    var bypassed = 0;

	// VERY VERY UGLY HACK TO DEAL WITH THE FACT THAT IE UTTERLY *SUCKS*
	if(typeof(result[0]) != "object") result = [result];

    // UGLY way of finding out how many news there are, specially because 
    // we're going to cycle through result[0] again... TODO (fix this)
    var length = 0;
    for (var i in result[0]) { if (typeof(result[0][i]) == "object") { length++; } }

    for (var i in result[0]) {
        if (typeof(result[0][i]) == "object") {
            if (bypassed >= bypass) {
                return showRSS(result[0][i], elem, bypass, length-1); // length - 1 'cause we don't work with the first object...
            } else {
                bypassed++;
            }
        }
    }
    return false;
}

// this just displays the processed RSS
function showRSS(what, where, which, total) {
    // what[0] is title
    // what[1] is content
    // what[2] is link
    // what[3] is timestmp
    
    //var html = "Title: " + what[0] + "<br/>Date: " + what[4] + "<p/>"+what[3];
    var html = "<p/><a href='"+what[2]+"'>"+what[0]+"</a><p/>"+what[1]+"<p/><div class='timestamp'>"+what[3]+"</div>";

    debug("showRSS: which is " + which + ", while total is " + total);
    var prev = which-1;
    var next = which+1;
    if (which > 1) html += "<div class='link' style='float:left;' onmousedown='news("+ prev +")'>&lt; recent</div>";
    if (which < total) html += "<div class='link' style='float:right;' onmousedown='news("+ next +")'>older &gt;</div>";
    document.getElementById(where).innerHTML=html;
}



// DOM manipulation
function setElementContent(elem, html) {
	debug("elem is " + elem);
    var e = document.getElementById(elem);
	debug(e);
    if (e && e.innerHTML !== undefined) {
        // replace null and undefined values for empty strings
        html = html === null ? "" : html;
        html = String(html);
        html = html.replace(/>null</g, '><');
        html = html.replace(/>undefined</g, '><');

        e.innerHTML = html;
		debug("just did an innerHTML, don't you see?");
        return true;
    } else {
		debug("oops");
        return false;
    }
}

/* ****************************************************************
 * site-specific functions (only these should be in this file...)
 * ****************************************************************/

// initialize website
function init() {
	container();
	sidebar();
}

// change what's displayed on container
function container(section) {
	if (section == undefined) section = "news";
	return setElementContent("container", getSection(section));	
}

function about() {
	return "<p/>Kokori is a Portuguese Post-CyberPunk Industrial project created in 2009 by the members of <a href='http://merankorii.grogue.org'>Merankorii</a> and <a href='http://pluskopluskoplus.grogue.org'>+ko+ko+</a>.<p/>They don't aim to conquer the world or any such nonsense, only to be the best band you've ever heard.<div align='center' style='font-size:8pt;color:#666666;'>picture taken by cisg (c) 2013<img src='DSC_0781_edit-600.jpg' alt='Kokori picture'/>";
}

function discog() {
	// var html = "<img style='float:right;padding:1em;width:40%;overflow:hidden;' src='http://farm2.staticflickr.com/1297/4703233977_678622feee_m.jpg' alt='Kokori - init()'/>";
	var html = "<div style='float:right;padding:1em;overflow:hidden;'>";
	html += "<img width='130px' src='http://farm2.staticflickr.com/1297/4703233977_678622feee_m.jpg' alt='Kokori - init()'/><br/>";
	html += "<img width='130px' src='http://userserve-ak.last.fm/serve/_/91291027/make+install+00_kokori__make_install.png' alt='Kokori - make install'/><br/>";
	html += "<img width='130px' src='http://newapproachrecords.files.wordpress.com/2012/02/capa.jpg?w=130&h=130' alt='Kokori - Release Candid Hate'/><br/>";
	html += "<img width='130px' src='http://f1.bcbits.com/img/a3272876761_7.jpg' alt='Kokori - Desert Moon / First Egg'/>";
	html += "</div>";
	html += "<p/>";
	
	// html += "<h4>Singles & EPs</h4>";
	html += "2010 was the year for Kokori's first release, the EP \"init()\", which is now sold-out.";
	html += "<p/>";
	// html += "<h4>Appearences</h4>";
	html += "After init(), we've been working on new material, participating in more than 30 compilations.";
	html += "<p/>";
	html += "In July 2013 that material took form of a new digital-only EP, \"make install\", which you can <a href=\"http://freemusicarchive.org/music/kokori/make_install/\">download for free</A>.<br/>This EP sums up an era, while installing the roots of great things to come...";
	html += "<p/>";
	html += "...and the instalation was fruitful, many bugs were fixed and the band was now ready for a \"Release Candid Hate\". This new EP, released in August 2013, marks the first time kokori does an heavy bet on vocals and lyrics, and is released in vinyl, with a two discs special edition for those who want all the bits.";
	html += "<p/>";
	html += "In 2014 kokori released a single, \"Desert Moon / First Egg\", in a limited edition 7\" vinyl that soon sold out. But they're far from done yet, and are preparing more material for a release to come..."
	html += "<p/>";
	// html += "<h4>Other</h4>";
	html += "You can see kokori's complete discography <a href='http://www.discogs.com/artist/Kokori'>here</a>.";

	return html;
}

function events() {
	return "<p/>Kokori's future will bring us many challenges, and we'll have news for you. At this time, we don't have any concerts planned - if you want to book us use the 'Contact' section of this website.<p/>In the meantime, you can allways check if either of us have anything up on our calendar, playing on our solo projects. Check for <a href='http://merankorii.grogue.org'>Merankorii</a> or for <a href='http://pluskopluskoplus.grogue.org'>+ko+ko+</a>.";
}

function contact() {
	return "<p/><ul><li>Join our list of friends, a low-volume mailing list. Ask to be part of it by sending us an e-mail!</li><li>e-mail us to <tt>kokori (at) grogue.org</tt></li><ul>";
}

function shop() {
	var html = "<p/>";

	html += "<h3>Main Discography</h3><ul>";
	html += "<li>init() - EP - 2010/06 - sold out</li>";
	html += "<li>make install - EP - 2013/07 - <a href=\"http://freemusicarchive.org/music/kokori/make_install/\">free download</a></li>";
	html += "<li>Release Candid Hate - EP - 2013/08:";
	html += "<ul><li>special edition: 7\" + 5\" vinyl + download, 4 tracks: <a href='http://newapproachrecords.wordpress.com/kokori-release-candid-hate-7/'>12€</a></li><li>standard edition: 7\" vinyl + download: <a href='http://newapproachrecords.tictail.com/product/kokori-release-candid-hate'>7€</a></li></ul></li>";
	html += "<li>Desert Moon / First Egg - Single - 2014/10 - sold out</li>";
	html += "</ul>";

	html += "<h3>Selected Compilations</h3><ul>";
	html += "<li>Basic Imprint - digital only - 2010 - <a href=\"http://archive.org/details/V.a.BasicImprintkopp.13\">free download</a></li>";
	html += "<li>Now That's What I Call Retro-Futurism Vol. 1 - Floppy - 2010 - sold out</li>";
	html += "<li>Necktar + Necktar 2017 - DVD - 2011 - sold out</li>";
	html += "<li>Icaro I: First Compilation - 3CD - 2011 - sold out</li>";
	html += "<li>Bearded Snails - 3CD - 2012 - <a href=\"http://abeardofsnails.storenvy.com/products/5204081-v-a-bearded-snails-3x-3\">available on label's shop</a></li>";
	html += "</ul>";

	html += "<h3>Mixtapes</h3><ul>";
	html += "<li>99 Anonymous Mixtape 4 - digital only - 2012 - <a href=\"http://archive.org/details/enrmix15_99_anonymous_mixtape_4\">free download</a></li>";
	html += "</ul>";

	//html += "<h3>Side-Projects</h3><ul>";
	//html += "<li>+ko+ko+ - A Path To Nowhere - CD - 2011 (mastered by Merankorii) - <a href='http://www.discogs.com/buy/CD/koko-A-Path-To-Nowhere/49373296?ev=bp_titl'>10€</a></li>"
	html += "</ul>";

	return html;
}

// get the HTML corresponding to a certain section
function getSection(section) {
	var html = "";

    switch (section) {
        case "news":
            html = news(1);
            break;
		case "about":
			html = about();
			break;
		case "discog":
			html = discog();
			break;
		case "events":
			html = events();
			break;
		case "contact":
			html = contact();
			break;
		case "shop":
			html = shop();
			break;
        default:
        	// TODO - add the rest of the cases. In the meantime...
        	var randomnumber=Math.floor(Math.random()*700);
        	var lorem = "<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>";
    	    html = lorem.substring(0,randomnumber);
    	    html += lorem;
            break;
    }
	return html;
}

// populate the sidebar
function sidebar() {
	var html = "";

    // media stuff
    html += media();

	// // separator
	// html += separator();

	// // shop widget
	// html += shopwidget();

	// flickr stuff, since we don't have any video yet (we should do one)
	// html += flickr();

	setElementContent("sidebar", html);
}

// a simple div with 10px
function separator() {
	return "<div style='height:10px'>&nbsp;</div>";
}

function shopwidget() {
	//return "<a href=\"http://freemusicarchive.org/music/kokori/make_install/\"><img style='width:80%;' src='http://userserve-ak.last.fm/serve/_/91291027/make+install+00_kokori__make_install.png' alt='Kokori - make install'/></a>";
	return "<div style='padding-left:25px;'><img style='width:70%;' src='http://newapproachrecords.files.wordpress.com/2012/02/capa.jpg?w=300&h=300' alt='Kokori - Release Candid Hate'/><br/><a href='http://newapproachrecords.wordpress.com/vinyl/'>--special=[12 €]</a> || <a href='http://newapproachrecords.tictail.com/product/kokori-release-candid-hate'>--standard=[7 €]</a></div>";
}

// we're basically calling an iframe with the thingie. I should fix this (TODO) and use their API and build a propper widget since there isn't one *gasp*...
function flickr() {
	return "<div style='top:1%; height:70%; position:relative;'><iframe id='flickr' name='flickr' src='flickr.html' width='100%' height='100%' scrolling='no' frameborder='0'></iframe></div>";
}

function media() {
	// bandcamp (note, this is *still* flash-only)
	return bandcamp();
	// we can choose what we want to be highlightning
	// return youtube();
	// return archiveorg();	
	// return fma();
	// soundcloud
    // return soundcloud();
}

function youtube() {
	// Ashcending, in the context of Noori Records' uploads playlist
	return "<iframe width='340' src='//www.youtube.com/embed/_ggGrQOiqN8?rel=0' frameborder='0' allowfullscreen></iframe>";
}

function archiveorg() {
	return "<iframe src=\"http://archive.org/embed/enrmp325_kokori_-_make_install&playlist=1\" width=\"300\" frameborder=\"0\" webkitallowfullscreen=\"true\" mozallowfullscreen=\"true\" allowfullscreen></iframe>";
	// return "<iframe src=\"http://archive.org/embed/enrmp325_kokori_-_make_install\" width=\"500\" height=\"30\" frameborder=\"0\" webkitallowfullscreen=\"true\" mozallowfullscreen=\"true\" allowfullscreen></iframe>";
}

function fma() {
	return "<object width=\"300\" height=\"280\"><param name=\"movie\" value=\"http://freemusicarchive.org/swf/playlistplayer.swf\"/><param name=\"flashvars\" value=\"playlist=http://freemusicarchive.org/services/playlists/embed/album/14620.xml\"/><param name=\"allowscriptaccess\" value=\"sameDomain\"/><embed type=\"application/x-shockwave-flash\" src=\"http://freemusicarchive.org/swf/playlistplayer.swf\" width=\"300\" height=\"280\" flashvars=\"playlist=http://freemusicarchive.org/services/playlists/embed/album/14620.xml\" allowscriptaccess=\"sameDomain\" /></object>";
}

function bandcamp() {
	return "<iframe style='border: 0; width: 350px; height: 522px;' src='http://bandcamp.com/EmbeddedPlayer/album=1827714063/size=large/bgcol=333333/linkcol=0f91ff/transparent=true/' seamless><a href='http://abeardofsnails.bandcamp.com/album/desert-moon-first-egg'>Desert Moon / First Egg by Kokori</a></iframe>";

	// return "<div style='position:relative;'><iframe id='bandcamp' name='bandcamp' width='300' height='100' style='position: relative; display: block; width: 300px; height: 100px;' src='http://bandcamp.com/EmbeddedPlayer/v=2/track=522663729/size=grande/bgcol=000000/linkcol=fa0000/' allowtransparency='true' frameborder='0'><a href='http://daidalosrec.bandcamp.com/track/inbrase'>Inbrase by Kokori</a></iframe></div>";

	// return "<iframe width='300' height='100' style='position: relative; display: block; width: 300px; height: 100px;' src='http://bandcamp.com/EmbeddedPlayer/v=2/track=4149719915/size=grande/bgcol=FFFFFF/linkcol=4285BB/' allowtransparency='true' frameborder='0'><a href='http://the20th.bandcamp.com/track/apert'>Apert by kokori</a></iframe>";
}

function soundcloud() {
		// Mortal Kombat
		return "<div style='height:80px;'><span>Mortal Kombat, a parody track made on a <a href='http://cabinetpin.com/20th/'>20th</a>. <a href='http://soundcloud.com/kokoript/terror-attack/download'>Download</a></span><object height='100%' width='100%'> <param name='movie' value='http://player.soundcloud.com/player.swf?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F9405883'></param> <param name='allowscriptaccess' value='always'></param> <embed allowscriptaccess='always' height='81' src='http://player.soundcloud.com/player.swf?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F9405883' type='application/x-shockwave-flash' width='100%'></embed></div>";
}

// we must have a news.rss, and this function is basicly an rss reader, reading that rss...
function news(which) {
    debug("news: which is " + which);
	setTimeout("loadRSS('news.rss','news-rss',"+which+")",10); // IE is a friggin piece of shite. I should rewrite this.
    return "<div id='news-rss'></div>";
}
