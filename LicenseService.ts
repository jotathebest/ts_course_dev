import { LicenseCacheService } from './LicenseCacheService';
declare const PropertiesService: any;
declare const Session: any;
declare const UrlFetchApp: any;
declare const DataStudioApp: any;
declare const Logger: any;

export class LicenseService {

  verifyLicenseAndThrow(request) {
    var verif = this.verifyLicence(request);
    this.licenceThrow(verif.valid, verif.detail);
  }

  verifyLicence(request) {
    var result: any = {
      "valid": true,
      "detail": "License Active"
    };
    var cache = new LicenseCacheService(request);
    var result_data = null;
    result_data = cache.fetchCache();
    try {
      if (result_data) {
        result = result_data;

      } else {
        var account_ids_str = request.configParams.accountID;
        var account_ids = [];
        if (account_ids_str.includes(";")) {
          account_ids = account_ids_str.split(",")[0].split(";");
        } else {
          account_ids = account_ids_str.split(",");
        }
        var scriptProps = PropertiesService.getScriptProperties();
        let accountPrefix = scriptProps.getProperty('LicVerification3');
        for (let index = 0; index < account_ids.length; index++) {
          account_ids[index] = accountPrefix + account_ids[index];
          
        }
        var account_id = account_ids.join(",");
        var PORTER_TOKEN = scriptProps.getProperty('portertoken');
        var url = scriptProps.getProperty('LicVerification1') + Session.getEffectiveUser().getEmail() + scriptProps.getProperty('LicVerification2') + account_id;
        Logger.log("URL license:" + url);
        var response = UrlFetchApp.fetch(url, {
          headers: {
            'Authorization': 'Basic ' + PORTER_TOKEN,
            'Accept': 'application/json'
          },
          muteHttpExceptions: true
        });
        result = JSON.parse(response);
        if (result && result.message && result.message.valid == false) {
          result = result.message;
        } else if (result && result.message && result.message.valid == true) {
          cache.setCache(result.message);
          result = result.message;
        }
      }
      Logger.log("License: " + JSON.stringify(result));
    }
    catch (e) {
      Logger.log("License Error: " + e)
    }
    return result;
  }

  licenceThrow(valid, detail) {
    if (!valid) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText(detail + " Remember, you are using this subscription e-mail: " + Session.getEffectiveUser().getEmail())
        .setText(detail)
        .throwException();
    }
  }
}
