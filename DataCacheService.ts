import { MasterCacheService } from './MasterCacheService';
import { SchemaService } from './SchemaService';
declare const Utilities: any;
declare const CacheService: any;
declare const PropertiesService: any;
declare const LockService: any;
declare const Logger: any;

export class DataCacheService extends MasterCacheService {

  request: any;
  constructor(request) {
    super();
    this.request = request
    var startDate = request.dateRange.startDate;
    var endDate = request.dateRange.endDate;
    var fields = request.fields;
    var account_ids_str = request.configParams.accountID;
    var account_ids = [];
    if (account_ids_str.includes(";")) {
      account_ids = account_ids_str.split(",")[0].split(";");
    } else {
      account_ids = account_ids_str.split(",");
    }
    var account_id = account_ids.join(",");
    this.cacheKey = this.buildCacheKey(startDate, endDate, fields, account_id);
  }

  buildCacheKey(startDate, endDate, fields, account_id) {
    Logger.log(fields);
    var key = PropertiesService.getScriptProperties().getProperty('CACHE_VERSION') + '_' + startDate.replace('-', '').replace('-', '') + '_' + endDate.replace('-', '').replace('-', '') + '_' + this.getFieldsIds(fields) + '_' + account_id;
    console.log(key);
    return key;
  };

  getFieldsIds(fields) {
    var arrFields = [];
    fields.forEach(field => {
      arrFields.push(field.name);
    });
    var lock = LockService.getUserLock();
    var schema = (new SchemaService()).getSchema(this.request, true)
    lock.releaseLock();
    var fieldsIndexes = []
    schema.schema.forEach(schemaField => {
      arrFields.forEach(fieldName => {
        if (fieldName == schemaField.name) {
          fieldsIndexes.push(schemaField.index)
        }
      });
    });
    return fieldsIndexes.sort().join('-')
  }

}

