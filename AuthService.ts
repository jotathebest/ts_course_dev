declare const OAuth2: any;
declare const PropertiesService: any;
declare const HtmlService: any;
declare const CacheService: any;
declare const Logger: any;
declare const UrlFetchApp: any;

export class AuthService {

  serviceName: string
  authorizationBaseUrl: string
  tokenUrl: string
  callbackFunction: string
  scope: string
  protected clientId: string
  protected clientSecret: string
  service: any
  scriptProps: any;
  userProps: any;


  // debería agregar el tipo de autenticacion en el constructor, to do
  constructor() {
    this.serviceName = PropertiesService.getScriptProperties().getProperty('serviceName');
    this.authorizationBaseUrl = PropertiesService.getScriptProperties().getProperty('authorizationBaseUrl');
    this.tokenUrl = PropertiesService.getScriptProperties().getProperty('tokenUrl');
    this.scope = PropertiesService.getScriptProperties().getProperty('scope');
    this.callbackFunction = "authCallback";
    this.clientId = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
    this.clientSecret = PropertiesService.getScriptProperties().getProperty('CLIENT_SECRET');
  }

  public getService(): any {
    if (!this.service) {
      this.service = OAuth2.createService(this.serviceName)
        .setAuthorizationBaseUrl(this.authorizationBaseUrl)
        .setTokenUrl(this.tokenUrl)
        .setClientId(this.clientId)
        .setClientSecret(this.clientSecret)
        .setPropertyStore(PropertiesService.getUserProperties())
        .setCallbackFunction(this.callbackFunction)
        .setCache(CacheService.getUserCache())
        .setScope(this.scope);
    }
    return this.service
  }


  public getAuthType(): any {
    var response = {
      "type": PropertiesService.getScriptProperties().getProperty('AuthType')
    };
    return response;
  }

  public resetAuth() {
    try {
      var options = {
        method: 'delete',
        headers: {
          'Authorization': 'Bearer ' + this.getService().getAccessToken()
        }
      };
      var delete_response = JSON.parse(UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('PERMISSIONSURL'), options));
    } catch {
      console.log("Error on FB permission delete")
    }
    this.getService().reset();
  }

  public isAuthValid() {
    return this.getService().hasAccess();
  }

  public authCallback(request: any): any {
    var authorized = this.getService().handleCallback(request);
    if (authorized) {
      return HtmlService.createHtmlOutput("Success! You can close this tab. quickly! let's start!<script>if (window.top) { window.top.close() }</script>");
    } else {
      return HtmlService.createHtmlOutput('Denied. You can close this tab');
    }
  }

  public get3PAuthorizationUrls() {
    return this.getService().getAuthorizationUrl();
  }

}