const app = require('./app');

test('POSITIVE => Should succesfully get data for function getInstagramPosts', () => {
    expect.assertions(1);
    return app.getInstagramPosts('IG').then(data => expect(data).toEqual('OK'));
});

test('POSITIVE => Should succesfully get data for function getBinancePrice', () => {
    expect.assertions(1);
    return app.getBinancePrice('LTCBTC').then(data => expect(data).toEqual('OK'));
});

test('NEGATIVE => Should not get data from function getBinancePrice', () => {
    expect.assertions(1);
    return app.getBinancePrice('Invalid').then(data => expect(data).toEqual('ERROR'));
});

test('POSITIVE => Should succesfully get data for function getBinanceTrades', () => {
    expect.assertions(1);
    return app.getBinanceTrades('Trades LTCBTC', 'LTCBTC').then(data => expect(data).toEqual('OK'));
});

test('NEGATIVE => Should not get data from function getBinanceTrades', () => {
    expect.assertions(1);
    return app.getBinanceTrades('Trades LTCBTC', 'Invalid').then(data => expect(data).toEqual('ERROR'));
});

test('POSITIVE => Should succesfully get data for function getWikipediaViews', () => {
    expect.assertions(1);
    return app.getWikipediaViews('Albert Einstein Wiki views').then(data => expect(data).toEqual('OK'));
});
