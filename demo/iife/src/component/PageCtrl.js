Class ( "PageCtrl" ).extends ( ice.Component ) ( {
	
	// component中的init方法接收外部传入的参数
	init : function () {
		return {
			reqPath : {
            	value : this.props.options.reqPath,
            	check : String,
            	require : true,
            	default : "",
            }
			currentPage : {
          		value : this.props.options.currentPage,
        		check : function ( val ) {
        			return !!val;
        		},
          		require : true,
        	},
			pageCount : {
          		value : this.props.options.pageCount,
        		check : Number,
          		require : true,
        	},
			current : {
            	value : this.props.options.current,
                require : true,
                check : String
            },
              
            setPage : {
            	value : this.props.setPage,
                require : true,
                check : Function
            },

			pagePrev : "上一页",
			pageNext : "下一页",
		};
	},
	view : {
    	html : ['<ul>',
					'<li class="sel" :if="currentPage !== 1"><a href="#">{{ pagePrev }}</a></li>',
					'<li :for="i in pageCount" :key="k" class="{{ current }} list"><a href="#">{{ i }}</a></li>',
					'<li :if="currentPage !== pageCount"><a href="#">{{ pageNext }}</a></li>',
				'</ul>'].join(),
		style : {
			"li" : {
				border: "solid 1px #555",
				background: "#666"
			},
			".sel" : {
				fontSize: 16,
				background: red
			},
		}
    }

	// action中定义驱动器方法，会过滤不是function的属性。方法中的this为init方法返回的vm对象
	// 定义驱动器方法时不能使用箭头函数定义，因为这样内部的this的指向将会错误
	action : function ( http ) {
      	return {
			prev : function () {
				this.state.setPage ( --this.state.currentPage );
			},
			next : function () {
				this.state.setPage ( ++this.state.currentPage );
			},
			turnTo : function ( page ) {
				if ( page > 0 && page <= this.state.pageCount ) {
					this.state.setPage ( page );
				}
            }
        };
	},
	apply : function () {
		// ...
	}
} );