// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Repositories::Repository';

    @Exclude()
    protected readonly IDENTIFIER_KEY_OWNER: string = '/properties/Owner';
    @Exclude()
    protected readonly IDENTIFIER_KEY_NAME: string = '/properties/Name';

    @Expose({ name: 'GitHubAccess' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitHubAccess', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitHubAccess?: Optional<string>;
    @Expose({ name: 'Org' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'org', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    org?: Optional<string>;
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Description' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'description', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    description?: Optional<string>;
    @Expose({ name: 'Homepage' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'homepage', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    homepage?: Optional<string>;
    @Expose({ name: 'Private' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'private_', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    private_?: Optional<boolean>;
    @Expose({ name: 'Visibility' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'visibility', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    visibility?: Optional<string>;
    @Expose({ name: 'HasIssues' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'hasIssues', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    hasIssues?: Optional<boolean>;
    @Expose({ name: 'HasProjects' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'hasProjects', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    hasProjects?: Optional<boolean>;
    @Expose({ name: 'HasWiki' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'hasWiki', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    hasWiki?: Optional<boolean>;
    @Expose({ name: 'IsTemplate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'isTemplate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    isTemplate?: Optional<boolean>;
    @Expose({ name: 'TeamId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'teamId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    teamId?: Optional<number>;
    @Expose({ name: 'AutoInit' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'autoInit', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    autoInit?: Optional<boolean>;
    @Expose({ name: 'GitIgnoreTemplate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitIgnoreTemplate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitIgnoreTemplate?: Optional<string>;
    @Expose({ name: 'LicenseTemplate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'licenseTemplate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    licenseTemplate?: Optional<string>;
    @Expose({ name: 'AllowSquashMerge' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowSquashMerge', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowSquashMerge?: Optional<boolean>;
    @Expose({ name: 'AllowMergeCommit' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowMergeCommit', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowMergeCommit?: Optional<boolean>;
    @Expose({ name: 'AllowRebaseMerge' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowRebaseMerge', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowRebaseMerge?: Optional<boolean>;
    @Expose({ name: 'AllowAutoMerge' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowAutoMerge', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowAutoMerge?: Optional<boolean>;
    @Expose({ name: 'DeleteBranchOnMerge' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'deleteBranchOnMerge', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    deleteBranchOnMerge?: Optional<boolean>;
    @Expose({ name: 'AllowForking' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowForking', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowForking?: Optional<boolean>;
    @Expose({ name: 'Archived' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'archived', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    archived?: Optional<boolean>;
    @Expose({ name: 'SecurityAndAnalysis' })
    @Type(() => SecurityAndAnalysis)
    securityAndAnalysis?: Optional<SecurityAndAnalysis>;
    @Expose({ name: 'Owner' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'owner', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    owner?: Optional<string>;
    @Expose({ name: 'HtmlUrl' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'htmlUrl', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    htmlUrl?: Optional<string>;
    @Expose({ name: 'GitUrl' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitUrl', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitUrl?: Optional<string>;
    @Expose({ name: 'DefaultBranch' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'defaultBranch', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    defaultBranch?: Optional<string>;
    @Expose({ name: 'Language' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'language', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    language?: Optional<string>;
    @Expose({ name: 'ForksCount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'forksCount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    forksCount?: Optional<number>;
    @Expose({ name: 'StarsCount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'starsCount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    starsCount?: Optional<number>;
    @Expose({ name: 'WatchersCount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'watchersCount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    watchersCount?: Optional<number>;
    @Expose({ name: 'IssuesCount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'issuesCount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    issuesCount?: Optional<number>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.owner != null) {
            identifier[this.IDENTIFIER_KEY_OWNER] = this.owner;
        }

        if (this.name != null) {
            identifier[this.IDENTIFIER_KEY_NAME] = this.name;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 2 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class SecurityAndAnalysis extends BaseModel {
    ['constructor']: typeof SecurityAndAnalysis;


    @Expose({ name: 'AdvanceSecurity' })
    @Type(() => AdvanceSecurity)
    advanceSecurity?: Optional<AdvanceSecurity>;
    @Expose({ name: 'SecretScanning' })
    @Type(() => SecretScanning)
    secretScanning?: Optional<SecretScanning>;
    @Expose({ name: 'SecretScanningPushProtection' })
    @Type(() => SecretScanningPushProtection)
    secretScanningPushProtection?: Optional<SecretScanningPushProtection>;

}

export class AdvanceSecurity extends BaseModel {
    ['constructor']: typeof AdvanceSecurity;


    @Expose({ name: 'Status' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'status', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    status?: Optional<string>;

}

export class SecretScanning extends BaseModel {
    ['constructor']: typeof SecretScanning;


    @Expose({ name: 'Status' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'status', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    status?: Optional<string>;

}

export class SecretScanningPushProtection extends BaseModel {
    ['constructor']: typeof SecretScanningPushProtection;


    @Expose({ name: 'Status' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'status', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    status?: Optional<string>;

}

