var api = null;

// This function is called by popup.js
function getTwitterAPI() {
    if (api === null) { // run for the first time.
        api = new Twitter();
    }

    return api;
}


// This function receive request content_script.js send.
chrome.extension.onRequest.addListener(function(req, sender, res) {
	getTwitterAPI().sign(req.verifier, res);
});

chrome.runtime.onStartup.addListener(function() {
    // execute only when chrome start
    if (getTwitterAPI().isAuthenticated) {
        if (localStorage["auto_open"] !== "off") {
            //console.log("on");
            getTwitterAPI().openNewURLsOnStart();
        } else {
            //console.log("off");
            var olderTweets = localStorage["older_tweets"];
            localStorage["oldest_tweets"] = olderTweets; // use open new url on popup
            
        }
    
        // event occur every 15 minutes
  　　　 　chrome.alarms.create('save', { periodInMinutes: 15 });
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm) {
        if (alarm.name == 'save') {
            getTwitterAPI().saveFavorites();
            //console.log(new Date + "alarm!!");
    　　　}
  　　}
});