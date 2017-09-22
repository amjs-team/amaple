<Module :title="登录">
	<template>
		<div>
			<form name="login_form" method="post" ice-target="root">
				<ul>
					<li>
						<input type="text" name="user_name" :model="userName" />
					</li>
					<li>
						<input type="password" name="password" :model="password" />
					</li>
					<li>
						<SubmitButton text="{{ btnOpts.btnText }}" />
					</li>
				</ul>
			</form>
		</div>
	</template>

	<style scoped>
		
	</style>
		
	<script>
		new ice.Module ( {

			// 该函数返回的对象为该模块内的数据绑定，包括变量和方法
			init ( animate ) {

				return {
					userName 	: "",
					password 	: "",
					btnOpts 	: {
						btnText : "提交"
					},

					style 		: {
						opacity : 1
					},

					width 		: {
						value : 50,

						// watch中的this表示当前值
						watch ( oldVal, newVal ) {
                        	this.animate = new Animate ();
                        	
							this.animate.step ( function ( eachVal ) {
								this.state.width = eachVal.toFixed( 0 );
							} )
							.Linear ( oldVal, newVal, function () {
								console.log ( "completed" );
							}, true );
						}
					},

					reqBefore () {
						animate.Linear ( this.state.style.opacity, 0, 1000 );
					},

					reqAfter () {
						animate.Linear ( this.state.style.opacity, 1, 1000 );
					},
				};
			},

			// 要操作模块内的dom，可调用该函数，参数this.moduleElem为module对应的元素封装，可链式调用
			apply () {
				
			}
		} );
	</script>
</Module>