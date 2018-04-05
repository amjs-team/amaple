const 
	fs = require ( "fs" ),
	version = process.argv [ 2 ] || require ( "../package.json" ).version,
	conventionalChangelog = require ( "conventional-changelog" ),
	changeLogDir = "./CHANGELOG",
	fileName = `${changeLogDir}/CHANGELOG-v${ version }.md`;

// 不存在文件夹时创建文件夹
new Promise ( ( resolve, reject ) => {
	fs.exists ( changeLogDir, isExist => {
		resolve ( isExist );
	} );
} )
.then ( isExist => {
	return new Promise ( ( resolve, reject ) => {
		if ( !isExist ) {
			fs.mkdir ( changeLogDir, () => {
				resolve ();
			} );
		}
		else {
			resolve ();
		}
	} );
} )
.then ( () => {
	const writeStream = require ( "fs" ).createWriteStream ( fileName );
	conventionalChangelog ( {
		preset: "angular",
		pkg: {
			transform ( pkg ) {
				pkg.version = `v${ version }`;
				return pkg;
			}
		}

	} ).pipe ( writeStream );
} );