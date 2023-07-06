const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const decodedToken = jwt.verify(token,"sandeepsundarlenka");
        const user = await Users.findByPk(decodedToken.id);
       
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {authenticate};
