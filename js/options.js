'use strict';

let movieRadioEn = document.getElementsByName('movie_radio_en');
let picRadioEn = document.getElementsByName('pic_radio_en');
let twiRadioEn = document.getElementsByName('twi_radio_en');
let locRadioEn = document.getElementsByName('loc_radio_en');
let autoOpenEn = document.getElementsByName('auto_open_en');
let displayURLEn = document.getElementsByName('displayURL_en');
let notificationEn = document.getElementsByName('notification_en');
let langRadioEn = document.getElementsByName('lang_radio_en');

let movieRadioJp = document.getElementsByName('movie_radio_jp');
let picRadioJp = document.getElementsByName('pic_radio_jp');
let twiRadioJp = document.getElementsByName('twi_radio_jp');
let locRadioJp = document.getElementsByName('loc_radio_jp');
let autoOpenJp = document.getElementsByName('auto_open_jp');
let displayURLJp = document.getElementsByName('displayURL_jp');
let notificationJp = document.getElementsByName('notification_jp');
let langRadioJp = document.getElementsByName('lang_radio_jp');


movieRadioEn[0].onclick = movieRadioJp[0].onclick = function() {
  localStorage.removeMovie = 'on';
}

movieRadioEn[1].onclick = movieRadioJp[1].onclick = function() {
  localStorage.removeMovie = 'off';
}


picRadioEn[0].onclick = picRadioJp[0].onclick = function() {
  localStorage.removePic = 'on';
}

picRadioEn[1].onclick = picRadioJp[1].onclick = function() {
  localStorage.removePic = 'off';
}


twiRadioEn[0].onclick = twiRadioJp[0].onclick = function() {
  localStorage.removeTwi = 'on';
}

twiRadioEn[1].onclick = twiRadioJp[1].onclick = function() {
  localStorage.removeTwi = 'off';
}


locRadioEn[0].onclick = locRadioJp[0].onclick = function() {
  localStorage.removeLoc = 'on';
}

locRadioEn[1].onclick = locRadioJp[1].onclick = function() {
  localStorage.removeLoc = 'off';
}


autoOpenEn[0].onclick = autoOpenJp[0].onclick = function() {
  localStorage.autoOpen = 'on';
}

autoOpenEn[1].onclick = autoOpenJp[1].onclick = function() {
  localStorage.autoOpen = 'off';
}


displayURLEn[0].onclick = displayURLJp[0].onclick = function(){
  localStorage.displayURL = 'brief';
}

displayURLEn[1].onclick = displayURLJp[1].onclick = function(){
  localStorage.displayURL = 'original';
}


notificationEn[0].onclick = notificationJp[0].onclick = function(){
  localStorage.notification = 'on';
}

notificationEn[1].onclick = notificationJp[1].onclick = function(){
  localStorage.notification = 'off';
}


langRadioEn[0].onclick = langRadioJp[0].onclick = function() {
  localStorage.lang = 'en';
  location.reload();
}

langRadioEn[1].onclick = langRadioJp[1].onclick = function() {
  localStorage.lang = 'ja';
  location.reload();
}


window.addEventListener('load',function(event){
  switch(localStorage.removeMovie) {
    case 'on':
      movieRadioEn[0].checked = movieRadioJp[0].checked = true;
      break;

    case 'off':
      movieRadioEn[1].checked = movieRadioJp[1].checked = true;
      break;

    default:
      movieRadioEn[0].checked = movieRadioJp[0].checked = true;
      break;
  }

  switch(localStorage.removePic) {
    case 'on':
      picRadioEn[0].checked = picRadioJp[0].checked = true;
      break;

    case 'off':
      picRadioEn[1].checked = picRadioJp[1].checked = true;
      break;

    default:
      picRadioEn[0].checked = picRadioJp[0].checked = true;
      break;
  }

  switch(localStorage.removeTwi) {
    case 'on':
      twiRadioEn[0].checked = twiRadioJp[0].checked = true;
      break;

    case 'off':
      twiRadioEn[1].checked = twiRadioJp[1].checked = true;
      break;

    default:
      twiRadioEn[0].checked = twiRadioJp[0].checked = true;
      break;
  }

  switch(localStorage.removeLoc) {
    case 'on':
      locRadioEn[0].checked = locRadioJp[0].checked = true;
      break;

    case 'off':
      locRadioEn[1].checked = locRadioJp[1].checked = true;
      break;

    default:
      locRadioEn[0].checked = locRadioJp[0].checked = true;
      break;
  }

  switch(localStorage.autoOpen) {
    case 'on':
      autoOpenEn[0].checked = autoOpenJp[0].checked = true;
      break;

    case 'off':
      autoOpenEn[1].checked = autoOpenJp[1].checked = true;
      break;

    default:
      autoOpenEn[1].checked = autoOpenJp[1].checked = true;
      break;
  }

  switch(localStorage.displayURL){
    case 'brief':
      displayURLEn[0].checked = displayURLJp[0].checked = true;
      break;

    case 'original':
      displayURLEn[1].checked = displayURLJp[1].checked = true;
      break;

    default:
      displayURLEn[0].checked = displayURLJp[0].checked = true;
      break;
  }

  switch(localStorage.notification){
    case 'on':
      notificationEn[0].checked = notificationJp[0].checked = true;
      break;

    case 'off':
      notificationEn[1].checked = notificationJp[1].checked = true;
      break;

    default:
      notificationEn[1].checked = notificationJp[1].checked = true;
      break;
  }

  switch(localStorage.lang) {
    case 'en':
      langRadioEn[0].checked = langRadioJp[0].checked = true;
      break;

    case 'ja':
      langRadioEn[1].checked = langRadioJp[1].checked = true;
      break;

    default:
      switch(navigator.language) { // for browzer language setting
        case 'ja':
          localStorage.lang = 'ja'
          langRadioEn[1].checked = langRadioJp[1].checked = true;
          break;

        default:
          localStorage.lang = 'en'
          langRadioEn[0].checked = langRadioJp[0].checked = true;
          break;
      }
  }
}, false);
