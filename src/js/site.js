const getCookie = key => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${key}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};
const createCookie = (key, value, days) => {
  var expires;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toGMTString();
  } else {
    expires = '';
  }
  document.cookie = key + '=' + value + expires + '; path=/';
};

function setLastReadBook(bookId) {
  var books = getCookie('books');
  if (books) {
    var items = books.split('_');
    items = jQuery.grep(items, function (n, i) {
      return parseInt(n) !== parseInt(bookId);
    });
    if (items.length > 4) {
      items.pop();
    }
    createCookie('books', bookId + '_' + items.join('_'));
  } else {
    createCookie('books', bookId);
  }
}

$('#accountModal').on('hide.bs.modal', function (x) {
  $('[class*=modal-body]').each(function (i, e) {
    $(e).removeClass('is-shown');
  });
});
$('#btnSignIn').on('click', function () {
  $('.modal-body__sign-in').addClass('is-shown');
});
$('#btnSignUp').on('click', function () {
  $('.modal-body__sign-up').addClass('is-shown');
});

$('img').on('error', function () {
  $(this).attr('src', '/storage/default.png');
});

$('.payment-tabs').each(function () {
  var $tabItems = $(this).find('.payment-tabs-item');
  var $paymentTabsContents = $('.payment-tabs-contents');
  var activeCss = 'active';

  $tabItems.each(function () {
    var $this = $(this);

    if ($this.hasClass(activeCss)) {
      var thisProp = $this.data('prop');
      $paymentTabsContents.find('.' + thisProp).addClass(activeCss);
    }
  });

  $tabItems.on('click', function () {
    var $this = $(this);
    $tabItems.removeClass(activeCss);
    $this.addClass(activeCss);

    var thisProp = $this.data('prop');
    $paymentTabsContents.find('> *').removeClass(activeCss);
    $paymentTabsContents.find('.' + thisProp).addClass(activeCss);
  });
});
