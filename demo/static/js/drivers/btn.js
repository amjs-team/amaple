function btn(crystals, elem) {
	this.currentState;
};

btn.prototype = {
	setState: function(state) {
		this.currentState = state;
		var enableBg = elem.style.background,
			disableBg = '#dddddd';

		switch (state) {
			case 'loading':
				btn.style.background = disableBg;
				btn.style.disabled = true;

				break;
			case 'default':
				btn.style.background = enableBg;
				btn.style.disabled = true;
				
				break;
		}
	}
}
driver(btn);