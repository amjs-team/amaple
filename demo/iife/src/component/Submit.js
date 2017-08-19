// 实现非submit按钮提交表单

ice.install ( {

	// method中定义驱动器方法，会过滤不是function的属性。方法中的this为init方法返回的vm对象
	// 定义驱动器方法时不能使用箭头函数定义，因为这样内部的this的指向将会错误
	apply : function ( elem ) {

		var btn = elem;

		while ( elem !== document.body ) {

			elem = elem.parentNode;

			if ( elem.parentNode.nodeName === "FORM" ) {
				break;
			}

			// 绑定事件
			btn.on ( "click", function () {
				elem.submit ();
			} );
		}
	}
} );