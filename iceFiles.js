var iceFiles = {
	rootPath: 'src',
	iceSrc: [
		'iceError.js',
		'var.js',
		'plugins/util.js',
		'privateFunc.js',
		'plugins/event.js',
		'plugins/promise.js',
		'plugins/animation.js',
		'plugins/language.js',
		'plugins/http.js',
		'cache.js',
		'single.js',
		'state.js',
		'moduleLoader.js',
		'crystals.js',
		'config.js',
		'core.js',
	]
}

module.exports 			= iceFiles;
var arr 				= [],
	join 				= arr.join,
	unshift 			= arr.unshift,
	push 				= arr.push,
	hasOwnProperty 		= Object.prototype.hasOwnProperty,
	KEY_ROOT_PATH		= 'rootPath';

iceFiles[KEY_ROOT_PATH] = rootPath = iceFiles[KEY_ROOT_PATH].indexOf('/', iceFiles[KEY_ROOT_PATH].length - 1) !== -1 ? iceFiles[KEY_ROOT_PATH] : iceFiles[KEY_ROOT_PATH] + '/';

iceFiles.getMergeFiles = function getMergeFiles() {
	unshift.call(iceFiles.iceSrc, rootPath + 'ice.prefix.js');
	push.call(iceFiles.iceSrc, rootPath + 'ice.suffix.js');
	return iceFiles.iceSrc;
}


if (hasOwnProperty.call(iceFiles, KEY_ROOT_PATH)) {
	for (key in iceFiles) {
		if (key === KEY_ROOT_PATH) continue;
		if (Array.isArray(iceFiles[key])) {
			for (i in iceFiles[key]) {
				if (typeof iceFiles[key][i] === 'string') iceFiles[key][i] = iceFiles[KEY_ROOT_PATH] + iceFiles[key][i];
			}
		}
		else {
			if (typeof iceFiles[key] === 'string') iceFiles[key] = iceFiles[KEY_ROOT_PATH] + iceFiles[key];
		}
	}

	delete iceFiles[KEY_ROOT_PATH];
}

for (key in iceFiles) {
	if (Array.isArray(iceFiles[key])) {
		for (i in iceFiles[key]) {
			if (typeof iceFiles[key][i] === 'string') push.call(arr, iceFiles[key][i]);
		}
	}
	else {
		if (typeof iceFiles[key] === 'string') push.call(arr, iceFiles[key]);
	}
}

iceFiles.all = arr;