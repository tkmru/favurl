'use strict';

let pinArea = $('#oauth_pin > p > kbd > code');

if (pinArea !== null && document.referrer.match(/oauth_consumer_key=([^&]+)/)) {
    if (RegExp.$1 === CONSUMER_KEY) {
        let pin = pinArea.text();
        chrome.runtime.sendMessage({ 'verifier': pin }, function(isSuccess) {
            pinArea.css({'font-size': '20px',
                         'line-height': '40px',
                         'text-align': 'left'
            });

            if (isSuccess === true) {
                pinArea.html('Congratulations, you\'ve been successfully authenticated. <br>Enjoy favurl!');
            } else {
                pinArea.html('Sorry, something went wrong. <br>Please try to login again.');
            }
        });
    }
}
