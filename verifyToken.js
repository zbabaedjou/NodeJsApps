var jwt = require('jsonwebtoken');

module.exports =function (req, res, next) {
  var token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (!token)
     res.status(403).json({ success: false, message: 'Token' });
    console.log(token)  
    var parts = token.split(' ');
     if (parts.length === 2) {
       var scheme = parts[0];
       var credentials = parts[1];

       if (/^Bearer$/i.test(scheme)) {
         token = credentials;
          jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err)
             res.status(500).json({ success: false, message: 'Token' });

            // if everything good, save to request for use in other routes
            req.userId = decoded.id;
            next();
          });         
       }
    }
  
}
