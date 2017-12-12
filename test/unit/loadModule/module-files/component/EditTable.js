ice.class ( "EditTable" ).extends ( ice.Component ) ( {
	init () {
		return {
			show : false,
			desc : "this is a EditTable component"
		};
	},
	render () {
		this.template ( "<span :if='show'>{{ desc }}</span><span :else>error</span><div>hidden</div>" ).
		style ( {
			span : { color : "blue" }
		} );
	}
} );