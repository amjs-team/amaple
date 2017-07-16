import { foreach } from "./util";

///////////////////////////////
///							///
///     内部调用，外部不可见   ///
///                         ///
///////////////////////////////


/**
	urlTransform ( str: String, mode: Boolean )

	Return Type:
	String

	Description:
	将url中的"/"和"."做调换，此方法用于设置请求路径与模块定义时的依赖注入。
	当mode不传或传入null、false时表示false，即字符串将.替换为/
	当mode有值时表示true，即字符串将/替换为.

	URL doc:
	http://icejs.org/######
*/
export function urlTransform ( str, mode ) {
	mode 					= !!mode;

	var rpoint 				= /\./g,
		rsep 				= /\//g,
		point 				= ".",
		separation 			= "/";
		

	return mode ? str.replace( rsep, point) : str.replace ( rpoint, separation );
}

/**
	setCurrentPath ( module: DOMObject, path: String )

	Return Type:
	void

	Description:
	设置module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径

	URL doc:
	http://icejs.org/######
*/
export function setCurrentPath ( module, path ) {
	module.currentPath = path;
}

/**
	getCurrentPath ( module: DOMObject )

	Return Type:
	String

	Description:
	获取module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径

	URL doc:
	http://icejs.org/######
*/
export function getCurrentPath ( module ) {
	return module.currentPath || "";
}

/**
	decomposeArray ( array: Array, callback: Function )

	Return Type:
	void

	Description:
	将一个数组以相邻的两个值为一组分解出来并传入回调函数中
	此方法将不改变原数组
	当前一个值为空时则跳过

	URL doc:
	http://icejs.org/######
*/
export function decomposeArray ( array, callback ) {

	// 复制array的副本到_array中
	// 此地方直接使用“=”时只是引用，如果改变tmpArr也将改变原数组
	var _array = [].concat ( array ),

		_arr;

	if ( config.params.moduleSeparator === "/" ) {
		for ( var i = 0; i < _array.length; ) {
			if ( _array [ i ] !== "" ) {
				callback ( _array[ i ], _array[ i + 1 ] || "" );

				i += 2;
			}
			else {
				i ++;
			}
		}
	}
	else {
		foreach ( _array, function ( arr ) {
			if ( arr !== "" ) {
				_arr = arr.split ( config.params.moduleSeparator );
				callback ( _arr [ 0 ], _arr [ 1 ] );
			}
		} );
	}
}