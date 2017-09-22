<component>
	<template>
		<a href="javascript:;">button</a>
	</template>

	<script>
		class Button extends ice.Component {

			// init方法中使用的this.props表示父作用域的state对象
			init () {
				return {
					opts : this.props.opts,
					btnText : this.props.opts.btnText,
					loading : "loading..."
				};
			}

			// action中定义驱动器方法，会过滤不是function的属性。方法中的this.state为init方法返回的vm对象，this.action指向此driver的封装方法
			// 定义驱动器方法时不能使用箭头函数定义，因为这样内部的this的指向将会错误
			loadStart () {
				this.state.opts.btnText = this.state.loading;
			}

			loadEnd () {
				this.state.opts.btnText = this.state.btnText;
			}

			// this.action指向此driver的封装方法
			apply ( http ) {
				http
				.reqBefore ( "self", function () {
					this.action.loadStart ();
				} )
				.reqComplete ( "self", function () {
					this.action.loadEnd ();
				} );
			}
		}
	</script>

	<style scoped>
		
	</style>
</component>