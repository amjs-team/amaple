ice.config({
	stateMark: '@',
	base: {
		url: 'static/module',
		lang: function() {
			return 'static/js/lang/zh_cn/';
		},
		plugin: function() {
			return 'static/js/plugins/';	
		},
		driver: function() {
			return 'static/js/drivers/';
		}
	},
	redirectCache: false,
	codeKey: 'code',
	htmlKey: 'html',
	header: [
		['aa/index.html', '首页'],
		['bb/login.html', function(code) {
			switch(code) {
				case 200: return '登录成功'; break;
				case 400: return '登录失败'; break;
			}
		}]
	]
});