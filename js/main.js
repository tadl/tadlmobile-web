var ILSCATCHER_HOST = 'tadl-ilscatcher.herokuapp.com'
var ILSCATCHER_BASE = 'https://' + ILSCATCHER_HOST
var ILSCATCHER_INSECURE_BASE = 'https://' + ILSCATCHER_HOST /* we will actually use https here also */
var FEATURED_URL = 'https://www.tadl.org/mobile/export/items/json/featured'
var EVENTS_URL = 'https://www.tadl.org/mobile/export/events/json/all'
var LOCATIONS_BASE = 'https://www.tadl.org/mobile/export/locations'
var PLACEHOLDER_IMG = 'img/clocktower100.png';
var FACEBOOK_URL = 'https://graph.facebook.com/TraverseAreaDistrictLibrary/feed?access_token=CAAFh5Quq0YMBAENgjPYY9MY0y3cdiAMvXmLl6Fq3H4LDZBBZBukKlXFwWPq0xMLa6hqDrfxfGqvFpBlIZCjFKg0rKdd37qHLsjwcBve4UeZAQymPksV7ddAeZAJOyaeZC05WqlLzrVpOUQEtjiCZArjB6NMUHjvU90qXZAGEOESKDgZDZD';
var loadingmoreText = '<span class="loadmore"><img style="margin-right: 10px; margin-left: 10px;" src="img/ajax-loader-2.gif">LOADING...</span>';
var loadmoreText = '<a class="loadmore button" onclick="loadmore();">LOAD MORE RESULTS</a>';
var psTitle = "TADL Mobile | ";
var searchquery = {};
var pagecount = {};
var mediatype = {};
var available = {};

$(document).ready(function() {
    router.perform();
    $('#term').keydown(function(event) {
        if (event.keyCode == 13) {
            getResults();
        }
    });
    $('#login_form').keydown(function(event) {
        if (event.keyCode == 13) {
            login();
        }
    });
    if (localStorage.getItem('username')) {
        login();
    }
    $('#search').click(getResults);
});

function loadmore() {
    pagecount++;
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    $('#loadmoretext').trigger("create");
    $.get(ILSCATCHER_INSECURE_BASE + "/main/searchjson.json?utf8=%E2%9C%93&q=" + searchquery + "&mt=" + mediatype + "&p=" + pagecount +"&avail=" + available, function(data) {
        var results = data.message
        if (results != "no results") {
            var template = Handlebars.compile($('#results-template').html());
            var info = template(data);
            $('#results').append(info).promise().done(function() {
                $('#loadmoretext').empty().append(loadmoreText);
                $('#loadmoretext').trigger("create");
                $("#login_form").slideUp("fast");
            })
        } else {
            $('#loadmoretext').html("No Further Results");
        }
    });
}

function getResults() {
        $("#login_form").slideUp("fast");
        $('#results').empty().trigger("create");
        $('.load_more').show();
        $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
        pagecount = 0;
        searchquery = $('#term').val();
        mediatype = $('#mediatype').val();
        if (document.getElementById('available').checked) {
            available = true;
        } else {
            available = false;
        }
        var newstate = 'search/'+searchquery+'/'+mediatype+'/'+available; 
        History.pushState({action: showcheckouts}, psTitle + "Search", newstate); 
        $.getJSON(ILSCATCHER_INSECURE_BASE + "/main/searchjson.json?utf8=%E2%9C%93&q=" + searchquery + "&mt=" + mediatype +"&avail=" + available, function(data) {
            var results = data.message
            if (results != "no results") {
                var template = Handlebars.compile($('#results-template').html());
                var info = template(data);
                $('#results').html(info);
                $('#loadmoretext').empty().append(loadmoreText);
                $('#loadmoretext').trigger("create");
            } else {
                $('#results').html("No Results");
                 $('.load_more').hide();
            }
        });
    }

function logged_in() {
    var username = localStorage.getItem('username');
    if (username) {
        return true;
    } else {
        return false;
    }
}

function logout() {
    localStorage.clear();
    $('#results').html("");
    location.reload();
}

function showmore(record_id) {
    var record_id = record_id;
    var e = document.getElementById(record_id);
    if (e.style.display === 'none') {
        if( !$.trim( $('#'+ record_id).html() ).length ) {
            $('#'+ record_id +'-loading').html(loadingmoreText).trigger("create");
            $.getJSON(ILSCATCHER_INSECURE_BASE + "/main/itemdetails.json?utf8=%E2%9C%93&record_id=" + record_id, function(data) {
                var results = data.message;
                var template = Handlebars.compile($('#more_details-template').html());
                var info = template(data);
                $('#'+ record_id).html(info).promise().done(function() {  $('#'+ record_id +'-loading').empty();});
                $('#'+ record_id).css('display', 'block');
                $('#showmore-' + record_id).css('display', 'none');
            });
        } else {
            $('#'+ record_id).css('display', 'block');
        }
    } else {
        $('#'+ record_id).css('display', 'none');
    }
}

function showfeatured() {
    $("#login_form").slideUp("fast");
    $('#results').html('<div class="image_carousel"><div id="featured"></div><div class="clearfix"></div></div>');
    History.pushState({action: showfeatured}, psTitle + "Featured Items", "featured");
    $('.load_more').show();
    $('.image_carousel').hide();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    $.getJSON(FEATURED_URL, function(data) {
        var template = Handlebars.compile($('#featured-template').html());
        var info = template(data);
        $('#featured').html(info);
        $('#featured').imagesLoaded().done( function( instance ) { 
            $('.load_more').hide();
            $('.image_carousel').show();
        });
    });
}

function viewitem(record_id) {
    $("#login_form").slideUp("fast");
    $('#results').empty().trigger("create");
    History.pushState({action: viewitem}, psTitle + "Item " + record_id, "item/" + record_id);
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    var record_id = record_id;
    $.getJSON(ILSCATCHER_INSECURE_BASE + "/main/itemdetails.json?utf8=%E2%9C%93&record_id=" + record_id, function(data) {
        var results = data.message;
        var template = Handlebars.compile($('#result-details-template').html());
        var info = template(data);
        $('#results').html(info).promise().done(function() {  $('#loadmoretext').empty();});
        $('#'+ record_id).css('display', 'block');
    });
}

function unhide(eventId) {
    var eventId = eventId;
    var e = document.getElementById(eventId);
    if (e.style.display === 'none') {
        $('#' + eventId).css('display', 'block');
        $('#more' + eventId).css('display', 'none');
    } else {
        $('#' + eventId).css('display', 'none');
        $('#more' + eventId).css('display', 'block');
    }
}

function showshelf(record_id) {
    var record_id = record_id;
    var e = document.getElementById(record_id +'shelf');
    if (e.style.display === 'none') {
        if( !$.trim( $('#'+ record_id +'shelf').html() ).length ) {
            $('#'+ record_id +'-loading').html(loadingmoreText).trigger("create");
            $.getJSON(ILSCATCHER_INSECURE_BASE + "/main/itemonshelf.json?utf8=%E2%9C%93&record_id=" + record_id, function(data) {
                var results = data.message;
                var template = Handlebars.compile($('#shelf-template').html());
                var info = template(data);
                $('#'+ record_id +'shelf').html(info).promise().done(function() {  $('#'+ record_id +'-loading').empty();});
                $('#'+ record_id +'shelf').css('display', 'block');
            });
        } else {
            $('#'+ record_id +'shelf').css('display', 'block');
        }
    } else {
        $('#'+ record_id +'shelf').css('display', 'none');
    }
}

function pre_hold(record_id) {
    var record_id = record_id;
    link_id = '#place_hold_' + record_id;
    if (logged_in()) {
        $(link_id).html('Requesting hold...');
        $(link_id).css('color', 'green');
        hold(record_id);
    } else {
        $(link_id).html('Log in to place hold');
        $(link_id).addClass('hold_login_first');
        $("#login_form").slideDown("fast");
    }
}

function reset_hold_links() {
    $(".hold_login_first").each(function() {
        $(this).removeClass('hold_login_first');
        $(this).html('Place Hold');
    });
}

function hold(record_id) {
    var record_id = record_id;
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    $.getJSON(ILSCATCHER_BASE + '/main/hold.json?u='+ username +'&pw=' + password + '&record_id=' + record_id, function(data) {
        var message = data[':message'];
        var success = false;
        var button_id = '#place_hold_' + record_id;

        if (message == 'Hold was successfully placed') {
            success = true;
        }

        if (message) {
            $(button_id).html(message);
        } else {
            $(button_id).html('Unable to place hold.');
        }

        $(button_id).css('color', (success) ? 'green' : 'red');

    });
    window.setTimeout(partB,5000);
}

function partB() {
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    $.getJSON(ILSCATCHER_BASE + '/main/login.json?u='+ username +'&pw=' + password, function(data) {
        var template = Handlebars.compile($('#logedin-template').html());
        var info = template(data);
        $('#login_form').html(info);
    });
}

function openForm() {
    if ($("#login_form").is(":hidden")) {
        $("#login_form").slideDown("fast");
        login();
    } else {
        $("#login_form").slideUp("fast");
        
    }
}

function login() {
    if (localStorage.getItem('username')) {
        username = localStorage.getItem('username');
        password = localStorage.getItem('password');
    } else {
        username = $('#username').val();
        password = $('#pword').val();
    }
    if (typeof(username) !== 'undefined' && username != '' && typeof(password) !== 'undefined' && password != '') { /* only attempt login if we have a username and password */
        $.getJSON(ILSCATCHER_BASE + '/main/login.json?u='+ username +'&pw=' + password, function(data) {
            if (data['status'] == 'error') { /* unsuccessful login */
                $('#username').val('');
                $('#pword').val('');
                $('#login_msg').html('Error logging in.');
                localStorage.clear();
            } else { /* login appears successful */
                var template = Handlebars.compile($('#logedin-template').html());
                var info = template(data);
                $('#login_form').html(info);
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                reset_hold_links(); /* change any 'Please log in first' hold links */
            }
        });
    }
}

function showcheckouts() {
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showcheckouts}, psTitle + "Checked-Out Items", "checkout");  
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password'); 
    $.getJSON(ILSCATCHER_BASE + '/main/showcheckouts.json?u='+ username +'&pw=' + password, function(data) {
        var template = Handlebars.compile($('#showcheckedout-template').html());
        var info = template(data);
        $('#results').html(info);
        $('.load_more').hide();
    });
}

function pre_cancelhold(element, hold_id) {
    var element = element;
    var hold_id = hold_id;
    var confirm_text = 'Tap to Cancel Hold';
    var canceling_text = 'Canceling hold...';
    $(element).css('color', 'red');
    $(element).html(confirm_text);
    $(element).prop("onclick", null); /* remove existing onclick */
    $(element).on("click", function(event) {$(this).off('click'); $(this).html(canceling_text); cancelhold(hold_id);});
}

function cancelhold(hold_id) {
    var hold_id = hold_id;
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    $.getJSON(ILSCATCHER_BASE + '/main/cancelhold.json?u='+ username +'&pw=' + password + '&hold_id=' + hold_id, function(data) {
        $('#hold_' + hold_id).remove();
    });
}

function showholds() {
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showholds}, psTitle + "Holds", "holds"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password'); 
    $.getJSON(ILSCATCHER_BASE + '/main/showholds.json?u='+ username +'&pw=' + password, function(data) {
        var template = Handlebars.compile($('#showholds-template').html());
        var info = template(data);
       $('#results').show();
       $('#results').html(info);
        $('.load_more').hide(); 
    });
}

function showpickups() {
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showpickups}, psTitle + "Items Ready for Pickup", "pickup"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");   
    var username = localStorage.getItem('username');
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password'); 
    $.getJSON(ILSCATCHER_BASE + '/main/showpickups.json?u='+ username +'&pw=' + password, function(data) {
        var template = Handlebars.compile($('#showholds-template').html());
        var info = template(data);
       $('#results').html(info);
        $('.load_more').hide(); 
    });
}

function renew(element, circulation_id, barcode) {
    var element = element;
    var circ_id = circulation_id;
    var bc = barcode;
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    $(element).css('color','red');
    $(element).html('Renewing...');
    $.getJSON(ILSCATCHER_BASE + '/main/renew.json?u='+ username +'&pw=' + password + '&circ_id=' + circ_id + '&bc=' + bc, function(data) {
        var template = Handlebars.compile($('#renew-template').html());
        var info = template(data);
        $('#'+ bc +'').html(info);
    });
}

function getsearch(query, mt, avail) {
    var query = query;
    var avail = avail;
    var mt = mt;
    $("#mediatype").val(decodeURIComponent(mt));
    $("#term").val(decodeURIComponent(query));
    if (avail == 'true') {
        $("#available").each(function(){ this.checked = true; });
    } else {
        $("#available").each(function(){ this.checked = false; });
    }
    getResults();
}

function showcard() {
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showcard}, psTitle + "Mobile Library Card", "card"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password'); 
    $.getJSON(ILSCATCHER_BASE + '/main/showcard.json?u='+ username +'&pw=' + password, function(data) {
        var card = data.barcode;
        $('.load_more').hide();
        $('#results').empty().append('<div class="shadow result"><div id="barcodepage"><div class="barcode"><div id="bcTarget"></div></div><div class="barcodelogo"><div class="bclogoTarget"><img src="img/clean-logo-header.png" alt="" /></div></div><div class="clearfix"></div></div></div>');
        $('#results').trigger("create"); 
        $("#bcTarget").barcode(card, "code128", {barWidth:2, barHeight:80, fontSize:12}); 
    });
}

function showevents() { 
     $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showevents}, psTitle + "Upcoming Events", "events"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    $.getJSON(EVENTS_URL, function(data) {
        var template = Handlebars.compile($('#showevents-template').html());
        var info = template(data);
        $('.load_more').hide();
        $('#results').html(info);
    });
}

function showlocations() { 
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: showlocations}, psTitle + "Library Locations", "locations"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    $.getJSON(LOCATIONS_BASE + "/all", function(data) {
        var template = Handlebars.compile($('#showlocations-template').html());
        var info = template(data);
        $('.load_more').hide();
        $('#results').html(info);
    });
}

function showmain() {
    $("#login_form").slideUp("fast");
    $('#results').html('<div id="mainpage"><div class="mainlogo"><img class="homelogo" src="img/clean-logo-header.png" alt="" /></div><div class="mainlinks"></div><div class="clearfix"></div></div>');
    History.pushState({action: showmain}, psTitle + "Search and Explore", "");
    $('.mainlinks').load('menu.html');
}

function facebookfeed() { 
    $("#login_form").slideUp("fast");
    $('#results').html("");
    History.pushState({action: facebookfeed}, psTitle + "Facebook Feed", "facebook"); 
    $('.load_more').show();
    $('#loadmoretext').empty().append(loadingmoreText).trigger("create");
    $.getJSON(FACEBOOK_URL, function(data) {
        var template = Handlebars.compile($('#facebookfeed-template').html());
        var info = template(data);
        $('.load_more').hide();
        $('#results').html(info);
        $('.linkable').doLinks();
        $(".shortDateFormat").each(function (idx, elem) {
            if ($(elem).is(":input")) {
                $(elem).val($.format.date($(elem).val(), 'MM/dd/yyyy'));
            } else {
                $(elem).text($.format.date($(elem).text(), 'MM/dd/yyyy'));
            }
        });
    });
}

function linkify(inputText, options) {
    this.options = {linkClass: 'url', targetBlank: true};
    this.options = $.extend(this.options, options);
    inputText = inputText.replace(/\u200B/g, "");

    var replacePattern1 = /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï]*[-A-Z0-9+&@#\/%=~_|ï]/gim;
    var replacedText = inputText.replace(replacePattern1, function($0,$1){ return $1?$0:'<br/><a class="'+ this.options.linkClass + '" href="' + $0 + '?nomobi=true"' + (this.options.targetBlank?'target="_blank"':'') + '>'+ $0.trunc(32) + '</a>';});

    var replacePattern2 = /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï]*[-A-Z0-9+&@#\/%=~_|ï]/gim;
    var replacedText = replacedText.replace(replacePattern2, function($0,$1){ return $1?$0:'<br/><a class="'+ this.options.linkClass + '" href="http://' + $0 + '?nomobi=true"' + (this.options.targetBlank?'target="_blank"':'') + '>'+ $0.trunc(32) + '</a>';});

    return replacedText;
}

$.fn.doLinks = function(){
    this.each(function(){
        $(this).html(linkify($(this).html()));
    });
}

String.prototype.trunc = 
    function(n){
        return this.substr(0,n-1)+(this.length>n?'&hellip;':'');
    };

function img_check(img) {
    var img = img;
    if ($(img).width() == 1) {
        img_error(img);
    }
}

function img_error(img) {
    var img = img;
    $(img).attr('src', PLACEHOLDER_IMG);
}

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }
    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('make_https', function(url, options) {
    var url = url;
    var https_url = url.replace(/^http:/, 'https:');
    return https_url;
});

