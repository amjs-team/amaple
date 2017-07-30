import { extend, foreach, guid } from "../../func/util";

/**
	DriverLoader ()

	Return Type:
	void

	Description:
	元素驱动器加载器类
	ice解析页面时，当遇到没有缓存的元素驱动器则会异步加载此驱动器对象，并将待渲染元素对象与对应的元素驱动器保存在DriverLoader类的对象中，等到加载完成后再取出进行渲染

	URL doc:
	http://icejs.org/######
*/
function DriverLoader () {

	// 等待加载完成的驱动器，每加载完成一个驱动器都会将此模块在waiting对象上移除，当waiting为空时则表示驱动器已全部加载完成
	this.waiting 	= {};

	this.count 		= 0;
}

extend ( DriverLoader.prototype, {

	/**
		putWaiting ( obj: Object )
	
		Return Type:
		void
	
		Description:
		保存等待加载完成的元素驱动器及待渲染元素
		如果遇到相同元素驱动器，则将待渲染元素push进已有元素驱动器对应的数组中
	
		URL doc:
		http://icejs.org/######
	*/
	putWaiting ( obj ) {

		foreach ( obj, ( elems, driverName ) => {
			this.waiting [ driverName ] = this.waiting [ driverName ] = extend ( this.waiting [ driverName ] || [], elems );
			this.count ++;
		} );
	},

	/**
		getCount ()
	
		Return Type:
		Number
		正在加载的元素驱动器数量
	
		Description:
		获取正在加载的元素驱动器数量
	
		URL doc:
		http://icejs.org/######
	*/
	getCount () {
		return this.count;
	}
} );


extend ( DriverLoader, {

	// 文件后缀
	suffix : ".js",

	// 保存正在使用的驱动器加载器对象，因为当同时更新多个模块时将会存在多个驱动器加载器对象
	loaders : {},

	/**
		create ()
	
		Return Type:
		Object
		DriverLoader对象与标识ID组成的对象
	
		Description:
		创建DriverLoader对象保存于DriverLoader.loaders中
	
		URL doc:
		http://icejs.org/######
	*/
	create () {

		let guid 		= guid (),
			instance 	= DriverLoader.loaders [ guid ] = new DriverLoader ();

		return {
			id 			: guid,
			instance 	: instance
		};
	},
} );