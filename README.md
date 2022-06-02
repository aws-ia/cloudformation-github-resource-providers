# cloudformation-github

## Set up git filter

This project uses a filter set up in the [.gitattributes](.gitattributes) file to replace private values for testing within the different `overides.json` on each resource.

The filter has to be added manually inside the `.git/config` file once the repository has been cloned.

Executing this in the console from the project root will add it. Replace the values inside the __square__ brackets with the actual values for testing

```properties
cat << EOF >> .git/config
[filter "github-token"]
	clean = sed \\
		-e 's:[githubAccessToken]:<GITHUB_TOKEN>:g' \\
		-e 's:[organizacionForTesting]:<ORG>:g' \\
		-e 's:[existingTeamForTesting]:<TEAM>:g' \\
		-e 's:[existingGithubUserForTesting]:<USERNAME>:g' 
	smudge = sed \\
		-e 's:<GITHUB_TOKEN>:[githubAccessToken]:g' \\
		-e 's:<ORG>:[organizacionForTesting]:g' \\
		-e 's:<TEAM>:[existingTeamForTesting]:g' \\
		-e 's:<USERNAME>:[existingGithubUserForTesting]:g'
EOF
```
