#!/usr/bin/env bash

echo $0
# if ! test -e ".git/hooks"; then
	ln -s "scripts/git_hooks/pre-commit" ".git/hooks/pre-commit"
	chmod -x ".git/hooks/pre-commit"

	ln -s "scripts/git_hooks/commit-msg" ".git/hooks/commit-msg"
	chmod -x ".git/hooks/commit-msg"
	echo "ln success"
# fi