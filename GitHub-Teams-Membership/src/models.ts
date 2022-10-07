// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Teams::Membership';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ORG: string = '/properties/Org';
    @Exclude()
    protected readonly IDENTIFIER_KEY_TEAMSLUG: string = '/properties/TeamSlug';
    @Exclude()
    protected readonly IDENTIFIER_KEY_USERNAME: string = '/properties/Username';

    @Expose({ name: 'Org' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'org', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    org?: Optional<string>;
    @Expose({ name: 'TeamSlug' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'teamSlug', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    teamSlug?: Optional<string>;
    @Expose({ name: 'Username' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'username', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    username?: Optional<string>;
    @Expose({ name: 'Role' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'role', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    role?: Optional<string>;
    @Expose({ name: 'State' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'state', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    state?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.org != null) {
            identifier[this.IDENTIFIER_KEY_ORG] = this.org;
        }

        if (this.teamSlug != null) {
            identifier[this.IDENTIFIER_KEY_TEAMSLUG] = this.teamSlug;
        }

        if (this.username != null) {
            identifier[this.IDENTIFIER_KEY_USERNAME] = this.username;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 3 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;


    @Expose({ name: 'GitHubAccess' })
    @Type(() => GitHubAccess)
    gitHubAccess?: Optional<GitHubAccess>;

}

export class GitHubAccess extends BaseModel {
    ['constructor']: typeof GitHubAccess;


    @Expose({ name: 'AccessToken' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accessToken', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accessToken?: Optional<string>;

}

