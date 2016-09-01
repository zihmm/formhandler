;(function(jQuery, window, document)
{
    var pluginName  = 'formHandler',
        defaults    = {
            loadingIndicator:       false,
            hideValidationMessages: false,
            actionUrl:              '',

            useAjax:                true,
            ajaxOptions:            {}
        };

    function FormHandler(element, options)
    {
        this.$element   = element;
        this.options    = jQuery.extend({}, defaults, options);
        this.response   = jQuery.Deferred();

        this.init()

        return this.response.promise();
    }

    // Class
    FormHandler.prototype = {

        init: function()
        {
            this._addEvents();

            // Add action url if nothing is definied
            if (this.options.actionUrl == '')
            {
                this.options.actionUrl = this.$element.attr('action');
            }

            // Hide validation messages?
            if (this.options.hideValidationMessages)
            {
                this.$element.addClass('hide-validation-messages');
            }
        },

        send: function(ev)
        {
            ev.preventDefault();

            this.isValid().then(function(formdata)
            {
                if (this.options.useAjax)
                {
                    var ajaxOptions = jQuery.extend({}, this.options.ajaxOptions, {
                        url:    this.$element.attr('action'),
                        method: this.$element.attr('method'),
                        cache:  false,
                        data: formdata
                    });

                    jQuery.ajax(ajaxOptions)
                        .done(function(response)
                        {
                            this.response.resolve(jQuery.parseJSON(response.responseText));
                        }.bind(this))
                        .fail(function(response)
                        {
                            this.response.reject(jQuery.parseJSON(response.responseText));
                        }.bind(this));
                }
                else
                {
                    this.$element.submit();
                }
            }.bind(this));
        },

        isValid: function()
        {
            var d       = jQuery.Deferred(),
                isValid = this.$element.isValid();

            (isValid) ? d.resolve(this.getFormdate()) : d.reject();

            return d.promise();
        },

        getFormdate: function()
        {
            var formdata = {};

            this.$element.find('input, textarea').each(function(ix, el)
            {
                var $el = $(el);

                switch ($el.prop('nodeName').toLowerCase())
                {
                    case 'checkbox':
                        formdata[$el.attr('name')] = $el.prop('checked');

                    default:
                        formdata[$el.attr('name')] = $el.val();
                }
            });

            return formdata;
        },

        _addEvents: function()
        {
            this.$element.find('button[type="submit"]').on('click', jQuery.proxy(this.send, this));
            jQuery.validate({ form: this.$element });
        }
    };

    // Plugin
    $.fn[pluginName] = function(options)
    {
        if (!$(this).data(pluginName))
        {
            $(this).data(pluginName, new FormHandler(this, options));
        }

        return $(this).data(pluginName);
    };

})(jQuery, window, document);