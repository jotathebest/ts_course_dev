import { MasterCacheService } from './MasterCacheService';
declare const PropertiesService: any;

export class SchemaCacheService extends MasterCacheService {


  constructor(accountID) {
    super();
    this.cacheKey = this.buildCacheKey(accountID);
  }

  buildCacheKey(accountID) {
    var key = PropertiesService.getScriptProperties().getProperty('CACHE_VERSION') + "schema" + accountID.split(",").sort().join();
    console.log(key);
    return key;
  };

}

