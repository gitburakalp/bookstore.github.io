//let prevUrl = '/';

// let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1OTA0MDY5MDEsImV4cCI6MTU5MTAxMTcwMSwiaWF0IjoxNTkwNDA2OTAxfQ.voj4YI4xD4y1Not4dpH381g-Hgv_nsS4cTV-wfSRWkk';
//let bookID = 22;
//let pageNumber = 1;
//let note = 'Test Note';
//let color = 'black';

//var startIndex = 89;
//var lastIndex = 189;

//let totalPageNumber = 0;
//var baseUrl = 'https://localhost:44365';
var baseUrl = 'https://api.semendel.com';
var ww = $(window).outerWidth();
var mouseupEvent = 'touchend mouseup';
var markLabels = [];
var selectedText = '';

var staticVal = 6;
var endCoords = {};
var bookPageNumber = "";

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

var bookmarks = [];
var noteHighlights = [];

// Text selecting functions

pageNumber = pageNumber - 1;

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getPageOfBook(pageNumber, bookID) {
  var url = baseUrl + '/api/list/bookpage?bookId=' + bookID + '&page=' + pageNumber;

  var $bookContent = $('.book-content');
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var ww = $(window).outerWidth();

      $bookContent.empty();
      data = data.sort(function (a, b) {
        return a.page < b.page ? -1 : 0;
      });

      data.forEach(function (e, idx) {
        e.pageContent = e.pageContent.replace(/<(?!img|b|\/b|mark|\/mark|edutooltip|\/edutooltip|a|\/a|table|\/table|tr|\/tr|td|\/td|p|\/p\s*\/?)[^>]+>/g, "");


        if (idx === 0) {
          $bookContent.append("<div class='row heading'><div class='col-12 text-center'><span>" + e.bookName + '</span></div></div>');
        }


        if (ww < 1279.99) {
          $bookContent.append("<div class='font-weight-bold'>" + e.page + '</div>');
          $bookContent.append(e.pageContent);
        } else {
          if (idx === 0) {
            $bookContent.append("<div class='row'><div class='col-12 col-lg-6'><div class='font-weight-bold book-page-number'>" + e.page + '</div>' + e.pageContent + '</div></div>');
          } else {
            $('.book-content > .row:not(.heading) > .col-12').after("<div class='col-12 col-lg-6'><div class='font-weight-bold text-right book-page-number'>" + e.page + '</div>' + e.pageContent + '</div>');
          }
        }
      });

      initBookContentMenus();
      bookmarkCheck();
      typeof noteHighlights !== undefined && typeof noteHighlights.data !== undefined && noteHighlights.data.length > 0 ? setHighlights() : '';

      changePageNumber(pageNumber);

      $("edutooltip").addClass("d-inline-block");
      $("edutooltip[title]").tooltip();

      document.addEventListener('mouseup', reportSelection, false);

      $('.book-content, .book-content *').bind('touchend', reportSelection);

      var keyword = getParameterByName('keyword');
      if (keyword !== '' && keyword !== null && keyword !== undefined) {
        $('.book-content').mark(keyword, {
          className: 'red',
        });
      }
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

    console.log(startIndex, lastIndex);
  }
}

function postToHighlight(note, color, startIdx, lastIdx) {
  var url = baseUrl + '/api/identity/addusernote?bookId=' + bookID + '&page=' + bookPageNumber + '&note=' + note + '&color=' + color + '&startIndex=' + startIdx + '&lastIndex=' + lastIdx;

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
      setHighlights();
    })
    .catch(error => {
      console.log(error);
    });
}

function initBookContentMenus() {
  var obj = null;

  $('.book-content, .book-content *').on(mouseupEvent, function (e) {

    bookPageNumber = $(e.target).closest(".col-lg-6").find(".book-page-number").text().trim();

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
    var thisPageNumber = $(this).closest("");

    postToHighlight(obj.text, thisColor, startIndex, lastIndex);

    $('.popovers--sm').removeClass('is-shown');
  });
}

function listUserBooks() {
  fetch(baseUrl + '/api/identity/listuserbook', '/identity/addusernote?bookId=', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(x => console.log(x));
}

var val = false;

Object.defineProperty(window, 'isLoadedHighlight', {
  get: function () {
    return val;
  },
  set: function (v) {
    val = !!v;

    setHighlights();
  },
});

function getHighlights() {
  fetch(baseUrl + '/api/identity/listusernote', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      noteHighlights = [];
      noteHighlights = x;

      isLoadedHighlight = true;
    });
}

function setHighlights() {
  var $bookContent = $('.book-content, .book-content *'),
    results = [],
    ranges = [];
  var previousPage = pageNumber % 2 === 1 ? pageNumber : pageNumber - 1;
  var nextPage = previousPage + 1;
  noteHighlights.data.forEach(function (e) {
    if (e.bookId == bookID && (e.pageNumber == previousPage || e.pageNumber == nextPage)) {
      results.push({
        offset: e.startIndex,
        length: e.lastIndex - e.startIndex,
        color: e.color,
        note: e.note,
      });
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
}

function getBookmarks(bid, pnum) {
  fetch(baseUrl + '/api/identity/listuserbracket', {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then(x => x.json())
    .then(function (x) {
      var data = x.data;

      bookmarks = [];
      bookmarks = data;
    })
    .catch(error => {
      console.log(error);
    });
}

function bookmarkCheck() {
  var isBookmarked = [];
  var previousPage = pageNumber % 2 === 1 ? pageNumber : pageNumber - 1;
  var nextPage = previousPage + 1;
  if (bookmarks.length != 0) {
    bookmarks.filter(function (data) {
      if (data.bookId == bookID && (data.pageNumber == previousPage || data.pageNumber == nextPage)) {
        isBookmarked.push(data);
      }
    });
  }

  isBookmarked.length != 0 ? $('.add-brackets').addClass('bookmarked') : $('.add-brackets').removeClass('bookmarked');
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
  //         url = 'https://api.semendel.com/api/identity/listusernote';
  //         break;
  //       case 'bookmarks':
  //         url = 'https://api.semendel.com/api/identity/listuserbracket';
  //         break;
  //       case 'fihrist':
  //         url = 'https://api.semendel.com/api/list/bookindexes?bookId=' + bookID;
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
  //         url = 'https://api.semendel.com/api/identity/listusernote';
  //         break;
  //       case 'bookmarks':
  //         url = 'https://api.semendel.com/api/identity/listuserbracket';
  //         break;
  //       case 'fihrist':
  //         url = 'https://api.semendel.com/api/list/bookindexes?bookId=' + bookID;
  //         break;
  //     }
  //     if (activeTab != 'reading') {
  //       getAllProps(url, activeTab, bookID);
  //     }
  //   });
  // });
}

function changePageNumber(pageNumber) {
  var currentPage = $('.book-pagining').find('.current');
  var leftPage = $('.book-pagining .pagesLeft i');
  currentPage.text(pageNumber);
  leftPage.text(totalPageNumber - pageNumber);
  $('.book-pagining').slider(
    {
      slide: function (event, ui) {
        var currentIndex = $('.book-pagining').slider('values', 0);
        currentPage.text(currentIndex);
        leftPage.text(totalPageNumber - currentIndex);

        $('.ui-slider-handle').empty();
        $('.ui-slider-handle').prepend('<span>' + currentIndex + '</span>');
      },
    },
    'value',
    pageNumber,
  );

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

//$.ajax({
//    dataType: 'json',
//    url: 'https://api.semendel.com/api/list/book?bookId=43',
//    type: 'get',
//    async: false,
//    success: function (data) {
//        totalPageNumber = data.pageCount;
//    },
//});

document.addEventListener('DOMContentLoaded', function () {
  setMinHeight();
});

$(window).on('resize oriantedChange', function () {
  setMinHeight();
});

$('body').hasClass('mode--reading') ? $('.main-section').parent().attr('class', 'col-12') : '';

$('body').click(function (e) {
  console.log(1);
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
    },
    create: function (event, ui) {
      getBookmarks(bookID, pageNumber);
      getHighlights(pageNumber);
      getPageOfBook(pageNumber, bookID);

      $('.book-pagining .pagesLeft i').text(totalPageNumber - pageNumber);
    },
    change: function (e, ui) {
      $('.book-pagining   .current-2').html(ui.value);
    },
  });

  $('.book-pagining .current').text(pageNumber);
});

$('.add-brackets').on('click', function (e) {
  var $this = $(this);
  var isBookmarked = $this.hasClass('bookmarked');
  e.stopPropagation();

  function bookmarkFunction() {
    var url = isBookmarked ? baseUrl + '/api/identity/removeuserbracket?bookId=' + bookID + '&page=' + pageNumber : baseUrl + '/api/identity/adduserbracket?bookId=' + bookID + '&page=' + pageNumber;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(function (x) {
        getBookmarks(bookID, pageNumber);

        isBookmarked ? $this.removeClass('bookmarked') : '';
      })
      .catch(e => console.error(e));
  }

  bookmarkFunction();
  bookmarkCheck();
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
  $('[data-item-type="fihrist"]').trigger('click');
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

function offsetMenuContentInit(itemType, listObj, $relatedItem) {
  var url = '';
  var errorMessages = {
    bookmarks: 'Eklenmiş Ayraç Bulunmamaktadır.',
    notes: 'Eklenmiş Not Bulunmamaktadır.',
  };

  $('.error-message').remove();

  switch (itemType) {
    case 'notes':
      url = baseUrl + '/api/identity/listusernote';
      break;
    case 'bookmarks':
      url = baseUrl + '/api/identity/listuserbracket';
      break;
    case 'fihrist':
      url = baseUrl + '/api/list/bookindexes?bookId=' + bookID;
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

        $('.offset-menu-block').removeClass('is-shown');

        $('html,body').animate(
          {
            scrollTop: $('.book-content').offset().top - 100,
          },
          250,
        );
      });

      $('.offset-menu-content').removeClass('is-loading');
      $relatedItem.addClass('is-shown');

      $relatedItem.find('.underbordered-list > *').length == 0 ? $relatedItem.append('<p class="error-message">' + errorMessages[itemType] + '</p>') : '';
    });
}

function offsetMenuInit() {
  $('.offset-menu').each(function () {
    var $this = $(this);
    var $thisMenuItem = $this.find('.offset-menu-item');
    var $thisActiveMenuItem = $this.find('.offset-menu-item.active');
    var $offsetMenuBlock = $this.closest('.offset-menu-block');

    var $offsetMenuContents = $('.offset-menu-contents');

    $thisActiveMenuItem.each(function () {
      var $this = $(this);
      var thisItemType = $(this).data('item-type');

      $offsetMenuContents.find('.' + thisItemType).addClass('is-shown');

      offsetMenuContentInit(thisItemType, $('.offset-menu-contents').find('.' + thisItemType + ' .underbordered-list'));
    });

    $thisMenuItem.on('click', function () {
      var $this = $(this);
      var thisItemType = $(this).data('item-type');

      if (!$this.hasClass('active')) {
        $offsetMenuContents.find('> *').removeClass('is-loading');
        $offsetMenuContents.find('> *').removeClass('is-shown');
        $thisMenuItem.removeClass('active');
        $this.addClass('active');

        $offsetMenuContents.find('.' + thisItemType).addClass('is-loading');

        offsetMenuContentInit(thisItemType, $('.offset-menu-contents').find('.' + thisItemType + ' .underbordered-list'), $offsetMenuContents.find('.' + thisItemType));
      } else {
        // $this.toggleClass('active');
      }
    });

    $offsetMenuBlock.on('click', function (e) {
      var target = $(e.target);

      if (target.closest('.offset-menu').length == 0 && target.closest('.offset-menu-contents').length == 0) {
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
      $('.book-read-block').addClass('on-hide');
    } else {
      $('.book-read-block').removeClass('on-hide');
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
}

$('.next-page').on('click', function () {
  if (pageNumber < totalPageNumber) {
    pageNumber = pageNumber % 2 == 0 ? pageNumber + 1 : pageNumber + 2;
    getPageOfBook(pageNumber, bookID);
    changePageNumber(pageNumber);
    $('.book-pagining').slider('value', pageNumber);
  }
});

$('.prev-page').on('click', function () {
  if (pageNumber > 1) {
    pageNumber = pageNumber % 2 == 0 ? pageNumber - 1 : pageNumber - 2;
    getPageOfBook(pageNumber, bookID);
    changePageNumber(pageNumber);
    $(this).removeClass('op-05');
    $('.book-pagining').slider('value', pageNumber);
  }
});

$('.load-page').on('click', function (e) {
  e.preventDefault();
  var pn = parseInt($('#inpPageNumber').val());

  pageNumber = pn;
  getPageOfBook(pn, bookID);
  changePageNumber(pn);
  $('.book-pagining').slider('value', pn);
  $(this).closest('.offset-menu-block').removeClass('is-shown');
});
