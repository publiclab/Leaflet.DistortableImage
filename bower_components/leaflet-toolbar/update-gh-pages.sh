#!/bin/sh

# Keep gh-pages branch in sync with master.
#     If you want to use this as a git hook, copy it to
#         .git/hooks/pre-push.
#     You can also use this as a standalone script by copying 
#         the code inside the if block and manually running it
#         whenever you want to synchronize gh-pages with master.

current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
if [ $current_branch = "master" ]; then
	git checkout gh-pages

	git checkout master -- examples dist .travis.yml
	git add node_modules/leaflet-draw node_modules/leaflet examples dist .travis.yml
	git commit -m "Update gh-pages branch on $(date +"%m-%d-%Y") at $(date +"%H:%M:%S")."

	git checkout master # return to the master branch
fi

exit 0