var slideSpaceMobile = 8;
var slideSpaceTablet = 10;
var slideSpaceDesktop = 18;

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

  $(window).on('resize orientedChanged',function(){
    $('[class*=-slider]:not([class*=-slider-block])').each(function(){
        var $thisSwiper = $(this)[0].swiper;

        if($thisSwiper != undefined || $thisSwiper != "") {
            $thisSwiper.update(true)
        }
    })
  })

  $('.cards-slider').each(function () {
    var $this = $(this);
    var slideCssClass = 'cards-slide';

    $this
      .find('.cards-slide')
      .each(function () {
        var bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;

        var isSameBg = $(this).prev().find('.cards').hasClass(bgColorList[bgListRandom]);

        if (isSameBg) {
          bgListRandom = Math.floor(Math.random() * (bgColorList.length - 1)) + 1;
        }

        $(this).find('.cards').addClass(bgColorList[bgListRandom]);
      });

    var config = {
      slidesPerView: 1.25,
      spaceBetween: slideSpaceMobile,
      loop: true,
      centeredSlides: true,
      containerModifierClass: 'cards-slider--',
      wrapperClass: 'cards-wrapper',
      slideClass: slideCssClass,
      slideActiveClass: slideCssClass + '--active',
      slideNextClass: slideCssClass + '--next',
      slidePrevClass: slideCssClass + '--prev',
      breakpoints: {
        768: {
          slidesPerView: 4,
          centeredSlides: false,
          spaceBetween: slideSpaceTablet,
          navigation: {
            nextEl: '.slider-controls--right',
          },
        },
        1440: {
          slidesPerView: 5,
          spaceBetween: slideSpaceDesktop,
          navigation: {
            nextEl: $this.parent().find('.slider-controls--right'),
          },
        },
      },
    };

    var cardsSlider = new Swiper($this, config);
  });

  $('.cards.standart').each(function(){
    $(this).find('.description').height() >= 100 ? $(this).find('.description').addClass("with-three-dots") : ""
  })
});
