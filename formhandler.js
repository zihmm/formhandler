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

        send: function()
        {
            var q = jQuery.Deferred();

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
                            q.resolve(response);
                        }.bind(this))
                        .fail(function(response)
                        {
                            q.reject(jQuery.parseJSON(response.responseText));
                        }.bind(this));
                }
                else
                {
                    this.$element.submit();
                }
            }.bind(this));

            return q.promise();
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

        getSubmitButton: function()
        {
            return this.$element.find('button[type="submit"]');
        },

        _addEvents: function()
        {
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