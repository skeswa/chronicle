var TIMEDATE_REGEX = /(\w+)\s(\w+)\s(\d+)\s(\d+)\s(\d+):(\d+):(\d+)/;

module.exports = {
    time: {
        sequence: function(splits) {
            for (var split in splits) {
                setTimeout(splits[split], split);
            }
        },
		ago: function(millis) {
			var deltaMillis = (new Date()).getTime() - millis;	
			if (deltaMillis < 60001) {
				return 'a few seconds ago';
			} else if (deltaMillis < 600001) {
				return 'a few minutes ago';
			} else if (deltaMillis < 1800001) {
				return 'a little while ago';
			} else if (deltaMillis < 3600001) {
				return 'almost an hour ago';
			} else if (deltaMillis < 7200001) {
				return 'a couple hours ago';
			} else if (deltaMillis < 8640001) {
				return 'a day ago';
			} else {
				var tmpDate = new Date(millis);
				return tmpDate.toString().replace(/\sGMT(.{1,})$/i, '');		
			}
		},
		toString: function(millis) {
			var dateString = (new Date(millis)).toString().replace(/\sGMT(.{1,})$/i, ''),
				match = dateString.match(TIMEDATE_REGEX),
				month = match[2],
				day = match[3],
				year = match[4],
				hour = parseInt(match[5]),
				minutes = match[6],
				seconds = match[7];
			
			return {
				date: [
					month,
					day + ', ',
					year
				].join(' '),
				time: [
					(hour > 12 ? (hour - 12) : hour) + ':' + minutes + ':' + seconds,
					(hour >= 12 ? 'PM' : 'AM')
				].join(' ')
			};
		}
    },
    dom: {
        isDescendant: function(parent, child) {
            var node = child.parentNode;
            while (node != null) {
                if (node == parent) return true;
                node = node.parentNode;
            }
            return false;
        }
    },
    assets: {
        waitForImages: function(images, done) {
            var img, count = 0, callback = function() {
                if (++count === images.length) {
                    done();
                }
            };

            for (var i = 0; i < images.length; i++) {
                img = new Image();
                img.onload = callback;
                img.src = images[i];
            }
        },
        waitForWebfonts: function(fonts, callback) {
            // Coutesy of Thomas Bachem
            var loadedFonts = 0;
            for (var i = 0, l = fonts.length; i < l; i++) {
                (function(font) {
                    var node = document.createElement('span');
                    // Characters that vary significantly among different fonts
                    node.innerHTML = 'giItT1WQy@!-/#';
                    // Visible - so we can measure it - but not on the screen
                    node.style.position      = 'absolute';
                    node.style.left          = '-10000px';
                    node.style.top           = '-10000px';
                    // Large font size makes even subtle changes obvious
                    node.style.fontSize      = '300px';
                    // Reset any font properties
                    node.style.fontFamily    = 'sans-serif';
                    node.style.fontVariant   = 'normal';
                    node.style.fontStyle     = 'normal';
                    node.style.fontWeight    = 'normal';
                    node.style.letterSpacing = '0';
                    document.body.appendChild(node);
                    // Remember width with no applied web font
                    var width = node.offsetWidth;
                    // Set the font-family
                    node.style.fontFamily = font;

                    var interval;
                    function checkFont() {
                        // Compare current width with original width
                        if (node && node.offsetWidth != width) {
                            ++loadedFonts;
                            node.parentNode.removeChild(node);
                            node = null;
                        }
                        // If all fonts have been loaded
                        if (loadedFonts >= fonts.length) {
                            if (interval) {
                                clearInterval(interval);
                            }
                            if (loadedFonts === fonts.length) {
                                callback();
                                return true;
                            }
                        }
                    };

                    if(!checkFont()) {
                        interval = setInterval(checkFont, 50);
                    }
                })(fonts[i]);
            }
        }
    },
    storage: {
        load: function(key, valueDefault) {
            if (typeof Storage !== 'undefined') {
                var valStr = localStorage.getItem(key);
                return JSON.parse(valStr) || valueDefault;
            } else {
                // No local storage support
                return valueDefault;
            }
        },
        save: function(key, value) {
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }
    },
    events: {
        once: function (el, type, callback) {
            var typeArray = type.split(' ');

            for (var i = typeArray.length - 1; i >= 0; i--) {
                el.addEventListener(typeArray[i], function(e) {
                    e.target.removeEventListener(e.type, arguments.callee);
                    return callback(e);
                });
            }
        },
        on: function(el, type, callback, capture) {
            el.addEventListener(type, callback, capture || false);
        },
        off: function(el, type, callback, capture) {
            el.removeEventListener(type, callback, capture || false);
        }
    }
}
