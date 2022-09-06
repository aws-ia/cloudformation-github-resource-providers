# Setting up a new project in github with a repository, team, and external member with CloudFormation

The following resource types can be useful when setting up a new repository on GitHub.  There is a full working example 
example.yaml which can be deployed with the following command.

```shell
aws cloudformation create-stack --stack-name My-Github-Project --template-body file://example.yaml  --parameters ParameterKey=GitHubAccess,ParameterValue=\'{{resolve:secretsmanager:git-cloudformation/user:SecretString:mySecret}}\'
```

The sample uses the following types.

- GitHub::Organizations::Membership - Add a user to an organization using an invitation
- GitHub::Repositories::Repository - Create a new repo
- GitHub::Repositories::Webhook - Add a webhook to a repo
- GitHub::Repositories::Collaborator - Add an external collaborator to a rep
- GitHub::Teams::Team - Create a team
- GitHub::Teams::Membership - Add an organization member to a team
- GitHub::Teams::RepositoryAccess - Give a team access to a repository


### Organisation Membership

We can add a test user to an organisation as shown. This will send an invite to the user, which they need to accept 
within 7 days.  If the Cloudformation is update while the invite is still pending then the invite will be updated but 
once the invite has been accepted the membership will be modified on update.

```yaml

Membership:
  Type: GitHub::Organizations::Membership
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Organization: ACME-CloudFormation
    Username: ACME-cloudformation-test-user
    Role: member
```

### Repository

This sets up a new repository within the organization.  Depending on the settings here you may not be able to add external
collaborators to the team e.g. if you make a repo public then adding an external collaborator with read only access
will fail as if it already exists.

```yaml
MyRepo:
  Type: GitHub::Repositories::Repository
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Org: ACME-CloudFormation
    Name: MyRepo
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
    AllowForking: true
    Archived: false
```

### Webhook

Create a webhook that will be called on every push event.  This is very useful for configuring automation managed via
other cloudformation resources.

```yaml
    
MyWebHook:
  Type: GitHub::Repositories::Webhook
  DependsOn: MyRepo
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Owner: ACME-CloudFormation
    Name: web
    Active: false
    Events:
      - push
    Repository: MyRepo
    Config:
      Url: http://some.url.com
      Secret: 123444
```

### Repository Collaborator

This is for giving access to a user from outside the organisation to a specific repository.  They will not become part
of the organisation, but they will have to accept an invitation in the same way as organization membership.

```yaml
            
ExternalCollaborator:
  Type: GitHub::Repositories::Collaborator
  DependsOn: MyRepo
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Owner: ACME-CloudFormation
    Repository: MyRepo
    Username: alasdairhodge
    Permission: pull
```

### Teams

Creates a new team.

```yaml
DemoTeam:
  Type: GitHub::Teams::Team
  Properties:
    Name: My Demo Team
    Organization: ACME-CloudFormation
    Description: My new Team
    Privacy: secret
    GitHubAccess: !Ref GitHubAccess
```

### Adding a team member

Here we add a member of the organisation to a team.

```yaml
DemoTeamMemberMe:
  Type: GitHub::Teams::Membership
  DependsOn: DemoTeam
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Org: ACME-CloudFormation
    TeamSlug: my-demo-team
    Username: organisation-member
    Role: member
```

### Repository Access

Now that we have a team with a member we can give that team (and all its members) access to the respository that we
created.

```yaml
DemoTeamAccessRepo:
  Type: GitHub::Teams::RepositoryAccess
  DependsOn:
    - MyRepo
    - DemoTeam
  Properties:
    GitHubAccess: !Ref GitHubAccess
    Org: ACME-CloudFormation
    Team: my-demo-team
    Owner: ACME-CloudFormation
    Repository: MyRepo
    Permission: pull
```