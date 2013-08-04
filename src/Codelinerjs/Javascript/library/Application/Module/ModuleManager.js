var Module = $CL.namespace("Cl.Application.Module");

$CL.require("Cl.Core.String");
$CL.require("Cl.Application.Module.LoadModuleEvent");

Module.ModuleManager = function ModuleManager() {};

(function(mm) {
    mm.prototype = {
        setup : function(options) {
            this.application = options.application;
            this.modules = {};
        },
        loadModules : function() {
            if (this.application.modules.length > 0) {
                for(var i=0;i<this.application.modules.length;i++) {
                    this.loadModule(this.application.modules[i]);
                }
            }
        },
        loadModule : function(moduleName) {
            moduleName = _getModuleName(moduleName);
            
            var module = $CL.get(moduleName);

            if (_.isNull(module)) {
                $CL.exception('Load module ' + moduleName + ' failed.', 'Cl.Application.Module.ModuleManager');
            }

            this.modules[moduleName] = module;

            //merge module config with application config
            if ($CL.isDefined(this.modules[moduleName]['getConfig'])) {
                this.application.config =
                this._mergeConfig(this.application.config, this.modules[moduleName].getConfig());
            }

            //register module bootstrap listener on application bootstrap event
            //context of the listener is set to the module
            if ($CL.isDefined(this.modules[moduleName]['onBootstrap'])) {
                this.application.events().attach(
                    "bootstrap",
                    $CL.bind(this.modules[moduleName]['onBootstrap'], this.modules[moduleName])
                );
            }

            var loadEvent = $CL.makeObj(
                "Cl.Application.Module.LoadModuleEvent",
                {
                    moduleManager : this,
                    application : this.application,
                    moduleName : moduleName,
                    module : this.modules[moduleName]
                }
            );

            this.application.events().trigger(loadEvent);
        },
        hasModule : function(moduleName) {
        	return _getModuleName(moduleName) !== null;
        },
        getModule : function(moduleName) {
        	if (moduleName = _getModuleName(moduleName)) {
        		return this.modules[moduleName];
        	}

        	return null;
        },
        /*
        * Merges two config Objects recursive
        *
        * @param config1 | Object | Destination
        * @param config2 | Object | Source
        *
        * @return Object
        */
        _mergeConfig : function(config1, config2) {
            var oldValue, newValue;

            for (var key in config2) {
                oldValue = config1[key];
                newValue = config2[key];

                if (typeof oldValue == typeof newValue) {
                    if (_.isArray(oldValue)) {
                        config1[key] = oldValue.concat(newValue);
                    } else if (_.isObject(oldValue)) {
                        config1[key] = this._mergeConfig(oldValue, newValue);
                    } else {
                        config1[key] = newValue;
                    }
                } else {
                    config1[key] = newValue;
                }
            }

            return config1;
        }
    };

    function _getModuleName(moduleName) {
    	if ($CL.classExists(moduleName)) {
    		return moduleName;
    	} else if (_.isString(moduleName) && moduleName != "") {
    		moduleName = moduleName.ucfirst() + ".Module";
    		if ($CL.classExists(moduleName)) {
    			return moduleName;
    		}
    	}

    	return null;
    }
})(Module.ModuleManager);