﻿$(function() {
	new Sliding($("#sliding"));
	
	appendCache(window.location.pathname);
	
	browserNavigation();
	
	new ScrolledMenu($(".b-scrolled-menu__type_main-submenu"));
	
	new MainMenu();
	
	contactsNav();
	
	portfolioTags();
	
	$(window).resize(windowResize).resize();
	
	onHtmlReady();
	onPageLoad(true);
	
	new FixedPanel("#b-fixed-panel");
  
  $( '#contacts-bar .b-phone-icon' ).click( function(e) {
    var $body = $( 'body' );
    if ( !$body.hasClass( 'i-cover' )) {
      $body.addClass( 'i-cover' );
      if ( !$( '#sliding #cover' ).length ) {
        $( '#sliding' ).append( '<div id="cover"></div>' );
      }
      e.stopPropagation();
    }
    e.preventDefault();
  });
  
  $( document ).bind( 'click', function(e) {
    var $body = $( 'body' );
    if ( $body.hasClass( 'i-cover' )) {
      $body.removeClass( 'i-cover' );
      $( '#cover' ).remove();
    }
  });
  
  $( '#contacts-panel' ).click( function(e) {
    e.stopPropagation();
  });
});

function Form(elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $(elem);
		self.$elem.data("Form", self);
		self.submitFlag = 0;
		self.firstElement = null;
		self.$submitButton = self.$elem.find(".b-form-submit .b-button");
		self.$messageBackLink = self.$elem.find(".b-form-message__back");
	}
	
	function handleEvents() {
		self.$submitButton.click(clickSubmitButton);
		self.$elem.submit(submitForm);
		self.$elem.find("input, textarea")
			.focus(focusElement)
			.keyup(keyupElement);
		if( self.$messageBackLink.length ) {
			self.$messageBackLink.click( clickBackLink );
		}
	}
	
	function clickBackLink(e) {
		e.preventDefault();
		//self.$elem.removeClass( "i-message" );
		$.ajax({
			url: self.$messageBackLink.attr( "href" ),
			type: "GET",
			dataType: "html",
			success: function ( data ) {
				if ( typeof data === "string" ) {
					self.$elem.fadeOut( 500, function () {
						var $form = $( data );
						self.$elem.before( $form.fadeIn() ).remove();
						self = null;
						$form.find("[data-placeholder]").placeholder();
						new Form( $form );
					});
				}
			},
			error: ajaxError
		});
	}
	
	function keyupElement(e) {
		if(this.tagName == "TEXTAREA" && e.which == 13 && e.ctrlKey == true) {
			self.$elem.submit();
			e.preventDefault();
		}
	}
	
	function focusElement() {
		//removeAttention($(this));
	}
	
	function clickSubmitButton(e) {
		self.$elem.submit();
		e.preventDefault();
	}
	
	function submitForm(e) {
		if ( isValid() ) {
			if ( !self.$elem.attr( "data-ajax-url" ) ) return true;
			$.ajax({
				url: self.$elem.attr( "data-ajax-url" ),
				type: "POST",
				data: self.$elem.serialize(),
				dataType: "json",
				success: function ( data ) {
					if ( data.message ) {
						self.$elem.find( ".b-form-message h2" ).text( data.message );
					}
					if ( data.url ) {
						self.$elem.find( ".b-form-message__back" ).attr({ href: data.url });
					}
					self.$elem.addClass( "i-message" );
				},
				error: ajaxError
			});
		}
		e.preventDefault();
	}
	
	function setAttention($elem) {
		$elem.closest(".b-form-field").addClass("i-attention");
		
		if(self.submitFlag == 0) {
			self.firstElement = $elem;
		}
		self.submitFlag = 1;
	}
	
	function removeAttention($elem) {
		$elem.closest(".b-form-field").removeClass("i-attention");
	}
	
	function isValid() {
		return check();
		
		function check() {
			self.submitFlag = 0;
			self.firstElement = null;
			
			checkEmpty();
			checkSpecialTypes();
			checkRequiredOr();
			checkEqual();
			checkEmpty();
			
			if (self.submitFlag == 0) return true;
			
			var scrolled = window.pageYOffset || document.documentElement.scrollTop;
			if((self.firstElement.offset().top - scrolled) < 0) {
				$.scrollTo(self.firstElement.parent().offset().top - 100, 10);
			}
				
			if(self.firstElement != null) {
				self.firstElement.focus();
			}
			return false;						
		}
		
		function checkEqual() {
			var orFieldsObject = {};
			self.$elem.find("[data-equal]").each(function() {
				var $filed = $(this),
					data = $filed.attr("data-equal");
					
				if(!orFieldsObject[data]) {
					orFieldsObject[data] = self.$elem.find("[data-equal=" + data + "]");
				}
			});
			
			var flag;
			for(var key in orFieldsObject) {
				flag = true;
				
				var value = $.trim($(orFieldsObject[key][0]).val());
				orFieldsObject[key].each(function() {
					if($.trim($(this).val()) != value) {
						flag = false;
					}
				});
				
				if(!flag) {
					orFieldsObject[key].each(function() {
						setAttention($(this));
					});
				}
				else {
					orFieldsObject[key].each(function() {
						removeAttention($(this));
					});
				}
			}
		}
		
		function checkEmpty() {
			self.$elem.find(".b-select.i-required").each(function() {
				if($(this).find("input:hidden").val() == "") {
					setAttention($(this));
				} else {
					removeAttention($(this));
				}
			});
			self.$elem.find("[required]").each(function() {
				var $field = $(this),
					$val = $.trim($field.val());
				
				if ($field.is("[type=radio]")) {
					if($field.closest(".b-form-field").find("input:checked").size() == 0)
						setAttention($field);
				} else if ($field.is("[type=checkbox]")) {
					if(!$field.is(":checked")) {
						setAttention($field);
					} else {
						removeAttention($field);
					}
				} else if ($field.is("[data-equal]")) {
					if($val == "") setAttention($field);
				} else if ($field.is("[type=password]")) {
					if($val.length < 6) {
						setAttention($field);
					} else {
						removeAttention($field);
					}
				} else if ($val == "") {
					setAttention($field);
				} else if(!$field.is("[type=email]") && !$field.is("[type=tel]") && !$field.is("[type=number]") && !$field.is("[type=url]")) {
					removeAttention($field);
				}
			});
		}
		
		function checkSpecialTypes() {
			checkPasswordType();
			checkEmailType();
			checkTelType();
			checkNumberType();
			checkUrlType();
			
			function checkPasswordType() {
				self.$elem.find("input:visible[type=password]").each(function() {
					var $field = $(this),
						$val = $.trim($field.val()),
						num = 6;
					
					if ($val.length < num) {
						setAttention($field);
					} else {
						removeAttention($field);
					}
				});
			}
			
			function checkEmailType() {
				self.$elem.find("[type=email]").each(function() {
					var $field = $(this),
						$val = $.trim($field.val()),
						mailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
					
					if ($val != "" && !mailRegex.test($val)) {
						setAttention($field);
					}
					else {
						removeAttention($field);
					}
				});
			}
			
			function checkTelType() {
				self.$elem.find("[type=tel]").each(function() {
					var $field = $(this),
						$val = $.trim($field.val()),
						phoneRegex = /^([0-9-()\++\s]{5,})$/i;
					
					if ($val != "" && !phoneRegex.test($val)) {
						setAttention($field);
					}
					else {
						removeAttention($field);
					}
				});
			}
			
			function checkNumberType() {
				self.$elem.find("[type=number]").each(function() {
					var $field = $(this),
						$val = $.trim($field.val()),
						numRegex = /^([0-9\s\.,]+)$/i;
					
					if ($val != "" && !numRegex.test($val)) {
						setAttention($field);
					}
					else {
						removeAttention($field);
					}
				});
			}
			
			function checkUrlType() {
				self.$elem.find("[type=url]").each(function() {
					var $field = $(this),
						$val = $.trim($field.val()),
						urlRegex = /^((https?:\/\/)?(www\.)?([-a-z0-9]+\.)+[a-z]{2,})$/i;
					
					if ($val != "" && !urlRegex.test($val)) {
						setAttention($field);
					}
					else {
						removeAttention($field);
					}
				});
			}
			
		}
		
		function checkRequiredOr() {
			var orFieldsObject = {};
			self.$elem.find("[data-required-or]").each(function() {
				var $filed = $(this),
					data = $filed.attr("data-required-or");
					
				if(!orFieldsObject[data]) {
					orFieldsObject[data] = self.$elem.find("[data-required-or=" + data + "]");
				}							
			});
			
			var counter;
			for(var key in orFieldsObject) {
				counter = 0;
				
				orFieldsObject[key].each(function() {
					if($.trim($(this).val()) != "") {
						counter++;
					}
				});
				
				if(counter == 0) {
					orFieldsObject[key].each(function() {
						setAttention($(this));
					});
				}
				else {
					orFieldsObject[key].each(function() {
						removeAttention($(this));
					});
				}
			}
		}
	} 
}

//--placeholder--//
(function($) {
	var defaults = {
		//text:"",
		//color:"#aaaaaa"
	};
	$.fn.placeholder = function(params) {
		
		var options = $.extend({}, defaults, params);
		
		$(this).each(function() {
			
			var self = this;
			self.$elem = $(this),
			self.$formField = self.$elem.closest(".b-form-field");
			self.placeholderText = options.text || self.$elem.attr("data-placeholder");
			
			init();
			
			function init() {
				if(!self.$placeholder) {
					createPlaceholder();
				}
				turnOn();
				handleEvents();
			}
			
			function turnOn() {
				setTimeout(function() {//for chrome, for it fills the password field in some time after loading the page
					if(self.$elem.val() == "") {
						self.$formField.addClass("i-placeholder");
					}
				}, 10);
			}
			
			function handleEvents() {
				self.$placeholderText.click(function() {
					if(!self.$elem.parent().hasClass("i-disabled"))
					self.$elem.focus();
				});
				
				self.$elem
					.focus(function() {
						onFocus();
					})
					.blur(function() {
						onBlur();
					});
				
			}
			
			function createPlaceholder() {
				self.$placeholder = $('<div class="b-form-field__placeholder"><div class="b-form-field__placeholder__text">' + self.placeholderText + '</div></div>');
				self.$placeholderText = self.$placeholder.find(".b-form-field__placeholder__text");
				
				self.$elem.before(self.$placeholder);
				
				setPlaceholderSize();
			}
			
			function setPlaceholderSize() {
				if(self.$elem.is(":visible")) {
					setSize();
				}
				else {
					var $elem = self.$elem;
					var $parent = $elem.parent();
					$elem.css({position: "absolute", bottom: "0", left: "0"}).appendTo("body");
					setSize();
					$parent.append($elem);
					$elem.css({position: "static", bottom: "none", left: "none"});
				}
				
				function setSize() {
					self.$placeholderText
						.css(
							{
								width: self.$elem.outerWidth() - parseInt(self.$placeholderText.css("paddingLeft")) + "px"
							}
						);
				}
			}
			
			function onFocus() {
				self.$formField.removeClass("i-placeholder");
			}
			
			function onBlur() {
				if (self.$elem.val() == "") {
					self.$formField.addClass("i-placeholder");
				}
			}
			
		});
		return this;
	};
})(jQuery);

function FixedPanel(elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $(elem);
		self.$elem.data("FixedPanel", self);
		self.$panel = self.$elem.find(".b-fp__panel");
		self.panelTopBorder = parseInt(self.$elem.css("top"), 10);
	}
	
	function handleEvents() {
		$(window)
			.bind("scroll", scrollWindow)
			.scroll();
	}
	
	function scrollWindow(e) {
		var scrolled = getScrolled();
		if(scrolled > self.panelTopBorder && !self.$elem.hasClass("i-scrolled")) {
			self.$elem.addClass("i-scrolled");
			setBgColor();
		} else if(scrolled <= self.panelTopBorder && self.$elem.hasClass("i-scrolled")) {
			resetBgColor();
			self.$elem.removeClass("i-scrolled");
		}
	}
	
	function getScrolled() {
		return window.pageYOffset || document.documentElement.scrollTop;
	}
	
	function setBgColor() {
		var bgColor = $("#sliding").css("backgroundColor");
		self.$panel.css({backgroundColor: bgColor});
	}
	
	function resetBgColor() {
		self.$panel.css({backgroundColor: "transparent"});
	}
	
	/*--- public methods ---*/
	
	this._setBgColor = function() {
		setBgColor();
	};
	
	this._resetBgColor = function() {
		resetBgColor();
	};
}

function portfolioTags() {
	$("#sliding").delegate("a.b-tags__item", "click", clickTag);
	
	function clickTag(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var tag = $(this).text();
		$("#sliding .b-portfolio__item").fadeOut(300, function() {
			$("#sliding .b-tags__item").each(function() {
				if($(this).text() == tag) {
					$(this).closest(".b-portfolio__item").fadeIn(500);
				}
			});
		});
		
		$(".b-main-menu__link.i-active").removeClass("i-active").addClass("i-inside");
	}
}

function browserNavigation() {
	$("section.b-content").delegate("a", "click", clickAnchor);
	window.pageHref;
	
	function clickAnchor(e) {
		if(isMobile()) return;
		
		var $anchor = $(this);
		var url = $anchor.attr("href");
		var localDomain = window.location.hostname;
		var path = url.split("?")[0];
		
		if($anchor.hasClass("b-share-buttons__item")) {
			if($anchor.hasClass("i-vk")) {
				window.open($anchor.attr("href"), '', 'width=540,height=450');
				return false;
			} else if($anchor.hasClass("i-fb")) {
				window.open($anchor.attr("href"), '', 'width=540,height=450');
				return false;
			}
		}
		if($anchor.hasClass("i-no-ajax") || (url.search("://") != -1 && path.search(localDomain) == -1) || url == "#" || url.search("skype") != -1 || url.search("mailto") != -1) return true;
		
		window.pageUrl = url;
		
		setTimeout(function() {
			if(url && window.pageUrl == url) {
				if($anchor.hasClass("i-active")) return;
				
				var state = history.state || {};
				if($anchor.hasClass("b-logo__link")) {
					$("#main-menu a, #main-submenu a, #person-submenu a").removeClass("i-active");
					$("#main-submenu menu, #person-submenu").fadeOut();
				}
				
				$("#sliding").data("Sliding").slide(url);
			}
		}, 500);
		e.preventDefault();
	}
	
	$(window).on('popstate', function(e) {
		if(isMobile()) return;
		
		window.historyPopstateFlag = true;
		var returnLocation = history.location || document.location;
		//returnLocation cut domain name and the tail
		if(returnLocation) $("#sliding").data("Sliding").slide(returnLocation);			
	});
}

function isMobile() {
	if($("body").hasClass("i-ipad") || $("body").hasClass("i-iphone") || $("body").hasClass("i-android") || $(document).width() <= 480) return true;
	return false;
}

function onHtmlReady() {
	$(".b-main-menu-block").data("MainMenu").highlight();
	$(".b-main-menu-block").data("MainMenu").showMenu();
}

function onPageLoad(first) {
	checkWidget();
	adaptiveBlocks();
	pushHistory(first);
	setPageMeta();
	
	$("[data-placeholder]").placeholder();
	$("form").each(function() {
		if ( $( this ).data( "Form" ) ) return;
		new Form(this);
	});
}

function pushHistory(first) {
	if(first) return;
	if(window.historyPopstateFlag) {
		window.historyPopstateFlag = false;
		return;
	}
	var url = $("#sliding").data("Sliding").$slidingContent.attr("data-url");
	if(url)	history.pushState(null, null, url);
}

function setPageMeta() {
	var $slidingContent = $("#sliding").data("Sliding").$slidingContent;
	var title = $slidingContent.attr("data-title");
	var keywords = $slidingContent.attr("data-keywords");
	var description = $slidingContent.attr("data-description");
	
	$("title").text(title);
	$("meta[name=keywords]").text(keywords);
	$("meta[name=description]").text(description);
}

function appendCache(url) {
	if( $("#sliding").data("Sliding").cache[url] )
		return;
	$("#sliding").data("Sliding").cache[url] = $("#sliding").html();
}

function adaptiveBlocks() {
	$(window).unbind("resize.adaptive");
	$(".b-adaptive-blocks").each(function() {
		adaptive(this);
	});
	
	function adaptive(elem) {
		var $elem = $(elem);
		var $items = $elem.children("[class*=item]");
		var minItemWidth = $items.width();
		var elemWidth = $(elem).width();
		
		$(window)
			.bind("resize.adaptive", resize)
			.resize();
		
		function getWidth() {
			return 100 / Math.floor(elemWidth / minItemWidth);
		}
		
		function resize() {
			elemWidth = $(elem).width();
			//$items.animate({width: getWidth() + "%"}, 200);
			$items.width(getWidth() + "%");
		}
	}
}

function checkWidget() {
	$("#sliding").find("[data-widget]").each(function() {
		var widget = $(this).attr("data-widget");
		if(widget && window[widget] && typeof window[widget] == "function") {
			window[widget]($(this));
		}
	});	
}

function windowResize() {
	var width = [1366, 1280, 768, 320, 0];
	
	var windowWidth = $(window).width();
	
	for(var i = 0; i < width.length-1; i++) {
		if(windowWidth < width[i] && windowWidth > width[i+1]) {
			$("body").addClass("i-" + width[i]);
		} else {
			$("body").removeClass("i-" + width[i]);
		}
	}
	
}

function ScrolledMenu($elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $elem;
		self.$elem.data("ScrolledMenu", self);
		self.$content = self.$elem.find(".b-scrolled-menu__content");
		self.$wrapper = self.$elem.find(".b-scrolled-menu__wrapper");
		self.$navTop = self.$elem.find(".b-scrolled-menu__nav-top");
		self.$navBottom = self.$elem.find(".b-scrolled-menu__nav-bottom");
		self.intervalId;	
		self.intervalCounter = 1;//ln(x) starts with 0
	}
	
	function handleEvents() {
		self.$elem
			.delegate(".b-scrolled-menu__nav-top", "mouseenter", enter)
			.delegate(".b-scrolled-menu__nav-top", "mouseleave", leave)
			.delegate(".b-scrolled-menu__nav-top", "click", false)
			.delegate(".b-scrolled-menu__nav-bottom", "mouseenter", enter)
			.delegate(".b-scrolled-menu__nav-bottom", "mouseleave", leave)
			.delegate(".b-scrolled-menu__nav-bottom", "click", false);
		
		self.$wrapper
			.mousewheel(function(e) {
				if(!self.$elem.hasClass("i-top") && !self.$elem.hasClass("i-bottom")) return;
				
				e.preventDefault();
				self.intervalCounter = 100;
				if(e.deltaY > 0) increaseMarginTop(true);
				else if(e.deltaY < 0) increaseMarginTop(false);
			});
	}
	
	function enter() {
		if(isMobile()) return;
		
		var $nav = $(this);
		var increase = true;
		self.intervalCounter = 1;
		if($nav[0].className.search("bottom") != -1) increase = false;
		if(self.intervalId) clearInterval(self.intervalId);
		
		self.intervalId = setInterval(function() {
			increaseMarginTop(increase);
		}, 20);
		
	}
	
	function leave() {
		if(isMobile()) return;
		
		var $nav = $(this);
		var increase = true;
		self.intervalCounter = 1;
		if($nav[0].className.search("bottom") != -1) increase = false;
		
		if(self.intervalId) clearInterval(self.intervalId);
		self.intervalId = setInterval(function() {
			stopMarginTop(increase);
		}, 30);
	}
	
	function increaseMarginTop(increase) {
		if(self.intervalCounter < 3) self.intervalCounter += 0.2;
		setMarginTop(increase);
	}
	
	function stopMarginTop(increase) {
		if(self.intervalCounter <= 1 && self.intervalId) {
			clearInterval(self.intervalId);
			return;
		}
		self.intervalCounter -= 0.2;
		setMarginTop(increase);
	}
	
	function setMarginTop(increase) {
		var marginTop = parseInt(self.$content.css("marginTop"), 10);
		if(increase) {
			marginTop += Math.ceil(Math.log(self.intervalCounter) * 4);
			if(marginTop >= 0) {
				marginTop = 0;
				if(self.intervalId) clearInterval(self.intervalId);
				self.$elem.removeClass("i-top").addClass("i-bottom");
			} else {
				self.$elem.addClass("i-top").addClass("i-bottom");
			}
		} else {
			marginTop -= Math.ceil(Math.log(self.intervalCounter) * 4);
			if(marginTop <= -1 * (self.$content.height() - self.$wrapper.height())) {
				marginTop = -1 * (self.$content.height() - self.$wrapper.height());
				if(self.intervalId) clearInterval(self.intervalId);
				self.$elem.removeClass("i-bottom").addClass("i-top");
			} else {
				self.$elem.addClass("i-top").addClass("i-bottom");
			}
		}
		
		self.$content.css({marginTop: marginTop + "px"});
	}
}

function Clients($elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $elem;
		self.$elem.data("Clients", self);
	}
	
	function handleEvents() {
		self.$elem
			.delegate(".b-clients__item", "mouseenter", mouseenterItem)
			.delegate(".b-clients__item", "mouseleave", mouseleaveItem);
	}
	
	function mouseenterItem() {
		$(this)
			.find(".b-clients__item__bg").stop().animate({opacity: 0.87}, 500).end()
			.find(".b-clients__item__name").stop().animate({top: "50%"}, 800, "easeOutElastic");
	}
	
	function mouseleaveItem() {
		$(this)
			.find(".b-clients__item__bg").stop().animate({opacity: 0}, 500).end()
			.find(".b-clients__item__name").stop().animate({top: "-40px"}, 500, "easeInQuad");
	}
}

function Sliding(elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $(elem);
		self.$elem.data("Sliding", self);
		self.$slidingContent = self.$elem.find(".b-sliding-content");
		self.pageHtml = undefined;
		self.cache = {};
		self.slideFlag = false;
		self.fadeFlag = false;
	}
	
	function handleEvents() {}
	
	function slide(url) {
		getPageHtml(url);
		slideOut();
		
		function getPageHtml(url) {
			self.pageHtml = undefined;
			sendAjax();
			
			function sendAjax() {
				if(!self.cache[url]) {
					$.ajax({
						url: url + '?ajax',
						type: "GET",
						dataType: "html",
						success: success,
						error: ajaxError
					});
				} else {
					self.pageHtml = self.cache[url];
				}
				
				function success(response, status, xhr) {
					setTimeout(function() {
						self.pageHtml = response;
						if(self.$elem.hasClass("i-preloader")) {
							self.$elem.removeClass("i-preloader").html(self.pageHtml);
							onHtmlReady();
							appendCache(url);
							self.$slidingContent = self.$elem.find(".b-sliding-content");
							self.$slidingContent.hide().fadeIn(500, function() {
								self.fadeFlag = true;
								if(self.slideFlag) onPageLoad();
							});
						}
					}, 0);
				}
			}
		}
		
		function slideOut() {
			$(".b-main-menu-block").data("MainMenu").hideMenu();
			if(self.$slidingContent.size() != 0) {
				self.$slidingContent.fadeOut(500, function() {
					self.$elem.attr({"data-marginLeft": self.$elem.css("marginLeft")});
					self.$elem.animate({marginLeft: $(document).width()}, 500, "easeInQuad", slideIn);
					$("#b-fixed-panel").data("FixedPanel")._resetBgColor();
				});
			} else {
				self.$elem.attr({"data-marginLeft": self.$elem.css("marginLeft")});
				self.$elem.animate({marginLeft: $(document).width()}, 500, "easeInQuad", slideIn);
			}
		}
		
		function slideIn() {
			self.slideFlag = false;
			self.fadeFlag = false;
			
			var marginLeft = "450px";
			if(self.$elem.attr("data-marginLeft")) marginLeft = self.$elem.attr("data-marginLeft");
			self.$slidingContent.empty();
			self.$elem.animate({marginLeft: marginLeft}, 1000, "easeOutQuad", function() {
				self.$elem.attr({"style": ""});
				showConent();
			});
			
			function showConent() {
				self.slideFlag = true;
				if(self.pageHtml) {
					self.$elem.html(self.pageHtml);
					onHtmlReady();
					appendCache(url);
					self.$slidingContent = self.$elem.find(".b-sliding-content");
					self.$slidingContent.hide().fadeIn(500, function() {
						self.fadeFlag = true;
						if(self.slideFlag) onPageLoad();
						$("#b-fixed-panel").data("FixedPanel")._setBgColor();
					});
				} else {
					self.$elem.addClass("i-preloader");
				}
			}
		}
	}
	
	/*--- public methods ---*/
	
	this.slide = function(url) {
		slide(url);
	};
}

function MainMenu() {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $(".b-main-menu-block");
		self.$elem.data("MainMenu", self);
		self.$mainMenu = $("#main-menu");
		self.$mainSubmenu = $("#main-submenu");
		self.$menuIcons = $(".b-menu-icon");
	}
	
	function handleEvents() {
		self.$elem
			.delegate("a", "mouseenter", enterLink)
			.delegate("a", "mouseleave", leaveLink);
		
		self.$menuIcons.click(clickMenuIcon);
	}
	
	function enterLink() {
		/*$(this).stop().animate({backgroundPosition: "0 0"}, 500, "easeOutQuad");
		var x = 0;  
		var y = 0;  
		var banner = $("#banner");  
		window.setInterval(function() {  
			banner.css("backgroundPosition", x + 'px' + ' ' + y + 'px');  
			y--;  
		}, 90);  */
	}
	
	function leaveLink() {
		//$(this).stop().animate({backgroundPosition: "-150px 0"}, 500, "easeOutQuad");
	}
	
	function clickMenuIcon(e) {
		e.preventDefault();
		e.stopPropagation();
		if(self.$mainMenu.is(":visible")) {
			self.$mainMenu.stop().slideUp();
		} else {
			self.$mainMenu.stop().slideDown();
			$.scrollTo(0);
		}
	}
	
	function showMenu() {
		var $subActive = self.$mainSubmenu.find(".i-active");
		if($subActive.size() == 0) $subActive = self.$mainSubmenu.find(".i-inside");
		if($subActive.is(":visible")) return;
		
		var $mainActive = self.$mainMenu.find(".i-active");
		if($mainActive.size() == 0) $mainActive = self.$mainMenu.find(".i-inside");
		
		if(self.$mainSubmenu.find(".b-main-submenu:visible").size() != 0) {
			self.$mainSubmenu.find(".b-main-submenu:visible").fadeOut(300, function() {
				fadeInSubmenu($mainActive);
			});
		} else {
			fadeInSubmenu($mainActive);
		}
	}
	
	function fadeInSubmenu($mainActive) {
		self.$mainSubmenu.css({marginTop: 0});
		makeScrolled();
		if($mainActive.size() == 0) return;
		var dir = $mainActive.parent().attr("data-dir");
		if(dir) {
			self.$mainSubmenu.find("[data-dir=" + dir + "]").fadeIn(500, function() {
				makeScrolled();
			});
		}
	}
	
	function hideMenu() {
		self.$mainSubmenu.find("menu").fadeOut();
	}
	
	function highlight() {
		self.$elem.find("a").removeClass("i-active").removeClass("i-inside");
		var url = $(".b-sliding-content").attr("data-url");
		if(!url) return;
		
		self.$mainSubmenu.find("a")
			.each(function() {
				var $a = $(this);
				var href = $a.attr("href");
				if(url == href) {
					$a.addClass("i-active");
				} else if(url.search(href) != -1) {
					$a.addClass("i-inside");
				}
			});
		
		self.$mainMenu.find("a")
			.each(function() {
				var $a = $(this);
				var $subActive = self.$mainSubmenu.find(".i-active");
				if($subActive.size() == 0) $subActive = self.$mainSubmenu.find(".i-inside");
				if($subActive.size() == 0) {
					if($a.attr("href") == url) $a.addClass("i-active");
					return;
				}
				
				var dir = $subActive.closest("menu").attr("data-dir");
				if(dir && dir == $a.parent().attr("data-dir")) $a.addClass("i-inside");
			});
	}
	
	function makeScrolled() {
		var scrolled = $(".b-scrolled-menu__type_main-submenu").data("ScrolledMenu");
		if(scrolled.$content.height() > scrolled.$wrapper.height()) {
			scrolled.$elem.addClass("i-bottom");
		} else {
			scrolled.$elem.removeClass("i-top").removeClass("i-bottom");
		}
	}
	
	/*--- public methods ---*/
	
	this.highlight = function() {
		highlight();
	};
	
	this.showMenu = function() {
		showMenu();
	};
	
	this.makeScrolled = function() {
		makeScrolled();
	};
	
	this.hideMenu = function() {
		hideMenu();
	};
}

function contactsNav() {
	var $contacts = $("#b-contacts-nav");
	var $bg = $contacts.find(".b-contacts-nav__bg");
	var $text = $contacts.find(".b-contacts-nav__item__text");
	var $phone = $contacts.find(".i-phone");
	var $mail = $contacts.find(".i-mail");
	var $skype = $contacts.find(".i-skype");
	var animationFlag = false;
	
	$contacts
		.mouseenter(enter)
		.mouseleave(leave);
	
	function enter() {
		if(isMobile()) return;
		animationFlag = true;
		setTimeout(function() {
			if(animationFlag) {
				$bg.fadeIn();
				$text.fadeIn();
				$mail.stop().animate({left: "300px"}, 500, "easeOutQuad");
				$skype.stop().animate({left: "550px"}, 500, "easeOutQuad");
			}
		}, 100);
	}
	
	function leave() {
		if(isMobile()) return;
		animationFlag = false;
		$bg.fadeOut();
		$text.fadeOut();
		$mail.stop().animate({left: "100px"}, 500, "easeOutQuad");
		$skype.stop().animate({left: "150px"}, 500, "easeOutQuad");
	}
}

function contacts() {
	if(!document.getElementById("contacts__map")) return;
	
	var $map = $("#contacts__map");
	var $mapLink = $("#contacts__map-link");
	var $sliding = $map.find(".b-contacts__map__sliding");
	$mapLink.click(clickMapLink);
	$sliding.click(clickSliding);
	
	var myMap;
	ymaps.ready(init);	
	
	function init () {
		myMap = new ymaps.Map('contacts__map', {
			center: [55.773251, 37.498564], // Москва
			zoom: 16
		});
		
		myMap.controls.add('zoomControl', {left: 60, top: 5});
		
		myPlacemark = new ymaps.Placemark([55.773251, 37.498564], {
            // Чтобы балун и хинт открывались на метке, необходимо задать ей определенные свойства.
            balloonContentHeader: "Студия Twin px",
            balloonContentBody: "Наш адрес: Улица Мневники, дом 3, корпус 1, вход со стороны 2-го Силикатного проезда<br>Москва, Россия, 123308.<br>Офис 224.",
            balloonContentFooter: "",
            hintContent: ""
        });
		
		myMap.geoObjects.add(myPlacemark);
	}
	
	function clickMapLink(e) {
		e.preventDefault();
		e.stopPropagation();
		$map.show().stop().animate({left: "0"}, 800, "easeOutQuad", function() {myMap.container.fitToViewport();});
	}
	
	function clickSliding(e) {
		e.preventDefault();
		e.stopPropagation();
		$map.stop().animate({left: "100%"}, 800, "easeOutQuad", function() {
			$map.hide();
		});
	}
}

function Portfolio($elem) {
	var self = this;
	
	init();
	
	function init() {
		initVarsAndElems();
		handleEvents();
	}
	
	function initVarsAndElems() {
		self.$elem = $elem;
		self.$elem.data("Portfolio", self);
	}
	
	function handleEvents() {
		self.$elem
			.delegate(".b-portfolio__item__link", "mouseenter", mouseenterLink)
			.delegate(".b-portfolio__item__link", "mouseleave", mouseleaveLink);
	}
	
	function mouseenterLink() {
		$(this)
			.find(".b-portfolio__item__link__bg").stop().animate({opacity: 0.75}, 500).end()
			.find(".b-portfolio__item__link__name").stop().animate({top: "25px"}, 800, "easeOutElastic");
	}
	
	function mouseleaveLink() {
		$(this)
			.find(".b-portfolio__item__link__bg").stop().animate({opacity: 0}, 500).end()
			.find(".b-portfolio__item__link__name").stop().animate({top: "-40px"}, 500, "easeInQuad");
	}
}

/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3.1
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

//mousewheel
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.6
 *
 * Requires: jQuery 1.2.2+
 */
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        version: '3.1.6',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );
        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

}));

/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-shiv-cssclasses-teststyles-prefixes-load
 */
;window.Modernizr=function(a,b,c){function w(a){j.cssText=a}function x(a,b){return w(m.join(a+";")+(b||""))}function y(a,b){return typeof a===b}function z(a,b){return!!~(""+a).indexOf(b)}function A(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:y(f,"function")?f.bind(d||b):f}return!1}var d="2.7.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={},o={},p={},q=[],r=q.slice,s,t=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},u={}.hasOwnProperty,v;!y(u,"undefined")&&!y(u.call,"undefined")?v=function(a,b){return u.call(a,b)}:v=function(a,b){return b in a&&y(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=r.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(r.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(r.call(arguments)))};return e}),n.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:t(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c};for(var B in n)v(n,B)&&(s=B.toLowerCase(),e[s]=n[B](),q.push((e[s]?"":"no-")+s));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)v(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},w(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=m,e.testStyles=t,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+q.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

function ajaxError(a, b, c) {
	if(window.console) {
		console.log(a);
		console.log(b);
		console.log(c);
	}
}