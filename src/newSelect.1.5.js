/*
 * newSelect jQuery plugin: searchable select
 *
 * Copyright 2014 huben92 (http://huben92.wordpress.com)
 *
 * Licensed under the MIT license: http://opensource.org/licenses/MIT
 *
*/

(function($) {

    var printCss = false;

    $.fn.newSelect = function(config){

        var genSelect = function( $el ){

            /**
            * Global Variable
            */
            var options, all_options, selected, focused, lists_per_page,

            /**
            * Global Element
            */
            $ns = $('<div class="__ns" style="width:'+ $el.width() +'"></div>'),
            $search = $('<div class="__ns_search_container"><input class="__ns_search '+ $el.attr('class') +'" type="text"></div>'),
            $options = $('<ul class="__ns_options_container options-container"></ul>');

            var __init = function(){

                if ( printCss === false ){
                    var $cssParent = ( $('html head').length > 0 ) ? $('html head') : $('body');
                    var css = '<style type="text/css">.__ns{position:relative;display:inline-block}.__ns_overlay{position:absolute;z-index:2}.__ns_search_container{position:absolute;z-index:3}.__ns_search{margin:1px;width:100%;height:100%;padding:2px}.__ns_options_container{padding:0;background:#fff;width:100%;border-left:#ccc 1px solid;border-right:#ccc 1px solid;border-bottom:#ccc 1px solid;position:absolute;z-index:9999}.__ns_options_container li{list-style:none;max-width:100%;overflow:hidden;padding:0 2px;white-space:nowrap;cursor:pointer;font-family:Arial;font-size:80%}.__ns_options_container li.selected{background:#9CDFFF}.__ns_options_container li.focused{background:#1BA1E2}</style>';
                    if (typeof $cssParent != 'undefined'){
                        $cssParent.append(css)
                    } else{
                        document.write(css);
                    }
                    printCss = true;
                }

                $el.after($ns);
                $el.appendTo($ns);
                $ns.append('<div class="__ns_overlay"></div>');
                $ns.append($search);
                $ns.append($options);
                $ns.children('.__ns_overlay').css({
                    height: $el.height()+2,
                    width: $el.width()+2,
                    margin: $el.css('margin'),
                    padding: $el.css('padding'),
                    top: 0,
                    left: 0
                });

                $search.css({
                    width: $el.width(),
                    height: $el.height(),
                    margin: $el.css('margin'),
                    padding: $el.css('padding'),
                    top: 0,
                    left: 0,
                    display: 'none'
                })

                $options.css({
                    top: $el.height() + 1,
                    left: 1,
                    margin: $el.css('margin'),
                    width: $el.width() - 2,
                    display: 'none'
                })
            }

            var getoptions = function(){
                all_options = [];
                $el.find('option').each(function(key, val){
                    var is_selected = ( selected.val == $(this).val() ) ? 1 : 0;

                    all_options.push( {
                        index    : key,
                        val      : $(this).val(),
                        html     : $(this).html(),
                        selected : is_selected
                    } );
                });

                return all_options;
            }

            var changeFocus = function( eq ){
                if (typeof eq == 'undefined' || eq < 0 || eq > options.length){
                    return null;
                }

                var $el = $options.children('.__ns_option').eq(eq);
                if ($el.length > 0){

                    $options.children('.__ns_option').removeClass('focused');
                    $el.addClass('focused');

                    focused = options[eq];
                }
            }

            var changeSelected = function( eq ){
                if (typeof eq == 'undefined' || eq < 0 || eq > options.length){
                    return null;
                }

                var $el = $options.children('.__ns_option').eq(eq);
                if ($el.length > 0){

                    $options.children('.__ns_option').removeClass('selected');
                    $el.addClass('selected');

                    selected = options[eq];
                }
            }

            var printOptions = function($el, options){

                // Empty options first
                $el.empty();

                $.each(options, function(key, val){
                    var $option = $('<li class="__ns_option option" index="'+ val.index +'" val="'+ val.val +'" selected="'+ val.selected +'">'+ val.html +'</li>');
                    // Bind select on click option
                    $option
                        .unbind('click')
                        .bind('click', function(e){
                            e.preventDefault();

                            select({
                                index    : key,
                                val      : $(this).attr('val'),
                                html     : $(this).html(),
                                selected : 0
                            });
                        })
                        .appendTo($el);

                    if (val.val == focused.val && val.val != 'null' ){
                        changeFocus( key );
                    }

                    if (val.val == selected.val && val.val != 'null'){
                        $option.addClass('selected');
                    }

                    $option.hover(function(){
                        changeFocus( key );
                    })
                });

                // changeFocus( 0 );

                if ( $el.height() > 350 ){
                    $el.css({
                        'max-height'    : 350,
                        'overflow-y'     : 'scroll',
                    });
                }
            }

            var close = function(){
                $el.css({ visibility: 'visible' });
                $search.hide();
                $options.hide();
            }

            var open = function(callback){
                $el.css({ visibility: 'hidden' });
                options = all_options;
                printOptions($options, all_options);
                $search.show().children('.__ns_search').focus().val(selected.html).select();
                $options.show(0, function(){
                    if (typeof callback == 'function')
                        callback();

                    lists_per_page = $options.height() / $options.children('.__ns_option:first').height();
                    if (typeof Math.floor != 'undefined')
                        lists_per_page = Math.floor(lists_per_page);
                });
            }

            var select = function(option){
                if (option.val == 'null'){
                    return null;
                }

                selected = option;
                focused = selected;

                $el.val(selected.val).trigger('change');
                close();
            }

            var searchObj = function(obj, key, val){
                if (val == ''){
                    return obj;
                }

                var objects = [];
                for (var i in obj) {
                    if (!obj.hasOwnProperty(i)) continue;
                    if (typeof obj[i] == 'object') {
                        if (i % 1 === 0){
                            objects = objects.concat(searchObj(obj[i], key, val));
                        }
                    } else{
                        if (typeof obj[key] != 'undefined'){
                            var search = obj[key].toLowerCase().search(val.toLowerCase());
                            if (i == key && search != -1) {
                                obj['sort'] = search;
                                objects.push(obj);
                            }
                        }
                    }
                }
                return objects.sort();
            }

            var bindSearch = function($el){
                $el
                .unbind('keyup keydown')
                .bind('keyup keydown', function(e){

                    // Close on esc key pressed
                    if ( e.keyCode == 27 ){
                        e.preventDefault();

                        close();
                        return null;
                    }

                    // Keyboard enter
                    if ( e.keyCode == 13 ){
                        e.preventDefault();

                        if (e.type == 'keydown'){
                            select( selected );
                        }

                    // Keyboard home
                    } else if ( e.keyCode == 36 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            eq = 0;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            $options
                                .stop(true, false)
                                .scrollTop( 0 );
                        }

                    // Keyboard end
                    } else if ( e.keyCode == 35 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            eq = options.length-1;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            if ( $el.length > 0 && $el.offset().top > $el.parent().offset().top ){
                                var scTop = $el.height() * (eq+1);
                                scTop -= $el.parent().height();
                                $options
                                    .stop(true, false)
                                    .scrollTop( scTop );
                            }
                        }

                    // Keyboard page down
                    } else if ( e.keyCode == 34 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            var eq = options.indexOf(focused);
                            eq = (eq+lists_per_page > options.length-1) ? options.length-1 : eq+lists_per_page;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            if ( $el.length > 0 && $el.offset().top > $el.parent().offset().top ){
                                var scTop = $el.height() * (eq+1);
                                scTop -= $el.parent().height();
                                $options
                                    .stop(true, false)
                                    .scrollTop( scTop );
                            }
                        }

                    // Keyboard page up
                    } else if ( e.keyCode == 33 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            var eq = options.indexOf(focused);
                            eq = (eq-lists_per_page < 0) ? 0 : eq-lists_per_page;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            if ( $el.length > 0 && $el.offset().top < $el.parent().offset().top ){
                                var scTop = $el.height() * (eq);
                                $options
                                    .stop(true, false)
                                    .scrollTop( scTop );
                            }
                        }

                    // Keyboard down
                    } else if ( e.keyCode == 40 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            var eq = options.indexOf(focused)+1;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            if ( $el.length > 0 && $el.offset().top > $el.parent().offset().top+$el.parent().height()-$el.height() ){
                                var scTop = $el.height() * (eq+1);
                                scTop -= $el.parent().height();
                                $options
                                    .stop(true, false)
                                    .scrollTop( scTop );
                            }
                        }

                    // Keyboard up
                    } else if ( e.keyCode == 38 ){
                        e.preventDefault();

                        if ( e.type == 'keydown' ){
                            var eq = options.indexOf(focused)-1;

                            changeFocus( eq );
                            changeSelected( eq );

                            var $el = $options.children('.__ns_option').eq( eq );
                            if ( $el.length > 0 && $el.offset().top < $el.parent().offset().top ){
                                var scTop = $el.height() * (eq);
                                $options
                                    .stop(true, false)
                                    .scrollTop( scTop );
                            }
                        }
                    } else{
                        options = searchObj( all_options, 'html', $(this).val() );
                        if ( typeof options[0] == 'undefined' ){
                            options[0] = {
                                index   : 0,
                                val     : 'null',
                                html    : $(this).val() +' not found!'
                            }
                        } else{
                            selected = options[0];
                            focused = selected;
                        }

                        // Tab pressed
                        if ( e.keyCode == 9 ){
                            e.preventDefault();

                            if ( options[0].val != 'null' ){
                                $(this).val( options[0].val );
                            }
                        }

                        // Change the options
                        printOptions( $options, options );
                    }
                });
            }

            try{
                __init();
            } catch(err){
                console.error('newSelect.1.5: An error occured when initializing newSelect');
                console.log('newSelect.1.5: Please tell us about this error, so we can fix it in future version');
                console.log('newSelect.1.5: You can report it by sending email to huben92@gmail.com');
            }

            selected = {
                index    : 0,
                val      : $el.children(':selected').val(),
                html     : $el.children(':selected').html(),
                selected : 1
            };
            focused = selected;

            try{
                all_options = options = getoptions();
            } catch(err){
                console.error('newSelect.1.5: An error occured when generating options');
                console.log('newSelect.1.5: Please tell us about this error, so we can fix it in future version');
                console.log('newSelect.1.5: You can report it by sending email to huben92@gmail.com');
            }

            try{
                printOptions($options, all_options);
            } catch(err){
                console.error('newSelect.1.5: An error occured when printing options to html');
                console.log('newSelect.1.5: Please tell us about this error, so we can fix it in future version');
                console.log('newSelect.1.5: You can report it by sending email to huben92@gmail.com');
            }

            try{
                bindSearch($search.children('.__ns_search'));
            } catch(err){
                console.error('newSelect.1.5: An error occured when binding event for search options');
                console.log('newSelect.1.5: Please tell us about this error, so we can fix it in future version');
                console.log('newSelect.1.5: You can report it by sending email to huben92@gmail.com');
            }

            // Open when select clicked
            $ns.children('.__ns_overlay')
            .unbind('click')
            .bind('click', function(e){
                e.preventDefault();
                open();
            });

            // Close when click outside
            $(document).on("click", function(e){
                if ( !$ns.is(e.target) && $ns.has(e.target).length === 0 ){
                    close();
                }
            });

        }

        $.each(this, function(){
            genSelect( $(this) );
        });

    }

}(jQuery));