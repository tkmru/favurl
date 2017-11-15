'use strict';

// todo http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call

const TWITTER_USER_ID_STORAGE_KEY = 'userid';

let Twitter = function() {};

Twitter.prototype.getAccessToken = function() {
    let accessToken = localStorage[ACCESS_TOKEN_STORAGE_KEY];

    return (typeof accessToken === 'string' || accessToken instanceof String) ? accessToken : null;
};

Twitter.prototype.getAccessTokenSecret = function() {
    let accessTokenSecret = localStorage[ACCESS_TOKEN_SECRET_STORAGE_KEY];

    return (typeof accessTokenSecret === 'string' || accessTokenSecret instanceof String) ? accessTokenSecret : null;
};

Twitter.prototype.getUserID = function() {
    let userID = Number(localStorage[TWITTER_USER_ID_STORAGE_KEY]);

    return (Number.isInteger(userID) && !Number.isNaN(userID)) ? userID : null;
};

Twitter.prototype.parseToken = function(data) {
    if (typeof data === 'string' || data instanceof String) {
        let parsedToken = {};

        data.split('&').forEach(function(token) {
            let kv = token.split('=');
            parsedToken[kv[0]] = kv[1];
        });

        return parsedToken;
    }

    return null;
};

Twitter.prototype.login = function() {
    let message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/oauth/request_token',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1'
        }
    };

    let accessor = {
        'consumerSecret': CONSUMER_SECRET
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.get(
        OAuth.addToURL(message.action, message.parameters),
        $.proxy(
            function(data) {
                let params = this.parseToken(data);
                let token = params.oauth_token;
                let secret = params.oauth_token_secret;

                message.action = 'https://api.twitter.com/oauth/authorize';
                message.parameters.oauth_token = token;

                accessor.oauth_token_secret = secret;

                OAuth.setTimestampAndNonce(message);
                OAuth.SignatureMethod.sign(message, accessor);

                this.request_token = token;
                this.request_token_secret = secret;

                window.open(OAuth.addToURL(message.action, message.parameters));
            },
            this
        )
    );
};


Twitter.prototype.sign = function(pin, cb) {
    let requestToken = this.request_token;
    let requestTokenSecret = this.request_token_secret;

    delete this.request_token;
    delete this.request_token_secret;

    let message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/oauth/access_token',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': requestToken,
            'oauth_verifier': pin
        }
    };

    let accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': requestTokenSecret
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.ajax({
        'type': 'GET',
        'url': OAuth.addToURL(message.action, message.parameters),
        'success': $.proxy(function(data) {

            let params = this.parseToken(data);

            this.save(params.oauth_token, params.oauth_token_secret, params.user_id);
            if (localStorage.sound === 'on') {
                speak('hello', '今日からよろしくお願いします');
            }
            cb(true);
        }, this),

        'error': function() {
            cb(false);
        }
    });
}


Twitter.prototype.save = function(accessToken, accessTokenSecret, userid) {
    localStorage[ACCESS_TOKEN_STORAGE_KEY] = accessToken;
    localStorage[ACCESS_TOKEN_SECRET_STORAGE_KEY] = accessTokenSecret;
    localStorage[TWITTER_USER_ID_STORAGE_KEY] = userid;
};


Twitter.prototype.logout = function() {
    if (localStorage.sound === 'on') {
        speak('good bye', 'twitterを一緒に戦えて嬉しかったです');
    }
    localStorage.clear();
    location.reload();
};


Twitter.prototype.isAuthenticated = function() {
    return (!Object.is(this.getAccessToken(), null) && !Object.is(this.getAccessTokenSecret(), null) && !Object.is(this.getUserID(), null)) ? true : false;
};


Twitter.prototype.saveFavorites = function() {
	// https://dev.twitter.com/docs/api/1.1/get/favorites/list
    let message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/1.1/favorites/list.json',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': this.getAccessToken(),
            'count': 200,
            'include_rts': true,
            'include_entities': true
        }
    };

    let accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': this.getAccessTokenSecret()
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.ajax({
        'type': 'GET',
        'url': OAuth.addToURL(message.action, message.parameters),
        'dataType': 'json',
        'success': function(tweets) {
            localStorage.olderTweets = JSON.stringify(tweets);
        }
    });
}


Twitter.prototype.tweet = function(text) {
    // https://dev.twitter.com/docs/api/1.1/post/statuses/update
    let message = {
        'method': 'POST',
        'action': 'https://api.twitter.com/1.1/statuses/update.json',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': this.getAccessToken(),
            'status': text
        }
    }

    let accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': this.getAccessTokenSecret()
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    let result = $.ajax({
        'type': message.method,
        'url': OAuth.addToURL(message.action, message.parameters), 
        'dataType': 'json',
        'async': false
    }).responseText;

    return result;
}

function getURLdiff(old_tweets, new_tweets) {
    let added_tweets = new_tweets.filter(x => old_tweets.indexOf(x) < 0 );
    let removePic = localStorage.removePic; //on or off(set by optionpage) or undefined(not set)
    let removeMovie = localStorage.removeMovie; //on or off(set by optionpage) or undefined(not set)
    let removeTweet = localStorage.removeTweet; //on or off(set by optionpage) or undefined(not set)
    let removeLoc = localStorage.removeLoc; //on or off(set by optionpage) or undefined(not set)

    let newURLs = [];
    for (added_tweet of added_tweets) { // extract url from new_tweets
        if (checkURL(added_tweet, removePic, removeMovie, removeTweet, removeLoc)) {
            // https://dev.twitter.com/docs/platform-objects/entities
            added_tweet.entities.urls.forEach(function(urls) {
                newURLs.push(urls.url);
            });
        }
    }
                    
    return newURLs;
}


function speak(en_words, ja_words) {
    let msg;

    if (localStorage.lang === 'ja'){
        msg = new SpeechSynthesisUtterance(ja_words);
        msg.lang = 'ja-JP';

    } else if (localStorage.lang === 'en') {
        msg = new SpeechSynthesisUtterance(en_words);
        msg.lang = 'en-US';

    } else if (navigator.language === 'ja') {
        localStorage.lang === 'ja';
        msg = new SpeechSynthesisUtterance(ja_words);
        msg.lang = 'ja-JP';

    } else {
        msg = new SpeechSynthesisUtterance(en_words);
        msg.lang = 'en-US';
    }

    window.speechSynthesis.speak(msg);
}


Twitter.prototype.getNewURLs = function() {
    // https://dev.twitter.com/docs/api/1.1/get/favorites/list
    let message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/1.1/favorites/list.json',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': this.getAccessToken(),
            'count': 200,
            'include_rts': true,
            'include_entities': true
        }
    };

    let accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': this.getAccessTokenSecret()
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.ajax({
        'type': 'GET',
        'url': OAuth.addToURL(message.action, message.parameters),
        'dataType': 'json',
        'success': function(new_tweets) {

            let olderTweets = JSON.parse(localStorage.olderTweets);
            if (!olderTweets) { // There isn't old tweet, old_tweets.tweets is undefined
                if (localStorage.notification !== 'off') {
                    chrome.windows.create({
                        url : 'notSetOldTweet.html',
                        focused : true,
                        type : 'popup',
                        height : 107,
                        width : 398
                    });
                }
            } else {
                let newURLs = getURLdiff(olderTweets, new_tweets);
                localStorage.newURLs = JSON.stringify(newURLs);
                if (newURLs.length !== 0) {
                    if (localStorage.notification !== 'off' && localStorage.autoOpen !== 'on') {
                        chrome.windows.create({
                            url : 'getNewFavURL.html',
                            focused : true,
                            type : 'popup',
                            height : 107,
                            width : 398
                        });
                    }

                    if (localStorage.sound === 'on' ) {
                        speak('You have new ' + newURLs.length + ' URL', newURLs.length+'つの新着URLがあります');    
                    }

                } else if (localStorage.sound === 'on' ) {
                    speak('I don\'t have new URL', '新着URLはありません');
                }

                if (localStorage.autoOpen === 'on') {
                    for (newURL of newURLs) {
                        window.open(newURL);
                    }
                    localStorage.newURLs = JSON.stringify([]); // for disable open url button  
                }
            }

            localStorage.olderTweets = JSON.stringify(new_tweets);
        },

        'error': function(xhr) {
            if (localStorage.sound === 'on') {
                speak('I\'m sorry, I failed to get favorites.', 'Twitterに接続できません');
            }

            if(localStorage.notification !== 'off'){
                chrome.windows.create({
                    url : 'failToGetFav.html',
                    focused : true,
                    type : 'popup',
                    height : 107,
                    width : 398
                });
            }
        }
    });

}


Twitter.prototype.openNewURLsOnPopup = function() {
    let newURLs = localStorage.newURLs;

    if (newURLs === undefined){
        if (localStorage.sound === 'on') {    
            speak('This function is enabled next time', 'この機能は次回起動時よりご利用いただけます');
        }
    } else {
        newURLs = JSON.parse(newURLs);
        if (localStorage.sound === 'on') { 
            if (newURLs.length === 0) {
                speak('I don\'t have new URL', '新着URLはありません');
            } else {
                speak('I open new ' + newURLs.length + ' URL', newURLs.length + 'つの新着URLを開きます');    
            }
        }

        for (newURL of newURLs) {
            window.open(newURL);
        }
    }

    localStorage.newURLs = JSON.stringify([]);
}


Twitter.prototype.fetchFavorites = function(elm, userID='') {
	// https://dev.twitter.com/docs/api/1.1/get/favorites/list

    let message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/1.1/favorites/list.json',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': this.getAccessToken(),
            'screen_name': userID,
            'count': 200,
            'include_rts': true,
            'include_entities': true
        }
    };

    let accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': this.getAccessTokenSecret()
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.ajax({
        'type': 'GET',
        'url': OAuth.addToURL(message.action, message.parameters),
        'dataType': 'json',
        'success': function(tweets) {

            let root = $('<div>').attr('class', 'tweets');
            let removePic = localStorage.removePic; // on or off(set by optionpage) or undefined(not set)
            let removeMovie = localStorage.removeMovie; // on or off(set by optionpage) or undefined(not set)
	        let removeTweet = localStorage.removeTweet; // on or off(set by optionpage) or undefined(not set)
	        let removeLoc = localStorage.removeLoc; // on or off(set by optionpage) or undefined(not set)
            	
            tweets.forEach(function(tweet) {
            	
            	if (checkURL(tweet, removePic, removeMovie, removeTweet, removeLoc)) {

                    let user = tweet.user;
                    let source = $(tweet.source);
                    let id = tweet.id

                    let tweetView = $('<div>').attr('class', 'tweet').append(
                        $('<div>').attr('class', 'tweet-icon').append(
                            $('<img>').attr('src', user.profile_image_url_https)
                        ),
                        $('<div>').attr('class', 'tweet-detail').append(
                            $('<a>').attr(
                                'href',
                                'http://twitter.com/' + user.screen_name
                            ).attr('target', '_blank').text(user.name),
                            $('<pre>').html(normalizeTweetText(tweet))
                        ),
                        $('<div>').attr('class', 'tweet-info').append(
                            $('<ul>').append(
                                $('<li>').append(source), 
                                $('<li>').append(
                                    $('<a>').attr(
                                        'href',
                                        'https://twitter.com/' + user.screen_name + '/status/' + tweet.id_str
                                    ).attr(
                                        'target',
                                        '_blank'
                                    ).text(normalizeDateTime(new Date(tweet.created_at)))
                                )
                            )
                        )
                    );

                    tweetView.append($('<div>').attr('class', 'clearfix'));

                    root.append(tweetView);
                }
            });

            $(elm).append(root);

            if (userID === '') { // in case get myID's tweet
                let currentTimeMs = (new Date()).getTime();
                if ((currentTimeMs - localStorage.lastTimeMs) > 903000 && localStorage.olderTweets !== undefined){ // 900000msec = 15min
                    // execute only when chrome return sleep mode and not first boot
                    let newURLs = getURLdiff(JSON.parse(localStorage.olderTweets), tweets);
                    if (localStorage.autoOpen === 'on') {                        
                        if (localStorage.sound === 'on'){
                            if (newURLs.length === 0) {
                                speak('I don\'t have new URL', '新着URLはありません');
                            } else {
                                speak('I open new '+newURLs.length+' URL', newURLs.length+'つの新着URLを開きます');
                            }
                        }

                        for (newURL of newURLs) {
                            window.open(newURL);
                        }

                    } else { // off or undefined(default)
                        localStorage.newURLs = JSON.stringify(newURLs);
                    }
                }

                localStorage.olderTweets = JSON.stringify(tweets);
            }
        },
        'error': function(xhr) {
            if (localStorage.sound === 'on') {
                speak('Sorry, I can\'t get favorites', 'すみません、ふぁぼを取得できませんでした。');
        	}
            // https://dev.twitter.com/docs/error-codes-responses
            if (xhr.status === 401) { // for unauthorized
                localStorage.removeItem('access_token');

            } else if (xhr.status === 429) { // for reach API limit
            	let root = $('<div>').attr('class', 'error');
                root.append('Sorry, request exceeded the API limit.<br/>Please try it later.');
                $(elm).append(root);

            } else if (xhr.status === 500) {
                let root = $('<div>').attr('class', 'error');
                root.append('Sorry, something in Twitter is technically wrong.<br/>Please try it later.');
                $(elm).append(root);


            } else {
            	let root = $('<div>').attr('class', 'error');
                root.append(xhr.status + ' error!<br/>Please try it later.');
                $(elm).append(root);
            }
        }
    });
};


function checkURL(tweet, removePic, removeMovie, removeTweet, removeLoc) {
    let removeCount = 0;
    let tweetURLs = tweet.entities.urls;
    if (tweetURLs.length > 0) { // url in tweet exist?
    	for (let i = 0; i < tweetURLs.length; i += 1) {
        	// removing URL of picture service
        	if (removePic !== 'off' &&
            /^pic\.twitter|^twitpic\.com|^instagram\.com\/p|^p\.twipple|^pckles\.com|^facebook\.com\/photo|^ift\.tt|^path\.com\/p/.test(tweetURLs[i].display_url)) {
                removeCount += 1;
                break;

            // removing URL of movie service
            } else if (removeMovie !== 'off' &&
            /^instagram\.com\/m|^youtu\.be|^youtube\.com|^nico\.ms|^vimeo\.com|^veoh\.com|^v\.youku|^ustre\.am|dailymotion\.com\/video|^dai.ly/.test(tweetURLs[i].display_url)) {
                removeCount += 1;
                break;

            // removing URL of tweet
            } else if (removeTweet !== 'off' &&
                       /^twitter\.com/.test(tweetURLs[i].display_url)) {
                removeCount += 1;
                break;

            // removing URL of location service
            } else if (removeLoc !== 'off' &&
                       /^4sq\.com|^swarmapp.com\/c/.test(tweetURLs[i].display_url)) {
                removeCount += 1;
                break;
            }
        }
        
    } else { // url not in tweet exist?
        removeCount += 1;
    }
    
    if (removeCount === 0) {
    	return true;
    } else {
        return false;
    }
}


function normalizeTweetText(tweet) {
    let text = tweet.text;
    let entities = tweet.entities;

    if (Array.isArray(entities.hashtags)) {
        entities.hashtags.forEach(function(hashtag) {
            text = text.replace(
                '#' + hashtag.text,
                '<a href=\'http://twitter.com/search/' + encodeURIComponent('#' + hashtag.text) + '\'target=\'_blank\'>#' + hashtag.text + '</a>'
            );
        });
    }

    if (Array.isArray(entities.media)) {
        entities.media.forEach(function(media) {
            if (localStorage.displayURL != 'original'){ // none or brief
                    text = text.replace(
                    media.url,
                    '<a href=' + media.media_url_https + '\'target=\'_blank\'>' + media.display_url + '</a>'
                );

            } else { // original
                text = text.replace(
                    media.url,
                    '<a href=' + media.media_url_https + '\'target=\'_blank\'>' + media.expanded_url + '</a>'
                );
            }
        });
    }

    if (Array.isArray(entities.urls) > 0) {
        entities.urls.forEach(function(url) {
            if (localStorage.displayURL != 'original'){ // none or brief
                text = text.replace(
                    url.url,
                    '<a href=\'' + url.expanded_url + '\' target=\'_blank\'>' + url.display_url + '</a>'
                );
            } else { // original   
                text = text.replace(
                    url.url,
                    '<a href=\'' + url.expanded_url + '\' target=\'_blank\'>' + url.expanded_url + '</a>'
                );
            }
        });
    }

    if (Array.isArray(entities.user_mentions)) {
        entities.user_mentions.forEach(function(mention) {
            text = text.replace(
                '@' + mention.screen_name,
                '<a href=\'https://twitter.com/' + mention.screen_name + '\' target=\'_blank\'>@' + mention.screen_name + '</a>'
            );
        });
    }

    return text;
}


function normalizeDateTime(date) {
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hour = ('00' + date.getHours()).slice(-2);
    let min = ('00' + date.getMinutes()).slice(-2);
    let sec = ('00' + date.getSeconds()).slice(-2);
    return year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;
}
