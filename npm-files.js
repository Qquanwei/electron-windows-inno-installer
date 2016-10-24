module.exports = function(name){
	var fs = require('fs');
	var path = require('path');
	var _ = require('underscore');
	
	var loadJsonFile = function(fileName){
		var data = fs.readFileSync(fileName);
		return JSON.parse(data)
	}
	
	var getDeps = function(pkgPath){
		var data = loadJsonFile(path.join(pkgPath, 'package.json'));
		var deps = Object.keys(data.dependencies || {});
		deps.forEach(function(depName){
			var deepDepPath = path.join(pkgPath, 'node_modules', depName);
			if (fs.existsSync(deepDepPath)){
				deps = deps.concat(getDeps(deepDepPath));
			} else {
				var depPath = path.join('node_modules', depName);
				if (fs.existsSync(depPath)){
					deps = deps.concat([depName]).concat(getDeps(depPath));
				}
			}
		})
		return _.uniq(deps);
	}
	
	if (name === undefined){
		name = '.';
	}
	return getDeps(name).map(function(v){
		return './node_modules/'+v+'/**/*'
	})
}