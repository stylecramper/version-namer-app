/* jslint esversion: 6 */
const SECRET_KEY = '998cf65a-1f0f-4325-81ea-315b08aec537';
const expressjwt = require('express-jwt');

const jwtCheck = expressjwt({
    secret: SECRET_KEY
});
module.exports = { jwtCheck: jwtCheck, SECRET_KEY: SECRET_KEY };
