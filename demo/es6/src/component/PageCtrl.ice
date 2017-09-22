<component>
	<template>
		<ul>
			<li class="sel" :if="currentPage !== 1">
				<a href="#">{{ pagePrev }}</a>
			</li>
			<li :for="i in pageCount" :key="k" class="{{ current }} list">
				<a href="#">{{ i }}</a>
			</li>
			<li :if="currentPage !== pageCount">
				<a href="#">{{ pageNext }}</a>
			</li>
		</ul>
	</template>

	<script>
		class PageCtrl extends ice.Component {
			validateProps () {
		    	this.propsType ( {
		        	options : {
		            	// validate可有四类参数，1、基础类（表示类型需一致） 2、正则表达式（表示需通过此正则）3、方法（方法内需返回true或false两种boolean值）4、数组，数组内是以上三种值的组合（表示满足数组内任意一项即可通过，相当于“||”）
		            	validate : Object,
		            	
		            	// 默认为false
		            	require : true,
		            	default : {},
		            }
		        } );
		    }
			
			// component中的init方法接收外部传入的参数
			init () {
				return {
					reqPath : this.props.options.reqPath,
					currentPage : this.props.options.currentPage,
					pageCount : this.props.options.pageCount,
					current : this.props.options.current,
		              
		            setPage : this.props.setPage,

					pagePrev : "上一页",
					pageNext : "下一页",
				};
			}

			prev () {
				this.state.setPage ( --this.state.currentPage );
			}

			next () {
				this.state.setPage ( ++this.state.currentPage );
			}

			turnTo () {
				if ( page > 0 && page <= this.state.pageCount ) {
					this.state.setPage ( page );
				}
			}

			apply () {
				// ...
			}
		}
	</script>

	<style scoped>
		li {
			border: solid 1px #555;
			background: #666;
		}
		.sel {
			font-size: 16;
			background: red;
		}
	</style>
</component>