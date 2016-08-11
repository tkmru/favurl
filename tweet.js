'use strict';

(function(undefined) {
    let bgPage = chrome.runtime.getBackgroundPage(function(bgPage) {
       	let twitter = bgPage.getTwitterAPI();
        let initText = bgPage.title + ' ' + bgPage.url + ' #favurl';
        $('#tweet-area').val(initText);

        let tweetLength = twttr.txt.getTweetLength(initText);
        $('#inputlength').html(tweetLength);
        if (tweetLength > 140){
            $('#inputlength').css('color', 'red');
        }

    	$('#tweet-button').click(function(){
            let tweet = $('#tweet-area').val();
            let tweetLength = twttr.txt.getTweetLength(tweet);
            if (tweetLength <= 140) {
                let result = JSON.parse(twitter.tweet(tweet));
                //alert(result);
                if('errors' in result){
                    let errorCode = result.errors[0].code;
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
        	}
    	});
    });
})();

function speak(enWords, jaWords) {
    let msg;

    if (localStorage['lang'] === 'ja'){
        msg = new SpeechSynthesisUtterance(jaWords);
        msg.lang = 'ja-JP';

    } else if (localStorage['lang'] === 'en') {
        msg = new SpeechSynthesisUtterance(enWords);
        msg.lang = 'en-US';

    } else if (navigator.language === 'ja') {
        localStorage['lang'] === 'ja';
        msg = new SpeechSynthesisUtterance(jaWords);
        msg.lang = 'ja-JP';

    } else {
        msg = new SpeechSynthesisUtterance(enWords);
        msg.lang = 'en-US';
    }

    window.speechSynthesis.speak(msg);
}


$('#tweet-area').keyup(function(){
    let tweet = $('#tweet-area').val();
    let tweetLength = twttr.txt.getTweetLength(tweet);
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

