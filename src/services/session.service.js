const Session = require('../models/session.model');

class SessionService {
    async getSessionsByUserId(userId) {
        return Session.findAll({where: {userId, isActive: true}});
    }

    async deactivateSession(sessionId) {
        return Session.update({isActive: false}, {where: {sessionId}});
    }
}

module.exports = new SessionService();
