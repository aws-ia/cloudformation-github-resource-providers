build:
	find . -maxdepth 1 -type d -name "GitHub-*" -exec bash -c "cd '{}' && cfn generate && npm install && npm run build" \;

docs:
	# delete generated
	rm -rf docs/user/generated/*
	# cp GitLab-*/docs/** to generated
	find . -maxdepth 1 -type d -name "GitHub-*" -exec bash -c "cd '{}' && cp -R docs/* ../docs/user/generated/" \;
	# cp GitLab-*/docs-extra/** to generated
	# cp src/main/docs/ to generated


.PHONY: build