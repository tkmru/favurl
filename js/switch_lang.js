$(document).ready(function() {
  'use strict';
	if ((localStorage.lang === undefined && navigator.language === 'ja') || localStorage.lang === 'ja') {
		$('#en').css('display', 'none');
  } else {
    $('#jp').css('display', 'none');
  }
});
