var movie_radio_en = document.getElementsByName("movie_radio_en");
var pic_radio_en = document.getElementsByName("pic_radio_en");
var twi_radio_en = document.getElementsByName("twi_radio_en");
var loc_radio_en = document.getElementsByName("loc_radio_en");
var auto_open_en = document.getElementsByName("auto_open_en");
var displayURL_en = document.getElementsByName('displayURL_en');
var notification_en = document.getElementsByName('notification_en');
var lang_radio_en = document.getElementsByName("lang_radio_en");

var movie_radio_jp = document.getElementsByName("movie_radio_jp");
var pic_radio_jp = document.getElementsByName("pic_radio_jp");
var twi_radio_jp = document.getElementsByName("twi_radio_jp");
var loc_radio_jp = document.getElementsByName("loc_radio_jp");
var auto_open_jp = document.getElementsByName("auto_open_jp");
var displayURL_jp = document.getElementsByName('displayURL_jp');
var notification_jp = document.getElementsByName('notification_jp');
var lang_radio_jp = document.getElementsByName("lang_radio_jp");


movie_radio_en[0].onclick = movie_radio_jp[0].onclick = function() {
    localStorage["remove_movie"] = "on";
}

movie_radio_en[1].onclick = movie_radio_jp[1].onclick = function() {
    localStorage["remove_movie"] = "off";
}


pic_radio_en[0].onclick = pic_radio_jp[0].onclick = function() {
    localStorage["remove_pic"] = "on";
}

pic_radio_en[1].onclick = pic_radio_jp[1].onclick = function() {
    localStorage["remove_pic"] = "off";
}


twi_radio_en[0].onclick = twi_radio_jp[0].onclick = function() {
    localStorage["remove_twi"] = "on";
}

twi_radio_en[1].onclick = twi_radio_jp[1].onclick = function() {
    localStorage["remove_twi"] = "off";
}


loc_radio_en[0].onclick = loc_radio_jp[0].onclick = function() {
    localStorage["remove_loc"] = "on";
}

loc_radio_en[1].onclick = loc_radio_jp[1].onclick = function() {
    localStorage["remove_loc"] = "off";
}


auto_open_en[0].onclick = auto_open_jp[0].onclick = function() {
    localStorage["auto_open"] = "on";
}

auto_open_en[1].onclick = auto_open_jp[1].onclick = function() {
    localStorage["auto_open"] = "off";
}


displayURL_en[0].onclick = displayURL_jp[0].onclick = function(){
    localStorage['displayURL'] = 'brief';
}

displayURL_en[1].onclick = displayURL_jp[1].onclick = function(){
    localStorage['displayURL'] = 'original';    
}


notification_en[0].onclick = notification_jp[0].onclick = function(){
    localStorage['notification'] = 'on';
}

notification_en[1].onclick = notification_jp[1].onclick = function(){
    localStorage['notification'] = 'off';
}


lang_radio_en[0].onclick = lang_radio_jp[0].onclick = function() {
    localStorage["lang"] = "en";
    location.reload();
}

lang_radio_en[1].onclick = lang_radio_jp[1].onclick = function() {
    localStorage["lang"] = "ja";
    location.reload();
}


window.addEventListener("load",function(event){
    switch(localStorage["remove_movie"]) {
        case "on":
            movie_radio_en[0].checked = movie_radio_jp[0].checked = true;
            break;
            
        case "off":
            movie_radio_en[1].checked = movie_radio_jp[1].checked = true;
            break;

        default:
            movie_radio_en[0].checked = movie_radio_jp[0].checked = true;
            break;
    }
    
    switch(localStorage["remove_pic"]) {
        case "on":
            pic_radio_en[0].checked = pic_radio_jp[0].checked = true;
            break;
            
        case "off":
            pic_radio_en[1].checked = pic_radio_jp[1].checked = true;
            break;
            
        default:
            pic_radio_en[0].checked = pic_radio_jp[0].checked = true;
            break;
    }

    switch(localStorage["remove_twi"]) {
        case "on":
            twi_radio_en[0].checked = twi_radio_jp[0].checked = true;
            break;
            
        case "off":
            twi_radio_en[1].checked = twi_radio_jp[1].checked = true;
            break;
            
        default:
            twi_radio_en[0].checked = twi_radio_jp[0].checked = true;
            break;
    }

    switch(localStorage["remove_loc"]) {
        case "on":
            loc_radio_en[0].checked = loc_radio_jp[0].checked = true;
            break;
            
        case "off":
            loc_radio_en[1].checked = loc_radio_jp[1].checked = true;
            break;
            
        default:
            loc_radio_en[0].checked = loc_radio_jp[0].checked = true;
            break;
    }

    switch(localStorage["auto_open"]) {
        case "on":
            auto_open_en[0].checked = auto_open_jp[0].checked = true;
            break;
            
        case "off":
            auto_open_en[1].checked = auto_open_jp[1].checked = true;
            break;
            
        default:
            auto_open_en[1].checked = auto_open_jp[1].checked = true;
            break;
    }

    switch(localStorage['displayURL']){
        case 'brief':
            displayURL_en[0].checked = displayURL_jp[0].checked = true;
            break;

        case 'original':
            displayURL_en[1].checked = displayURL_jp[1].checked = true;
            break;

        default:
            displayURL_en[0].checked = displayURL_jp[0].checked = true;
            break;            
    }

    switch(localStorage['notification']){
        case 'on':
            notification_en[0].checked = notification_jp[0].checked = true;
            break;

        case 'off':
            notification_en[1].checked = notification_jp[1].checked = true;
            break;

        default:
            notification_en[0].checked = notification_jp[0].checked = true;
            break;            
    }

    switch(localStorage["lang"]) {
        case "en":
            lang_radio_en[0].checked = lang_radio_jp[0].checked = true;
            break;
            
        case "ja":
            lang_radio_en[1].checked = lang_radio_jp[1].checked = true;
            break;
            
        default:
            switch(navigator.language) { // for browzer language setting
                case "ja":
                    localStorage["lang"] = "ja"
                    lang_radio_en[1].checked = lang_radio_jp[1].checked = true;
                    break;
                    
                default:
                    localStorage["lang"] = "en"
                    lang_radio_en[0].checked = lang_radio_jp[0].checked = true;
                    break;
            }
    }
}, false);
