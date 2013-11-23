(function($){

    $.fn.CategoryDropDown = function(options){

        options = $.extend({}, $.fn.CategoryDropDown.defaultOptions, options);

        // dropdown handles the UL elements located inside the first level LI elements.
        var dropdown = function (el, cdd) {
            this.cdd            = cdd;
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

                this.el.on('click', function(){
                    // Close any open menus
                    $('> li.' + options.activeClass, obj.cdd)
                    .not(this)
                    .each(function () { this.dd.closeMenu(); });

                    $(this).toggleClass(options.activeClass);
                    return false;
                });

                this.opts.on('click', function(){
                    return obj.doSelect($(this));
                });
            },
            closeMenu : function(){
                var domUL = this.el.find('ul:first');
                if(!options.closeOnSelect ||
                    !domUL.is(':visible') ||
                    domUL.css( "visibility") !== 'visible') return;
                this.el.removeClass(options.activeClass);
                var toggleClose = function(){ domUL.toggle(); };
                toggleClose();
                setTimeout(function(){toggleClose();}, 100);
            },
            doSelect : function(listItem, setHash){
                if(!listItem) return;
                // Exit if the same index is being selected.
                if(listItem.index() == this.selectedIndex) return;

                // Reset our selections to get ready for a new selected item.
                this.reset();

                var value = listItem.attr('data-value');
                var text = $.trim(listItem.text());
                var index = listItem.index();

                this.selectedValue = (typeof value !== 'undefined' ? value : text);
                this.selectedIndex = index;

                this.setTitle(text, listItem);

                // Add selected class to the currently selected item.
                listItem.addClass(options.selectedClass);
                // Add selected class to the UL container.
                this.el.addClass(options.selectedClass);

                // Call select on the parent, which is our CategoryDropDown container.
                this.cdd.Select(this, setHash);
                return false;
            },
            reset : function(){
                // Remove the active class from the currently selected item.
                $('li.' + options.selectedClass, this.el).removeClass(options.selectedClass);
                // Make sure the dropdown can collapse and remove the 'selected' class
                this.el.removeClass(options.selectedClass);
                // Close the menu if it's open.
                this.closeMenu();

                this.selectedValue = '';
                this.selectedIndex = -1;
                this.placeholder.text(this.title);
            },
            setTitle : function(text, listItem){
                // Set a new title
                var titleArgs = [ this.title, text, this.selectedValue, this.selectedIndex ];
                var titleFormat;
                if(this.selectedValue == '')
                    titleFormat = '{0}';
                else
                {
                    var attrID = 'data-format';
                    // Try to get the title from the selected list item first.
                    // Try the LI element second.
                    // Try the UL element third.
                    // Finally, fall back to the options title format.
                    titleFormat = ((listItem) ? listItem.attr(attrID) : null)
                                || this.el.attr(attrID)
                                || this.el.closest('ul').attr(attrID)
                                || options.titleFormat;
                }

                var newTitle = titleFormat.replace(/{(\d+)}/g, function(m, i){
                    return (typeof titleArgs[i] !== 'undefined' ? titleArgs[i] : m);
                });

                this.placeholder.text(newTitle);
            }
        };

        this.HashValue = function(value){
            var value = (typeof value !== 'undefined') ? value : this.selectedValue;
            return (value == '') ? '' : options.idkey + '=' + value;
        };

        this.SelectedValue = function(value){
            if(typeof value !== 'undefined')
            {
                var winLoc      = ('' + window.location).split('#');
                var winHash     = winLoc[1];
                var curHash     = this.HashValue();
                var newHash     = this.HashValue(value);
                var newWinLoc   = '';

                if(typeof winHash === 'undefined') winHash = '';

                if(winHash != '' && curHash != '' && winHash.indexOf(curHash) !== -1)
                    newWinLoc = winHash.replace(curHash, newHash);
                else
                    newWinLoc = winHash + ((winHash != '') ? '&' : '') + newHash;

                location.replace(winLoc[0] + '#' + newWinLoc);
                this.selectedValue = value;
            }
            else
                return this.selectedValue;
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
                    var dd = new dropdown($(this), innerCDD);
                    this.dd = dd; // Store the dropdown object on the LI element
                });
            });

            // Set selected menu's based on Location Hash
            this.TrackHash();

            // Close all open drop down menus
            $(document).click(function(){
                cdd.find('> li').removeClass(options.activeClass);
            })
        };

        this.TrackHash = function(){
            // Make sure setHash is set to true by default.
            var regex = new RegExp(options.idkey + '=([^&]*)', 'gi');
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
                    var dropDown = domParent[0].dd;

                    if(dropDown != null)
                        dropDown.doSelect(selItem, false);
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
      selectedClass:    'selected',
      closeOnSelect:    true,
       onItemSelect:    null,
        titleFormat:    '{0}: {1}'
    };

    // Title Format codes:
    // {0} = span text
    // {1} = li text
    // {2} = li value
    // {3} = li index

})(jQuery);