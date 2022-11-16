# cloudformation-github

## Set up git filter

_Note: this is changing, to accomodate CICD. `example_inputs` is now transformed into `inputs` by `setup.sh` in each resource folder. Only GitHub-Repositories-Repository has been changed so far._

This project uses a filter set up in the [.gitattributes](.gitattributes) file to replace private values for testing within the different `overides.json` on each resource.

The filter has to be added manually inside the `.git/config` file once the repository has been cloned.

Executing this in the console from the project root will add it. Replace the values inside the __square__ brackets with the actual values for testing

```properties
cat << EOF >> .git/config
[filter "github"]
	clean = sed \\
		-e 's:[organizacionForTesting]:<GITHUB_ORG>:g' \\
		-e 's:[existingRepositoryForTesting]:<GITHUB_REPOSITORY>:g' \\
		-e 's:[existingShaCommitOfAboveRepositoryForTesting]:<GITHUB_SHA_1>:g' \\
		-e 's:[existingShaCommitOfAboveRepositoryForTesting]:<GITHUB_SHA_2>:g' \\
		-e 's:[existingRepositoryForTesting]:<GITHUB_REPOSITORY>:g' \\
		-e 's:[existingTeamForTesting]:<GITHUB_TEAM>:g' \\
		-e 's:[existingGithubUserForTesting]:<GITHUB_USERNAME>:g'
	smudge = sed \\
		-e 's:<GITHUB_ORG>:[organizacionForTesting]:g' \\
        -e 's:<GITHUB_REPOSITORY>:[existingRepositoryForTesting]:g' \\
        -e 's:<GITHUB_SHA_1>:[existingShaCommitOfAboveRepositoryForTesting]:g' \\
        -e 's:<GITHUB_SHA_2>:[existingShaCommitOfAboveRepositoryForTesting]:g' \\
		-e 's:<GITHUB_TEAM>:[existingTeamForTesting]:g' \\
		-e 's:<GITHUB_USERNAME>:[existingGithubUserForTesting]:g'
EOF
```
