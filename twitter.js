const TWITTER_USER_ID_STORAGE_KEY = 'userid';

var Twitter = function() {};

Twitter.prototype.getAccessToken = function() {
    var accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    return _.isString(accessToken) ? accessToken : null;
};

Twitter.prototype.getAccessTokenSecret = function() {
    var accessTokenSecret = localStorage.getItem(ACCESS_TOKEN_SECRET_STORAGE_KEY);

    return _.isString(accessTokenSecret) ? accessTokenSecret : null;
};

Twitter.prototype.getUserID = function() {
    var userid = Number(localStorage.getItem(TWITTER_USER_ID_STORAGE_KEY));

    return (_.isNumber(userid) && !_.isNaN(userid)) ? userid : null;
};

Twitter.prototype.parseToken = function(data) {
    if (_.isString(data)) {
        var parsedToken = {};

        data.split('&').forEach(function(token) {
            var kv = token.split('=');

            parsedToken[kv[0]] = kv[1];
        });

        return parsedToken;
    }

    return null;
};

Twitter.prototype.login = function() {
    var message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/oauth/request_token',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1'
        }
    };

    var accessor = {
        'consumerSecret': CONSUMER_SECRET
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.get(
        OAuth.addToURL(message.action, message.parameters),
        $.proxy(
            function(data) {
                var params = this.parseToken(data);
                var token =params.oauth_token;
                var secret = params.oauth_token_secret;

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
    var requestToken = this.request_token;
    var requestTokenSecret = this.request_token_secret;

    delete this.request_token;
    delete this.request_token_secret;

    var message = {
        'method': 'GET',
        'action': 'https://api.twitter.com/oauth/access_token',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': requestToken,
            'oauth_verifier': pin
        }
    };

    var accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': requestTokenSecret
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    $.ajax({
        'type': 'GET',
        'url': OAuth.addToURL(message.action, message.parameters),
        'success': $.proxy(function(data) {

            var params = this.parseToken(data);

            this.save(params.oauth_token, params.oauth_token_secret, params.user_id);
            if (localStorage['sound'] === 'on') {
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
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(ACCESS_TOKEN_SECRET_STORAGE_KEY, accessTokenSecret);
    localStorage.setItem(TWITTER_USER_ID_STORAGE_KEY, userid);
};


Twitter.prototype.logout = function() {
    if (localStorage['sound'] === 'on') {
        speak('good bye', 'twitterを一緒に戦えて嬉しかったです');
    }
    localStorage.clear();
    location.reload();
};


Twitter.prototype.isAuthenticated = function() {
    return !_.isNull(this.getAccessToken()) && !_.isNull(this.getAccessTokenSecret()) && _.isNumber(this.getUserID()) ? true : false;
};


Twitter.prototype.saveFavorites = function() {
	// https://dev.twitter.com/docs/api/1.1/get/favorites/list
    var message = {
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

    var accessor = {
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
            localStorage['older_tweets'] = JSON.stringify(tweets);
        }
    });
}


Twitter.prototype.tweet = function(text) {
    // https://dev.twitter.com/docs/api/1.1/post/statuses/update
    var message = {
        'method': 'POST',
        'action': 'https://api.twitter.com/1.1/statuses/update.json',
        'parameters': {
            'oauth_consumer_key': CONSUMER_KEY,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_token': this.getAccessToken(),
            'status': text
        }
    }

    var accessor = {
        'consumerSecret': CONSUMER_SECRET,
        'tokenSecret': this.getAccessTokenSecret()
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var result = $.ajax({
        'type': message.method,
        'url': OAuth.addToURL(message.action, message.parameters), 
        'dataType': 'json',
        'async': false
    }).responseText;

    return result;

    /*
    return $.ajax({
        'type': message.method,
        'url': OAuth.addToURL(message.action, message.parameters), 
        'dataType': 'json'
    }) 
    */
}

function getArrayDiff(older, newer){
    function callback_filter(element, index, array) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].id_str === element.id_str) {
                return false;
            }
        }
        return true;
    }
    if (newer.length === older.length) { //this update change  newer.length
        return newer.filter(callback_filter, older);
    }
}


function getNewFavURL(old_tweets, new_tweets) {
    var added_tweets = getArrayDiff(old_tweets, new_tweets);
    //console.log(added_tweets);

    var remove_pic = localStorage['remove_pic']; //on or off(set by optionpage) or undefined(not set)
    var remove_movie = localStorage['remove_movie']; //on or off(set by optionpage) or undefined(not set)
    var remove_twi = localStorage['remove_twi']; //on or off(set by optionpage) or undefined(not set)
    var remove_loc = localStorage['remove_loc']; //on or off(set by optionpage) or undefined(not set)

    var new_urls = [];
    for (var i = 0; i < added_tweets.length; i++) { // extract url from new_tweets
        if (checkURL(added_tweets[i], remove_pic, remove_movie, remove_twi, remove_loc)) {
            // https://dev.twitter.com/docs/platform-objects/entities
            added_tweets[i].entities.urls.forEach(function(urls) {
            new_urls.push(urls.url);
            });
        }
    }
    //console.log('newwurl'+JSON.stringify(new_urls));
                    
    return new_urls;
}


function speak(en_words, ja_words) {
    var msg;

    if (localStorage['lang'] === 'ja'){
        msg = new SpeechSynthesisUtterance(ja_words);
        msg.lang = 'ja-JP';

    } else if (localStorage['lang'] === 'en') {
        msg = new SpeechSynthesisUtterance(en_words);
        msg.lang = 'en-US';

    } else if (navigator.language === 'ja') {
        localStorage['lang'] === 'ja';
        msg = new SpeechSynthesisUtterance(ja_words);
        msg.lang = 'ja-JP';

    } else {
        msg = new SpeechSynthesisUtterance(en_words);
        msg.lang = 'en-US';
    }

    window.speechSynthesis.speak(msg);
}


Twitter.prototype.getNewURLsOnStart = function() {
    // https://dev.twitter.com/docs/api/1.1/get/favorites/list
    var message = {
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

    var accessor = {
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

            var olderTweets = JSON.parse(localStorage['older_tweets']);
            if (!olderTweets) { // There isn't old tweet, old_tweets.tweets is undefined
                window.open('./NotSetOldTweet.html');
            } else {
                new_urls = getNewFavURL(olderTweets, new_tweets);
                localStorage['new_urls'] = JSON.stringify(new_urls);
                if (localStorage['sound'] === 'on' ) {
                    if (new_urls.length === 0) {
                        speak('I don\'t have new URL', '新着URLはありません');
                    } else {
                        speak('You have new '+new_urls.length+' URL', new_urls.length+'つの新着URLがあります');    
                    }
                }
            }

            localStorage['older_tweets'] = JSON.stringify(new_tweets);
            localStorage['oldest_tweets'] = JSON.stringify(new_tweets);
        },

        'error': function(xhr) {
            if (localStorage['sound'] === 'on') {
                speak('I\'m sorry, I failed to get favorites.', 'Twitterに接続できません');
            }
            windows.open('./failToGetFav.html');  
        }
    });

}


Twitter.prototype.openNewURLsOnStart = function() {
	// https://dev.twitter.com/docs/api/1.1/get/favorites/list
    var message = {
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

    var accessor = {
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

            var olderTweets = JSON.parse(localStorage['older_tweets']);
            if (!olderTweets) { // There isn't old tweet, old_tweets.tweets is undefined
                window.open('./NotSetOldTweet.html');
            } else {
                new_urls = getNewFavURL(olderTweets, new_tweets);
                if (localStorage['sound'] === 'on' ) {
                    if (new_urls.length === 0) {
                        speak('I don\'t have new URL', '新着URLはありません');
                    } else {
                        speak('I open new '+new_urls.length+' URL', new_urls.length+'つの新着URLを開きます');    
                    }
                }

                for (var i = 0; i < new_urls.length; i++) {
                    window.open(new_urls[i]);
                }
            }

            localStorage['older_tweets'] = JSON.stringify(new_tweets);
            localStorage['oldest_tweets'] = JSON.stringify(new_tweets);
            localStorage['new_urls'] = JSON.stringly([]);
        },

        'error': function(xhr) {
            if (localStorage['sound'] === 'on') {
                speak('I\'m sorry, I failed to get favorites.', 'Twitterに接続できません');
            }
            windows.open('./failToGetFav.html');    
        }
    });
}


Twitter.prototype.openNewURLsOnPopup = function() {
    if (localStorage['sound'] === 'on') {
        if (localStorage['new_urls'] === undefined){    
            speak('This function is enabled next time', 'この機能は次回起動時よりご利用いただけます');
        } else if (JSON.parse(localStorage['new_urls']).length === 0) {
            speak('I don\'t have new URL', '新着URLはありません');
        } else {
            speak('I open new '+new_urls.length+' URL', new_urls.length+'つの新着URLを開きます');    
        }
    }

    for (var i = 0; i < new_urls.length; i++) {
        window.open(new_urls[i]);
    }
    localStorage['new_urls'] = JSON.stringify([]);
}


Twitter.prototype.fetchFavorites = function(elm, userID) {
	// https://dev.twitter.com/docs/api/1.1/get/favorites/list

    userID = userID || ''; // set default arg

    var message = {
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

    var accessor = {
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

            if (userID === '') {
                localStorage['older_tweets'] = JSON.stringify(tweets);
            }

            var root = $('<div>').attr('class', 'tweets');
            var remove_pic = localStorage['remove_pic']; //on or off(set by optionpage) or undefined(not set)
            var remove_movie = localStorage['remove_movie']; //on or off(set by optionpage) or undefined(not set)
	        var remove_twi = localStorage['remove_twi']; //on or off(set by optionpage) or undefined(not set)
	        var remove_loc = localStorage['remove_loc']; //on or off(set by optionpage) or undefined(not set)
            	
            tweets.forEach(function(tweet) {
            	
            	if (checkURL(tweet, remove_pic, remove_movie, remove_twi, remove_loc)) {

                    var user = tweet.user;
                    var source = $(tweet.source);
                    var id = tweet.id

                    if (_.isObject(source) && _.isElement(source[0])) {
                        source.attr('target', '_blank');
                    } else {
                        source = $('<a>').attr('href', 'javascript:void(0)').text(tweet.source);
                    }

                    var tweetView = $('<div>').attr('class', 'tweet').append(
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
        },
        'error': function(xhr) {
            if (localStorage['sound'] === 'on') {
                speak('Sorry, I can\'t get favorites', 'すいません、ふぁぼを取得できませんでした。');
        	}
            // https://dev.twitter.com/docs/error-codes-responses
            if (xhr.status === 401) { // for unauthorized
                localStorage.removeItem('access_token');

            } else if (xhr.status === 429) { // for reach API limit
            	var root = $('<div>').attr('class', 'error');
                root.append('Sorry, request exceeded the API limit.<br/>Please try it later.');
                $(elm).append(root);

            } else if (xhr.status === 500) {
                var root = $('<div>').attr('class', 'error');
                root.append('Sorry, something in Twitter is technically wrong.<br/>Please try it later.');
                $(elm).append(root);


            } else {
            	var root = $('<div>').attr('class', 'error');
                root.append(xhr.status + ' error!<br/>Please try it later.');
                $(elm).append(root);
            }
        }
    });
};


function checkURL(tweet, remove_pic, remove_movie, remove_twi, remove_loc) {
    var judge_remove = 0;
    var urls = tweet.entities.urls;
    if (urls.length > 0) { //url in tweet exist?
    	for (var i = 0; i < urls.length; i++) {
        	// removing URL of picture service
        	if (remove_pic !== 'off' &&
            /^pic\.twitter|^twitpic\.com|^instagram\.com\/p|^p\.twipple|^pckles\.com|^facebook\.com\/photo|^ift\.tt|^path\.com\/p/.test(urls[i].display_url)) {
                judge_remove++;
                break;

            // removing URL of movie service
            } else if (remove_movie !== 'off' &&
            /^instagram\.com\/m|^youtu\.be|^youtube\.com\/watch|^nico\.ms|^vimeo\.com|^veoh\.com|^v\.youku|^ustre\.am|dailymotion\.com\/video|^dai.ly/.test(urls[i].display_url)) {
                judge_remove++;
                break;

            // removing URL of tweet
            } else if (remove_twi !== 'off' &&
                       /^twitter\.com/.test(urls[i].display_url)) {
                judge_remove++;
                break;

            // removing URL of location service
            } else if (remove_loc !== 'off' &&
                       /^4sq\.com/.test(urls[i].display_url)) {
                judge_remove++;
                break;
            }
        }
        
    } else { //url not in tweet exist?
        judge_remove++;
    }
    
    if (judge_remove === 0) {
    	return true;
    } else {
        return false;
    }
}


function normalizeTweetText(tweet) {
    var text = tweet.text;
    var entities = tweet.entities;

    if (_.isObject(tweet)) {
        if (_.isArray(entities.hashtags)) {
            entities.hashtags.forEach(function(hashtag) {
                text = text.replace(
                    '#' + hashtag.text,
                    '<a href="http://twitter.com/search/' + encodeURIComponent('#' + hashtag.text) + '"target="_blank">#' + hashtag.text + '</a>'
                );
            });
        }

        if (_.isArray(entities.media)) {
            entities.media.forEach(function(media) {
                text = text.replace(
                    media.url,
                    '<a href=' + media.media_url_https + '"target="_blank">' + media.expanded_url + '</a>'
                );
            });
        }

        if (_.isArray(entities.urls) > 0) {
            entities.urls.forEach(function(url) {
                text = text.replace(
                    url.url,
                    '<a href="' + url.expanded_url + '"target="_blank">' + url.expanded_url + '</a>'
                );
            });
        }

        if (_.isArray(entities.user_mentions)) {
            entities.user_mentions.forEach(function(mention) {
                text = text.replace(
                    '@' + mention.screen_name,
                    '<a href="https://twitter.com/' + mention.screen_name + '" target="_blank">@' + mention.screen_name + '</a>'
                );
            });
        }

        return text;
    } else {
        throw new Error('argument isn`t prototype of String');
    }
}


function normalizeDateTime(date) {
    if (_.isDate(date)) {
        return date.getFullYear() + '/' + zeroPadding(date.getMonth() + 1) + '/' + zeroPadding(date.getDate()) + ' ' + zeroPadding(date.getHours()) + ':' + zeroPadding(date.getMinutes()) + ':' + zeroPadding(date.getSeconds());
    } else {
        throw new Error('argument isn`t prototype of Date');
    }
}

function zeroPadding(n) {
    if (_.isNumber(n)) {
        if (String(n).length == 1) {
            return '0' + n;
        }
    }

    return n;
}