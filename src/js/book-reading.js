let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1ODk3OTIyOTEsImV4cCI6MTU5MDM5NzA5MSwiaWF0IjoxNTg5NzkyMjkxfQ.vnAJKW8s1-ab1wsqiobVZOFcKBgkAW2ts9k7PfZV0i0';
let bookID = 43;
let pageNumber = 19;
let note = 'Test Note';
let color = 'black';
let startIndex = 89;
let lastIndex = 189;
let totalPageNumber = 0;

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
  var url2 = 'http://api.semendel.com/api/identity/addusernote?bookId=43&page=17&note=Note%20Test&color=red&startIndex=15&lastIndex=45';

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
      var pageNumber = ui.value;
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

// function getSelectionText() {
//   var text = '';
//   var activeEl = document.activeElement;
//   var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;

//   $('.book-content').each(function () {
//     var activeEl = $(this).find('*')[0];

//     console.log(document.getSelection());

//     text = $(activeEl).text().slice(activeEl.selectionStart, activeEl.selectionEnd);
//   });

//   // if (activeElTagName == 'textarea' || (activeElTagName == 'input' && /^(?:text|search|password|tel|url)$/i.test(activeEl.type) && typeof activeEl.selectionStart == 'number')) {
//   // } else if (window.getSelection) {
//   //   text = window.getSelection().toString();
//   // }
//   return text;
// }

document.onmouseup = document.onkeyup = document.onselectionchange = function () {
  // $('#sel').text(window.getSelection().anchorOffset);
  $('#sel').text(getSelectionText());
  // console.log(getSelectionText());
};

window.onload = function () {
  setMarks();
};

function setMarks() {
  var markLabels = [
    { text: 'cinâyetini', color: 'red' },
    { text: 'Yahûdîlerin', color: 'blue' },
    { text: 'Ísâ', color: 'yellow' },
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
