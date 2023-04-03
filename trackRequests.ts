import * as cliProgress from 'cli-progress';

let requestCountMaps: Array<Map<string, number>> = [];
let currentTop100: Array<[string, number]> = [];

function insert(element: [string, number], array: Array<[string, number]>) {
    array.splice(locationOf(element, array) + 1, 0, element);
    return array;
}

function locationOf(element: [string, number], array: Array<[string, number]>, start=0, end=array.length) {
    if (array.length === 0) return 0;
    const pivot = Math.floor(start + (end - start) / 2);
    if (array[pivot][1] === element[1]) return pivot;
    if (end - start <= 1)
      return array[pivot][1] < element[1] ? pivot - 1 : pivot;
    if (array[pivot][1] > element[1]) {
      return locationOf(element, array, pivot, end);
    } else {
      return locationOf(element, array, start, pivot);
    }
  }

function request_handled(ip_address: string) {
    let hasAddedRequest = false;
    let modifiedMap = new Map();
    while (!hasAddedRequest) {
        for (let i = 0; i < requestCountMaps.length; i++) {
            if (requestCountMaps[i].has(ip_address)) {
                requestCountMaps[i].set(ip_address, requestCountMaps[i].get(ip_address) + 1);
                hasAddedRequest = true;
                modifiedMap = requestCountMaps[i];
                break;
            }
        }

        if (!hasAddedRequest) {
            for (let i = 0; i < requestCountMaps.length; i++) {
                if (requestCountMaps[i].size < 16000000) {
                    requestCountMaps[i].set(ip_address, 1);
                    hasAddedRequest = true;
                    modifiedMap = requestCountMaps[i];
                    break;
                }
            }
        }

        if (!hasAddedRequest) {
            requestCountMaps.push(new Map<string, number>());
            requestCountMaps[requestCountMaps.length-1].set(ip_address, 1);
            hasAddedRequest = true;
            modifiedMap = requestCountMaps[requestCountMaps.length-1];
        }
    }

    if (currentTop100.length < 100 || modifiedMap.get(ip_address) > currentTop100[99][1]) {
        insert([ip_address, modifiedMap.get(ip_address)], currentTop100);
    }
    if (currentTop100.length > 100) {
        currentTop100.pop();
    }
}

function top100(): Array<[string, number]> {
    return currentTop100;
}

function clear() {
    requestCountMaps.length = 0;
    currentTop100.length = 0;
}

const randomIp = () => Array(4).fill(0).map((_, i) => Math.floor(Math.random() * 255)
    + (i === 0 ? 1 : 0)).join('.');

function generateSeedData() {
    let currentMapIndex = 0;
    requestCountMaps.push(new Map<string, number>());
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(20000000, 0);
    for (let i = 1; i <= 20000000; i++) {
        const ip = randomIp();
        const count = Math.floor(Math.random() * 40000000);
        requestCountMaps[currentMapIndex].set(ip, count);
        if (currentTop100.length < 100 || requestCountMaps[currentMapIndex].get(ip) > currentTop100[99][1]) {
            insert([ip, requestCountMaps[currentMapIndex].get(ip)], currentTop100);
        }
        if (currentTop100.length > 100) {
            currentTop100.pop();
        }
        if (requestCountMaps[currentMapIndex].size === 16000000) {
            currentMapIndex++;
            requestCountMaps.push(new Map<string, number>());
        }
        bar1.increment();
    }
    bar1.stop();
}

function testClear() {
    requestCountMaps.push(new Map<string, number>());
    console.log('requestCountMaps length before clear: ', requestCountMaps.length);
    console.log('first request count map size before clear: ', requestCountMaps[0].size);
    clear();
    console.log('request counts after clear: ', requestCountMaps);
    console.log('current top 100 after clear: ', currentTop100);
}

generateSeedData();
const newIp = randomIp();
console.time('request_handled');
request_handled(newIp);
console.timeEnd('request_handled');
console.time('top100');
const top = top100();
console.timeEnd('top100');
console.log('top 100: ', top);
testClear();
