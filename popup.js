(function(undefined) {
    var bgPage = chrome.runtime.getBackgroundPage(function(bgPage) {
        var twitter = bgPage.getTwitterAPI();

        $("#login").click(function() {
            twitter.login();
        });

        $("#logout").click(function() {
            twitter.logout();
            location.reload();
        });

        $("#open_newurl").click(function() {
            twitter.openNewURLsOnPopup();        
        });  

        if (twitter.isAuthenticated()) {
    	    $("#login").css('display', 'none');
            $("#tweet-contents").show();
            var root = $("#tweet-contents");
            twitter.fetchFavorites(root);
        
        } else {
    	    $('#login').css('display', 'block');
            $('#header').hide();
            $('#tweet-contents').hide();
        }
    });
})();


$("#logo").click(function() {
    window.open("https:/twitter.com");
});

$("#option").click(function() {
    window.open("chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/options.html");
});

$("#refresh").click(function() {
    location.reload();
});

$('#search').click(function() {
    $('#search').hide();
    $('#back').show('fast');
    $('#tweets').css('display', 'none');
    $('#search-contents').show();
});

$('#back').click(function() {
    $('#back').hide();
    $('#search').show('fast');
    $('#search-contents').hide();
    $('#tweets').css('display', 'block');
});

jQuery(document).ready(
    function(){
        if (localStorage['auto_open'] === 'on'){
            $('#open_newurl').hide();
            $('#logo').css('margin-right', '275px');
        }
    }
);

