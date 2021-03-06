(function(undefined) {
  'use strict';
  let bgPage = chrome.runtime.getBackgroundPage(function(bgPage) {
    let twitter = bgPage.getTwitterAPI();

    $('#login').click(function() {
      twitter.login();
    });

    $('#logout').click(function() {
      twitter.logout();
      location.reload();
    });

    $('#search').click(function() {
      let userID = $('#userID').val();
      if (userID !== '' && userID !== ' --- Please put target user ID. ---') {
        $('#search-contents').css('margin', '0px');
        twitter.fetchFavorites($('#search-contents'), userID);
        $('#userID').val('');
        $('#userID').hide();
        $('#search').hide();
      } else {
        $('#userID').css('color', 'red');
        $('#userID').val(' --- Please put target user ID. ---');
      }
    });

    if (twitter.isAuthenticated()) {
      $('#login').css('display', 'none');
      $('#tweet-contents').show();
      twitter.fetchFavorites($('#tweet-contents'));

    } else {
      $('#login').css('display', 'block');
      $('#header').hide();
      $('#tweet-contents').hide();
    }
  });
})();


$('#logo').click(function() {
  window.open('https:/twitter.com');
});

$('#option').click(function() {
  window.open('chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/options.html');
});

$('#refresh').click(function() {
  location.reload();
});

$('#toSearch').click(function() {
  $('#toSearch').hide();
  $('#back').show('fast');
  $('#tweet-contents > .tweets').css('display', 'none');
  if ($('#tweet-contents > .error').length === 0) {
    $('#search-contents').show();
  }
});

$('#back').click(function() {
  $('#back').hide();
  $('#toSearch').show('fast');
  $('#userID').show();
  $('#search').show();
  $('#search-contents').hide();
  $('#search-contents > .tweets').remove();
  $('#search-contents > .error').remove();
  $('#tweet-contents > .tweets').css('display', 'block');
  $('#search-contents').css('margin', '10px 5px');
});

$('#userID').hover(function(){
  $('#userID').focus();
});

$('#userID').focus(function(){
  if (this.value === this.defaultValue){
    $(this).css('color', '#000');
    $(this).val('');
  }
});

let konamikan = [];
let image = document.createElement('img');
image.src = 'images/Twitter_logo.png';

let canvas = document.getElementById('logo');
let ctx = canvas.getContext('2d');

image.onload = function(){
  ctx.drawImage(image, 0, 0, 18, 14.63);
}

function doRotate(ctx, img, delay, i) {
  'use strict';
  setTimeout(function () {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate((Math.PI/9)*i);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height); // draw the image
    ctx.restore(); //restore the state of canvas
  }, delay);
}

$(window).keyup(function(e) {
  'use strict';
  konamikan.push(e.keyCode);
  if (konamikan.slice(-10).toString()=='38,38,40,40,37,39,37,39,66,65'){
    let delay = 40;
    for(let i = 1; i <= 18; i += 1) {
      doRotate(ctx, image, delay, i);
      delay += 40;
    }
  }
});

$(document).ready(function() {
  $(window).on("unload", function() {
    $('#header').show();
    $('#login').css('display', 'none');
    $('#tweet-contents').show();
    $('#tweet-form').hide();
  });
});
