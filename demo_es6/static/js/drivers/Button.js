import animate from "../plugins/animate";

export default {

	// init方法中使用的this.props表示父作用域的state对象
	init () {
		return {
			opts : this.props.opts,
			btnText : this.props.opts.btnText,
			loading : "loading..."
		};
	},

	template : "",

	// 插件注入方法1
	deps : { http : "http", animate },

	// method中定义驱动器方法，会过滤不是function的属性。方法中的this.state为init方法返回的vm对象，this.method指向此driver的封装方法
	// 定义驱动器方法时不能使用箭头函数定义，因为这样内部的this的指向将会错误
	method : {
		loadStart () {
			this.state.opts.btnText = this.state.loading;
		},
		loadEnd () {
			this.state.opts.btnText = this.state.btnText;
		}
	},

	// this.method指向此driver的封装方法
	apply ( elem, http ) {
		http
		.reqBefore ( "self", function () {
			this.method.loadStart ();
		} )
		.reqComplete ( "self", function () {
			this.method.loadEnd ();
		} );
	}
};