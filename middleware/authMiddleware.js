const jwt = require("jsonwebtoken");
const HttpError = require("../models/errorModel");

const authMiddleware = async (req, res, next) => {
  const Authorization = req.headers.Authorization || req.headers.authorization;

  if (Authorization && Authorization.startsWith("Bearer")) {
    const token = Authorization.split(" ")[1];
    // console.log(token);

    jwt.verify(token, "secretkey", (err, info) => {
      if (err) {
        return next(new HttpError("Unauthorized invalid token", 403));
      }

      req.user = info;
      next();
    });
  }else{
    return next(new HttpError("unauthorized no token",402))
  }
};

module.exports = authMiddleware;