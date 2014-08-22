var api = null;

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

var url = '';
var title = '';

chrome.contextMenus.onClicked.addListener(function(info, tab){
    if (info.menuItemId == 'jumpTweetWindow'){
        if(getTwitterAPI().isAuthenticated()){
            url = tab.url;
            title = tab.title;
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
    if (getTwitterAPI().isAuthenticated()) {
        if (localStorage['auto_open'] === 'on') {
            //console.log('on');
            getTwitterAPI().openNewURLsOnStart();
        } else {
            //console.log('off');
            getTwitterAPI().getNewURLsOnStart();
        }    
        // event occur every 15 minutes
  　　　 chrome.alarms.create('save', { periodInMinutes: 15 });
    }
    localStorage['lastTime'] = (new Date()).getTime();
});


chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'save') {
        if (getTwitterAPI().isAuthenticated) {
            console.log(getTwitterAPI().isAuthenticated);
            getTwitterAPI().saveFavorites();
        }
        console.log(new Date + 'alarm!!');
        localStorage['lastTime'] = (new Date()).getTime();
    }
});


chrome.tabs.onCreated.addListener(function() {
    //var currentTime = (new Date()).getTime();
    check_returnSleep();
    console.log('created');
});

chrome.tabs.onRemoved.addListener(function() {
    //var currentTime = (new Date()).getTime();
    check_returnSleep();
    console.log('removed');
});

chrome.tabs.onUpdated.addListener(function() {
    //var currentTime = (new Date()).getTime();
    check_returnSleep();
    console.log('updated');
});


function check_returnSleep(){
    var currentTime = (new Date()).getTime();
    if ((currentTime - localStorage['lastTime']) > 903000){ // 900000msec = 15min
        // execute only when chrome return sleep mode
        console.log('return sleep');
        if (getTwitterAPI().isAuthenticated) {
            if (localStorage['auto_open'] === 'on') {
                getTwitterAPI().openNewURLsOnStart();
            } else { // off or undefined(default)
                getTwitterAPI().getNewURLsOnStart();
            }
        }    
        // alarm often don't work when return sleep.
        chrome.alarms.clear('save');
        // event occur every 15 minutes
        chrome.alarms.create('save', { periodInMinutes: 15 });
    }
    
    localStorage['lastTime'] = currentTime;
}