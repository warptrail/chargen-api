const AuthService = require('../auth/auth-service');

// function requireAuth(req, res, next) {
//   console.log('requireAuth');
//   console.log(req.get('Authorization'));

//   const authToken = req.get('Authorization') || '';

//   let basicToken;

//   if (!authToken.toLowerCase().startsWith('basic ')) {
//     return res.status(401).json({ error: 'Missing basic token' });
//   } else {
//     basicToken = authToken.slice('basic '.length, authToken.length);
//   }

//   const [tokenUserName, tokenPassword] = Buffer.from(basicToken, 'base64')
//     .toString()
//     .split(':');

//   if (!tokenUserName || !tokenPassword) {
//     return res.status(401).json({ error: 'Unauthorized Request' });
//   }

//   req.app
//     .get('db')('users')
//     .where({ user_name: tokenUserName })
//     .first()
//     .then((user) => {
//       if (!user || user.password !== tokenPassword) {
//         return res.status(401).json({ error: 'Unauthorized request' });
//       }
//       next();
//     })
//     .catch(next);
// }

//* The original

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  console.log('1-->', authToken);

  let basicToken;
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length);
    console.log('2-->', basicToken);
  }

  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(
    basicToken
  );

  console.log('3--> tokenUserName', tokenUserName);
  console.log('4--> tokenPassword', tokenPassword);

  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request 1' });
  }

  AuthService.getUserWithUserName(req.app.get('db'), tokenUserName)
    .then((user) => {
      console.log('user');
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request 2' });
      }
      console.log('6 --> tokenPassword ', tokenPassword, typeof tokenPassword);
      console.log('7 --> user.password ', user.password, typeof user.password);

      return AuthService.comparePasswords(tokenPassword, user.password).then(
        (passwordsMatch) => {
          console.log('5 --> Passwords Match??? ', passwordsMatch);
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
