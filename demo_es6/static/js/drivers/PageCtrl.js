export default {

	// driver中的init方法接收外部传入的参数
	init () {
		return {
			reqPath 	: this.props.options.reqPath,
			currentPage : this.props.options.currentPage,
			pageCount 	: this.props.options.pageCount,
			current 	: this.props.options.current,

			pagePrev 	: "上一页",
			pageNext 	: "下一页",
		};
	},
	template : ['<ul>',
					'<li :if="currentPage !== 1"><a href="#">{{ pagePrev }}</a></li>',
					'<li :for="i in pageCount" :key="k" class="{{ current }} list"><a href="#">{{ i }}</a></li>',
					'<li :if="currentPage !== pageCount"><a href="#">{{ pageNext }}</a></li>',
				'</ul>'].join(),

	// method中定义驱动器方法，会过滤不是function的属性。方法中的this为init方法返回的vm对象
	// 定义驱动器方法时不能使用箭头函数定义，因为这样内部的this的指向将会错误
	method : {
		prev () {
			this.currentPage -= 1;

			// 暂时省略插件、其他驱动器获取方法
			http.get ( this.reqPath + "?page=" + currentPage ).done ( res => {

				// 更新表格数据
				table.update ( res );
			} );
		},
		next () {
			this.currentPage += 1;

			// 暂时省略插件、其他驱动器获取方法
			http.get ( this.reqPath + "?page=" + currentPage ).done ( res => {

				// 更新表格数据
				table.update ( res );
			} );
		},
		turnTo ( page ) {
			if ( page > 0 && page <= pageCount ) {
				this.currentPage = page;

				// 暂时省略插件、其他驱动器获取方法
				http.get ( this.reqPath + "?page=" + currentPage ).done ( function ( res ) {

					// 更新表格数据
					table.update ( res );
				} );
			}
		}
	},
	apply ( elem ) {
		// ...
	}
};



// function btn(crystals, elem) {
// 	this.currentState;
// };

// btn.prototype = {
// 	setState: function(state) {
// 		this.currentState = state;
// 		var enableBg = elem.style.background,
// 			disableBg = '#dddddd';

// 		switch (state) {
// 			case 'loading':
// 				btn.style.background = disableBg;
// 				btn.style.disabled = true;

// 				break;
// 			case 'default':
// 				btn.style.background = enableBg;
// 				btn.style.disabled = true;
				
// 				break;
// 		}
// 	}
// }
// driver(btn);