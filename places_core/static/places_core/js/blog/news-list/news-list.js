//
// news-list.js
// ============
//
// Manage location's blog.
//
define(['jquery',
        'underscore',
        'backbone',
        'utils', 
        'js/utils/pageable-view',
        'paginator',
        'moment'],

function ($, _, Backbone, utils, PageableView) {
    
    "use strict";
        
    var baseurl = $('#rest-api-url').val(),

        NewsModel = Backbone.Model.extend({}),

        NewsView = Backbone.View.extend({
            
            tagName: 'div',

            className: 'news-entry',

            template: _.template($('#news-entry-tpl').html()),

            submenu: {},

            events: {
                'click .submenu-toggle': 'openMenu'
            },

            render: function () {
                var that = this;
                this.$el.html(this.template(this.model.toJSON()));
                this.submenu = {
                    $el: that.$el.find('.entry-submenu'),
                    opened: false
                };
                this.$el.find('.date-created')
                    .text(moment(this.model.get('date_created')).fromNow());
                if (this.model.get('edited')) {
                    this.$el.find('.date-edited')
                        .text(moment(this.model.get('date_edited')).fromNow());
                }
                return this;
            },

            openMenu: function () {
                if (this.submenu.opened) {
                    this.submenu.$el.slideUp('fast');
                    this.submenu.opened = false;
                } else {
                    this.submenu.$el.slideDown('fast');
                    this.submenu.opened = true;
                }
            },
        }),

        NewsCollection = Backbone.PageableCollection.extend({
            
            model: NewsModel,
            
            url: baseurl,
            
            queryParams: {
                totalRecords: 'count'
            },
            
            parseRecords: function (data) {
                return data.results;
            },
            
            parseState: function (resp, queryParams, state, options) {
                return {totalRecords: resp.count};
            }
        }),

        NewsList = PageableView.extend({

            initialize: function () {
                this.collection = new NewsCollection();
                this.collection.setPageSize(window.pageSize);
                this.$el.appendTo('#entries');
                this.listenTo(this.collection, 'sync', this.render);
            },

            render: function () {
                var self = this;
                this.$el.empty();
                this.$el.html(this.template(this.collection.state));
                this.collection.each(function (item) {
                    this.renderEntry(item);
                }, this);
                this.$el.find('.page').on('click', function () {
                    self.getPage(parseInt($(this).attr('data-index'), 10));
                });
            },

            renderEntry: function (item) {
                var itemView = new NewsView({
                        model: item
                    });
                $(itemView.render().el).insertBefore(this.$el.find('.page-info'));
            }
        });
    
    return NewsList;
});