var pinArea = $("#oauth_pin > p > kbd > code");

if (pinArea !== null && document.referrer.match(/oauth_consumer_key=([^&]+)/)) {
    if (RegExp.$1 === CONSUMER_KEY) {
        var pin = pinArea.text();

        chrome.extension.sendRequest({ "verifier": pin }, function(isSuccess) {
            pinArea.css("font-size", "20px");
            if (isSuccess === true) {
                pinArea.text("Congratulations, you've been successfully authenticated. Enjoy favurl!");

            } else {
                pinArea.text("Sorry, something went wrong. Please try to click icon again.");
            }
        });
    }
}