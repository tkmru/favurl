'use strict';

let api = null;

// This function is called by popup.js
function getTwitterAPI() {
    if (api === null) { // run for the first time.
        api = new Twitter(); // make once.
    }

    return api;
}


// This function receive request content_script.js send.
chrome.runtime.onMessage.addListener(function(req, sender, res) {
    getTwitterAPI().sign(req.verifier, res);
    return true;
});

let url = '';
let title = '';

chrome.contextMenus.onClicked.addListener(function(info, tab){
    if (info.menuItemId == 'jumpTweetWindow'){
        if(getTwitterAPI().isAuthenticated()){
            url = tab.url; // for twitter.js
            title = tab.title; // for twitter.js
            chrome.windows.create({
                url : 'tweet.html',
                focused : true,
                type : 'popup',
                height : 107,
                width : 398
            });
        } else {
            alert('Please login to twitter.');
        }
    }
});

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
    // Create contextMenus to jump tweet window
    chrome.contextMenus.create({
        'title': 'tweet this URL',
        'type': 'normal',
        'id': 'jumpTweetWindow'
    });
});


chrome.runtime.onStartup.addListener(function() {
    // execute only when chrome start
    // chrome.tabs.executeScript(null, {code: 'console.log('abc');'}, null);
    if (getTwitterAPI().isAuthenticated()) {
        getTwitterAPI().getNewURLs();
    }   
    // event occur every 15 minutes
    chrome.alarms.create('save', { periodInMinutes: 15 });
    localStorage['lastTime'] = (new Date()).getTime();
});


chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'save') {
        if (getTwitterAPI().isAuthenticated) {
            getTwitterAPI().saveFavorites();
        }
        localStorage['lastTime'] = (new Date()).getTime();
    }
});


chrome.tabs.onCreated.addListener(function() {
    // let currentTime = (new Date()).getTime();
    check_returnSleep();
});

chrome.tabs.onRemoved.addListener(function() {
    // let currentTime = (new Date()).getTime();
    check_returnSleep();
});

chrome.tabs.onUpdated.addListener(function() {
    // let currentTime = (new Date()).getTime();
    check_returnSleep();
});


function check_returnSleep(){
    let currentTime = (new Date()).getTime();
    if ((currentTime - localStorage['lastTime']) > 903000){ // 900000msec = 15min
        // execute only when chrome return sleep mode
        if (getTwitterAPI().isAuthenticated) {
            getTwitterAPI().getNewURLs();
        }    
        // alarm often don't work when return sleep.
        chrome.alarms.clear('save');
        // event occur every 15 minutes
        chrome.alarms.create('save', { periodInMinutes: 15 });
    }
    
    localStorage['lastTime'] = currentTime;
}
