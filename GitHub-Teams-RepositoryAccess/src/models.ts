// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Teams::RepositoryAccess';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ORG: string = '/properties/Org';
    @Exclude()
    protected readonly IDENTIFIER_KEY_TEAM: string = '/properties/Team';
    @Exclude()
    protected readonly IDENTIFIER_KEY_OWNER: string = '/properties/Owner';
    @Exclude()
    protected readonly IDENTIFIER_KEY_REPOSITORY: string = '/properties/Repository';

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
    @Expose({ name: 'Team' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'team', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    team?: Optional<string>;
    @Expose({ name: 'Owner' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'owner', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    owner?: Optional<string>;
    @Expose({ name: 'Repository' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repository', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    repository?: Optional<string>;
    @Expose({ name: 'Permission' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'permission', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    permission?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.org != null) {
            identifier[this.IDENTIFIER_KEY_ORG] = this.org;
        }

        if (this.team != null) {
            identifier[this.IDENTIFIER_KEY_TEAM] = this.team;
        }

        if (this.owner != null) {
            identifier[this.IDENTIFIER_KEY_OWNER] = this.owner;
        }

        if (this.repository != null) {
            identifier[this.IDENTIFIER_KEY_REPOSITORY] = this.repository;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 4 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

