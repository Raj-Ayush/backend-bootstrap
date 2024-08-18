const refreshTokenCookiesStore = (res, token) => res.cookie(
    'refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
);

module.exports = refreshTokenCookiesStore;
