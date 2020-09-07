const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let basicToken;
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length);
    console.log('le basic of tokens', basicToken);
  }

  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(
    basicToken
  );

  console.log(tokenUserName, tokenPassword);

  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request 1' });
  }

  AuthService.getUserWithUserName(req.app.get('db'), tokenUserName)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request 2' });
      }
      return AuthService.comparePasswords(tokenPassword, user.password).then(
        (passwordsMatch) => {
          console.log(passwordsMatch);
          console.log(tokenPassword);
          console.log(user.password);
          console.log(tokenPassword === user.password);
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request 3' });
          }

          req.user = user;
          next();
        }
      );
    })
    .catch(next);
}

module.exports = {
  requireAuth,
};
