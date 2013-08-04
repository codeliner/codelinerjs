var ClBackbone = $CL.namespace('Cl.Backbone');

$CL.require('Cl.Backbone.View');

ClBackbone.Layout = function() {};

ClBackbone.Layout = $CL.extendClass(ClBackbone.Layout, Cl.Backbone.View, {
    childes : [],
    previousChildes : [],
    contentEl : null,
    init : function() {
        $CL.get('shared_event_manager').attach('application', 'render', [this.onRender, this], 100);
    },
    addChild : function(child) {
        this.childes.push(child);
    },
    render : function(){
        _.each(this.previousChildes, function(child) {
            child.undelegateEvents();
        });

        _.each(this.childes, function(child) {
            child.render();
            child.delegateEvents();
        });

        this.previousChildes = this.childes;

        this.childes = [];
    },
    getContentEl : function() {
        if (_.isNull(this.contentEl)) {
            this.contentEl = $('#js_content')[0];
        }

        return this.contentEl;
    },
    onRender : function(mvcEvent) {

        if ($CL.isInstanceOf(mvcEvent.getResponse(), Cl.Backbone.View)) {
            var childView = mvcEvent.getResponse();

            //do not pass a terminated view to layout
            if ($CL.has(childView, 'isTerminal') && childView.isTerminal()) {
                return;
            }
            childView.setElement(this.getContentEl());
            this.addChild(childView);
            this.previousContentChild = childView;
            mvcEvent.setResponse(this);
        }

        return;
    }
});