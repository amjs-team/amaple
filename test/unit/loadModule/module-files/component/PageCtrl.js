ice.class ( "PageCtrl" ).extends ( ice.Component ) ( {
	constructor : function () {
		this.__super ();
		this.depComponents = [ Num ];
	},
	init : function () {
		return {
			desc : "this is a PageCtrl component"
		};
	},
	render : function () {
		this.template ( "<span>{{ desc }}</span><num></num>" ).
		style ( {
			span : { color : "pink" }
		} );
	}
} );