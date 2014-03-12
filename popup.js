(function(undefined) {
    var bgPage = chrome.extension.getBackgroundPage();
    var twitter = bgPage.getTwitterAPI();

    document.getElementById("login").onclick = function() {
        twitter.login();
    };

    document.getElementById("logo").onclick = function() {
        window.open("https:/twitter.com");
    };

    document.getElementById("logout").onclick = function() {
        twitter.logout();
        //location.reload();
    };

    document.getElementById("refresh").onclick = function() {
        location.reload();
    };

    document.getElementById("open_newurl").onclick = function() {
        twitter.openNewURLsOnPopup();        
    }
    
    document.getElementById("option").onclick = function() {
        window.open("chrome-extension://lfigaiipdofkibbekkhkdbkjhilfbcom/options.html");
    };

    if (twitter.isAuthenticated()) {
    	document.getElementById("login").style.display = "none";
    	document.getElementById("tweet-contents").style.display = "block";
        var root = document.querySelector("#tweet-contents");
        twitter.fetchFavorites(root);
        
    } else {
    	document.getElementById("login").style.display = "block";
        document.getElementById("header").style.display = "none";
        document.getElementById("tweet-contents").style.display = "none";
    }
})();
