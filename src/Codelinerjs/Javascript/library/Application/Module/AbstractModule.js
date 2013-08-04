var Module = $CL.namespace('Cl.Application.Module');

$CL.require("Cl.Core.String");
$CL.require("Cl.Application.Module.ModuleInterface");

Module.AbstractModule = function ClAbstractModule() {};

Module.AbstractModule.prototype = {
	getController : function(controllerName) {
		var namespace = $CL.className(this).replace(/^([^\.]+)\..*$/, "$1");
		
		var con = $CL.get(namespace + ".Controller." + controllerName.ucfirst());
		
		if (_.isNull(con)) {
			var conName = namespace + ".Controller." + controllerName.ucfirst();
			$CL.exception(
				"Can not get " + conName + " from ServiceManager",
				$CL.className(this)
			);
		}
		
		return con;
	}	
};