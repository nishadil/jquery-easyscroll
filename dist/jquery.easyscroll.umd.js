(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
    typeof define === 'function' && define.amd ? define(['jquery'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.EasyScroll = factory(global.jQuery));
})(this, (function ($) { 'use strict';

    // Import required libraries

    // Define default options
    const defaults = {
        customClass: 'easy-scroll',
        frameRate: 24,
        speed: 1,
        orientation: 'horizontal',
        auto: true,
        autoMode: 'loop',
        manualMode: 'end',
        direction: 'forwards',
        pauseOnHover: true,
        pauseOnTouch: true,
        pauseButton: false,
        startOnLoad: false,
        initialOffset: 0,
    };

    class EasyScroll {
        constructor(el, options) {
            // Properties to be initialized during the constructor
            this.$list = $(el);
            this.$items = null;
            this.$clip = null;
            this.$container = null;
            this.$btnBack = null;
            this.$btnForward = null;
            this.isAuto = false;
            this.isHorizontal = false;
            this.isRTL = false;
            this.isForwards = false;
            this.isLoop = false;
            this.supportsTouch = false;
            this.events = null;
            this.$btnPause = null;
            this.paused = false;
            this.moveBackClass = '';
            this.moveForwardClass = '';
            this.scrollPos = '';
            this.itemMax = 0;
            this.clipMax = 0;
            this.dimension = '';
            this.posMin = 0;
            this.posMax = 0;
            this.resetPosition = 0;
            this.resetPositionForwards = 0;
            this.resetPositionBackwards = 0;
            this.trigger = null;
            this.funcMoveBack = null;
            this.funcMoveForward = null;
            this.funcMovePause = null;
            this.funcMoveStop = null;
            this.funcMoveResume = null;
            this.interval = null;
            this.timestamp = null;

            this.o = $.extend({}, defaults, options || {});

            this.isAuto = this.o.auto !== false && this.o.autoMode.match(/^loop|bounce$/) !== null;
            this.isHorizontal = 
                this.o.orientation.match(/^horizontal|vertical$/) !== null &&
                this.o.orientation === defaults.orientation;

            this.isRTL = this.isHorizontal && $("html").attr('dir') === 'rtl';
            this.isForwards = !this.isAuto && !this.isRTL ||
                (this.isAuto && this.o.direction.match(/^forwards|backwards$/) !== null && this.o.direction === defaults.direction);
            this.isLoop = this.isAuto && this.o.autoMode === 'loop' || !this.isAuto && this.o.manualMode === 'loop';
        
            this.supportsTouch = ('createTouch' in document);
        
            this.events = this.supportsTouch ?
                {start:'touchstart MozTouchDown',move:'touchmove MozTouchMove',end:'touchend touchcancel MozTouchRelease'} :
                {start:'mouseenter',end:'mouseleave'};

            this.$list = $(el); //called on ul/ol/div etc
            this.$items = this.$list.children();

            this.$list.addClass('easy-scroll-list').wrap('<div class="easy-scroll-clip"></div>').parent().wrap('<div class="' + this.o.customClass + ' easy-scroll-container"></div>');

            if (!this.isAuto) {
                this.$list.parent().parent().prepend('<div class="easy-scroll-back"></div>').prepend('<div class="easy-scroll-forward"></div>');
            } else {
                if (this.o.pauseButton) {
                    this.$list.parent().parent().prepend('<div class="easy-scroll-btn easy-scroll-btn-pause"></div>');
                    this.o.pauseOnHover = false;
                }
            }

            // Additional markup generation logic
            if (this.$items.length > 1) {
                let extra_wrap = false;
                let total = 0;

                if (this.isHorizontal) {
                    this.$items.each(function () {
                        total += $(this).outerWidth(true);
                    });

                    extra_wrap = this.$items.eq(0).outerWidth(true) * this.$items.length !== total;
                } else {
                    this.$items.each(function () {
                        total += $(this).outerHeight(true);
                    });

                    extra_wrap = this.$items.eq(0).outerHeight(true) * this.$items.length !== total;
                }

                if (extra_wrap) {
                    if (this.isHorizontal) {
                        this.$list.css({
                            float: "left",
                            width: total + "px"
                        });
                    } else {
                        this.$list.css({
                            height: total + "px"
                        });
                    }
                }
            }

            // Call init method to complete setup
            // this.init();
            if (!this.o.startOnLoad) {
                this.init();
            } else {
                const init = () => this.init();
                if (document.readyState === 'complete') {
                    init();
                } else {
                    $(window).on('load', init);
                }
            }
        }

        init() {
            var self = this;

            this.$items = this.$list.children();
            if (!this.$items.length) {
                return;
            }
            this.$clip = this.$list.parent(); //this is the element that scrolls
            this.$container = this.$clip.parent();
            this.$btnBack = $('.easy-scroll-back', this.$container);
            this.$btnForward = $('.easy-scroll-forward', this.$container);

            if (!this.isHorizontal) {
                this.itemMax = this.$items.eq(0).outerHeight(true);
                this.clipMax = this.$clip.height();
                this.dimension = 'height';
                this.moveBackClass = 'easy-scroll-btn-up';
                this.moveForwardClass = 'easy-scroll-btn-down';
                this.scrollPos = 'Top';
            } else {
                this.itemMax = this.$items.eq(0).outerWidth(true);
                this.clipMax = this.$clip.width();
                this.dimension = 'width';
                this.moveBackClass = 'easy-scroll-btn-left';
                this.moveForwardClass = 'easy-scroll-btn-right';
                this.scrollPos = 'Left';
            }

            if (!this.itemMax || !isFinite(this.itemMax)) {
                return;
            }

            this.posMin = 0;

            this.posMax = this.$items.length * this.itemMax;

            var addItems = Math.ceil(this.clipMax / this.itemMax);

            //auto scroll loop & manual scroll bounce or end(to-end)
            if (this.isAuto && this.o.autoMode === 'loop') {

                this.$list.css(this.dimension, this.posMax + (this.itemMax * addItems) + 'px');

                this.posMax += (this.clipMax - this.o.speed);

                if (this.isForwards) {
                    this.$items.slice(0, addItems).clone(true).appendTo(this.$list);
                    this.resetPosition = 0;

                } else {
                    this.$items.slice(-addItems).clone(true).prependTo(this.$list);
                    this.resetPosition = this.$items.length * this.itemMax;
                    //due to inconsistent RTL implementation force back to LTR then fake
                    if (this.isRTL) {
                        this.$clip[0].dir = 'ltr';
                        //based on feedback seems a good idea to force float right
                        this.$items.css('float', 'right');
                    }
                }

                //manual and loop
            } else if (!this.isAuto && this.o.manualMode === 'loop') {

                this.posMax += this.itemMax * addItems;

                this.$list.css(this.dimension, this.posMax + (this.itemMax * addItems) + 'px');

                this.posMax += (this.clipMax - this.o.speed);

                this.$items.slice(0, addItems).clone(true).appendTo(this.$list);
                this.$items.slice(-addItems).clone(true).prependTo(this.$list);

                this.resetPositionForwards = this.resetPosition = addItems * this.itemMax;
                this.resetPositionBackwards = this.$items.length * this.itemMax;

                //extra events to force scroll direction change
                this.$btnBack.bind(this.events.start, function () {
                    self.isForwards = false;
                    self.resetPosition = self.resetPositionBackwards;
                });

                this.$btnForward.bind(this.events.start, function () {
                    self.isForwards = true;
                    self.resetPosition = self.resetPositionForwards;
                });

            } else { //(!this.isAuto && this.o.manualMode=='end')

                this.$list.css(this.dimension, this.posMax + 'px');

                if (this.isForwards) {
                    this.resetPosition = 0;

                } else {
                    this.resetPosition = this.$items.length * this.itemMax;
                    //due to inconsistent RTL implementation force back to LTR then fake
                    if (this.isRTL) {
                        this.$clip[0].dir = 'ltr';
                        //based on feedback seems a good idea to force float right
                        this.$items.css('float', 'right');
                    }
                }
            }

            this.resetPos(this.o.initialOffset);  //ensure scroll position is reset

            this.timestamp = null;
            this.interval = null;

            if (!(!this.isAuto && this.o.manualMode === 'end')) { //loop mode
                //ensure that speed is divisible by item width. Helps to always make images even not odd widths!
                while (this.itemMax % this.o.speed !== 0) {
                    this.o.speed--;
                    if (this.o.speed === 0) {
                        this.o.speed = 1; break;
                    }
                }
            }

            this.trigger = null;

            this.funcMoveBack = function (e) {
                if (e !== undefined) {
                    e.preventDefault();
                }
                self.trigger = !self.isAuto && self.o.manualMode === 'end' ? this : null;
                if (self.isAuto) {
                    self.isForwards ? self.moveBack() : self.moveForward();
                } else {
                    self.moveBack();
                }
            };

            this.funcMoveForward = function (e) {
                if (e !== undefined) {
                    e.preventDefault();
                }
                self.trigger = !self.isAuto && self.o.manualMode === 'end' ? this : null;
                if (self.isAuto) {
                    self.isForwards ? self.moveForward() : self.moveBack();
                } else {
                    self.moveForward();
                }
            };

            this.funcMovePause = function () { self.movePause(); };
            this.funcMoveStop = function () { self.moveStop(); };
            this.funcMoveResume = function () { self.moveResume(); };

            if (this.isAuto) {

                this.paused = false;

                function togglePause() {
                    if (self.paused === false) {
                        self.paused = true;
                        self.funcMovePause();
                    } else {
                        self.paused = false;
                        self.funcMoveResume();
                    }
                    return self.paused;
                }

                //disable pauseTouch when links are present
                if (this.supportsTouch && this.$items.find('a').length) {
                    this.supportsTouch = false;
                }

                if (this.isAuto && this.o.pauseOnHover && !this.supportsTouch) {
                    this.$clip
                        .bind(this.events.start, this.funcMovePause)
                        .bind(this.events.end, this.funcMoveResume);
                } else if (this.isAuto && this.o.pauseOnTouch && !this.o.pauseButton && this.supportsTouch) {

                    var touchStartPos, scrollStartPos;

                    this.$clip.bind(this.events.start, function (e) {
                        togglePause();
                        var touch = e.originalEvent.touches[0];
                        touchStartPos = self.isHorizontal ? touch.pageX : touch.pageY;
                        scrollStartPos = self.$clip[0]['scroll' + self.scrollPos];
                        e.stopPropagation();
                        e.preventDefault();

                    }).bind(this.events.move, function (e) {

                        e.stopPropagation();
                        e.preventDefault();

                        var touch = e.originalEvent.touches[0],
                            endTouchPos = self.isHorizontal ? touch.pageX : touch.pageY,
                            pos = (touchStartPos - endTouchPos) + scrollStartPos;

                        if (pos < 0) pos = 0;
                        else if (pos > self.posMax) pos = self.posMax;

                        self.$clip[0]['scroll' + self.scrollPos] = pos;

                        //force pause
                        self.funcMovePause();
                        self.paused = true;
                    });
                } else {
                    if (this.o.pauseButton) {

                        this.$btnPause = $(".easy-scroll-btn-pause", this.$container)
                            .bind('click', function (e) {
                                e.preventDefault();
                                togglePause() ? $(this).addClass('active') : $(this).removeClass('active');
                            });
                    }
                }
                this.funcMoveForward();
            } else {

                this.$btnBack
                    .addClass('easy-scroll-btn' + ' ' + this.moveBackClass)
                    .bind(this.events.start, this.funcMoveBack)
                    .bind(this.events.end, this.funcMoveStop);
                this.$btnForward
                    .addClass('easy-scroll-btn' + ' ' + this.moveForwardClass)
                    .bind(this.events.start, this.funcMoveForward)
                    .bind(this.events.end, this.funcMoveStop);

                if (this.o.manualMode === 'end') {
                    !this.isRTL ? this.$btnBack.addClass('disabled') : this.$btnForward.addClass('disabled');
                }
            }
        }


        moveForward() {
            const self = this;
            this.movePause();
            this.movement = 'forward';

            if (this.trigger !== null) {
                this.$btnBack.removeClass('disabled');
            }

            const frame = function (timestamp) {
                if (
                    self.$clip[0]['scroll' + self.scrollPos] <
                    self.posMax - self.clipMax
                ) {
                    const delta =
                        ((timestamp - (self.timestamp || timestamp)) * self.o.speed) /
                        self.o.frameRate;
                    self.$clip[0]['scroll' + self.scrollPos] += Math.ceil(delta);

                    // ... (additional logic)

                } else if (self.isLoop) {
                    self.resetPos();
                } else {
                    self.moveStop(self.movement);
                    return;
                }

                self.timestamp = timestamp;
                self.interval = requestAnimationFrame(frame);
            };

            this.interval = requestAnimationFrame(frame);
        }

        moveBack() {
            const self = this;
            this.movePause();
            this.movement = 'back';

            if (this.trigger !== null) {
                this.$btnForward.removeClass('disabled');
            }

            const frame = function (timestamp) {
                if (self.$clip[0]['scroll' + self.scrollPos] > self.posMin) {
                    const delta =
                        ((timestamp - (self.timestamp || timestamp)) * self.o.speed) /
                        self.o.frameRate;
                    self.$clip[0]['scroll' + self.scrollPos] -= Math.ceil(delta);

                    // ... (additional logic)

                } else if (self.isLoop) {
                    self.resetPos();
                } else {
                    self.moveStop(self.movement);
                    return;
                }

                self.timestamp = timestamp;
                self.interval = requestAnimationFrame(frame);
            };

            this.interval = requestAnimationFrame(frame);
        }

        movePause() {
            cancelAnimationFrame(this.interval);
            this.timestamp = null;
        }

        moveStop(moveDir) {
            this.movePause();
            this.timestamp = null;

            if (this.trigger !== null) {
                if (typeof moveDir !== 'undefined') {
                    $(this.trigger).addClass('disabled');
                }
                this.trigger = null;
            }

            if (this.isAuto) {
                if (this.o.autoMode === 'bounce') {
                    moveDir === 'forward' ? this.moveBack() : this.moveForward();
                }
            }
        }

        moveResume() {
            this.movement === 'forward' ? this.moveForward() : this.moveBack();
        }

        resetPos(resetPos) {
            const nextPos = typeof resetPos === 'number' ? resetPos : this.resetPosition;
            this.$clip[0]['scroll' + this.scrollPos] = nextPos;
        }

        // ... (additional methods and properties)
    }

    if ($ && $.fn && !$.fn.easyScroll) {
        $.fn.easyScroll = function (options) {
            return this.each(function () {
                const $el = $(this);
                if (!$el.data('easyScroll')) {
                    $el.data('easyScroll', new EasyScroll(this, options));
                }
            });
        };
    }

    // Example of usage
    // $(document).ready(function () {
    //   $('.your-selector').easyScroll({
    //     // your options here
    //   });
    // });
    //
    // or
    // $(document).ready(function () {
    //   new EasyScroll('.your-selector',{
    //      // your options here
    //   });
    // });

    return EasyScroll;

}));
