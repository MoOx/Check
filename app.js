// jquery wrapper
(function($)
{
    // API
    var CheckAppApi = function(tokenblabla)
    {
        // public api
        this.add = function(taskContent, callback, error)
        {
            return _do('add', {message: taskContent}, callback);
        };

        this.check = function(id, callback, error)
        {
            return _do('check', {id: id}, callback, error);
        };

        this.uncheck = function(id, callback, error)
        {
            return _do('uncheck', {id: id}, callback, error);
        }
        this.setOrder = function(ids, callback, error)
        {
            return _do('order', {ids: ids}, callback, error);
        }

        // private
        var _do = function(action, data, callback, error)
        {
            // @todo server side implementation
            $jqxhr = $.getJSON('api.json?' + action, data);

            $jqxhr.done(callback);
            // @todo define global error handler for ajax request
            //if (error) $jqxhr.fail(error);
            if (console && console.log)
            {
                console.log('CheckApi called', action, data, callback, error);
            }
        }
    };
    CheckApi = new CheckAppApi($(document.body).attr('token'));

    // DOM Plugin
    $.fn.todoify = function(element, options)
    {
        // to avoid confusions, use "plugin" to reference the
        // current instance of the object
        var plugin = this;
        var done = $('<div class="done" />').insertAfter(plugin);
        var $todo = $(element); // reference to the jQuery version of DOM element

        // public
        plugin.init = function()
        {
            initListElement(getListElements());
            var list = parseList();

            // if no list preset
            // @todo maybe move this part to API
            if (!list.length)
            {
                plugin.add('Hire me');
                plugin.add('Check code');
                plugin.add('Drag & Drop me');
                plugin.add('Check/Uncheck me');
            }

            var $form = $todo.closest('form'); // a bit random I know...
        }


        plugin.add = function(task)
        {
            makeUnSortable();
            CheckApi.add(task, function(data)
            {
                console.log('add callback');
                plugin.prepend(createTaskElement(task, data));
                $('#task').val('');
                makeSortable();
            });



            return true;
        }

        // private
        var createTaskElement = function(taskContent, data)
        {
            return initListElement($('<label>' + taskContent + '</label>'));
        }

        var initListElement = function($li)
        {
            var $checkbox = $('<input type="checkbox" />').bind('change', function(e)
            {
                makeUnSortable();
                if ($checkbox.is(':checked'))
                {
                    CheckApi.check($li.attr('id'), function()
                    {
                        done.prepend($li);
                        makeSortable();
                    },
                    function()
                    {
                        // uncheck me
                        // @todo add a param when checking to avoid infinite looop (trigger uncheck will trigger this function wich trigger uncheck...etc ...)
                    });
                }
                else
                {
                    CheckApi.uncheck($li.attr('id'), function()
                    {
                        plugin.prepend($li);
                        makeSortable();
                    },
                    function()
                    {
                        // recheck me
                    });
                }
            });

            return $li.prepend($checkbox);
        }

        var parseList = function()
        {
            var list = [];
            getListElements().each(function(i, li)
            {
                var $li = $(li);
                list.push({id: $li.attr('li'), text: $li.text()});
            });

            return list;
        }

        var getListElements = function()
        {
            return $todo.find('>li');
        }

        var makeUnSortable = function()
        {
            plugin.sortable('destroy');
            done.sortable('destroy');
        }

        var makeSortable = function()
        {
            plugin.sortable();
            done.sortable();
        }

        plugin.init(); // start !

        return plugin;
    };

    // bootstrap
    $(function()
    {
        var $todo = $('.todo').todoify();

        var $form = $('#add-task').bind('submit', function(e)
        {
            e.preventDefault(); // stop <form> normal submit

            // @todo replace alert() with a better notification system
            try
            {
                if (!$todo.add($task.val()))
                {
                    alert('Your task have no been added. Please try later or contact support if it persists');
                };
            }
            catch(e)
            {
                alert('Error "' + e +  '". Please try later or contact support if it persists');
            }
        })

        var $task = $('#task');

        // @todo add pollfills for placeholder
    });

})(jQuery);