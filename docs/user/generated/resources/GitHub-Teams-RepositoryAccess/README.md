# GitHub::Teams::RepositoryAccess

Manage a team access to a repository in GitHub.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "GitHub::Teams::RepositoryAccess",
    "Properties" : {
        "<a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>" : <i>String</i>,
        "<a href="#org" title="Org">Org</a>" : <i>String</i>,
        "<a href="#team" title="Team">Team</a>" : <i>String</i>,
        "<a href="#owner" title="Owner">Owner</a>" : <i>String</i>,
        "<a href="#repository" title="Repository">Repository</a>" : <i>String</i>,
        "<a href="#permission" title="Permission">Permission</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: GitHub::Teams::RepositoryAccess
Properties:
    <a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>: <i>String</i>
    <a href="#org" title="Org">Org</a>: <i>String</i>
    <a href="#team" title="Team">Team</a>: <i>String</i>
    <a href="#owner" title="Owner">Owner</a>: <i>String</i>
    <a href="#repository" title="Repository">Repository</a>: <i>String</i>
    <a href="#permission" title="Permission">Permission</a>: <i>String</i>
</pre>

## Properties

#### GitHubAccess

Personal Access Token

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Org

The organization name. The name is not case sensitive.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Team

The slug of the team name.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Owner

The account owner of the repository. The name is not case sensitive.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Repository

The name of the repository. The name is not case sensitive.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Permission

The permission to grant the team on this repository. In addition to the enumerated values, you can also specify a custom repository role name, if the owning organization has defined any. If no permission is specified, the team's permission attribute will be used to determine what permission to grant the team on this repository.

_Required_: No

_Type_: String

_Allowed Values_: <code>pull</code> | <code>push</code> | <code>admin</code> | <code>maintain</code> | <code>triage</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

