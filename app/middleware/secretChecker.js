const jwt = require('jsonwebtoken')
const tokenSecret = "myTopapikeyAPIpss"

exports.verify = (req, res, next) => {
    const secret = req.headers["x-api-key"]
    if (!secret) res.status(403).json({error: "please provide a X-API-Key"})
    else {
        jwt.verify(secret, tokenSecret, (err, value) => {
            if (err) res.status(500).json({error: 'failed to authenticate X-API-Key'})
            req.appname = value.data.appname
            next()
        })
    }
}