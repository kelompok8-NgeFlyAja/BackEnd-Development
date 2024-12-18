
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false, //Kita lagi di Sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

module.exports = {snap, core}