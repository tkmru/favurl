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

        $('#search').click(function() {
            var userID = $("#userID").val();
            if (userID !== '' && userID !== '--- Please put target user ID. ---') {
                $("#search-contents").css('margin', '0px');
                
                twitter.fetchFavorites($("#search-contents"), userID);
                $('#userID').hide();
                $('#search').hide();
            } else {
                $('#userID').css('color', 'red');
                $('#userID').val('--- Please put target user ID. ---');
            }
        });

        if (twitter.isAuthenticated()) {
    	    $("#login").css('display', 'none');
            $("#tweet-contents").show();
            twitter.fetchFavorites($("#tweet-contents"));
        
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

$('#toSearch').click(function() {
    $('#toSearch').hide();
    $('#back').show('fast');
    $('#tweet-contents > .tweets').css('display', 'none');
    if ($('#tweet-contents > .error').size() === 0) { //not diplay  error
        $('#search-contents').show();
    }
});

$('#back').click(function() {
    $('#back').hide();
    $('#toSearch').show('fast');
    $('#userID').show();
    $('#search').show();
    $('#search-contents').hide();
    $('#search-contents > .tweets').remove();
    $('#search-contents > .error').remove();
    $('#tweet-contents > .tweets').css('display', 'block');
    $('#search-contents').css('margin', '10px 5px');
});

$('#toSoundOFF').click(function(){
    localStorage['sound'] = 'off';
    $('#toSoundOFF').hide();
    $('#toSoundON').show('fast');
});

$('#toSoundON').click(function(){
    localStorage['sound'] = 'on';
    $('#toSoundON').hide();
    $('#toSoundOFF').show('fast');
});


document.getElementById('userID').onmouseover = function(){
    document.getElementById('userID').focus();
}

document.getElementById('userID').onfocus = function(){
    document.getElementById('userID').style.color = '#000';
    document.getElementById('userID').value = "";    
}

jQuery(document).ready(
    function(){
        if (localStorage['auto_open'] === 'on'){
            $('#open_newurl').hide();
            $('#logo').css('margin-right', '248px');
        }

        if (localStorage['sound'] !== 'off'){
            localStorage['sound'] = 'on';
            $('#toSoundON').hide();
            $('#toSoundOFF').show();
        } else {
            $('#toSoundOFF').hide();
            $('#toSoundON').show();
        }

    }
);

