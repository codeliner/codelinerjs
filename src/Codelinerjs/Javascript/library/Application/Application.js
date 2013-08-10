var Application = $CL.namespace("Cl.Application");

$CL.require("Cl.Backbone.Backbone");
$CL.require("Cl.Event.SharedManager");
$CL.require("Cl.Event.Manager");
$CL.require("Cl.Application.Router.RouteEvent");
$CL.require("Cl.Application.Router.RouteMatch");
$CL.require("Cl.Application.Module.ModuleManager");
$CL.require("Cl.Application.Bootstrap.BootstrapEvent");
$CL.require("Cl.Application.Mvc.MvcEvent");
$CL.require("Cl.Application.View.DefaultStrategy");
$CL.require("Cl.Application.View.RendererInterface");

Application.Application = function() {
    this.runningLoads = {};
};

(function(app) {
    app.prototype = {
        setup : function(options) {

            if (!$CL.isDefined(options)) {
                options = {};
            }

            //default config
            this.config = {
                /*
                * router routes are passed to Backbone.Router
                * key is used as routeName
                * callback is registered on Backbone.Router.Event route:routeName
                * build is used within {@method application.router.getUri}
                */
                router : {
                    routes : {
                        'default' : {
                            route : ':module/:controller/:action',
                            //callback should always return a routeMatch
                            callback : function(module, controller, action) {
                                return $CL.makeObj(
                                    "Cl.Application.Router.RouteMatch",
                                    {
                                        module : module,
                                        controller : controller,
                                        action : action
                                    }
                                    );
                            },
                            //the build function should return the URI associated with the route
                            build : function(routeParams) {
                                return routeParams.module + "/" + routeParams.controller + "/" + routeParams.action;
                            }
                        },
                        'pageNotFound' : {
                            route :  'application/404',
                            callback : function() {
                                window.location.href = window.location.href.replace(/\/[^/]+$/, '/404');
                            },
                            build : function(routeParams) {
                                return "application/404";
                            }
                        }
                    },
                    history : {}
                },
                //view rendering config
                view : {
                    //all strategies registered in config are attached to the render Event
                    strategies : [
                    {
                        key : "Cl.Application.View.DefaultStrategy",
                        priority : -100
                    }
                    ]
                },
                //point to Codelinerjs\Controller\LazyModuleController::loadModuleAction()
                //override the last param "default", if you use another JsLoader instance
                lazy_load_module_url : "/codelinerjs/load-module/:modulename/default"
            };

            if ($CL.isDefined(options.app_url)) {
                this.config.router.root = options.app_url;
            }

            this.modules = [];

            if ($CL.isDefined(options.modules)) {
                this.modules = options.modules;
            }
        },
        init : function() {

            _initModules.call(this);

            //attach rendering strategies
            _.each(this.config.view.strategies, $CL.bind(
                function(strategyConfig) {
                    var strategy = $CL.get(strategyConfig.key);

                    if (_.isNull(strategy)) {
                        $CL.exception(
                            "Can not get strategy from serviceManager",
                            "Cl.Application.Application",
                            {
                                strategy : strategyConfig.key
                            }
                            );
                    }

                    if (!$CL.isInstanceOf(strategy, Cl.Application.View.RenderingStrategyInterface)) {
                        $CL.exception(
                            "Provided view strategy does not implement Cl.Application.View.RenderingStrategyInterface",
                            "Cl.Application.Application",
                            {
                                strategy : $CL.className(strategy)
                            }
                            );
                    }

                    this.events().attach("render", [strategy.onRender, strategy], strategyConfig.priority || 0);
                },
                this
                ));
        },
        bootstrap : function() {
            var bootstrapEvent = $CL.makeObj(
                "Cl.Application.Bootstrap.BootstrapEvent",
                {
                    application : this
                }
                );

            this.events().trigger(bootstrapEvent);

            return this;
        },
        run : function() {
            _initRouter.call(this);

            if(!this.router.isPageReload()) {
                //start backbone routing
                Backbone.history.start(this.config.router.history);
            } else {
                this.router.navigate = function(url, options) {
                    if ($CL.isDefined(options.trigger) && options.trigger) {
                        window.location.href = url;
                    }
                }
            }

            this.events().trigger("run");
        },
        events : function() {
            if (!$CL.has(this, "__eventManager")) {
                this["__eventManager"] = $CL.get("event_manager", {
                    target : "application"
                });
            }

            return this["__eventManager"];
        },
        dispatch : function(routeMatch) {
            if (!$CL.isInstanceOf(routeMatch, Cl.Application.Router.RouteMatch)) {
                $CL.exception("routeMatch has to be instance of Cl.Application.Router.RouteMatch", "Cl.Application", {
                    method : "application.dispatch",
                    routeMatch : routeMatch
                });
            }

            if (routeMatch.getModule() == "" || !this.moduleManager.hasModule(routeMatch.getModule())) {
                $CL.exception(
                    "Can not dispatch routeMatch, no module found",
                    "Cl.Application.Application",
                    {
                        routeMatch : routeMatch,
                        modules : this.moduleManager.modules
                    }
                    );
            }

            if (routeMatch.getController() == "") {
                $CL.exception(
                    "Can not dispatch routeMatch, no controller provided",
                    "Cl.Application.Application",
                    {
                        routeMatch : routeMatch
                    }
                    );
            }

            var controller = this.moduleManager.getModule(routeMatch.getModule()).getController(routeMatch.getController());

            var mvcEvent = $CL.makeObj("Cl.Application.Mvc.MvcEvent", {
                application : this,
                routeMatch : routeMatch
            });
            mvcEvent.name = "dispatch.pre";

            this.events().trigger(mvcEvent);

            if (mvcEvent.isPropagationStopped())
                return;

            mvcEvent.name = "dispatch";

            var response = controller.dispatch(mvcEvent);

            if (mvcEvent.isPropagationStopped()) {
                return;
            }

            mvcEvent.setResponse(response);

            this.continueDispatch(mvcEvent);
        },

        /**
         * Dispatch is splitted into two steps
         *
         * If a controller triggers an async task,
         * post dispatching and rendering only makes sense
         * when async callback is finished, so the dispatch prozess
         * can be interrupted by returning an event with stopped propagation
         * and later it can be continued by calling the continueDispatch method
         * with the same event.
         * The application resets the propagation state and triggers the missing
         * events dispatch.post, render and finish
         */
        continueDispatch : function(mvcEvent, ignoreZombieEvent) {

            if (!$CL.isDefined(ignoreZombieEvent)) {
                ignoreZombieEvent = false;
            }

            //Do not continue a zombie event, until it is explicity set by caller
            if (!ignoreZombieEvent && this.router.getCurrentRouteMatch() != mvcEvent.getRouteMatch()) {
                $CL.log("blocked zombie event");
                return;
            }

            mvcEvent.continuePropagation();
            mvcEvent.name = "dispatch.post";

            this.events().trigger(mvcEvent);

            if (mvcEvent.isPropagationStopped()) {
                return;
            }

            var response = mvcEvent.getResponse();

            if (_.isNull(response)) {
                response = "";
            }

            if(!$CL.isInstanceOf(response, Cl.Application.View.RendererInterface)) {
                var module = mvcEvent.getRouteMatch().getModule().ucfirst();
                var controller = mvcEvent.getRouteMatch().getController().ucfirst();
                var action = mvcEvent.getRouteMatch().getAction().ucfirst();

                var viewClass = module + ".View." + controller + "." + action;

                if ($CL.classExists(viewClass)) {
                    var view = $CL.get(viewClass);

                    var tplKey = module.toLowerCase() + "/" + controller.toLowerCase() + "/" + action.toLowerCase();

                    if ($CL.isDefined(__TEMPLATES__[tplKey])) {
                        view.setTemplate($CL._template(tplKey));
                    }

                    if (_.isObject(response)) {
                        view.setData(response);
                    } else if (_.isString(response)) {
                        view.setData({content : response});
                    }

                    mvcEvent.setResponse(view);
                }
            }

            this.render(mvcEvent);
        },
        render : function(mvcEvent) {

            mvcEvent.name = "render";
            this.events().trigger(mvcEvent);

            mvcEvent.continuePropagation();

            var activeView = mvcEvent.getResponse();
            this.previousView = activeView;

            this.finish(mvcEvent);
        },
        finish : function(mvcEvent) {
            mvcEvent.name = "finish";
            this.events().trigger(mvcEvent);
            var view = mvcEvent.getResponse();
        },
        wait : function() {
            this.events().trigger("wait");
            return this;
        },
        stopWait : function(checkPageReload) {
            if (!$CL.isDefined(checkPageReload)) {
                checkPageReload = false;
            }

            if (checkPageReload) {
                if (this.router.isPageReload()) {
                    return this;
                }
            }

            this.events().trigger("stopWait");

            return this;
        },
        alert : function(msg, jqX) {

            if ($CL.isDefined(jqX) && $CL.has(jqX, "responseText")) {
                msg += "\nServer Response: " + jqX.responseText;
            }

            var event = $CL.get('Cl.Event.Event', {
                name : "alert",
                params : {
                    msg : msg,
                    jqX : jqX
                }
            });

            this.events().trigger(event);

            return this;
        },
        lazyLoadModule : function(moduleName, callback) {
            if (!this.moduleManager.hasModule(moduleName)) {
                this.wait();

                if (!$CL.isDefined(callback)) {
                    callback = function() {};
                }

                var url = this.config.lazy_load_module_url.replace(':modulename', moduleName);

                if (!$CL.isDefined(this.runningLoads[moduleName])) {
                    this.runningLoads[moduleName] = [];
                }

                this.runningLoads[moduleName].push(callback);

                $.getScript(url)
                .done($CL.bind(function() {
                    this.moduleManager.loadModule(moduleName);
                    var module = this.moduleManager.getModule(moduleName);

                    if ($CL.isDefined(module['getConfig'])) {
                        var config = module.getConfig();

                        if ($CL.isDefined(config['service_manager'])) {
                            $CL.addServiceConfig(config['service_manager']);
                        }

                        if ($CL.isDefined(config['router'])) {
                            var routes = config.router.routes;

                            //single route setting supports RegEx routes
                            $.each(routes, $CL.bind(function(routeName, routeConfig) {

                                //store routes in app config, to hold the reference on the config
                                //this is important for using router.forward() with object data
                                this.config.router.routes[routeName] = routeConfig;

                                this.router.route(routeConfig.route, routeName);
                                this.router.on(
                                    'route:' + routeName,
                                    _routerRouteCallback,
                                    {
                                        routeName : routeName,
                                        routeConfig : routeConfig,
                                        application : this
                                    }
                                );
                            }, this));
                        }
                    }

                    if ($CL.isDefined(module['onBootstrap'])) {
                        var bootstrapEvent = $CL.makeObj(
                            "Cl.Application.Bootstrap.BootstrapEvent",
                            {
                                application : this
                            }
                        );

                        module.onBootstrap(bootstrapEvent);
                    }

                    _.each(this.runningLoads[moduleName], function(cb) {
                        cb();
                    });

                    delete this.runningLoads[moduleName];

                    this.stopWait(false);
                }, this))
                .fail($CL.bind(function() {
                    this.alert('Lazy loading of module: ' + moduleName + ' failed.');
                    this.stopWait();
                }, this));
            } else {
                callback();
            }
        }
    };

    //private functions
    function _initRouter() {
        var routes = this.config.router.routes;

        var Router = Backbone.Router.extend({
            hashChange : null,
            'initialize' : function() {
                var router = this;

                //single route setting supports RegEx routes
                $.each(routes, function(routeName, routeConfig) {
                    router.route(routeConfig.route, routeName);
                });
            },
            /*
             * Function returns uri, that can be used for routing
             *
             * If routeName is similar to the current route name, params are merged with current routeParams
             * If routeName is not present, name of the current route is used as routeName
             *
             * @param routeNameOrParams | String | Object | can be name of the route or routeParams
             * @param params | Object | If first arguments is a String, than params are used as routeParams
             *
             * @return String
             */
            getUri : $CL.bind(
                function(routeNameOrParams, params) {
                    return this.router._callRouteConfig("getUri", routeNameOrParams, params);
                },
                this
            ),
            /**
             * Navigate to given uri and add it to browser history
             *
             * @param {string} uri The uri to navigate to
             *
             * @return void
             */
            callUri : function(uri) {
                    this.navigate(encodeURI(uri), {trigger : true});
            },
            callRoute : function(routeNameOrParams, params) {
                this.callUri(this.getUri(routeNameOrParams, params));
            },
            forward : function(routeNameOrParams, params) {
                this._callRouteConfig("forward", routeNameOrParams, params);
            },
            getCurrentRouteMatch : function() {
                if ($CL.has(this, "currentRouteMatch")) {
                    return this.currentRouteMatch;
                } else {
                    return null;
                }
            },
            setCurrentRouteMatch : function(routeMatch) {
                this.currentRouteMatch = routeMatch;
            },
            hasRoute : function(routeLink) {
                var hasRoute = false;

                _.any(Backbone.history.handlers, function(handler) {
                    if (handler.route.test(routeLink)) {
                        hasRoute = true;
                        return true;
                    }
                });

                return hasRoute;
            },
            _callRouteConfig : $CL.bind(function(mode, routeNameOrParams, params) {
                var currentRouteMatch = this.router.getCurrentRouteMatch();

                if (typeof routeNameOrParams != "string") {
                    params = routeNameOrParams;

                    if (currentRouteMatch !== null)
                        routeNameOrParams = currentRouteMatch.getRoute();
                    else
                        routeNameOrParams = "default";
                }

                if (!$CL.isDefined(params)) {
                    params = {};
                }

                if (currentRouteMatch !== null
                    && currentRouteMatch.getRoute() == routeNameOrParams) {
                    var currentParams = _.extend({
                        module : currentRouteMatch.getModule(),
                        controller : currentRouteMatch.getController(),
                        action : currentRouteMatch.getAction(),
                        route : currentRouteMatch.getRoute()
                    }, currentRouteMatch.getParams());

                    params = _.extend(currentParams, params);
                }

                var routeConfig = this.config.router.routes[routeNameOrParams];

                if (!$CL.isDefined(routeConfig)) {
                    $CL.exception("route is not defined in config", "Cl.Application.Application", {
                        routeName : routeNameOrParams
                    });
                }

                var routeLink = routeConfig.build(params);

                if (mode == "getUri") {
                    return routeLink;
                } else if (mode == "forward") {
                    _.any(Backbone.history.handlers, function(handler) {
                        if (handler.route.test(routeLink)) {
                            handler.callback(routeLink);
                            return true;
                        }
                    });
                }
            }, this),
            //Check if application wants to use the history pushState feature of modern browsers, without
            //a fallback to hashChange, but the feature isn't supported by the client.
            //In this case a page reload is required when application.router.navigate() is called
            //The application calls isPageReload() in application.run(). Normaly the application will call Backbone.history.start()
            //but if isPageReload() returns true, the application doesn't start history but override application.router.navigate
            //with a custom function, that will do a page load to given uri
            isPageReload : function()
            {
                if (!(window.history && window.history.pushState)) {
                    var config = $CL.get('Configuration');

                    if ($CL.isDefined(config.router) && $CL.isDefined(config.router.history)) {
                        var config = config.router.history;
                        if ($CL.isDefined(config.hashChange)) {
                            return config.hashChange === false;
                        }
                    }
                }

                return false;
            }
        });

        this.router = new Router();

        //register route listeners on every defined route
        $.each(routes, $CL.bind(function(routeName, routeConfig) {
            this.router.on(
                'route:' + routeName,
                _routerRouteCallback,
                {
                    routeName : routeName,
                    routeConfig : routeConfig,
                    application : this
                }
                );
        }, this));
    }

    function _initModules() {
        this.moduleManager = $CL.makeObj("Cl.Application.Module.ModuleManager", {
            application : this
        });
        this.moduleManager.loadModules();

        if ($CL.has(this.config, 'service_manager')) {
            $CL.addServiceConfig(this.config['service_manager']);
        }

        $CL.register("Configuration", this.config);
    }

    function _routerRouteCallback() {

        if (arguments) {
            _.map(arguments, decodeURIComponent);
        }

        //call route callback with routeConfig as context and get a routeMatch object back
        var routeMatch = this.routeConfig.callback.apply(this.routeConfig, arguments);

        if (!$CL.isInstanceOf(routeMatch, Cl.Application.Router.RouteMatch)) {
            $CL.exception("Callback did not return a RouteMatch object", "Cl.Application", {
                routeName : this.routeName,
                routeConfig : this.routeConfig
            });
        }

        //add routeName to routeMatch
        routeMatch.route = this.routeName;
        this.application.router.setCurrentRouteMatch(routeMatch);

        var routeEvent = $CL.makeObj("Cl.Application.Router.RouteEvent", {
            application : this.application,
            routeMatch : routeMatch
        });

        //trigger routeEvent
        this.application.events().trigger(routeEvent);

        //set routeMatch to router again, maybe a listener has changed the match
        this.application.router.setCurrentRouteMatch(routeEvent.getRouteMatch());

        this.application.dispatch(routeEvent.getRouteMatch());
    }

})(Application.Application);
