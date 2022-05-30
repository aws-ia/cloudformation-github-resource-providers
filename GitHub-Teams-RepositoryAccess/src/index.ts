import {Octokit} from "@octokit/core";

const octokit = new Octokit({
    auth: "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"
});


octokit.request('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
    org: 'Cloudsoft-CloudFormation',
    team_slug: 'github-repository-handler-test-team',
    owner: 'Cloudsoft-CloudFormation',
    repo: 'CloudFormation-GitHub-Test',
    permission: 'pull'
}).then(response => {
    console.log(JSON.stringify(response, null, 2));
}).catch(err => console.error(err));