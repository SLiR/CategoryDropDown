(function($){

    $.fn.CategoryDropDown = function(options){

        options = $.extend({}, $.fn.CategoryDropDown.defaultOptions, options);

        // dropdown handles the UL elements located inside the first level LI elements.
        var dropdown = function(el, innerCDD){
            el.dropdown         = 'test';
            this.cdd            = innerCDD;
            this.el             = el;
            this.placeholder    = this.el.find('> span');
            this.opts           = this.el.find('> ul > li');
            this.selectedValue  = '';
            this.selectedIndex  = -1;
            this.title          = this.placeholder.text();

            this.initEvents();
        };

        dropdown.prototype = {
            initEvents : function(){
                var obj = this;

                obj.el.on('click', function(){
                    $(this).toggleClass(options.activeClass);
                    return false;
                });

                obj.opts.on('click', function(){
                    return obj.doSelect($(this));
                });
            },
            doSelect : function(opt){
                if(opt){
                    var attr = opt.attr('value');
                    this.selectedValue = (attr != null ? attr : $.trim(opt.text()) );
                    this.selectedIndex = opt.index();
                    this.placeholder.text(this.title + ': ' + this.selectedValue);
                } else {
                    this.selectedValue = '';
                    this.selectedIndex = -1;
                    this.placeholder.text(this.title);
                }
                // Make sure the dropdown can collapse
                this.el.removeClass(options.activeClass);
                this.cdd.select(this);
                return false;
            }
        };

        this.select = function(dropdown){
            if(!dropdown) return;
            if(this.lastDropdown && this.lastDropdown !== dropdown)
                this.lastDropdown.doSelect();

            if(dropdown.selectedIndex > -1)
            {
                // var newIndex = [$(this).index(), dropdown.el.index(), dropdown.selectedIndex];

                // // http://stackoverflow.com/questions/1773069/using-jquery-to-compare-two-arrays
                // // Use jQuery to compare two arrays.
                // if(this.selectedIndex &&
                //     $(this.selectedIndex).not(newIndex).length == 0 &&
                //     $(newIndex).not(this.selectedIndex).length == 0 ) return;

                if(this.selectedValue && this.selectedValue === dropdown.selectedValue)
                    return;

                this.lastDropdown = dropdown;
                //this.selectedIndex = newIndex;
                this.selectedValue = dropdown.selectedValue;
                //window.location.hash = 'cdd[' + this.selectedIndex + ']';
                window.location.hash = 'cdd[' + this.selectedValue + ']';
            }
            else
            {
                this.selectedIndex = null;
                this.lastDropdown = null;
            }
        };

        this.init = function(){
            var cdd = this;

            this.each(function(){
                var innerCDD        = this;
                this.lastDropdown   = null;
                this.selectedVal    = null;
                this.selectedIndex  = null;
                this.select         = cdd.select;

                $(this).find('> li').each(function(){
                    new dropdown($(this), innerCDD);
                });
            });

            //if(window.location.hash)
            //alert(window.location.hash);

            // var regex = /(?!cdd\[)(\d+(?!=,*))(?!=\])/gi;
            var regex = /(?!cdd\[)(\w)+(?=\])/gi;
            if(regex.test(window.location.hash))
            {
                var fromHash = window.location.hash.match(regex);

                var selItem = $(this).find('li ul li:contains("' + fromHash + '"):first');
                if(selItem.length > 0)
                {
                    alert(selItem.html());
                    selItem.click();
                    // var parent = selItem.closest('li:first');
                    // alert(parent.length);
                    // if(parent.length > 0){
                    //     alert(parent.dropdown);
                    //     parent.click();
                    // }
                }
            }

            $(document).click(function(){
                cdd.find('> li').removeClass(options.activeClass);
            })

        };

        this.init();

        return this;
    };

    $.fn.CategoryDropDown.defaultOptions = {
              class:    'categorydropdown',
        activeClass:    'active'
    };

})(jQuery);