const { test, ln, chmod } = require ( "shelljs" );

function installHooks () {
	if ( test ( "-e", ".git/hooks" ) ) {
		ln ( "-sf", "../../scripts/git/pre-commit", ".git/hooks/pre-commit" );
		chmod ( "+x", ".git/hooks/pre-commit" );
		ln ( "-sf", "../../scripts/git/commit-msg", ".git/hooks/commit-msg" );
		chmod ( "+x", ".git/hooks/commit-msg" );
	}
}

installHooks ();