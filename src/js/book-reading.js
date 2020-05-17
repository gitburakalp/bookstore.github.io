let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1ODk3MjM1NDUsImV4cCI6MTU5MDMyODM0NSwiaWF0IjoxNTg5NzIzNTQ1fQ.6siYLl9QdJ8AFbgL2SrGdlFoOpufpTrzRwPuh38rHPU';
let bookID = 43;
let pageNumber = 19;
let note = 'Test Note';
let color = 'black';
let startIndex = 89;
let lastIndex = 189;
let totalPageNumber = 0;

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
  // $.ajax({
  //   dataType: 'json',
  //   url: 'http://api.semendel.com/api/list/bookpage?bookId=' + bookID + '&page=' + pageNumber,
  //   type: 'get',
  //   async: false,
  //   headers: {
  //     Authorization: 'Bearer ' + userToken,
  //   },
  //   success: function (data) {
  //     $('.book-content').each(function () {
  //       $(this).empty();
  //       $(this).append(data.pageContent);
  //       $(this).append(data.pageContentClear);
  //     });
  //   },
  // });

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

  var url = 'http://api.semendel.com/api/identity/addusernote?bookId=43&page=17&note=NoteTest&color=red&startIndex=15&lastIndex=45';

  var h = new Headers();

  h.append('Authentication', `Bearer ${userToken}`);

  let req = new Request(url, {
    method: 'POST',
    mode: 'cors',
  });

  fetch(req).then(function (data) {
    console.log(data);
  });
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
