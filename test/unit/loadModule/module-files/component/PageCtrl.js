ice.Class ( "PageCtrl" ).extends ( ice.Component ) ( {
	init () {
		return {
			desc : "this is a PageCtrl component"
		};
	},
	render () {
		this.template ( "<span>{{ desc }}</span>" ).
		style ( {
			span : { color : "pink" }
		} );
	}
} );