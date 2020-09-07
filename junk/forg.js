const bcrypt = require('bcryptjs');

bcrypt.hash('1234', 12).then((hash) => console.log({ hash }));

console.log('Buffer back and forth');
console.log('warptrail:1234 turns to -->');
console.log(Buffer.from('warptrail:1234').toString('base64'));
console.log('d2FycHRyYWlsOjEyMzQ= turns back to -->');
console.log(Buffer.from('d2FycHRyYWlsOjEyMzQ=', 'base64').toString('ascii'));
// warptrail:1234
