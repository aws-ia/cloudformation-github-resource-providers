// This is a generated file. Modifications will be overwritten.
import {
    BaseModel,
    Dict,
    Optional,
    transformValue
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {Exclude, Expose, Transform} from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Teams::Team';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ORGANISATION: string = '/properties/Organisation';
    @Exclude()
    protected readonly IDENTIFIER_KEY_NAME: string = '/properties/Name';
    @Exclude()
    protected readonly IDENTIFIER_KEY_SLUG: string = '/properties/Slug';

    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Organisation' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'organisation', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    organisation?: Optional<string>;
    @Expose({ name: 'Description' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'description', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    description?: Optional<string>;
    @Expose({ name: 'Privacy' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'privacy', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    privacy?: Optional<string>;
    @Expose({ name: 'Slug' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'slug', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    slug?: Optional<string>;
    @Expose({ name: 'GitHubAccess' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitHubAccess', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitHubAccess?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.organisation != null) {
            identifier[this.IDENTIFIER_KEY_ORGANISATION] = this.organisation;
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
        if (this.getIdentifier_Slug() != null) {
            identifiers.push(this.getIdentifier_Slug());
        }
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }

    @Exclude()
    public getIdentifier_Slug(): Dict {
        const identifier: Dict = {};
        if ((this as any).slug != null) {
            identifier[this.IDENTIFIER_KEY_SLUG] = (this as any).slug;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }
}

