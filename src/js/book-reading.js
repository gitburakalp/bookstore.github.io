let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1ODk5NzQ3OTUsImV4cCI6MTU5MDU3OTU5NSwiaWF0IjoxNTg5OTc0Nzk1fQ.JOwyP0a-98nPt6vJowjliqckgvG3QaZd6zzeM4LNX2w';
let bookID = 43;
let pageNumber = 90;
let note = 'Test Note';
let color = 'black';

var startIndex = 89;
var lastIndex = 189;

let totalPageNumber = 0;
var ww = $(window).outerWidth();
var mouseupEvent = 'touchend mouseup';
var markLabels = [];
var selectedText = '';

var staticVal = 6;

// Text selecting functions

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
      });

      initBookContentMenus();
      getHighlights(pageNumber);

      document.addEventListener(mouseupEvent, reportSelection, false);

      $('.book-content, .book-content *').bind('touchend', reportSelection);
    });
}

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

function getSelectionCharacterOffsetWithin(element) {
  var start = 0;
  var end = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != 'undefined') {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      start = preCaretRange.toString().length;
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      end = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != 'Control') {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint('EndToStart', textRange);
    start = preCaretTextRange.text.length;
    preCaretTextRange.setEndPoint('EndToEnd', textRange);
    end = preCaretTextRange.text.length;
  }
  return { start: start, end: end };
}

function reportSelection() {
  var selOffsets = getSelectionCharacterOffsetWithin(document.querySelector('.book-content'));
  selectedText = getSelectionText();

  if (selectedText != '') {
    startIndex = selOffsets.start;
    lastIndex = selOffsets.end;
  }
}

function postToHighlight(note, color, startIdx, lastIdx) {
  var url = 'http://api.semendel.com/api/identity/addusernote?bookId=' + bookID + '+&page=' + pageNumber + '&note=' + note + '&color=' + color + '&startIndex=' + startIdx + '&lastIndex=' + lastIdx;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(x => console.log(x));
  // .catch(e => console.error(e));
}

function initBookContentMenus() {
  var obj = null;

  $('.book-content, .book-content *').on(mouseupEvent, function (e) {
    var $popoversSm = $('.popovers--sm');
    var pageX = ww > 768 ? e.pageX - 100 : e.pageX / 1.875;
    var pageY = ww > 768 ? e.pageY + 10 : e.pageY;

    $popoversSm.removeClass('expanded');
    $popoversSm.css({ top: pageY + 'px', left: pageX + 'px' });

    // var defaultColor = 'green';

    selectedText = getSelectionText();

    obj = {
      text: selectedText,
      color: 'green',
    };

    if (selectedText != '') {
      $popoversSm.addClass('is-shown');
    } else {
      $popoversSm.removeClass('is-shown');
    }
  });

  $('[class*=color-pick--]').on('click', function (e) {
    e.preventDefault();
    var thisColor = $(this).data('color');

    postToHighlight(obj.text, thisColor, startIndex, lastIndex);
    getHighlights(pageNumber);

    $('.popovers--sm').removeClass('is-shown');
  });
}

function getHighlights(pageNumber) {
  var $bookContent = $('.book-content, .book-content *'),
    results = [],
    ranges = [];

  fetch('http://api.semendel.com/api/identity/listusernote', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      x.data.forEach(function (e) {
        if (e.pageNumber === pageNumber) {
          results.push({ offset: e.startIndex, length: e.lastIndex - e.startIndex, color: e.color, note: e.note });
          ranges.push({ start: e.startIndex, length: e.lastIndex - e.startIndex });
        }
      });

      $bookContent.unmark().markRanges(ranges, {
        debug: true,
        separateWordSearch: false,
        each: function (node, range) {
          var start = range.start;
          found =
            results.find(function (el) {
              return el.offset === start;
            }) || null;
          if (found) {
            node.classList.add(found.color);
          }
        },
      });
    })
    .catch(error => {
      reject(error);
    });
}

function getBookmarks(bid, pnum) {
  fetch('http://api.semendel.com/api/identity/listuserbracket', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      var data = x.data;

      data.forEach(function (e) {
        if (e.bookId == bid && e.pageNumber == pnum) {
          $('.btn--brackets').addClass('bookmarked');
        } else {
          $('.btn--brackets').removeClass('bookmarked');
        }
      });
    })
    .catch(error => {
      reject(error);
    });
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

$('body').hasClass('mode--reading') ? $('.main-section').parent().attr('class', 'col-12') : '';

$('body').click(function (e) {
  var isFontPropsPopover = !$(e.target).closest('.btn--font-props').siblings().closest('.popovers').length && !$(e.target).closest('.popovers').hasClass('is-shown');
  var isCustomizePopover = !$(e.target).closest('body').find('.popovers--sm.is-shown').length;

  if (isFontPropsPopover) {
    $('.popovers').removeClass('is-shown');
  }
});

$('.book-content').each(function () {
  $(this).siblings().find('.total').text(totalPageNumber);

  $('.book-pagining').slider({
    step: 1,
    min: 1,
    max: totalPageNumber,
    value: pageNumber,
    stop: function (event, ui) {
      pageNumber = ui.value;
      getPageOfBook(pageNumber, bookID);

      $('.book-pagining .current').text(pageNumber);
      $('.book-pagining .pagesLeft i').text(totalPageNumber - pageNumber);
      getBookmarks(bookID, pageNumber);
    },
    create: function (event, ui) {
      getPageOfBook(pageNumber, bookID);
      $('.book-pagining .pagesLeft i').text(totalPageNumber - pageNumber);
      getBookmarks(bookID, pageNumber);
    },
  });

  $('.book-pagining .current').text(pageNumber);
});

$('.add-brackets').on('click', function (e) {
  e.stopPropagation();

  var url = 'http://api.semendel.com/api/identity/adduserbracket?bookId=' + bookID + '&page=' + pageNumber;

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

$('[class*=color-circle--]').on('click', function () {
  var theme = $(this).attr('class').split('--')[1];

  $('body').attr('class', 'mode--reading theme--' + theme);
});

$('.popovers--sm').each(function () {
  var $this = $(this);

  $('[data-btn="highlight"]').on('click', function () {
    $this.addClass('expanded');
  });
});
