import { AuthService } from "./AuthService";
import { DataCacheService } from "./DataCacheService";
import { SchemaService } from "./SchemaService";
import { UsageService } from './UsageService';
import { LicenseService } from './LicenseService';

declare const UrlFetchApp: any;
declare const Logger: any;
declare const PropertiesService: any;
declare const Session: any;
declare const DataStudioApp: any;
declare const Utilities: any;

export class DataService {

  authService: AuthService;

  getData(request: any) {
    Logger.log(request);
    (new LicenseService()).verifyLicenseAndThrow(request);
    var cache = new DataCacheService(request);
    var result = cache.fetchCache();
    if (result) {
      (new UsageService()).sendUsage(request);
      this.checkForError(result);
      return result;
    }
    var data = this.getDataRequest(request);
    cache.setCache(data);
    Logger.log("fetched response & last refresh at: " + request.scriptParams.lastRefresh);
    return data;
  }

  getDataRequest(request) {
    var args = this.dataStudioToPorter(request);
    Logger.log(JSON.stringify(args));
    var endp: string = PropertiesService.getScriptProperties().getProperty('ENDP') + "/" + PropertiesService.getScriptProperties().getProperty('resourceName') + "/get_data";
    var payload: any = {
      "target": "datastudio",
      "user": Session.getEffectiveUser().getEmail(),
      "timestamp": new Date().getTime(),
      "environment": PropertiesService.getScriptProperties().getProperty('environment'),
      "connector": PropertiesService.getScriptProperties().getProperty('Connector'),
      "cached": false,
      "last_refresh": request.scriptParams.lastRefresh,
      "args": args
    };
    Logger.log("Payload: ");
    Logger.log(payload);
    payload = JSON.stringify(payload);

    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': payload,
      'headers': {
        "x-api-key": PropertiesService.getScriptProperties().getProperty('PTOK'),
        "Accept": "application/json"
      }
    };
    let result = JSON.parse(UrlFetchApp.fetch(endp, options));
    this.checkForWorkId(result);
    let get_work_result_options = {
      'method': 'get',
      'contentType': 'application/json',
      'headers': {
          "x-api-key": PropertiesService.getScriptProperties().getProperty('PTOK'),
          "Accept": "application/json"
      },
      'muteHttpExceptions': true
    };
    let get_work_result_endp = PropertiesService.getScriptProperties().getProperty('ENDP') + "/work-result/?work-id=" + result.work_id;
    let response_error_trys = 3;
    do {
        Utilities.sleep(3000);
        result = UrlFetchApp.fetch(get_work_result_endp, get_work_result_options);
        let result_code = result.getResponseCode();
      
        if (result_code == 200) {
          result = JSON.parse(result)
        } else if (response_error_trys > 0){
          Logger.log('Work result response code: ' + result_code);
          Logger.log('Work result response body: ' + result);
          response_error_trys = response_error_trys - 1;
          result = {
            'process_status': 'IN PROGRESS'
          }
        } else {
          Logger.log('We cant get work result data from the server because server is broken');
          result = {
              'code': 500,
              'status': 'Error',
              'message': 'We have had an error trying to obtain your data, try to reload your report, or change the date range of the request.'
          }
        }
    } while (response_error_trys > 0 && result.process_status && result.process_status == "IN PROGRESS")
    
    this.checkForError(result);
    return result;
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

  checkForError(config) {
    Logger.log("config.status", config.status);
    if (config.status && config.status == "Error") {
      Logger.log("config.status: ");
      Logger.log(config.status);
      Logger.log("config: ");
      Logger.log(config);
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText(config.message)
        .setText(config.message)
        .throwException();
    }
    if (!config.rows) {
      Logger.log("config.status: ");
      Logger.log(config.status);
      Logger.log("config: ");
      Logger.log(config);
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText(JSON.stringify(config))
        .setText("It seems that Porter is presenting problems to bring your data at this moment. We’re sorry :(. Feel free to reach out to us via our website chat to help you ASAP: https://portermetrics.com/en/home/or visit our help center: https://help.portermetrics.com/")
        .throwException();
    }
  }

  dataStudioToPorter(request: any) {

    var account_ids_str = request.configParams.accountID;
    var account_ids = [];
    if (account_ids_str.includes(";")) {
      account_ids = account_ids_str.split(",")[0].split(";");
    } else {
      account_ids = account_ids_str.split(",");
    }
    var fields = request.fields.map(function (field) {
      return field.name;
    }
    )
    var since = request.dateRange.startDate;
    var until = request.dateRange.endDate;
    var date_filter = { "since": since, "until": until };
    var type = "OAuth";
    var token = (new AuthService()).getService().getAccessToken();
    var authentication = { "type": type, "token": token }
    var args = {
      "account_ids": account_ids,
      "fields": fields,
      "date_filter": date_filter,
      "authentication": authentication
    }
    return args;
  }
}
