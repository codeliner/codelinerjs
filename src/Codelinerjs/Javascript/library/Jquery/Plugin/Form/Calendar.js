$CL.require("Cl_Core_Date");

/**
 * CalendarView for jQuery
 *
 * Based on CalendarView for Prototype http://calendarview.org/ which is based
 * on Dynarch DHTML Calendar http://www.dynarch.com/projects/calendar/old/.
 *
 * CalendarView is licensed under the terms of the GNU Lesser General
 * Public License (LGPL)
 *
 * Usage:
 *   jQuery(document).ready(function() {
 *     $('#date_input').calendar();
 *   }
 *
 *   jQuery(document).ready(function() {
 *     $('#date_input').calendar({triggerElement: '#date_input_trigger'});
 *   }
 *
 *   jQuery(document).ready(function() {
 *     $('#date_input').calendar({parentElement: '#calendar_container'});
 *   }
 *
 * Default options:
 *   triggerElement: null, // Popup calendar
 *   parentElement: "click", // Inline calendar
 *   triggerEvent: null, // show on click
 *   minYear: 1900,
 *   maxYear: 2100,
 *   firstDayOfWeek: 1, // Monday
 *   weekend: "0,6", // Sunday and Saturday
 *   dateFormat: '%Y-%m-%d',
 *   selectHandler: null, // Will use default select handler
 *   closeHandler: null // Will use default close handler
 */
(function($, Core_Date) {
	var Calendar = function() {
		this.date = new Date();
	};

	//------------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------------
	
	

	Calendar.VERSION = '1.2';
	Calendar.TODAY = 'Today';	

	Calendar.NAV_PREVIOUS_YEAR  = -2;
	Calendar.NAV_PREVIOUS_MONTH = -1;
	Calendar.NAV_TODAY          =  0;
	Calendar.NAV_NEXT_MONTH     =  1;
	Calendar.NAV_NEXT_YEAR      =  2;

	//------------------------------------------------------------------------------
	// Static Methods
	//------------------------------------------------------------------------------

	/**
	 * This gets called when the user presses a mouse button anywhere in the
	 * document, if the calendar is shown. If the click was outside the open
	 * calendar this function closes it.
	 *
	 * @param event
	 */
	Calendar._checkCalendar = function(event) {
		if (!window._popupCalendar) {
			return false;
		}

		if ($(event.target).parents().index($(window._popupCalendar.container)) >= 0) {
			return false;
		}

		window._popupCalendar.callCloseHandler();
		return event.preventDefault();
	}

	/**
	 * Event Handlers
	 * @param event
	 */
	Calendar.handleMouseDownEvent = function(event){
		$(document).mouseup(Calendar.handleMouseUpEvent);
		event.preventDefault();
	}

	/**
	 * Clicks of different actions
	 * @param event
	 */
	Calendar.handleMouseUpEvent = function(event) {
		var el        = event.target;
		var calendar  = el.calendar;
		var isNewDate = false;

		// If the element that was clicked on does not have an associated Calendar
		// object, return as we have nothing to do.
		if (!calendar) return false

		// Clicked on a day
		if (typeof el.navAction == 'undefined') {
			if (calendar.currentDateElement) {
				calendar.currentDateElement.removeClass('selected');
				$(el).addClass('selected');
				calendar.shouldClose = (calendar.currentDateElement == $(el));
				if (!calendar.shouldClose) {
					calendar.currentDateElement = $(el);
				}
			}
			calendar.date.setDateOnly(el.date);
			isNewDate = true;
			calendar.shouldClose = !$(el).hasClass('otherDay');
			var isOtherMonth     = !calendar.shouldClose;
			if (isOtherMonth) {
				calendar.update(calendar.date);
			}
		} else {
			// Clicked on an action button
			var date = new Date(calendar.date);

			if (el.navAction == Calendar.NAV_TODAY) {
				date.setDateOnly(new Date());
			}

			var year = date.getFullYear();
			var mon = date.getMonth();
			function setMonth(m) {
				var day = date.getDate();
				var max = date.getMonthDays(m);
				if (day > max) date.setDate(max)
					date.setMonth(m);
			}
			switch (el.navAction) {

				// Previous Year
				case Calendar.NAV_PREVIOUS_YEAR:
					if (year > calendar.minYear)
						date.setFullYear(year - 1);
					break;

				// Previous Month
				case Calendar.NAV_PREVIOUS_MONTH:
					if (mon > 0) {
						setMonth(mon - 1);
					}
					else if (year-- > calendar.minYear) {
						date.setFullYear(year);
						setMonth(11);
					}
					break;

				// Today
				case Calendar.NAV_TODAY:
					break;

				// Next Month
				case Calendar.NAV_NEXT_MONTH:
					if (mon < 11) {
						setMonth(mon + 1);
					}
					else if (year < calendar.maxYear) {
						date.setFullYear(year + 1);
						setMonth(0);
					}
					break;

				// Next Year
				case Calendar.NAV_NEXT_YEAR:
					if (year < calendar.maxYear)
						date.setFullYear(year + 1);
					break;

			}

			if (!date.equalsTo(calendar.date)) {
				calendar.shouldClose = false;
				calendar.setDate(date);
				isNewDate = true;
			} else if (el.navAction == 0) {
				isNewDate = (calendar.shouldClose = true);
			}
		}

		if (isNewDate) event && calendar.callSelectHandler();
		if (calendar.shouldClose) event && calendar.callCloseHandler();
		$(document).unbind('mouseup', Calendar.handleMouseUpEvent);
		return event.preventDefault();
	};

	Calendar.defaultSelectHandler = function(calendar) {
		if (!calendar.dateField) {
			return false;
		}

		// Update dateField value
		(calendar.dateField.attr('tagName') == 'INPUT')
			? calendar.dateField.val(calendar.date.print(calendar.dateFormat))
			: calendar.dateField.html(calendar.date.print(calendar.dateFormat));

		// Trigger the onchange callback on the dateField, if one has been defined
		calendar.dateField.trigger('change');

		// Call the close handler, if necessary
		if (calendar.shouldClose) {
			calendar.callCloseHandler();
		}

		return true;
	}

	Calendar.defaultCloseHandler = function(calendar) {
		calendar.hide();
	}

	//------------------------------------------------------------------------------
	// Calendar Instance
	//------------------------------------------------------------------------------

	Calendar.prototype = {
		// The HTML Container Element
		container: null,

		// Dates
		date: null,
		currentDateElement: null,

		// Status
		shouldClose: false,
		isPopup: true,

		/**
		 * Update / (Re)initialize Calendar
		 * @param date
		 */
		update: function(date) {
			var calendar   = this;
			var today      = new Date();
			var thisYear   = today.getFullYear();
			var thisMonth  = today.getMonth();
			var thisDay    = today.getDate();
			var month      = date.getMonth();
			var dayOfMonth = date.getDate();

			// Ensure date is within the defined range
			if (date.getFullYear() < this.minYear) {
				date.setFullYear(this.minYear);
			} else if (date.getFullYear() > this.maxYear) {
				date.setFullYear(this.maxYear);
			}
			this.date = new Date(date);

			// Calculate the first day to display (including the previous month)
			date.setDate(1);
			var day1 = (date.getDay() - this.firstDayOfWeek) % 7;
			if (day1 < 0) day1 += 7;
			date.setDate(-day1);
			date.setDate(date.getDate() + 1);

			// Fill in the days of the month
			$('tbody tr', this.container).each(function() {
				var rowHasDays = false;
				$(this).children().each(function() {
					var day            = date.getDate();
					var dayOfWeek      = date.getDay();
					var isCurrentMonth = (date.getMonth() == month);

					// Reset classes on the cell
					cell = $(this);
					cell.removeAttr('class');
					cell[0].date = new Date(date);
					cell.html(day);

					// Account for days of the month other than the current month
					if (!isCurrentMonth) {
						cell.addClass('otherDay');
					} else {
						rowHasDays = true;
					}

					// Ensure the current day is selected
					if (isCurrentMonth && day == dayOfMonth) {
						cell.addClass('selected');
						calendar.currentDateElement = cell;
					}

					// Today
					if (date.getFullYear() == thisYear && date.getMonth() == thisMonth && day == thisDay) {
						cell.addClass('today');
					}

					// Weekend
					if (calendar.weekend.indexOf(dayOfWeek.toString()) != -1) {
						cell.addClass('weekend');
					}

					// Set the date to tommorrow
					date.setDate(day + 1);
				});
				// Hide the extra row if it contains only days from another month
				!rowHasDays ? $(this).hide() : $(this).show();
			});

			$('td.title', this.container).html(Core_Date.MONTH_NAMES[Date.LANG][month] + ' ' + calendar.date.getFullYear());
		},

		create: function(parent) {

			// If no parent was specified, assume that we are creating a popup calendar.
			this.isPopup = false;
			if (!parent) {
				parent = $('body');
				this.isPopup = true;
			}

			// Calendar Table
			var table = $('<table />');

			// Calendar Header
			var thead = $('<thead />');
			table.append(thead);

			// Title Placeholder
			var row  = $('<tr />');
			var cell = $('<td colspan="7" class="title" />');
			row.append(cell);
			thead.append(row);

			// Calendar Navigation
			row = $('<tr />');
			this._drawButtonCell(row, '&#x00ab;', 1, Calendar.NAV_PREVIOUS_YEAR);
			this._drawButtonCell(row, '&#x2039;', 1, Calendar.NAV_PREVIOUS_MONTH);
			this._drawButtonCell(row, Calendar.TODAY,    3, Calendar.NAV_TODAY);
			this._drawButtonCell(row, '&#x203a;', 1, Calendar.NAV_NEXT_MONTH);
			this._drawButtonCell(row, '&#x00bb;', 1, Calendar.NAV_NEXT_YEAR);
			thead.append(row);

			// Day Names
			row = $('<tr />');
			for (var i = 0; i < 7; ++i) {
				var realDay = (i + this.firstDayOfWeek) % 7;
				cell = $('<th />').html(Core_Date.SHORT_DAY_NAMES[Date.LANG][realDay]);
				if (this.weekend.indexOf(realDay.toString()) != -1)
					cell.addClass('weekend');
				row.append(cell);
			}
			thead.append(row);

			// Calendar Days
			var tbody = table.append($('<tbody />'));
			for (i = 6; i > 0; --i) {
				row = $('<tr />').addClass('days');
				tbody.append(row);
				for (var j = 7; j > 0; --j) {
					cell = $('<td />');
					cell[0].calendar = this;
					row.append(cell);
				}
			}

			// Calendar Container (div)
			this.container = $('<div />').addClass('calendar').append(table);
			if (this.isPopup) {
				this.container.css({
					position: 'absolute',
					display: 'none'
				}).addClass('popup');
			}

			// Initialize Calendar
			this.update(this.date);

			// Observe the container for mousedown events
			this.container.mousedown(Calendar.handleMouseDownEvent);

			// Append to parent element
			parent.append(this.container);
		},

		_drawButtonCell: function(parent, text, colSpan, navAction) {
			var cell = $('<td />');
			if (colSpan > 1) cell[0].colSpan = colSpan; // IE issue attr()
			cell.addClass('button').html(text).attr('unselectable', 'on'); // IE;
			cell[0].calendar     = this;
			cell[0].navAction    = navAction;
			parent.append(cell);
			return cell;
		},

		//------------------------------------------------------------------------------
		// Callbacks
		//------------------------------------------------------------------------------

		/**
		 * Calls the Select Handler (if defined)
		 */
		callSelectHandler: function() {
			if (this.selectHandler) {
				this.selectHandler(this, this.date.print(this.dateFormat));
			}
		},

		/**
		 * Calls the Close Handler (if defined)
		 */
		callCloseHandler: function() {
			if (this.closeHandler) {
				this.closeHandler(this);
			}
		},

		//------------------------------------------------------------------------------
		// Calendar Display Functions
		//------------------------------------------------------------------------------

		/**
		 * Shows the Calendar
		 */
		show: function() {
			this.container.show();
			if (this.isPopup) {
				window._popupCalendar = this;
				$(document).mousedown(Calendar._checkCalendar);
			}
		},

		/**
		 * Shows the calendar at the given absolute position
		 * @param x
		 * @param y
		 */
		showAt: function (x, y) {
			this.container.css({
				left: x + 'px',
				top: y + 'px'
			})
			this.show();
		},

		/**
		 * Shows the Calendar at the coordinates of the provided element
		 * @param element
		 */
		showAtElement: function(element) {
			var offset = element.offset();
			this.showAt(offset.left, offset.top);
		},

		/**
		 * Hides the Calendar
		 */
		hide: function() {
			if (this.isPopup) {
				$(document).unbind('mousedown', Calendar._checkCalendar);
			}
			this.container.hide();
		},

		/**
		 * Tries to identify the date represented in a string.  If successful it also
		 * calls this.setDate which moves the calendar to the given date.
		 * @param str
		 * @param format
		 */
		parseDate: function(str, format) {
			if (!format) {
				format = this.dateFormat;
			}
			this.setDate(Date.parseDate(str, format));
		},

		setDate: function(date) {
			if (!date.equalsTo(this.date))
				this.update(date);
		},

		setRange: function(minYear, maxYear) {
			this.minYear = minYear;
			this.maxYear = maxYear;
		}
	}

	// global object that remembers the calendar
	window._popupCalendar = null;

	

	//------------------------------------------------------------------------------
	// The jQuery plugin function
	//------------------------------------------------------------------------------
	$.fn.calendar = function(options) {
		var defaults = {
			triggerElement: null, // Popup calendar
			triggerEvent: "click", // show on click
			parentElement: null, // Inline calendar
			minYear: 1900,
			maxYear: 2100,
			firstDayOfWeek: 1, // Monday
			weekend: "0,6", // Sunday and Saturday
			dateFormat: '%Y-%m-%d',
			dateField: null,
			selectHandler: null,
			closeHandler: null
		};
		var settings = $.extend({}, defaults, options);

		this.each(function() {
			var self = $(this);
			var calendar = new Calendar();

			calendar.minYear = settings.minYear;
			calendar.maxYear = settings.maxYear;

			calendar.firstDayOfWeek = settings.firstDayOfWeek;
			calendar.weekend = settings.weekend;
			calendar.dateFormat = settings.dateFormat;
			calendar.dateField = (settings.dateField || self);

			calendar.selectHandler = (settings.selectHandler || Calendar.defaultSelectHandler);

			// Inline Calendar
			var selfDate = self.html() || self.val();
			if (settings.parentElement) {
				calendar.create($(settings.parentElement));
				if (selfDate) calendar.parseDate(selfDate);
				calendar.show();
			} else {
				// Popup Calendar
				calendar.create();
				if (selfDate) calendar.parseDate(selfDate);
				var triggerElement = $(settings.triggerElement || self);
				triggerElement.bind(settings.triggerEvent,function() {
					calendar.closeHandler = (settings.closeHandler || Calendar.defaultCloseHandler);
					calendar.showAtElement(triggerElement);
				});
			}
		});

		return this;
	}

})(jQuery, Cl_Core_Date);
