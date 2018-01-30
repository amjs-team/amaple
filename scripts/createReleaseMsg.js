const 
	version = process.argv [ 2 ] || require ( "../package.json" ).version,
	conventionalChangelog = require ( "conventional-changelog" ),
	fileName = `./CHANGELOG/CHANGELOG-v${ version }.md`,
	writeStream = require ( "fs" ).createWriteStream ( fileName );

conventionalChangelog ( {
	preset: "angular",
	pkg: {
		transform ( pkg ) {
			// pkg.version = `v${ version }`;
			return pkg;
		}
	}

} ).pipe ( writeStream );