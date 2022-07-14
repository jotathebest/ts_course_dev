import { ActiveCampaignService } from './ActiveCampaignService';
import { AuthService } from './AuthService';
import { ConfigService } from "./ConfigService";
import { DataService } from "./DataService";
import { SchemaService } from "./SchemaService";


declare const Session: any;
declare const Logger: any;
declare const PropertiesService: any;
declare const DataStudioApp: any;

export class MainService {


    configService: ConfigService;
    schemaService: SchemaService;
    dataService: DataService;
    authService: AuthService;


    getAuthService(): AuthService {
        if (!this.authService) {
            this.setAuthService(new AuthService());
        }
        return this.authService;
    }

    setAuthService(authService: AuthService): void {
        this.authService = authService;
    }

    get3PAuthorizationUrls(): any {
        (new ActiveCampaignService()).subscribe();
        var authService: AuthService = this.getAuthService()
        return authService.get3PAuthorizationUrls()
    }

    authCallback(request: any): any {
        var authService: AuthService = this.getAuthService()
        return authService.authCallback(request);
    }
    isAdminUser(): boolean {
        var user = Session.getEffectiveUser().getEmail();
        var admins = PropertiesService.getScriptProperties().getProperty('admins').split(",");
        if (admins.includes(user)) {
            return true;
        }
    }

    getConfig(request: any): any {
        return this.getConfigService().getConfig(request);
    }
    getConfigService(): ConfigService {
        if (!this.configService) {
            this.setConfigService(new ConfigService());
        }
        return this.configService;
    }
    setConfigService(configService: ConfigService) {
        this.configService = configService;
    }
    getSchema(request: any): any {
        return (new SchemaService()).getSchema(request, false);
    }
    getData(request: any): any {
        return this.getDataService().getData(request);
    }
    getDataService(): DataService {
        if (!this.dataService) {
            this.setDataService(new DataService());
        }
        return this.dataService;
    }
    setDataService(dataService: DataService): void {
        this.dataService = dataService
    }

    getAuthType() {
        var response = {
            "type": PropertiesService.getScriptProperties().getProperty('AuthType')
        };
        return response;
    }

    isAuthValid() {
        var valid = this.getAuthService().isAuthValid();
        if (!valid) {
            this.resetAuth();
        }
        return valid;
    }

    resetAuth() {
        return this.getAuthService().resetAuth();
    }

}