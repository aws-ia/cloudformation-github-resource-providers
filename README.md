# GitHub CloudFormation Resources

This collection of [AWS CloudFormation resource types][1] allow GitHub to be controlled using [AWS CloudFormation][2].


| Resource                           | Description                                                      | Documentation                          |
|------------------------------------|------------------------------------------------------------------|----------------------------------------|
| GitHub::Git::Tag                   | This resource type manages a [GitHub Git Tag][3]                 | [/GitHub-Git-Tag][4]                   |
| GitHub::Organizations::Membership  | This resource type manages a [GitHub Organization Membership][5] | [/GitHub-Origanizations-Membership][6] |
| GitHub::Repositories::Collaborator | This resource type manages a [GitHub Repository Collaborator][7] | [/GitHub-Repositories-Collaborator][8] |
| GitHub::Repositories::Repository   | This resource type manages a [GitHub Repository][9]              | [/GitHub-Repositories-Repository][10]  |
| GitHub::Repositories::Webhook      | This resource type manages a [GitHub Repository Webhoo][11]      | [/GitHub-Repositories-Webhook][12]     |
| GitHub::Teams::Membership          | This resource type manages a [GitHub Team Membership][13]        | [/GitHub-Teams-Membership][14]         |
| GitHub::Teams::RepositoryAccess    | This resource type manages a [GitHub Team Repository Access][15] | [/GitHub-Teams-Repository-Access][16]  |
| GitHub::Teams::Team                | This resource type manages a [GitHub Team][17]                   | [/GitHub-Teams-Team][18]               |
| Github::Repositories::Secret         | This resource type manages a [Github Repositories Secret][27]      | [/Github-Repositories-Secret][29]
| Github::Organizations::Secret         | This resource type manages a [Github Organizations Secret][28]      | [/Github-Organizations-Secret][30]


## Prerequisites
* [AWS Account][19]
* [AWS CLI][20]
* [GitHub Account][21] and [Access Token][22]

## AWS Management Console

To get started:

1. Sign in to the [AWS Management Console][23] with your account and navigate to CloudFormation.

2. Select "Public extensions" from the left hand pane and filter Publisher by "Third Party".

3. Use the search bar to filter by the "GitHub" prefix.

Note: All official GitHub resources begin with `GitHub::` and specify that they are `Published by GitHub`.

4. Select the desired resource name to view more information about its schema, and click **Activate**.

5. On the **Extension details** page, specify:
- Extension name
- Execution role ARN
- Automatic updates for minor version releases
- Configuration

6. In your terminal, specify the configuration data for the registered GitHub CloudFormation resource type, in the given account and region by using the **SetTypeConfiguration** operation:


For example:

  ```Bash
  $ aws cloudformation set-type-configuration \
  --region us-west-2 --type RESOURCE \
  --type-name GitHub::Git::Tag \
  --configuration-alias default \
  --configuration '{"GitHubAccess": {"AccessToken": "{{resolve:ssm-secure:/cfn/github/accesstoken:1}}"}}'
  ```

7. After you have your resource configured, [create your AWS stack][24] that includes any of the activated GitHub resources.

For more information about available commands and workflows, see the official [AWS documentation][25].

## Supported regions

The GitHub CloudFormation resources are available on the CloudFormation Public Registry in the following regions:

| Code            | Name                      |
|-----------------|---------------------------|
| us-east-1       | US East (N. Virginia)     |
| us-east-2       | US East (Ohio)            |
| us-west-1       | US West (N. California)   |
| us-west-2       | US West (Oregon)          |
| ap-south-1      | Asia Pacific (Mumbai)     |
| ap-northeast-1  | Asia Pacific (Tokyo)      |
| ap-northeast-2  | Asia Pacific (Seoul)      |
| ap-southeast-1  | Asia Pacific (Singapore)  |
| ap-southeast-2  | Asia Pacific (Sydney)     |
| ca-central-1    | Canada (Central)          |
| eu-central-1    | Europe (Frankfurt)        |
| eu-west-1       | Europe (Ireland)          |
| eu-west-2       | Europe (London)           |
| eu-west-3       | Europe (Paris)            |
| eu-north-1      | Europe (Stockholm)        |
| sa-east-1       | South America (São Paulo) |

**Note**: To privately register a resource in any other region, use the provided packages.

## Examples

### Setting up a new project in github with a repository, team, and external member with CloudFormation

```yaml
---
AWSTemplateFormatVersion: '2010-09-09'
Description: Shows how to set up a new github based project

Parameters:
  RepoName:
    Type: String
    Description: |
      The name of the repo that is being created and configured
    Default: MyRepo

Resources:
  Membership:
    Type: GitHub::Organizations::Membership
    Properties:
      Organization: ACME-CloudFormation
      Username: ACME-cloudformation-test-user
      Role: member
  MyRepo:
    Type: GitHub::Repositories::Repository
    Properties:
      Org: ACME-CloudFormation
      Name: !Ref RepoName
      Description: Repo created by cloudformation example
      Homepage: https://GitHub.com
      Private: true
      Visibility: private
      HasIssues: true
      HasProjects: false
      HasWiki: true
      IsTemplate: false
      AutoInit: true
      GitIgnoreTemplate: Node
      LicenseTemplate: mit
      AllowSquashMerge: true
      AllowMergeCommit: true
      AllowRebaseMerge: true
      AllowAutoMerge: true
      DeleteBranchOnMerge: false
      Archived: false
  MyWebHook:
    Type: GitHub::Repositories::Webhook
    DependsOn: MyRepo
    Properties:
      Url: http://some.url.com
      Owner: ACME-CloudFormation
      Name: web
      Active: false
      Events:
        - push
      Repository: !Ref RepoName
  ExternalCollaborator:
    Type: GitHub::Repositories::Collaborator
    DependsOn: MyRepo
    Properties:
      Owner: ACME-CloudFormation
      Repository: !Ref RepoName
      Username: externaluser
      Permission: pull
  DemoTeam:
    Type: GitHub::Teams::Team
    Properties:
      Name: My Demo Team
      Organization: ACME-CloudFormation
      Description: My new Team
      Privacy: secret
  DemoTeamMemberMe:
    Type: GitHub::Teams::Membership
    Properties:
      Org: ACME-CloudFormation
      TeamSlug: !GetAtt DemoTeam.Slug
      Username: organisation-member
      Role: member
  DemoTeamAccessRepo:
    Type: GitHub::Teams::RepositoryAccess
    DependsOn: MyRepo
    Properties:
      Org: ACME-CloudFormation
      Team: !GetAtt DemoTeam.Slug
      Owner: ACME-CloudFormation
      Repository: !Ref RepoName
      Permission: pull

```

### Set up a repository secret

```yaml
---
AWSTemplateFormatVersion: '2010-09-09'
Description: Sets up a repository secret
Resources:
  MySecret:
    Type: GitHub::Repositories::Secret
    Properties:
      Repository: example-repo
      Owner: ACME-CloudFormation
      SecretName: secret example
      SecretValue: example_secret123

```

### Set up a organization secret

```yaml
---
AWSTemplateFormatVersion: '2010-09-09'
Description: Sets up a Organization secret
Resources:
  MySecret:
    Type: GitHub::Organization::Secret
    Properties:
      Org: example-org
      SecretName: secret example
      SecretValue: example_secret123
      Visibility: selected
      SelectedRepositoryIds: 
        - 595653363

```

[1]: https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-types.html
[2]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
[3]: https://docs.github.com/en/rest/git/tags
[4]: GitHub-Git-Tag
[5]: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/about-organization-membership
[6]: GitHub-Organizations-Membership
[7]: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository
[8]: GitHub-Repositories-Collaborator
[9]: https://docs.github.com/en/repositories
[10]: GitHub-Repositories-Repository
[11]: https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks
[12]: GitHub-Repositories-Webhook
[13]: https://docs.github.com/en/organizations/organizing-members-into-teams/adding-organization-members-to-a-team
[14]: GitHub-Teams-Membership
[15]: https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-team-access-to-an-organization-repository
[16]: GitHub-Teams-RepositoryAccess
[17]: https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams
[18]: GitHub-Teams-Team
[19]: https://aws.amazon.com/account/
[20]: https://aws.amazon.com/cli/
[21]: https://github.com/
[22]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[23]: https://aws.amazon.com/console/
[24]: https://console.aws.amazon.com/cloudformation/home
[25]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry.html
[27]: https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28#create-or-update-a-repository-secret
[28]: https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28#create-or-update-an-organization-secret
[29]: GitHub-Repositories-Secret
[30]: GitHub-Organizations-Secret