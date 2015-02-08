(function(undefined) {
    var bgPage = chrome.runtime.getBackgroundPage(function(bgPage) {
       	var twitter = bgPage.getTwitterAPI();
        var initText = bgPage.title + ' ' + bgPage.url + ' #favurl';
        $('#tweet-area').val(initText);

        var tweetLength = twttr.txt.getTweetLength(initText);
        $('#inputlength').html(tweetLength);
        if (tweetLength > 140){
            $('#inputlength').css('color', 'red');
        }

    	$('#tweet-button').click(function(){
            var tweet = $('#tweet-area').val();
    		var tweetLength = twttr.txt.getTweetLength(tweet);
    		if (tweetLength <= 140) {
    			var result = JSON.parse(twitter.tweet(tweet));
    			//alert(result);
        		if('errors' in result){
        			var errorCode = result.errors[0].code;
        			if (errorCode === 226) {
        				$('body').html(result.errors[0].code + ' error. ' +
        					'This request looks like it might be automated. ' + 
        					' Please try again later.'
        				);
        			} else {
        				$('body').html(result.errors[0].code + ' error. ');
        			}

                    if(localStorage['sound'] === 'on'){
                        speak('failed in posting tweet.', 'ふぁぼゆーあーるえるのツイートに失敗しました。');
                    }

        			setTimeout(function(){
    					window.close();
    				}, 3000);

        		} else {
        			$('body').html('Success!');
                    $('body').css('font-size', '23px');
                    if(localStorage['sound'] === 'on'){
                        speak('Succeeded in posting tweet.', 'ふぁぼゆーあーるえるをツイートしました。');
                    }
        			setTimeout(function(){
    					window.close();
    				}, 850);
    			}
                /*
                twitter.tweet(text).done(function(){
                    
                }).fail(function(xhr){
                    $('body').html(xhr.status);
                });
                */
        	}
    	});
    });
})();

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


$('#tweet-area').keyup(function(){
    var tweet = $('#tweet-area').val();
    var tweetLength = twttr.txt.getTweetLength(tweet);
    $('#inputlength').html(tweetLength);
    if (tweetLength > 140){
    	$('#inputlength').css('color', 'red');
    } else {
    	$('#inputlength').css('color', 'black');
    }
});

$('#tweet-area').hover(function(){
    $('#tweet-area').focus();
});

