ice.Class ( "EditTable" ).extends ( ice.Component ) ( {
	init () {
		return {
			desc : "this is a EditTable component"
		};
	},
	render () {
		this.template ( "<span>{{ desc }}</span>" ).
		style ( {
			span : { color : "blue" }
		} );
	}
} );