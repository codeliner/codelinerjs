var Popup = $CL.namespace('Cl.Popup');

Popup.Store = function() {
    this.popups = {};
    this.minimized = 0;
    this.minimizedLayer = 1;
    this.minimizedObjs = [];
    this.zIndex = 10000;
};

Popup.Store.prototype = {
    addPopup : function(id, ppObj) {
        this.popups[id] = ppObj;
    },
    setMinimized : function(num) {
        this.minimized = num;
    },
    decreaseMinimized : function() {
        this.minimized--;
    },
    increaseMinimized : function() {
        this.minimized++;
    },
    setMinimizedLayer : function(num) {
        this.minimizedLayer = num;
    },
    decreaseMinimizedLayer : function() {
        this.minimizedLayer--;
    },
    increaseMinimizedLayer : function() {
        this.minimizedLayer++;
    },
    addMinimizedObj : function(index, ppObj) {
        this.minimizedObjs[index] = ppObj;
        this.increaseMinimized();
    },
    increaseZIndex : function() {
        this.zIndex++;
    }
}

