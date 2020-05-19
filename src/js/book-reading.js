let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1ODk5MDA3NjQsImV4cCI6MTU5MDUwNTU2NCwiaWF0IjoxNTg5OTAwNzY0fQ.0_0cWoVCDqwf782ODk6kLA5QEh7UQC-wkgMhZDwQOCY';
let bookID = 43;
let pageNumber = 19;
let note = 'Test Note';
let color = 'black';
let startIndex = 89;
let lastIndex = 189;
let totalPageNumber = 0;
var ww = $(window).outerWidth();
var mouseupEvent = 'touchend mouseup';
var markLabels = [];

// Text selecting functions

function getSelectionText() {
  'use strict';

  var text = '';
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text;
  }

  return text;
}

$('body').click(function (e) {
  var isFontPropsPopover = !$(e.target).closest('.btn--font-props').siblings().closest('.popovers').length && !$(e.target).closest('.popovers').hasClass('is-shown');
  var isCustomizePopover = !$(e.target).closest('body').find('.popovers--sm.is-shown').length;

  if (isFontPropsPopover) {
    $('.popovers').removeClass('is-shown');
  }
});

function initBookContentMenus() {
  $('.book-content *').on(mouseupEvent, function (e) {
    var $popoversSm = $('.popovers--sm');
    var pageX = ww > 768 ? e.pageX - 100 : e.pageX / 1.875;
    var pageY = ww > 768 ? e.pageY + 10 : e.pageY;

    $popoversSm.css({ top: pageY + 'px', left: pageX + 'px' });

    var selectedText = getSelectionText();
    // var defaultColor = 'green';

    if (selectedText != '') {
      $popoversSm.addClass('is-shown');
    }
  });

  $('[class*=color-pick--]').on('click', function (e) {
    e.preventDefault();
    var thisColor = $(this).data('color');

    var obj = {
      text: selectedText,
      color: thisColor,
      startIndex: window.getSelection().anchorOffset,
      lastIndex: window.getSelection().extentOffset,
    };

    console.log(window.getSelection(), obj.lastIndex);

    // postToHighlight(obj.text, obj.color, obj.startIndex, obj.lastIndex);
  });
}

function getHighlights(pageNumber) {
  fetch('http://api.semendel.com/api/identity/listusernote', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      x.data.forEach(function (e) {
        if (e.pageNumber === pageNumber) {
          console.log(e);

          var selection = e.startIndex;
          var selectedText = e.note;

          console.log(selection, selectedText);

          // var span = document.createElement('span');
          // span.style.backgroundColor = 'yellow';

          // span.appendChild(selectedText);

          // this.parentNode.insertBefore(document.createTextNode(this.innerHTML), this);
          // this.parentNode.removeChild(this);
          // selection.insertNode(span);

          // var val = e.note;
          // var color = e.color;
          // $('.book-content').mark(val, {
          //   element: 'span',
          //   className: color,
          // });
        }
      });
    })
    .catch(e => console.error(e));
}

function postToHighlight(note, color, startIdx, lastIdx) {
  var url = 'http://api.semendel.com/api/identity/addusernote?bookId=43&page=' + pageNumber + '&note=' + note + '&color=' + color + '&startIndex=' + startIdx + '&lastIndex=' + lastIdx;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(x => console.log(x))
    .catch(e => console.error(e));
}

function getFetchByUrl(url, haveToken) {
  var response = null;

  if (haveToken) {
    fetch(url, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(x => x.json())
      .then(x => console.log(x))
      .catch(e => console.error(e));
  } else {
    fetch(url)
      .then(function (res) {
        response = res.json();
      })
      .then(function (data) {
        response = data.json();
      });
  }
}

$.ajax({
  dataType: 'json',
  url: 'http://api.semendel.com/api/list/book?bookId=43',
  type: 'get',
  async: false,
  success: function (data) {
    totalPageNumber = data.pageCount;
  },
});

function getPageOfBook(pageNumber, bookID) {
  var url = 'http://api.semendel.com/api/list/bookpage?bookId=' + bookID + '&page=' + pageNumber;
  // var url2 = 'http://api.semendel.com/api/identity/addusernote?bookId=43&page=17&note=Note%20Test&color=red&startIndex=15&lastIndex=45';

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      $('.book-content').each(function () {
        $(this).empty();
        $(this).append(data.pageContent);
        $(this).append(data.pageContentClear);
      });

      initBookContentMenus();
    });
}

$('.book-content').each(function () {
  $(this).siblings().find('.total').text(totalPageNumber);

  $('.book-pagining').slider({
    step: 1,
    min: 1,
    max: totalPageNumber,
    value: 1,
    slide: function (event, ui) {
      pageNumber = ui.value;
      getPageOfBook(pageNumber, bookID);

      $('.book-pagining .current').text(pageNumber);
    },
    create: function (event, ui) {
      getPageOfBook(pageNumber, bookID);
    },
  });

  $('.book-pagining .current').text(pageNumber);
});

$('div.context').mark('text', {
  element: 'span',
  className: 'highlight',
});

$('.add-brackets').on('click', function (e) {
  e.stopPropagation();

  var url2 = 'http://api.semendel.com/api/identity/listusernote';

  var url = 'http://api.semendel.com/api/identity/addusernote?bookId=43&page=17&note=NoteTest&color=red&startIndex=15&lastIndex=45';

  fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => console.log(x))
    .catch(e => console.error(e));
});

$('.btn--font-props').on('click', function (e) {
  e.preventDefault();

  $(this).siblings().toggleClass('is-shown');
});

$('#selectFontFamily').change(function () {
  var selectedFamily = $(this).val();

  $('.book-content').attr('class', 'book-content ' + selectedFamily);
});

var staticVal = 6;

$('.props-font-size > *').on('click', function () {
  var isMinus = $(this).hasClass('font-size-minus');
  var val = $(this).data('val');

  if (isMinus && staticVal > 0) {
    staticVal = staticVal + val;
  } else if (!isMinus && staticVal < 8) {
    staticVal = staticVal + val;
  }

  var css = 'fs-1-' + staticVal;
  $('.book-content').attr('class', 'book-content ff-georgia ' + css);
});

window.onload = function () {
  setMarks();
};

function setMarks() {
  var markLabels = [
    { text: 'cinâyetini', color: 'red' },
    { text: 'Yahûdîlerin', color: 'blue' },
    { text: 'Ísâ', color: 'yellow' },
    { text: 'Esse temporibus', color: 'green' },
    // { text: 'Yahûdîlerin elinden kurtararak onu rûhen ve ceseden rahmetiyle semâya kaldırdı.', color: 'red' },
  ];

  markLabels.forEach(function (e) {
    var val = e.text;
    var color = e.color;

    $('.book-content').mark(val, {
      element: 'span',
      className: color,
    });
  });
}

$('.popovers--sm').each(function () {
  var $this = $(this);

  $('[data-btn="highlight"]').on('click', function () {
    $this.addClass('expanded');
  });
});
