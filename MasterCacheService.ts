declare const Utilities: any;
declare const CacheService: any;

export class MasterCacheService {

  service: any;
  cacheKey: any;
  REQUEST_CACHING_TIME = 3600;
  MAX_CACHE_SIZE = 100 * 1024;

  constructor() {
    this.service = CacheService.getUserCache();
    this.cacheKey = "1"
  }

  get() {
    var value = '';
    var chunk = '';
    var chunkIndex = 0;

    do {
      var chunkKey = this.getChunkKey(chunkIndex);
      chunk = this.service.get(chunkKey);
      value += (chunk || '');
      chunkIndex++;
    } while (chunk && chunk.length == this.MAX_CACHE_SIZE);

    return value;
  };

  set(value) {
    this.storeChunks(value);
  };

  storeChunks(value) {
    var chunks = this.splitInChunks(value);

    for (var i = 0; i < chunks.length; i++) {
      var chunkKey = this.getChunkKey(i);
      this.service.put(chunkKey, chunks[i], this.REQUEST_CACHING_TIME);
    }
  };

  getChunkKey(chunkIndex) {
    return this.cacheKey + '_' + chunkIndex;
  };

  splitInChunks(str) {
    var size = this.MAX_CACHE_SIZE;
    var numChunks = Math.ceil(str.length / size);
    var chunks = new Array(numChunks);

    for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }

    return chunks;
  };

  fetchCache(): any {
    var response_data = null;
    console.log('Trying to fetch from cache...');
    try {
      var response_data_string = this.get();
      //console.log('Fetched from cache data', response_data_string);
      if (response_data_string) {
        response_data = JSON.parse(response_data_string);
        //console.log('Fetched succesfully from cache', response_data, response_data.rows[0].values);
      } else {
        return false;
      }

    } catch (e) {
      console.log('Error when fetching from cache:', e);
    }

    return response_data;
  }

  setCache(response_data: any) {
    console.log('Setting data to cache...');
    try {
      this.set(JSON.stringify(response_data));
    } catch (e) {
      console.log('Error when storing in cache', e);
    }
  }

}

