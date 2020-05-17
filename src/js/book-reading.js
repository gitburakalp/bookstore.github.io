let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjYiLCJuYmYiOjE1ODk3MjM1NDUsImV4cCI6MTU5MDMyODM0NSwiaWF0IjoxNTg5NzIzNTQ1fQ.6siYLl9QdJ8AFbgL2SrGdlFoOpufpTrzRwPuh38rHPU';
let bookID = 43;
let pageNumber = 35;
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
  $.ajax({
    dataType: 'json',
    url: 'http://api.semendel.com/api/list/bookpage?bookId=' + bookID + '&page=' + pageNumber,
    type: 'get',
    async: false,
    headers: {
      Authorization: 'Bearer ' + userToken,
    },
    success: function (data) {
      $('.book-content').each(function () {
        $(this).empty();
        $(this).append(data.pageContent);
        $(this).append(data.pageContentClear);
      });
    },
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
      getPageOfBook(1, bookID);
    },
  });
});

$('div.context').mark('text', {
  element: 'span',
  className: 'highlight',
});

$('.add-brackets').on('click', function (e) {
  e.stopPropagation();
});
