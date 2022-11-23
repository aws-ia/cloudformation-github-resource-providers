# GitHub::Teams::Team

This resource type manages a [GitHub Team][17]

[Documentation][26]

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
  --type-name GitHub::Teams::Team \
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

### Create a team

```yaml
---
AWSTemplateFormatVersion: '2010-09-09'
Description: Creates a team
Resources:
  DemoTeam:
    Type: GitHub::Teams::Team
    Properties:
      Name: My Demo Team
      Organization: ACME-CloudFormation
      Description: My new Team
      Privacy: secret


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
[26]: ./docs/README.md
