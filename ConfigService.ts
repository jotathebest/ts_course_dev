import { AuthService } from "./AuthService";
declare const UrlFetchApp: any;
declare const PropertiesService: any;
declare const Logger: any;
declare const Session: any;
declare const DataStudioApp: any;
declare const Utilities: any;


export class ConfigService {

  authService: AuthService;

  getConfig(request: any): any {
    var endp: string = PropertiesService.getScriptProperties().getProperty('ENDP') + "/" + PropertiesService.getScriptProperties().getProperty('resourceName') + "/get_config";
    this.authService = new AuthService();
    var token = this.authService.getService().getAccessToken();
    var payload: any = {
      "target": "datastudio",
      "user": Session.getEffectiveUser().getEmail(),
      "args": {
        "request": request,
        "authentication": {
          "type": "OAuth",
          "token": token
        }
      }
    };
    payload = JSON.stringify(payload);
    let options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': payload,
      'headers': {
        "x-api-key": PropertiesService.getScriptProperties().getProperty('PTOK'),
        "Accept": "application/json"
      }
    };

    var config = JSON.parse(UrlFetchApp.fetch(endp, options));
    this.checkForWorkId(config);
    let get_work_result_options = {
      'method': 'get',
      'contentType': 'application/json',
      'headers': {
        "x-api-key": PropertiesService.getScriptProperties().getProperty('PTOK'),
        "Accept": "application/json"
      },
      'muteHttpExceptions': true
    };
    let get_work_result_endp = PropertiesService.getScriptProperties().getProperty('ENDP') + "/work-result/?work-id=" + config.work_id;
    let response_error_trys = 3;
    do {
      Utilities.sleep(2000);
      config = UrlFetchApp.fetch(get_work_result_endp, get_work_result_options);
      let result_code = config.getResponseCode();
          
      if (result_code == 200) {
        config = JSON.parse(config)
      } else if (response_error_trys > 0){
        Logger.log('Work result response code: ' + result_code);
        Logger.log('Work result response body: ' + config);
        response_error_trys = response_error_trys - 1;
        config = {
          'process_status': 'IN PROGRESS'
        }
      } else {
        Logger.log('We cant get work result data from the server because server is broken');
        config = {
            'code': 500,
            'status': 'Error',
            'message': 'We have had an error trying to obtain your data, try to reload your report, or change the date range of the request.'
        }
      }
    } while (response_error_trys > 0 && config.process_status && config.process_status == "IN PROGRESS")
    
    this.checkForError(config);
    // config = this.addResetInfo(config)
    return config;
  }

  checkForError(config) {
    if (config.status && config.status == "Error") {
      Logger.log("config.status: ");
      Logger.log(config.status);
      Logger.log("config: ");
      Logger.log(config);
      this.authService.resetAuth();
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText('Please re-authorize the connector with your facebook account.' + config.message)
        .setText('Please re-authorize the connector with your facebook account.' + config.message)
        .throwException();
    }
  }

  checkForWorkId(config) {
    if (!config.work_id) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText("Wow Wow... It seems that we are having some problems in our service right now. If you have already reported this, probably we're solving it in this moment." + JSON.stringify(config))
        .setText("Wow Wow... It seems that we are having some problems in our service right now. If you have already reported this, probably we're solving it in this moment.")
        .throwException();
    }
  }

  addResetInfo(config) {
    if (config && config.configParams) {
      config.configParams.unshift({
        type: "INFO",
        name: "resetAuth text",
        text: "If you want to re authenticate your account or just delete the permission given to this app, click here: " + PropertiesService.getScriptProperties().getProperty('reseturl')
      })
    }
    return config
  }

}
