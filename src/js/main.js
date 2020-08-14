var slideSpaceMobile = 8;
var slideSpaceTablet = 10;
var slideSpaceDesktop = 18;
var ww = $(window).outerWidth();
let root = document.documentElement;

var bgColorList = [];

var dynamicModalHtml = `<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" data-modal-title></h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><i class="fal fa-times-circle"></i></button></div><div class="modal-body" data-modal-body></div></div></div></div>`;

document.addEventListener('DOMContentLoaded', function () {
  $('[href*="#"]').click(function (event) {
    event.preventDefault();
  });

  $('.books-title > .description').each(function () {
    var $el = $(this).closest('a');
    $el.attr('data-toogle', 'tooltip');
    $el.attr('title', $(this).text().trim());

    $el.tooltip();
  });

  $('.summary').each(function () {
    $('body').append(dynamicModalHtml);

    $(this)
      .find('.summary-products')
      .each(function () {
        $(this).attr('data-toggle', 'modal');
        $(this).attr('data-target', '#dynamicModal');
      });

    $('#dynamicModal').on('shown.bs.modal', function (e) {
      var $relatedTarget = $(e.relatedTarget);

      var bookTitle = $relatedTarget.data('book-title');
      var bookDescription = $relatedTarget.data('book-description');

      $('#dynamicModal [data-modal-title]').text(bookTitle);
      $('#dynamicModal [data-modal-body]').text(bookDescription);
    });
  });

  $(document.styleSheets[0].rules).each(function (idx, e) {
    if (e.selectorText != undefined ? e.selectorText.includes('bg--') : '') {
      bgColorList.push(e.selectorText.replace('.', ''));
    }
  });

  if (!$('body').hasClass('homepage') && !$('body').hasClass('mode--payment')) {
    $('body').append("<i class='prev-icon'></i>");
  }

  $(window).on('resize orientedChanged', function () {
    $('[class*=-slider]:not([class*=-slider-block])').each(function () {
      var $thisSwiper = $(this)[0].swiper;

      if ($thisSwiper != undefined || $thisSwiper != null) {
        $thisSwiper.update(true);
      }
    });
  });

  // function setCardBackgrounds(sliderSlide) {
  //   var bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;
  //   var isSameBg = $(sliderSlide).prev().find('.cards').hasClass(bgColorList[bgListRandom]);

  //   if (isSameBg) {
  //     bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;
  //   }

  //   $(sliderSlide).find('.cards').addClass(bgColorList[bgListRandom]);
  // }

  // $('.cards-slider').each(function () {
  //   var $this = $(this);
  //   var isCardsSlider = $this.hasClass('cards-slider--standart');
  //   ww = $(window).outerWidth();

  //   if (!isCardsSlider) {
  //     $this.find('.cards-slide').each(function (idx, el) {
  //       setCardBackgrounds(el);
  //     });
  //   } else {
  //     if (ww < 768) {
  //       $this.find('.cards-slide').each(function (idx, el) {
  //         setCardBackgrounds(el);
  //       });
  //     }
  //   }
  // });

  $('.cards-slider--standart').each(function () {
    var $this = $(this);
    var slideCssClass = 'cards-slide';
    var cardsSliderStandart = null;
    ww = $(window).outerWidth();

    var config = {
      slidesPerView: 1.3391,

      spaceBetween: slideSpaceMobile,
      centeredSlides: true,
      containerModifierClass: 'cards-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      breakpoints: {
        768: {
          slidesPerView: 1,
          centeredSlides: false,
          spaceBetween: slideSpaceTablet,
        },
        1440: {
          slidesPerView: 1,
          centeredSlides: false,
          spaceBetween: slideSpaceDesktop,
        },
      },
    };

    var configTwo = {
      slidesPerView: 1,

      spaceBetween: slideSpaceDesktop,
      effect: 'fade',
      containerModifierClass: 'cards-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      autoplay: { delay: 5000 },

      pagination: {
        el: '.cards-slider--standart .cards-pagination',
        type: 'bullets',
      },
    };

    if (ww < 768) {
      cardsSliderStandart = new Swiper($this, config);
    } else {
      cardsSliderStandart = new Swiper($this, configTwo);
    }
  });

  $('.cards-slider:not(.cards-slider--standart)').each(function () {
    var $this = $(this);
    var slideCssClass = 'cards-slide';
    var hasPerviewProp = false;
    var dataSlidePerview = $this.data('slides-perview');
    var slidesPerViewValues = '';
    var slidePerviewSM = '';
    var slidePerviewMD = '';
    var slidePerviewLG = '';
    var dataEffect = $this.data('effect');

    if (dataSlidePerview != undefined) {
      hasPerviewProp = true;
      slidesPerViewValues = $('[data-slides-perview]').data('slidesPerview').split(',');

      slidesPerViewValues.forEach(function (e, idx) {
        if (e.includes('sm')) slidesPerviewSM = e.split(':')[1];
        else if (e.includes('md')) slidesPerviewMD = e.split(':')[1];
        else slidesPerviewLG = e.split(':')[1];
      });
    }

    var config = {
      slidesPerView: 1.3391,
      spaceBetween: slideSpaceMobile,
      centeredSlides: true,
      containerModifierClass: 'cards-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      breakpoints: {
        768: {
          slidesPerView: hasPerviewProp ? slidesPerviewMD : 2,
          centeredSlides: false,
          loop: true,
          spaceBetween: slideSpaceTablet,
          navigation: {
            prevEl: $this.parent().find('.slider-controls--prev'),
            nextEl: $this.parent().find('.slider-controls--next'),
          },
        },
        1280: {
          slidesPerView: hasPerviewProp ? slidesPerviewMD : 4,
          centeredSlides: false,
          loop: true,
          spaceBetween: slideSpaceTablet,
          navigation: {
            prevEl: $this.parent().find('.slider-controls--prev'),
            nextEl: $this.parent().find('.slider-controls--next'),
          },
        },
        1600: {
          slidesPerView: hasPerviewProp ? slidesPerviewLG : 5,
          centeredSlides: false,
          loop: true,
          spaceBetween: slideSpaceDesktop,
          navigation: {
            prevEl: $this.parent().find('.slider-controls--prev'),
            nextEl: $this.parent().find('.slider-controls--next'),
          },
        },
      },
    };

    var cardsSlider = new Swiper($this, config);

    var t = 0; // the height of the highest element (after the function runs)
    var t_elem; // the highest element (after the function runs)

    $this.find('.cards-slide').each(function () {
      $this = $(this);
      if ($this.outerHeight() > t) {
        t_elem = this;
        t = $this.outerHeight();
      }
    });

    root.style.setProperty('--mh', t + 'px');
  });

  $('.cards.standart').each(function () {
    $(this).find('.description').height() >= 100 ? $(this).find('.description').addClass('with-three-dots') : '';
  });

  $('.header-main-menu').each(function () {
    $('.header-list-item').on('click', function () {
      $('.header-list-item').removeClass('active');
      $(this).addClass('active');
    });
  });

  $('.category-block').each(function () {
    var $this = $(this);
    ww = $(window).outerWidth();

    if (ww < 768) {
      var slideCssClass = 'category-row';

      var config = {
        slidesPerView: 1.3391,
        spaceBetween: slideSpaceMobile,
        centeredSlides: true,
        containerModifierClass: 'category-block--',
        wrapperClass: 'category-wrapper',
        slideClass: slideCssClass,
        slideActiveClass: slideCssClass + '--active',
        slideNextClass: slideCssClass + '--next',
        slidePrevClass: slideCssClass + '--prev',
      };

      var categorySlider = new Swiper($this, config);
    } else {
      var slideCssClass = 'books-block';

      $(this)
        .find('.books')
        .each(function () {
          var config = {
            slidesPerView: 4,
            spaceBetween: 0,
            containerModifierClass: 'books--',
            wrapperClass: 'books-wrapper',
            slideClass: slideCssClass,
            slideActiveClass: slideCssClass + '--active',
            slideNextClass: slideCssClass + '--next',
            slidePrevClass: slideCssClass + '--prev',
            navigation: {
              prevEl: $(this).siblings('.slider-controls--prev-white'),
              nextEl: $(this).siblings('.slider-controls--next-white'),
            },
            breakpoints: {
              1600: {
                slidesPerView: 5,
              },
            },
          };

          var booksSlider = new Swiper($(this), config);
        });
    }
  });

  $('.books-slider').each(function () {
    var slideCssClass = 'books-block';
    var isBookDetailsSlide = $(this).closest('.book-details').length != 0 ? true : false;
    var isProductSlide = $(this).closest('.product-info').length != 0 ? true : false;

    var b768 = 4;
    var b1600 = 5;
    var b768sb = 0;
    var b1600sb = 0;

    if (isBookDetailsSlide) {
      b768 = 3;
      b1600 = 4;
    } else if (isProductSlide) {
      b768 = 3;
      b1600 = 3;
      b768sb = 40;
      b1600sb = 40;
    }

    var config = {
      slidesPerView: 2.5,
      containerModifierClass: 'books-slider--',
      wrapperClass: 'books-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      navigation: {
        prevEl: $(this).siblings('.slider-controls--prev-white'),
        nextEl: $(this).siblings('.slider-controls--next-white'),
      },
      breakpoints: {
        1600: {
          slidesPerView: b1600,
          spaceBetween: b1600sb,
        },
        768: {
          slidesPerView: b768,
          spaceBetween: b768sb,
        },
      },
    };

    var booksSlider = new Swiper($(this), config);
  });

  $('.cards-right-slider').each(function () {
    var $this = $(this);
    var slideCssClass = 'cards-slide';
    var config = {
      slidesPerView: 1,
      containerModifierClass: 'cards-right-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      pagination: {
        el: '.cards-right-slider .cards-pagination.pagination-relative',
        type: 'bullets',
      },
    };

    var cardsSlider = new Swiper($this, config);
  });

  root.style.setProperty('--book-row-count', 10);
  root.style.setProperty('--header-height', $('header').height() + 'px');

  $(window).on('resize oriantedChange', function () {
    root.style.setProperty('--header-height', $('header').height() + 'px');
  });

  $('.header-main-right .search-block .form-control').on('click', function () {
    var $this = $(this);
    ww = $(window).outerWidth();

    if (ww < 768) {
      $('.search-block').addClass('is-shown');
      $('html,body').addClass('overflow-hidden');
      $('html,body').animate(
        {
          scrollTop: 0,
        },
        500,
      );
    }
  });

  $('.cancel-btn').on('click', function () {
    $('.search-block').removeClass('is-shown');
    $('html,body').removeClass('overflow-hidden');
  });

  $('.btn--filter').on('click', function (e) {
    $(this).closest('.search-block').toggleClass('shown-filter');
    isFilter = !isFilter;

    $('.ui-autocomplete > *').length != 0 ? $('ul.ui-autocomplete, .ui-widget-content').filter(':hidden').show() : $('#inpSearchBook').focus();
  });

  $('#btnFilterAccept').on('click', function (e) {
    e.preventDefault();
    $('.popover--filter').removeClass('is-shown');
  });
});

function getMap() {
  var mapProp = {
    center: new google.maps.LatLng(41.0258767, 28.9711733),
    zoom: 17,
    disableDefaultUI: true,
  };
  var map = new google.maps.Map(document.getElementById('googleMap'), mapProp);
}

$('.basic-tabs-block').each(function () {
  var $basicTabs = $(this).find('.basic-tabs');
  var $basicTabsContent = $(this).find('.basic-tabs-contents');

  $basicTabs.find('.basic-tabs-item.active').each(function () {
    var activeTab = $(this).data('tabs');

    $basicTabsContent.find('> *[class*=-' + activeTab + ']').addClass('is-shown');
  });

  $basicTabs.find('.basic-tabs-item').on('click', function () {
    var activeTab = $(this).data('tabs');

    $basicTabs.find('.basic-tabs-item').removeClass('active');
    $(this).addClass('active');

    $basicTabsContent.find('> *').removeClass('is-shown');
    $basicTabsContent.find('> *[class*=-' + activeTab + ']').addClass('is-shown');
  });
});

$('[data-slidable-wrapper="true"]').each(function () {
  var activePlatforms = $(this).data('active-platforms');
  var config = {};
  var thisSlider = null;
  ww = $(window).outerWidth();

  switch (activePlatforms) {
    case 'md-up':
      if (ww > 767.99) {
        $(this).addClass('c');
        $(this).find('> *').addClass('w');
        $(this).find('> * > *').addClass('s');

        config = {
          observer: true,
          observeParents: true,
          slidesPerView: 3,
          loop: $(this).find('s').length <= 3 ? true : false,
          spaceBetween: '4.75%',
          containerModifierClass: 'c--',
          wrapperClass: 'w',
          slideClass: 's',
          slideActiveClass: 's--active',
          slideNextClass: 's--next',
          slidePrevClass: 's--prev',
        };
      }

      thisSlider = new Swiper($(this), config);

      break;
  }
});

var oldCardIdx = '';

$(window).on('load', function () {
  $('.books-cards.is-collapsed').on('click', function (e) {
    e.preventDefault();

    if ($(this).parent().index() != oldCardIdx) {
      $('.books-cards.is-collapsed').siblings().slideUp();
      $(this).siblings().slideDown();
    } else {
      $(this).siblings().slideToggle();
    }

    oldCardIdx = $(this).parent().index();
  });
});

$(window).on('load', function () {
  setTimeout(() => {
    $('body').removeClass('is-loading');
  }, 500);
});

var themeSliders = [];

$('.theme-slider').each(function (idx, e) {
  var config = {
    observer: true,
    observeParents: true,
    slidesPerView: 2.75,
    spaceBetween: '7%',
    freeMode: true,
    containerModifierClass: 'theme-slider--',
    wrapperClass: 'theme-wrapper',
    slideClass: 'theme-slide',
    slideActiveClass: 'theme-slide--active',
    slideNextClass: 'theme-slide--next',
    slidePrevClass: 'theme-slide--prev',
    navigation: {
      prevEl: $(this).parent().find('.slider-controls--prev'),
      nextEl: $(this).parent().find('.slider-controls--next'),
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
      },

      1024: {
        slidesPerView: 4,
      },

      1280: {
        slidesPerView: 5,
        spaceBetween: 48,
      },
    },
  };

  themeSliders[idx] = new Swiper($(this), config);
});

$('.underbordered-list .books-cards .books-cards__content > *:last-child > a:nth-child(1)').each(function () {
  if ($(this).siblings().length != 0) {
    $(this).addClass('haveDetails');
  }
});

$('.underbordered-list').each(function () {
  var $this = $(this);
  var ww = $(window).outerWidth();

  if (ww < 768) {
    if ($this.find('li').length >= 10) {
      $this.addClass('isMore-active');

      var $item = $this.find('li');
      var moreBtn = '<div class="text-center my-3"><a class="btn font-size-sm show-more"><span class="more">Daha Fazla Sonuç</span><span class="less">Daha Az Sonuç</span></a></div>';

      if ($item.length > 10) {
        $(moreBtn).insertAfter($this);
      }

      $this.find('li:lt(10)').fadeIn();
    }
  }
});

$('.show-more').on('click', function (e) {
  e.preventDefault();
  var $this = $(this);

  var $list = $this.parent().prev();

  var max = 10;
  var hiddenLength = $list.find('li:hidden').length;

  if (hiddenLength == 0) {
    $list.find('li').removeAttr('style');
    $list.find('li:hidden:lt(' + max + ')').fadeIn();
  } else {
    $list.find('li:hidden:lt(' + max + ')').fadeIn();
  }

  var lastOffset = $list.find('li:visible:last').offset().top;

  $('html,body').animate(
    {
      scrollTop: lastOffset > 2000 ? lastOffset / 1.375 : lastOffset / 2,
    },
    1000,
  );

  if ($list.find('li:hidden').length == 0) {
    $this.removeClass('show-more');
  } else {
    $this.addClass('show-more');
  }
});

$('.btn--trigger-filter').on('click', function () {
  var ww = $(window).outerWidth();

  if (ww < 768) {
    $('.category-aside').addClass('is-shown');
  }
});

$('.category-aside').on('click', function (e) {
  var ww = $(window).outerWidth();

  if (ww < 768) {
    if ($(e.target).closest('.underbordered-list').length == 0) {
      $(this).removeClass('is-shown');
    }
  }
});

$('.header-list-item:last-child').on('click', function () {
  var ww = $(window).outerWidth();

  if (ww < 768) {
    // $('.search-block').addClass('is-shown');
  }
});

$(window).on('load', function () {
  $('.prev-icon,.btn--prev').on('click', function (e) {
    window.location.href = prevUrl;
  });
});

$('html,body').on('click', function (e) {
  var t = $(e.target);

  if (t.hasClass('shoping-cart-block')) {
    $('.shoping-cart').removeClass('active');
  }
});

$('.shoping-cart').each(function () {
  var ww = 0;

  $(this).on({
    mouseenter: function (e) {
      ww = $(window).outerWidth();

      ww > 767.99 ? $('.shoping-cart-block').addClass('is-shown') : '';
    },
    mouseleave: function () {
      ww = $(window).outerWidth();

      ww > 767.99 ? $('.shoping-cart-block').removeClass('is-shown') : '';
    },
  });
});

$('.increment-buttons').each(function () {
  var $this = $(this);
  var $btnMinus = $(this).find('[data-prop="minus]');
  var $btnPlus = $(this).find('[data-prop="plus"]');
  var $inpBookCount = $(this).find('[data-prop="book-count"]');

  var max = $(this).data('max');

  $(this)
    .find('button')
    .on('click', function () {
      var isMinus = $(this).data('prop') == 'minus';
      var bookCount = $inpBookCount.val();

      if (isMinus && bookCount != 1) {
        bookCount--;
      } else if (!isMinus && bookCount < max) {
        bookCount++;
      }

      $inpBookCount.val(bookCount);
    });
});

$('.account-menu').each(function () {
  $(this)
    .find('.account-menu-link')
    .on('click', function (e) {
      var $accountMenuItem = $(this).parent();
      var thisTabItem = $accountMenuItem.data('tabs-item');

      $('.account-menu > *').removeClass('active');
      $accountMenuItem.addClass('active');

      $('.account-tabs-item').removeClass('active');
      $('.account-tabs-item.' + thisTabItem).addClass('active');
    });
});

$('.fw-b-s').each(function () {
  var config = {
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 28,
    containerModifierClass: 'fw-b-s--',
    wrapperClass: 'fw-b-w',
    slideClass: 'fw-b-b',
    slideActiveClass: 'fw-b-b--active',
    slideNextClass: 'fw-b-b--next',
    slidePrevClass: 'fw-b-b--prev',
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1280: {
        slidesPerView: 2.75,
        spaceBetween: 28,
      },
    },
  };

  var slider = new Swiper($(this), config);
});
