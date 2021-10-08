/* Documentation URLs:
 * 1.) Databox API: https://github.com/databox/databox-js
 * 2.) Binance API: https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md
 * 3.) Wikipedia API: https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews
 * 4.) Instagram API: https://developers.facebook.com/docs/instagram-basic-display-api/
*/

const Databox = require('databox');
const request = require('request');
const fs = require('fs');

const client = new Databox({
    push_token: 'gqb27v0d5imnep1fcbqxc'
});

const metricKeys = {
    Instagram: 'IG',
    Wikipedia: 'Albert Einstein Wiki views',
    LTCBTC: 'LTCBTC',
    tradesLTCBTC: 'Trades LTCBTC',
    BNBBTC: 'BNBBTC',
    tradesBNBBTC: 'Trades BNBBTC',
};

function main() {
    getInstagramPosts(metricKeys.Instagram);

    getBinancePrice(metricKeys.LTCBTC);
    getBinancePrice(metricKeys.BNBBTC);

    getBinanceTrades(metricKeys.tradesLTCBTC, metricKeys.LTCBTC);
    getBinanceTrades(metricKeys.tradesBNBBTC, metricKeys.BNBBTC);

    getWikipediaViews(metricKeys.Wikipedia);
}

// Data is checked and sent to Databox every 5s until the program is stopped
setInterval(main, 5000);

function pushDataToDatabox(key, value) {
    // Push one KPI
    client.push({
        key: key,
        value: value
    }, function (result) {
        console.log(result);
        logReports(key, new Date(), result, value, 1,);
    });
}

function pushInstagramPostsToDatabox(key, data) {
    // Push multiple KPI with attributes
    data.forEach(post => {
        client.push({
            key: key,
            value: post['id'],
            attributes: {
                caption: post['caption']
            }
        }, function (result) {
            console.log(result);
            logReports(key, new Date(), result, post['id'], 1, { caption: post['caption'] });
        });
    });
}

function pushDataToDataboxWithId(key, value, attrValue) {
    // Push one KPI with attribute
    client.push({
        key: key,
        value: value,
        attributes: {
            'id': attrValue
        }
    }, function (result) {
        console.log(result);
        logReports(key, new Date(), result, value, 1, { 'id': attrValue });
    });
}

function logReports(serviceName, time, responseReport, metrics = null, attributes = [], KPI = 0) {
    var report = {
        service: serviceName,
        time: time,
        metrics: metrics,
        attributes: attributes,
        numberOfKPI: KPI,
        report: responseReport
    };

    // Read existing data
    var data = fs.readFileSync('log.json');
    var log = JSON.parse(data);

    // Add new log
    log.push(report);
    var jsonReport = JSON.stringify(log, null, 2);

    fs.writeFileSync('log.json', jsonReport);
}

function getInstagramPosts(key) {
    return new Promise(resolve => {
        request.get({
            uri: 'https://graph.instagram.com/me/media?fields=id,caption&access_token=IGQVJYZA2RYMW9PU2ZAPd2ZAqLUV5MjM2Q0FqcHJ1UmMxcUIxM2djdTZAqeVUwZAVlyRFlUQXVxWTJwaU9xUXNLQW5meXA5LTRHRHctR3BtcFdlX0dzaUxkeURhRFAxMW9BZA3ZAfaTNsWndn'
        }, function (error, response, body) {
            if (!error && body && JSON.parse(body)['data']) {

                pushInstagramPostsToDatabox(key, JSON.parse(body)['data']);
                resolve('OK');

            } else resolve('ERROR');
        });
    });
}

function getBinancePrice(key) {
    return new Promise(resolve => {
        request.get({
            uri: 'https://api.binance.com/api/v3/ticker/price?symbol=' + key
        }, function (error, response, body) {
            if (!error && body && JSON.parse(body)['price']) {

                pushDataToDatabox(key, JSON.parse(body)['price']);
                resolve('OK');

            } else resolve('ERROR');
        });
    });
}

function getBinanceTrades(key, symbol) {
    return new Promise(resolve => {
        request.get({
            uri: 'https://api.binance.com/api/v3/trades?symbol=' + symbol
        }, function (error, response, body) {
            if (!error && body && JSON.parse(body)[0]) {

                jsonBody = JSON.parse(body);
                // Push only latest trade
                pushDataToDataboxWithId(key, jsonBody[0]['price'], jsonBody[0]['id']);
                resolve('OK');

            } else resolve('ERROR');
        });
    });
}

function getWikipediaViews(key) {
    return new Promise(resolve => {
        request.get({
            uri: 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/Albert_Einstein/daily/2015100100/2015103100'
        }, function (error, response, body) {
            if (!error && body && JSON.parse(body)['items']) {

                // Push only latest number of views
                pushDataToDatabox(key, JSON.parse(body)['items'][0]['views']);
                resolve('OK');

            } else resolve('ERROR');
        });
    });
}

// Export functions, so they can be accessed from tests
exports.getInstagramPosts = getInstagramPosts;
exports.getBinancePrice = getBinancePrice;
exports.getBinanceTrades = getBinanceTrades;
exports.getWikipediaViews = getWikipediaViews;

/* NOTE: The following code is commented, because it is only executed manually step by step.
 *       The reason for this is, that Instagram requires user interaction to get access_token.
 *       Therefore long term access_token is generated and can be used for 60 days.
 */
/*function getInstagramAccessToken() {
     * NOTE: Instagram requires manual login (returns redirectURI for login instead of token)
     *       therefore the following steps are performed manually:
     *
    request.get({
        uri: 'https://api.instagram.com/oauth/authorize?client_id=554658249080016&redirect_uri=https://localhost:8000/auth/&scope=user_profile,user_media&response_type=code',
        followAllRedirects: true
    }, function (error, response, body) {
        console.log(response.request._redirect.redirects);
    });

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: 'https://api.instagram.com/oauth/access_token',
        form: {
            client_id: '554658249080016',
            client_secret: 'bc5da8edf597fb0b7726daf9c4278c1f',
            grant_type: 'authorization_code',
            redirect_uri: 'https://localhost:8000/auth/',
            code: 'AQAEAxxiJ7DSlnGGAZKig1CPbUidP8f91j72WLPv8jmWhecjnvjJL1isna8oX92Jgdp8bC8YUir46hTMeqy1ZYh0NqPQk1VLZ8Wb6EVr6hoHMSY2_He2IBcI_XxkTDwVPDDZ6p8O0xLzaJYphUO_45sVDN_PfTxfKFLItXTaMvg8Xic0WRRyyrrH24rv2ig7et3Gf-JCYPKEbq3uoNR-AAHaW7EiGZeLxEsLtMJl77zgWA'
        }
    }, function(error, response, body){
        console.log(error, response, body);
    });

    request.get({
        uri: 'https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=bc5da8edf597fb0b7726daf9c4278c1f&access_token=IGQVJYRE51ODhfLWlPN3QtaVgzcVdfSXFpZAVMxamRTcDFsbDBhS2NERS1aUGY4LUtlZAmFIbGhUYnE0ZAE9pMGNsa0h0VXZAOeVBOZAEROZAW9laUdyakh4dUlRd2tna25XQTB4aHo4U0RwWUVwLURENEtRTjNETGF6Ykp1UU5n',
        followAllRedirects: true
    }, function (error, response, body) {
        console.log(error, response, body);
    });
}*/