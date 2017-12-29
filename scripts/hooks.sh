#!/usr/bin/env bash

if test -e ".git/hooks"; then
	
	ln -sfiv "scripts/git/commit-msg" "dev"
	# chmod -x "pre-commit"

	# ln -sfiv "${basepath}/git_hooks/commit-msg" "${basepath}/commit-msg"
	# chmod -x "commit-msg"
	# echo "ln success"
fi