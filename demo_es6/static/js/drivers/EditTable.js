driver(['input'], function(crystals, elem, input) {
	var tdArr = elem.querySelectorAll('td');

	// 设置编辑失去焦点时的提交地址
	input.setSaveUrl('table/save', 'content');
	for (var i in tdArr) {
		// 将表格设为可编辑
		input.editable(tdArr[i]);
	}

	this.page = function(page) {
		// 翻页
	}

	this.flush = function() {
		// 刷新
	}
})