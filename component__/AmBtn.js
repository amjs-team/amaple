am.class ( "AmBtn" ).extends ( am.Component ) ( {
	init: function () {
		return {
			href: this.props.href || "#",
			target: this.props.target,
			type: this.props.type,
			img: this.props.img,
			imgWidth: this.props.imgWidth || 16,
			imgPos: this.props.imgPos,
			leftBg: this.props.leftBg,
			rightBg: this.props.rightBg,
		}
	},
	render: function () {
		var amBtn = {
			padding: "8px 24px",
			"text-align": "center",
			"border-radius": 25,
			"box-sizing": "border-box",
			display: "inline-block",
		};

		if ( this.state.type === "stroke" ) {
			amBtn.border = "solid 2px " + this.state.leftBg;
			amBtn.color = this.state.leftBg;
		}
		else {
			amBtn.background = "linear-gradient(to right, " + this.state.leftBg + " 0%, " + this.state.rightBg + " 100%)";
			amBtn [ "box-shadow" ] = "5px 5px 30px -6px " + this.state.rightBg;
			amBtn.color = "#ffffff";
		}

		this.template ( [
			'<a href="{{ href }}" target="{{ target }}" class="am-btn">',
				'<img :if="img && !imgPos" src="{{ img }}" />',
				'{{ subElements.default }}',
				'<img :if="img && imgPos" src="{{ img }}" />',
			'</a>'
		].join ( "" ) )
		.style ( {
			".am-btn": amBtn,
			".am-btn img": {
				width: this.state.imgWidth,
				"margin": "0 5px",
				"vertical-align": -6,
			}
		} );
	},
} );