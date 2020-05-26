let prevUrl = '/';

let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1OTA0MDY5MDEsImV4cCI6MTU5MTAxMTcwMSwiaWF0IjoxNTkwNDA2OTAxfQ.voj4YI4xD4y1Not4dpH381g-Hgv_nsS4cTV-wfSRWkk';
let bookID = 22;
let pageNumber = 1;
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
var endCoords = {};

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

// Text selecting functions

function getPageOfBook(pageNumber, bookID) {
  var url = 'http://api.semendel.com/api/list/bookpage?bookId=' + bookID + '&page=' + pageNumber;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var ww = $(window).outerWidth();

      $('.book-content').empty();

      if (ww < 1279.99) {
        data.forEach(function (e, idx) {
          $('.book-content').append(e.pageContent);
        });
      } else {
        data.forEach(function (e, idx) {
          if (idx == 0) {
            $('.book-content').append("<div class='row'><div class='col-12 col-xl-6'>" + e.pageContent + '</div></div>');
          } else {
            $('.book-content > .row > .col-12').after("<div class='col-12 col-xl-6'>" + e.pageContent + '</div>');
          }
        });
      }

      initBookContentMenus();
      getHighlights(pageNumber);

      document.addEventListener('mouseup', reportSelection, false);

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

    // console.log(startIndex, lastIndex);
  }
}

function postToHighlight(note, color, startIdx, lastIdx) {
  var url = 'http://api.semendel.com/api/identity/addusernote?bookId=' + bookID + '&page=' + pageNumber + '&note=' + note + '&color=' + color + '&startIndex=' + startIdx + '&lastIndex=' + lastIdx;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(function (e) {
      // console.log(e);
    })
    .then(function (e) {
      getHighlights(pageNumber);
    })
    .catch(error => {
      console.log(error);
    });
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

    // console.log(obj.text, thisColor, startIndex, lastIndex);

    postToHighlight(obj.text, thisColor, startIndex, lastIndex);

    $('.popovers--sm').removeClass('is-shown');
  });
}

function listUserBooks() {
  fetch('http://api.semendel.com/api/identity/listuserbook', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(x => console.log(x));
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
        if (e.bookId == bookID && e.pageNumber === pageNumber) {
          results.push({ offset: e.startIndex, length: e.lastIndex - e.startIndex, color: e.color, note: e.note });
          ranges.push({ start: e.startIndex, length: e.lastIndex - e.startIndex });
        }
      });

      $bookContent.markRanges(ranges, {
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
        console.log(e, bid, pnum);

        if (e.bookId == bid && e.pageNumber == pnum) {
          $('.btn--brackets').addClass('bookmarked');
        } else {
          $('.btn--brackets').removeClass('bookmarked');
        }
      });
    })
    .catch(error => {
      console.log(error);
    });
}

function setMinHeight() {
  var calcAmount = 0;
  var bookReadTopMenuHeight = $('.book-read-top-menu').outerHeight(true) + 'px';
  var bookControls = $('.book-content').next().outerHeight(true) + 'px';
  var bookpaging = $('.book-pagining').outerHeight(true) + 'px';

  let root = document.documentElement;
  root.style.setProperty('--calcAmount', 'calc((var(--vh, 1vh) * 100) - (' + bookReadTopMenuHeight + ' + ' + bookpaging + ' + ' + bookControls + ' + 7.5rem))');
}

function submenuInit() {
  // $('.book-read-submenu').each(function () {
  //   var $bookReadList = $(this).find('.book-read-list');
  //   var $bookReadTabsContent = $('.book-read-tabs');
  //   $bookReadList.find('.book-read-list-item.active').each(function () {
  //     var activeTab = $(this).data('showntab');
  //     $bookReadTabsContent.find('> *').removeClass('is-shown');
  //     $bookReadTabsContent.find('> .' + activeTab).addClass('is-shown');
  //     switch (activeTab) {
  //       case 'notes':
  //         url = 'http://api.semendel.com/api/identity/listusernote';
  //         break;
  //       case 'bookmarks':
  //         url = 'http://api.semendel.com/api/identity/listuserbracket';
  //         break;
  //       case 'fihrist':
  //         url = 'http://api.semendel.com/api/list/bookindexes?bookId=' + bookID;
  //         break;
  //     }
  //     if (activeTab != 'reading') {
  //       getAllProps(url, activeTab, bookID);
  //     }
  //   });
  //   $bookReadList.find('.book-read-list-item:not([non])').on('click', function () {
  //     var activeTab = $(this).data('showntab');
  //     $bookReadList.find('> *').removeClass('active');
  //     $(this).addClass('active');
  //     $bookReadTabsContent.find('> *').removeClass('is-shown');
  //     $bookReadTabsContent.find('> .' + activeTab).addClass('is-shown');
  //     switch (activeTab) {
  //       case 'notes':
  //         url = 'http://api.semendel.com/api/identity/listusernote';
  //         break;
  //       case 'bookmarks':
  //         url = 'http://api.semendel.com/api/identity/listuserbracket';
  //         break;
  //       case 'fihrist':
  //         url = 'http://api.semendel.com/api/list/bookindexes?bookId=' + bookID;
  //         break;
  //     }
  //     if (activeTab != 'reading') {
  //       getAllProps(url, activeTab, bookID);
  //     }
  //   });
  // });
}

function changePageNumber(pageNumber) {
  $('.book-pagining').find('.current').text(pageNumber);
  $('.book-pagining .pagesLeft i').text(totalPageNumber - pageNumber);
  $('.book-pagining').slider('value', pageNumber);

  if ($(window).outerWidth() < 768) {
    if (document.documentElement.scrollTop || document.body.scrollTop > 500) {
      $('html,body').animate(
        {
          scrollTop: 0,
        },
        500,
      );
    }
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

document.addEventListener('DOMContentLoaded', function () {
  setMinHeight();
});

$(window).on('resize oriantedChange', function () {
  setMinHeight();
});

$('body').hasClass('mode--reading') ? $('.main-section').parent().attr('class', 'col-12') : '';

$('body').click(function (e) {
  var isFontPropsPopover = !$(e.target).closest('[class*=btn--]').siblings().closest('.popovers').length && !$(e.target).closest('.popovers').hasClass('is-shown');
  var isCustomizePopover = !$(e.target).closest('body').find('.popovers--sm.is-shown').length;

  if (isFontPropsPopover) {
    $('.popovers').removeClass('is-shown');
  }
});

$(document)
  .on('mouseover', function (e) {
    if ($(e.target).hasClass('book-read-top-menu')) {
      $(e.target).siblings().addClass('is-shown');
    }
  })
  .on('mouseleave', function (e) {
    var $target = $(e.target);
    if (!$target.hasClass('book-read-top-menu') || !$target.hasClass('book-read-submenu')) {
      setTimeout(() => {
        $(this).siblings().removeClass('is-shown');
      }, 2000);
    }
  });

$('.book-content').each(function () {
  $('.book-pagining .total').text(totalPageNumber);

  $('.book-pagining').slider({
    step: 1,
    min: 1,
    max: totalPageNumber,
    value: pageNumber,
    animate: 'slow',
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
    change: function (e, ui) {
      $('.book-pagining   .current-2').html(ui.value);
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
    .then(function (x) {
      console.log(x);

      getBookmarks(bookID, pageNumber);
    })
    .catch(e => console.error(e));
});

$('.book-content').bind('touchmove', function (event) {
  endCoords = event.originalEvent.targetTouches[0];
});

// $('.book-content').bind('touchend', function (event) {
//   if (endCoords.pageY - endCoords.pageX > 50) {
//     pageNumber = pageNumber + 1;

//     getPageOfBook(pageNumber, bookID);
//     changePageNumber(pageNumber);
//   }
// });

$('.book-read-top-menu [class*=btn--]').on('click', function (e) {
  e.preventDefault();

  function getPos(el) {
    // yay readability
    for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return { x: lx, y: ly };
  }

  var left = $(this).offset().left;
  var wwouterWidth = $(window).outerWidth();

  $('.popovers').removeClass('is-shown');
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

  $('[data-btn="highlight"]')
    .parent()
    .siblings()
    .on('click', function () {
      $('[data-showntab]').removeClass('active');
      $('[data-showntab="notes"]').addClass('active');
      submenuInit();
      $this.removeClass('is-shown');
    });
});

submenuInit();

function offsetMenuContentInit(itemType, listObj) {
  var url = '';

  switch (itemType) {
    case 'notes':
      url = 'http://api.semendel.com/api/identity/listusernote';
      break;
    case 'bookmarks':
      url = 'http://api.semendel.com/api/identity/listuserbracket';
      break;
    case 'fihrist':
      url = 'http://api.semendel.com/api/list/bookindexes?bookId=' + bookID;
      break;
  }

  fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      listObj.empty();

      if (itemType == 'fihrist') {
        x.forEach(function (e) {
          listObj.append('<li><a data-pagenumber="' + e.pageNumber + '"><h3>' + e.indexTitle + '</h3><span data-props="pn">' + e.pageNumber + '</span></a></li>');
        });
      } else {
        var data = x.data;

        data.forEach(function (e) {
          var title = '';
          var note = '';

          if (e.bookId == bookID) {
            if (e.pageNumber != undefined) title = '<h3>' + e.pageNumber + '. Sayfa</h3>';
            if (e.note != undefined) note = '<p>' + e.note + '</p>';

            if (title != '' || note != '') {
              listObj.append('<li ' + (e.color != undefined ? 'data-color=' + e.color : '') + '><a data-pagenumber="' + e.pageNumber + '">' + title + note + '</a></li>');
            }
          }
        });
      }

      listObj.find('a').on('click', function () {
        var pn = $(this).data('pagenumber');
        getPageOfBook(pn, bookID);
        pageNumber = pn;
        changePageNumber(pageNumber);

        $('.offset-menu-block').removeClass('is-shown');

        $('html,body').animate(
          {
            scrollTop: $('.book-content').offset().top - 100,
          },
          250,
        );
      });
    });
}

function offsetMenuInit() {
  $('.offset-menu').each(function () {
    var $this = $(this);
    var $thisMenuItem = $this.find('.offset-menu-item');
    var $thisActiveMenuItem = $this.find('.offset-menu-item.active');
    var $offsetMenuBlock = $this.closest('.offset-menu-block');

    $thisActiveMenuItem.each(function () {
      var $this = $(this);
      var thisItemType = $(this).data('item-type');

      offsetMenuContentInit(thisItemType, $this.find('.underbordered-list'));
    });

    $thisMenuItem.on('click', function () {
      var $this = $(this);
      var thisItemType = $(this).data('item-type');

      if (!$this.hasClass('active')) {
        $thisMenuItem.removeClass('active');
        $this.addClass('active');
        offsetMenuContentInit(thisItemType, $this.find('.underbordered-list'));
      } else {
        // $this.toggleClass('active');
      }
    });

    $offsetMenuBlock.on('click', function (e) {
      var target = $(e.target);

      if (target.closest('.offset-menu').length == 0) {
        $offsetMenuBlock.removeClass('is-shown');
      }
    });

    $('.hamburger-icon > *').on('click', function (e) {
      $('.offset-menu-block').addClass('is-shown');
    });
  });
}

offsetMenuInit();

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return (
    evt.touches || evt.originalEvent.touches // browser API
  ); // jQuery
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    /*most significant*/
    if (xDiff > 0) {
      if (pageNumber < totalPageNumber) {
        pageNumber = pageNumber + 2;
        getPageOfBook(pageNumber, bookID);
        changePageNumber(pageNumber);
      }
    } else {
      if (pageNumber > 1) {
        pageNumber = pageNumber - 2;
        getPageOfBook(pageNumber, bookID);
        changePageNumber(pageNumber);
      }
    }
  } else {
    if (yDiff > 0) {
      /* up swipe */
    } else {
      /* down swipe */
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
}

$('.prev-icon,.btn--prev').on('click', function (e) {
  window.location.href = prevUrl;
});

$('.next-page').on('click', function () {
  if (pageNumber < totalPageNumber) {
    pageNumber = pageNumber + 2;
    getPageOfBook(pageNumber, bookID);
    changePageNumber(pageNumber);
  }
});

$('.prev-page').on('click', function () {
  if (pageNumber > 1) {
    pageNumber = pageNumber - 2;
    getPageOfBook(pageNumber, bookID);
    changePageNumber(pageNumber);
    $(this).removeClass('op-05');
  }
});
