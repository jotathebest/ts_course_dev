declare const UrlFetchApp: any;
declare const Logger: any;
declare const PropertiesService: any;
declare const Session: any;

export class UsageService {

  // TODO: Create a new flow that allow to update cache from get config

  schema: any;

  sendUsage(request: any) {
    Logger.log("cached response & last refresh at: " + request.scriptParams.lastRefresh);
    var args = this.dataStudioToPorter(request);
    var endp: string = PropertiesService.getScriptProperties().getProperty('usageURL');
    var payload: any = {
      "target": "datastudio",
      "method": "get_data",
      "user": Session.getEffectiveUser().getEmail(),
      "timestamp": new Date().getTime(),
      "environment": PropertiesService.getScriptProperties().getProperty('environment'),
      "connector": PropertiesService.getScriptProperties().getProperty('Connector'),
      "cached": true,
      "last_refresh": request.scriptParams.lastRefresh,
      "args": args
    };
    Logger.log("Cache payload: ");
    console.log(payload);
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
    return JSON.parse(UrlFetchApp.fetch(endp, options));
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
    var args = {
      "account_ids": account_ids,
      "fields": fields,
      "date_filter": date_filter
    }
    return args;
  }
}