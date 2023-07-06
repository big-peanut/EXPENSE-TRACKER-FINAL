const Expenses = require('../models/expenses');
const Users = require('../models/users');
const sequelize = require('../util/database');


exports.getleaderboard = async (req, res, next) => {
  try {
    const leaderboardusers=await Users.findAll({
      order:[['totalExpense','DESC']]
    })
    res.status(200).json(leaderboardusers)
  } catch (err) {
    res.status(500).json(err);
  }
};
