var slideSpaceMobile = 8;
var slideSpaceTablet = 10;
var slideSpaceDesktop = 18;
var ww = $(window).outerWidth();

var bgColorList = [];

var sliderConfig = {
  slidesPerView: 1.25,
  spaceBetween: slideSpaceMobile,
  loop: true,
  containerModifierClass: 'hotel-cards-slider--',
  wrapperClass: 'hotel-cards-wrapper',
  slideClass: 'hotel-cards-slide',
  slideActiveClass: 'hotel-cards-slide--active',
  slideNextClass: 'hotel-cards-slide--next',
  slidePrevClass: 'hotel-cards-slide--prev',
};

document.addEventListener('DOMContentLoaded', function () {
  $(document.styleSheets[0].rules).each(function (idx, e) {
    if (e.selectorText != undefined ? e.selectorText.includes('bg--') : '') {
      bgColorList.push(e.selectorText.replace('.', ''));
    }
  });

  $(window).on('resize orientedChanged', function () {
    $('[class*=-slider]:not([class*=-slider-block])').each(function () {
      var $thisSwiper = $(this)[0].swiper;

      if ($thisSwiper != undefined || $thisSwiper != null) {
        $thisSwiper.update(true);
      }
    });
  });

  function setCardBackgrounds(sliderSlide) {
    var bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;
    var isSameBg = $(sliderSlide).prev().find('.cards').hasClass(bgColorList[bgListRandom]);

    if (isSameBg) {
      bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;
    }

    $(sliderSlide).find('.cards').addClass(bgColorList[bgListRandom]);
  }

  $('.cards-slider').each(function () {
    var $this = $(this);
    var isCardsSlider = $this.hasClass('cards-slider--standart');
    ww = $(window).outerWidth();

    if (!isCardsSlider) {
      $this.find('.cards-slide').each(function (idx, el) {
        setCardBackgrounds(el);
      });
    } else {
      if (ww < 768) {
        $this.find('.cards-slide').each(function (idx, el) {
          setCardBackgrounds(el);
        });
      }
    }
  });

  $('.cards-slider--standart').each(function () {
    var $this = $(this);
    var slideCssClass = 'cards-slide';
    var cardsSliderStandart = null;
    ww = $(window).outerWidth();

    var config = {
      slidesPerView: 1.25,
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
    };

    if (ww < 768) {
      cardsSliderStandart = new Swiper($this, config);
    } else {
      cardsSliderStandart = new Swiper($this, configTwo);
    }

    $(window).on('resize orientedChange', function () {
      ww = $(window).outerWidth();

      var $cardsWrapper = $this.find('.cards-wrapper');
      var clonedSlides = $cardsWrapper.children('.cards-slide').clone(true);

      cardsSliderStandart.destroy();
      $cardsWrapper.empty().append(clonedSlides);
      $cardsWrapper.attr('style', '');

      if (ww < 768) {
        cardsSliderStandart = new Swiper($this, config);
      } else {
        cardsSliderStandart = new Swiper($this, configTwo);
      }
    });
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
      slidesPerView: 1.25,
      spaceBetween: slideSpaceMobile,
      // loop: true,
      centeredSlides: true,
      containerModifierClass: 'cards-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      breakpoints: {
        768: {
          slidesPerView: hasPerviewProp ? slidesPerviewMD : 4,
          centeredSlides: false,
          spaceBetween: slideSpaceTablet,
          navigation: {
            nextEl: $this.parent().find('.slider-controls--right'),
          },
        },
        1440: {
          slidesPerView: hasPerviewProp ? slidesPerviewLG : 5,
          centeredSlides: false,
          spaceBetween: slideSpaceDesktop,
          navigation: {
            nextEl: $this.parent().find('.slider-controls--right'),
          },
        },
      },
    };

    var cardsSlider = new Swiper($this, config);
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
});
