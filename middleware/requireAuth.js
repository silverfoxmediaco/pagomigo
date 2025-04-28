
module.exports = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.userId = req.session.userId;
  next();
};
console.log("LOGIN SESSION:", req.sessionID);
console.log("LOGIN SESSION DATA:", req.session);

