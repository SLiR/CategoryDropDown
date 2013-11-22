(function($){

    $.fn.CategoryDropDown = function(options){

        options = $.extend({}, $.fn.CategoryDropDown.defaultOptions, options);

        // dropdown handles the UL elements located inside the first level LI elements.
        var dropdown = function(el, innerCDD){
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
                // Store this dropdown as a data object with jQuery
                $.data(obj.el[0], 'CategoryDropDown', obj);

                obj.el.on('click', function(){
                    $(this).toggleClass(options.activeClass);
                    return false;
                });

                obj.opts.on('click', function(){
                    return obj.doSelect($(this));
                });
            },
            doSelect : function(opt, setHash){
                if(!opt) return;
                // Exit if the same index is being selected.
                if(opt.index() == this.selectedIndex) return;

                // Reset our selections to get ready for a new selected item.
                this.reset();

                var attr = opt.attr('data-value');
                this.selectedValue = $.trim( (typeof attr !== 'undefined' ? attr : opt.text()) );
                this.selectedIndex = opt.index();
                // Set a new title
                var addedTitle = ((this.selectedValue != '') ? ': ' + this.selectedValue : '');
                this.placeholder.text(this.title + addedTitle);
                opt.addClass(options.activeClass);

                // Call select on the parent, which is our CategoryDropDown container.
                this.cdd.Select(this, setHash);
                return false;
            },
            reset : function(){
                // Remove the active class from the currently selected item.
                $('li.' + options.activeClass, this.el).removeClass(options.activeClass);
                // Make sure the dropdown can collapse
                this.el.removeClass(options.activeClass);

                this.selectedValue = '';
                this.selectedIndex = -1;
                this.placeholder.text(this.title);
            }
        };

        this.HashValue = function(value){
            var value = (typeof value !== 'undefined') ? value : this.selectedValue;
            return (value == '') ? '' : '?' + options.idkey + ':' + value;
        };

        this.SelectedValue = function(value){
            if(typeof value !== 'undefined'){
                var winLocation = ('' + window.location).split('#');
                var winHash     = winLocation[1];
                var curHash     = this.HashValue();
                var newHash     = this.HashValue(value);
                var newWinLocation = '';

                if(typeof winHash === 'undefined') winHash = '';

                if(winHash != '' && curHash != '' && winHash.indexOf(curHash) !== -1)
                    newWinLocation = winHash.replace(curHash, newHash);
                else
                    newWinLocation = winHash + newHash;

                location.replace(winLocation[0] + '#' + newWinLocation);
                this.selectedValue = value;
            } else {
                return this.selectedValue;
            }
        };

        this.Select = function(dropdown, setHash){
            if(!dropdown) return;
            // Exit if setting the same value.
            if(this.selectedValue && this.selectedValue === dropdown.selectedValue)
                return;

            // Make sure setHash is set to true by default.
            var setHash = (typeof setHash !== 'boolean') ? true : setHash;

            if(this.lastDropdown && this.lastDropdown !== dropdown)
                this.lastDropdown.reset();

            if(dropdown.selectedIndex > -1)
            {
                this.lastDropdown = dropdown;
                this.selectedIndex = dropdown.selectedIndex;
                if(setHash)
                    this.SelectedValue(dropdown.selectedValue);
                else
                    this.selectedValue = dropdown.selectedValue;
            }
            else
            {
                this.selectedIndex = -1;
                this.SelectedValue('');
                this.lastDropdown = null;
            }

            if(typeof options.onItemSelect === 'function')
                options.onItemSelect(this.selectedValue, this.selectedIndex);
        };

        this.init = function(){
            var cdd = this;

            this.each(function(){
                var innerCDD        = this;
                this.lastDropdown   = null;
                this.selectedVal    = '';
                this.selectedIndex  = -1;
                this.selectedValue  = '';
                this.Select         = cdd.Select;
                this.HashValue      = cdd.HashValue;
                this.SelectedValue  = cdd.SelectedValue;

                $(this).find('> li').each(function(){
                    new dropdown($(this), innerCDD);
                });
            });

            cdd.TrackHash();

            $(document).click(function(){
                cdd.find('> li').removeClass(options.activeClass);
            })
        };

        this.TrackHash = function(){
            // Make sure setHash is set to true by default.
            var regex = new RegExp(options.idkey + ':([^?]*)', 'gi');
            var winHash = window.location.hash;
            var match = regex.exec(winHash);

            while(match != null){
                var value = match[1];
                var selector = 'li ul li:contains("' + value + '"):first,' +
                               'li ul li[data-value="' + value + '"]';
                var selItem = $(this).find(selector);

                if(selItem.length > 0)
                {
                    var domParent = selItem.parents('li');
                    var domDropDown = (domParent.length > 0) ?
                                        $.data(domParent[0], 'CategoryDropDown') :
                                        null;

                    if(domDropDown != null)
                        domDropDown.doSelect(selItem, false);
                }

                match = regex.exec(winHash);
            }
        };

        this.init();

        return this;
    };

    $.fn.CategoryDropDown.defaultOptions = {
              idkey:    'catdd',
        activeClass:    'active',
       onItemSelect:    null
    };

})(jQuery);