(function( $, undefined ) {
$.fn.extend({
    clickableSort : function(options) {

        var _sorted = options && options.sorted ? options.sorted : function() {};

        this.children().addClass('ui-sort-item');

        if (options && options.cancel) {
            this.children().filter(options.cancel).removeClass('ui-sort-item');
        }

        this.find('.js-sort-up').bind('click.clickableSort', $.proxy(function(e) {
            e.preventDefault();
            var $target = $(e.target).hasClass('ui-sort-item')? $(e.target) : $(e.target).parents('.ui-sort-item');

            if (this.find('.ui-sort-item').first()[0] != $target[0]) {
                var $prev = $target.prev('.ui-sort-item');
                $prev.before($target);
                _sorted($target);
            }
        }, this));

        this.find('.js-sort-down').bind('click.clickableSort', $.proxy(function(e) {
            e.preventDefault();
            var $target = $(e.target).hasClass('ui-sort-item')? $(e.target) : $(e.target).parents('.ui-sort-item');

            if (this.find('.ui-sort-item').last()[0] != $target[0]) {
                var $next = $target.next('.ui-sort-item');
                $next.after($target);
                _sorted($target);
            }
        }, this));
    }
});
})(jQuery);