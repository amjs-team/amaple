import cache from "../cache/core";

export function getLoadedComponent ( loadURL, Loader ) {
	const loadedCompoennt = Loader.currentLoaded;
	cache.pushModule ( loadURL, loadedCompoennt );

	delete Loader.currentLoaded;
	return loadedCompoennt;
}

export function getLoadedPlugin ( loadURL, Loader ) {
	return null;
}