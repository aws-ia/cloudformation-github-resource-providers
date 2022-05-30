# GitHub::Repositories::Repository

Manage a repository in GitHub.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "GitHub::Repositories::Repository",
    "Properties" : {
        "<a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>" : <i>String</i>,
        "<a href="#org" title="Org">Org</a>" : <i>String</i>,
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#description" title="Description">Description</a>" : <i>String</i>,
        "<a href="#homepage" title="Homepage">Homepage</a>" : <i>String</i>,
        "<a href="#private" title="Private">Private</a>" : <i>Boolean</i>,
        "<a href="#visibility" title="Visibility">Visibility</a>" : <i>String</i>,
        "<a href="#hasissues" title="HasIssues">HasIssues</a>" : <i>Boolean</i>,
        "<a href="#hasprojects" title="HasProjects">HasProjects</a>" : <i>Boolean</i>,
        "<a href="#haswiki" title="HasWiki">HasWiki</a>" : <i>Boolean</i>,
        "<a href="#istemplate" title="IsTemplate">IsTemplate</a>" : <i>Boolean</i>,
        "<a href="#teamid" title="TeamId">TeamId</a>" : <i>Double</i>,
        "<a href="#autoinit" title="AutoInit">AutoInit</a>" : <i>Boolean</i>,
        "<a href="#gitignoretemplate" title="GitIgnoreTemplate">GitIgnoreTemplate</a>" : <i>String</i>,
        "<a href="#licensetemplate" title="LicenseTemplate">LicenseTemplate</a>" : <i>String</i>,
        "<a href="#allowsquashmerge" title="AllowSquashMerge">AllowSquashMerge</a>" : <i>Boolean</i>,
        "<a href="#allowmergecommit" title="AllowMergeCommit">AllowMergeCommit</a>" : <i>Boolean</i>,
        "<a href="#allowrebasemerge" title="AllowRebaseMerge">AllowRebaseMerge</a>" : <i>Boolean</i>,
        "<a href="#allowautomerge" title="AllowAutoMerge">AllowAutoMerge</a>" : <i>Boolean</i>,
        "<a href="#deletebranchonmerge" title="DeleteBranchOnMerge">DeleteBranchOnMerge</a>" : <i>Boolean</i>,
        "<a href="#allowforking" title="AllowForking">AllowForking</a>" : <i>Boolean</i>,
        "<a href="#archived" title="Archived">Archived</a>" : <i>Boolean</i>,
        "<a href="#securityandanalysis" title="SecurityAndAnalysis">SecurityAndAnalysis</a>" : <i><a href="securityandanalysis.md">SecurityAndAnalysis</a></i>,
    }
}
</pre>

### YAML

<pre>
Type: GitHub::Repositories::Repository
Properties:
    <a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>: <i>String</i>
    <a href="#org" title="Org">Org</a>: <i>String</i>
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#description" title="Description">Description</a>: <i>String</i>
    <a href="#homepage" title="Homepage">Homepage</a>: <i>String</i>
    <a href="#private" title="Private">Private</a>: <i>Boolean</i>
    <a href="#visibility" title="Visibility">Visibility</a>: <i>String</i>
    <a href="#hasissues" title="HasIssues">HasIssues</a>: <i>Boolean</i>
    <a href="#hasprojects" title="HasProjects">HasProjects</a>: <i>Boolean</i>
    <a href="#haswiki" title="HasWiki">HasWiki</a>: <i>Boolean</i>
    <a href="#istemplate" title="IsTemplate">IsTemplate</a>: <i>Boolean</i>
    <a href="#teamid" title="TeamId">TeamId</a>: <i>Double</i>
    <a href="#autoinit" title="AutoInit">AutoInit</a>: <i>Boolean</i>
    <a href="#gitignoretemplate" title="GitIgnoreTemplate">GitIgnoreTemplate</a>: <i>String</i>
    <a href="#licensetemplate" title="LicenseTemplate">LicenseTemplate</a>: <i>String</i>
    <a href="#allowsquashmerge" title="AllowSquashMerge">AllowSquashMerge</a>: <i>Boolean</i>
    <a href="#allowmergecommit" title="AllowMergeCommit">AllowMergeCommit</a>: <i>Boolean</i>
    <a href="#allowrebasemerge" title="AllowRebaseMerge">AllowRebaseMerge</a>: <i>Boolean</i>
    <a href="#allowautomerge" title="AllowAutoMerge">AllowAutoMerge</a>: <i>Boolean</i>
    <a href="#deletebranchonmerge" title="DeleteBranchOnMerge">DeleteBranchOnMerge</a>: <i>Boolean</i>
    <a href="#allowforking" title="AllowForking">AllowForking</a>: <i>Boolean</i>
    <a href="#archived" title="Archived">Archived</a>: <i>Boolean</i>
    <a href="#securityandanalysis" title="SecurityAndAnalysis">SecurityAndAnalysis</a>: <i><a href="securityandanalysis.md">SecurityAndAnalysis</a></i>
</pre>

## Properties

#### GitHubAccess

Personal access token

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Org

The organization name. The name is not case sensitive. If not specified, then the managed repository will be within the currently logged-in user account.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Name

The name of the repository.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Description

A short description of the repository.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Homepage

A URL with more information about the repository.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Private

Whether the repository is private.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Visibility

Can be public or private. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, visibility can also be internal. Note: For GitHub Enterprise Server and GitHub AE, this endpoint will only list repositories available to all users on the enterprise. For more information, see "Creating an internal repository" (https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories#about-internal-repositories) in the GitHub Help documentation.

_Required_: No

_Type_: String

_Allowed Values_: <code>public</code> | <code>private</code> | <code>internal</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### HasIssues

Either true to enable issues for this repository or false to disable them.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### HasProjects

Either true to enable projects for this repository or false to disable them. Note: If you're creating a repository in an organization that has disabled repository projects, the default is false, and if you pass true, the API returns an error.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### HasWiki

Either true to enable the wiki for this repository or false to disable it.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### IsTemplate

Either true to make this repo available as a template repository or false to prevent it.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### TeamId

The id of the team that will be granted access to this repository. This is only valid when creating a repository in an organization.

_Required_: No

_Type_: Double

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### AutoInit

Pass true to create an initial commit with empty README.

_Required_: No

_Type_: Boolean

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### GitIgnoreTemplate

Desired language or platform .gitignore template to apply. Use the name of the template without the extension (https://github.com/github/gitignore). For example, "Haskell".

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### LicenseTemplate

Choose an open source license template (https://choosealicense.com/) that best suits your needs, and then use the license keyword (https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository#searching-github-by-license-type) as the license_template string. For example, "mit" or "mpl-2.0".

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### AllowSquashMerge

Either true to allow squash-merging pull requests, or false to prevent squash-merging.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AllowMergeCommit

Either true to allow merging pull requests with a merge commit, or false to prevent merging pull requests with merge commits.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AllowRebaseMerge

Either true to allow rebase-merging pull requests, or false to prevent rebase-merging.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AllowAutoMerge

Either true to allow auto-merge on pull requests, or false to disallow auto-merge.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DeleteBranchOnMerge

Either true to allow automatically deleting head branches when pull requests are merged, or false to prevent automatic deletion.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AllowForking

Either true to allow private forks, or false to prevent private forks.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Archived

true to archive this repository. Note: You cannot unarchive repositories through the API.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SecurityAndAnalysis

Specify which security and analysis features to enable or disable. For example, to enable GitHub Advanced Security, use this data in the body of the PATCH request: {"security_and_analysis": {"advanced_security": {"status": "enabled"}}}. If you have admin permissions for a private repository covered by an Advanced Security license, you can check which security and analysis features are currently enabled by using a GET /repos/{owner}/{repo} request.

_Required_: No

_Type_: <a href="securityandanalysis.md">SecurityAndAnalysis</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Owner

ID of the repository owner.

#### HtmlUrl

URL of the git repository on Github.

#### GitUrl

Git URL of the repository on Github.

#### DefaultBranch

Updates the default branch for this repository.

#### Language

The main programming language used for this GitHub repository.

#### ForksCount

Number of forks for this GitHub repository.

#### StarsCount

Number of stars for this GitHub repository.

#### WatchersCount

Number of stars for this GitHub repository.

#### IssuesCount

Number of issues for this GitHub repository.

