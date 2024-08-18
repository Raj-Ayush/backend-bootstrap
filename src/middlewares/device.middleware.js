
const captureDeviceInfo = (req, res, next) => {
    req.deviceInfo = req.device;
    req.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
};

module.exports = captureDeviceInfo;
