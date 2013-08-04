/*
 * Code is licenced under the new BSD Licence
 * @author Alexander Miertsch
 * @copyright 2011-2012 Alexander Miertsch
 */
var $CL = {
    UNDEFINED_CLASS : 404,
    loadStack : {},
    LANGUAGE : 'de_DE',
    instances : {},
    factories : {},
    fallback_factories : [],
    non_shared_services : [],
    invokables : {},
    stateging : "production",
    vars : {},
    basePath : "",
    beforeAjaxSendListeners : [],

    /**
     * Initializes the core module
     */
    init : function () {
        this.$ = jQuery;

        //get language
        if (this.has(navigator, "language"))
            this.LANGUAGE = navigator.language;
        else if (this.has(navigator, "browserLanguage"))
            this.LANGUAGE = navigator.browserLanguage;
        
        this.$.ajaxSetup({
            beforeSend : $CL.bind(function(jqXhr, request) {  
                _.each(this.beforeAjaxSendListeners, function(listener) {                    
                    listener(jqXhr, request);
                });
            }, this)
        });

        if (this.basePath !== "" ) {
            this.attachBeforeAjaxSend($CL.bind(function(jqXhr, request) {
                var url = request.url;
                request.url = this.basePath + '/' + url.replace(/^\/(.*)/, '$1');
            }, this));            
        }
        
        this.$.each(this.loadStack, this.bind(function (key, className) {
            var obj = this.makeObj(className);
            this.register(key, obj);
        }, this));
    },

    namespace : function(namespace) {
        var parts = namespace.split("."),
            parent = window,
            currentPart = '';

        for (var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];

            parent[currentPart] = parent[currentPart] || {};

            parent = parent[currentPart];
        }

        return parent;
    },

    /**
     * Adds obj to registry
     *
     * @param key   | String | Name of the regisry key
     * @param value | Object | Object to save in registry
     *
     * @return Cl_Core
     */
    register : function (key, value) {
        this.instances[key] = value;
        return this;
    },

    /**
     * Deletes an ojbect from registry
     *
     * @param key | String | Identifirer of the object
     */
    unset : function (key) {
        delete this.instances[key];
    },

    /*
     * Creates new instance from given class name
     *
     * @param className | String | Name of the class
     * @param params    | Object | [optional] params object, this object is passed
     *                             to constructor of the new instance
     *
     * @return Object
     */
    makeObj : function (className, params) {
        try {
            if (!this.classExists(className)) {
                throw this.UNDEFINED_CLASS;
            }

            var ClassConstructor = this.namespace(className);

            if (!this.isDefined(params)) {
                var obj = new ClassConstructor();
            } else {
                var obj = new ClassConstructor(params);
            }

            if (typeof obj != "object") {
                this.exception("undefined class: "+className, "Cl_Core");
            }

            if (_.isFunction(obj.setup)) {
                obj.setup(params || {});
            }

            this.initObj(obj, className);
        } catch (err) {
            this.exception(err, "Cl_Core", {
                makeObj : className,
                params : params
            });
        }

        return obj;
    },
    /**
     * This method is sperated from makeObj, so we can call initObj on an existing instance
     *
     * This is usefull for Backbone.Model instances
     */
    initObj : function(obj, className) {
        if (!this.has(obj, "__CLASSNAME__")) {
            obj["__CLASSNAME__"] = className;

            if (_.isFunction(obj.init))
                obj.init();
        }
    },
    /*
     * Get or create instance that belongs to the given key/alias
     *
     * @param key | String | Key or alias of the object, that is requested
     * @param params | Object | Params object, that is passed to the factories
     *
     * @return Object | null
     */
    get : function(key, params) {
        if (!this.isDefined(params) && this.has(this.instances, key)) {
            return this.instances[key];
        }

        var service = null;

        if (this.has(this.invokables, key)) {
            var className = "";
            if (typeof this.invokables[key] == "function") {
                className = this.className(this.invokables[key]);
            } else {
                className = this.invokables[key];
            }

            service = this.makeObj(className, params);
        } else if (this.has(this.factories, key)) {
            var fName = this.factories[key];
            var factory;

            if (this.isType(fName, "function")) {
                service = fName(this, params);
            } else {
                if (!this.classExists(fName)) {
                    this.exception(
                        "Factory can not be found",
                        "Cl_Core",
                        {
                            factoryName : fName
                        }
                        );
                }

                factory = this.makeObj(fName);

                if (!this.isInstanceOf(factory, Cl.Service.FactoryInterface)) {
                    this.exception(
                        "factory has to be instance of Cl.Service.FactoryInterface",
                        "Cl_Core",
                        {
                            "factoryClass" : this.className(factory)
                            }
                        );
                }

                service = factory.createService(this, params);
            }
        } else if (this.classExists(key)) {
            service = this.makeObj(key, params);
        } else {
            for(var i=0;i<this.fallback_factories.length;i++) {
                var fFactory = null;

                if(typeof this.fallback_factories[i] == "string") {
                    fFactory = this.makeObj(this.fallback_factories[i]);
                    this.fallback_factories[i] = fFactory;
                }

                if (!this.isInstanceOf(fFactory, Cl.Service.FallbackFactoryInterface)) {
                    this.exception(
                        "FallbackFactory has to be instance of Cl.Service.FallbackFactoryInterface",
                        "Cl_Core",
                        {
                            "factoryClass" : this.className(fFactory)
                            }
                        );
                }

                if (fFactory.canCreateService(key, this, params)) {
                    return fFactory.createService(key, this, params);
                }
            }
        }

        if (_.indexOf(this.non_shared_services, key) == -1) {
            this.register(key, service);
        }

        return service;
    },

    addServiceConfig : function(config) {
        if (this.has(config, 'invokables')) {
            _.extend(this.invokables, config.invokables);
        }

        if (this.has(config, 'factories')) {
            _.extend(this.factories, config.factories);
        }

        if (this.has(config, 'fallback_factories')) {
            $.each(config.fallback_factories, this.bind(function(i, factory) {
                this.fallback_factories[this.fallback_factories.length] = factory;
            }, this));
        }

        if (this.has(config, 'non_shared_services')) {
            $.each(config.non_shared_services, this.bind(function(i, serviceKey) {
                this.non_shared_services.push(serviceKey);
            }, this));
        }
    },

    /*
     * Extend a class with parent
     *
     * @param child | Function | class that extends parent
     * @param parent | Function | parent class
     * @param proto | Object | prototype object to assign to child class
     *
     */
    extendClass : function (child, parent, proto) {
        if (!this.isDefined(proto)) {
            proto = {};
        }

        if (this.isType(parent['extend'], 'function')) {
            child = parent.extend(proto);
            child.prototype.parent = parent;
            return child;
        }

        try {
            var tmpClass = child;
            child.prototype = new parent();
            child.prototype.constructor = tmpClass;
            child.prototype.parent = parent.prototype;

            for (var key in proto) {
                child.prototype[key] = proto[key];
            }

            return child;
        } catch (err) {
            $CL.exception(err, "Cl.Core", {
                child : child,
                parent : parent,
                proto : proto
            });
        }
    },
    bind : function (func, c) {
        return function () {
            return func.apply(c, arguments);
        }
    },

    /*
     * Load a required class.
     *
     * This function is used for autoloading classes by the jsLoader PHP module
     *
     * @param className | String | Name of the class
     */
    require : function (className) {},

    /*
     * Checks if the given class exists
     *
     * @param className | String | Name of the class
     *
     * @return Boolean
     */
    classExists : function (className) {
        var parts = className.split("."),
            parent = window,
            currentPart = '';

        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];

            if (!this.isDefined(parent[currentPart])) {
                return false;
            }

            parent = parent[currentPart];
        }

        if (!$CL.isDefined(parent.prototype)) {
            return false;
        }

        return _.isFunction(parent.prototype.constructor);
    },

    /*
     * Checks if given object is an instance of requested class
     *
     * @param obj       | Object | Object to check
     * @param className | String | Name of the class
     *
     * @return Boolean
     */
    isInstanceOf : function (obj, className) {
        if (typeof obj == "undefined") {
            $CL.exception("can not check if object is instance of "
                + className
                + ", cause object is undefined",
                "Cl.Core")
        }

        if (obj instanceof className) {
            return true;
        }

        if (_.isNull(obj) || _.isString(obj)) {
            return false;
        }

        if (typeof obj["__IMPLEMENTS__"] != "undefined") {
            for (var i=0; i<obj["__IMPLEMENTS__"].length;i++) {
                if (obj["__IMPLEMENTS__"][i] == className) {
                    return true;
                }

            }
        }



        return false;
    },

    /**
     * Returns the className of an object
     *
     * @param obj | Object | Requested object
     *
     *  @return String
     */
    className : function (obj) {
        if (typeof obj == "undefined") {
            return "undefined";
        }

        if (this.has(obj, "__CLASSNAME__")) {
            return obj["__CLASSNAME__"];
        } else if (typeof obj == "function") {
            var match = obj.toString().match(/function ([^\(]+).+/);
            if (match) {
                return match[1];
            }
            return "anonymos function";
        } else {
            return typeof obj;
        }
    },
    exception : function (msg, cl, args) {

        if (typeof args == "undefined")
            args = "";
        else
            args = "\nargs: " + JSON.stringify(args);


        throw new Error(msg + "\nin " + cl + args);
    },
    implementThis : function () {
        $CL.exception("function not implemented", $CL.className(arguments.callee), arguments.callee.caller);
    },
    variable : function(key, defaultValue) {
    	if (this.isDefined(this.vars, key)) {
    		return this.vars[key];
    	} else {
    		return defaultValue;
    	}
    },
    isType : function (key, type) {
        return typeof key == type;
    },
    isEmpty : function (mixed) {
        if (typeof mixed == "undefined")
            return true;
        else if (typeof mixed == "string" && (mixed == "" || mixed === null))
            return true;
        else if (typeof mixed == "array" && mixed.legth == 0)
            return true;
        else if (typeof mixed == "object") {
            var check = true;

            for (var key in mixed) {
                check = false;
                break;
            }

            return check;
        } else if (mixed === null)
            return true;

        return false;
    },
    has : function (obj, key) {
        return typeof obj[key] != "undefined";
    },
    isDefined : function (obj) {
        return typeof obj != "undefined";
    },
    pause : function (millis)
    {
        /**
        * nice trick, found on http://www.sean.co.uk
        */
        var date = new Date();
        var curDate = null;

        do {
            curDate = new Date();
        }
        while(curDate-date < millis);
    },
    log : function () {
        if (typeof window.console != "undefined")
        {
            if (this.isDefined(console.log) && this.stateging != "production") {
                if (this.isType(console.log, 'function')) {
                    console.log.apply(console, arguments);
                }
                else {
                    $.each(arguments, function(key, value) {
                        console.log(value);
                    });
                }
            }
        }
    },
    translate : function (value) {
        return value;
    },
    setLanguage : function(language) {
        this.LANGUAGE = language;
    },
    setStaging : function(stateging) {
        this.stateging = stateging;
    },
    clone : function(obj) {
        var newObj = {},
        value = null;

        if (!_.isObject(obj) && !_.isArray(obj)) {
            return false;
        }

        if (_.isArray(obj)) {
            newObj = [];
        }

        if ($CL.has(obj, 'toJSON')) {
            obj = obj.toJSON();
        }

        for (var key in obj) {
            value = obj[key];

            if (_.isArray(value) || _.isObject(value)) {
                newObj[key] = this.clone(value);
            } else {
                newObj[key] = value;
            }
        }

        return newObj;
    },
    jTarget : function(targetEl, nodeName) {
        if (targetEl.nodeName.toLowerCase() == nodeName) {
            return $(targetEl);
        }

        return $(targetEl).parents(nodeName);
    },
    sjax : function () {
        return {
            get : function(url, callback, type) {
                $.ajaxSetup({async : false});
                var jqXhr = $.get(url, callback, type);
                $.ajaxSetup({async : true});
                return jqXhr;
            },
            post : function(url, data, callback, type) {
                $.ajaxSetup({async : false});
                var jqXhr = $.post(url, data, callback, type);
                $.ajaxSetup({async : true});
                return jqXhr;
            }
        }
    },
    attachBeforeAjaxSend : function(listener) {
        this.beforeAjaxSendListeners.push(listener);
    },
    _template : function(tplName) {
        if (!$CL.isDefined(__TEMPLATES__[tplName])) {
            this.exception('Template can not be found!', "Cl.Core", {tplName : tplName});
        }
        return _.template(__TEMPLATES__[tplName]);
    },
    setUri : function(uri) {
        window.location.href = this.basePath + uri;
    },
    app : function() {
        return this.get("application");
    }
};