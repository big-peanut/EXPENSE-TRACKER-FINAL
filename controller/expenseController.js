const Expenses = require('../models/expenses');
const Users = require('../models/users');
const sequelize = require('../util/database');
const UserServices = require('../services/userServices')
const S3services = require('../services/S3services')


exports.addexpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;

        const data = await Expenses.create(
            {
                amount: amount,
                description: description,
                category: category,
                userID: req.user.id
            },
            { transaction: t }
        );

        const totalExpense = Number(req.user.totalExpense) + Number(amount);

        await Users.update(
            {
                totalExpense: totalExpense
            },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();
        res.json({ dataValues: data });
    } catch (err) {
        await t.rollback();
        console.log(err);
    }
};

const ITEMS_PER_PAGE=3
exports.getexpense = (req, res, next) => {

        const page=+req.query.page||1
        let total

        Expenses.count()
            .then((tot)=>{
                total=tot
                return Expenses.findAll({where:{userID:req.user.id},
                    offset:(page-1)*ITEMS_PER_PAGE,
                    limit:ITEMS_PER_PAGE
                })
            })
            .then((expenses)=>{
                res.json({
                    expenses:expenses,
                    currentPage:page,
                    hasNextPage:ITEMS_PER_PAGE*page<total,
                    nextPage:page+1,
                    hasPreviousPage:page>1,
                    previousPage:page-1,
                    lastPage:Math.ceil(total/ITEMS_PER_PAGE)
                })
            })
            .catch((err)=>{console.log(err)})

        //const expenses = await Expenses.findAll({ where: { userID: req.user.id } });
        //res.json({ allexpenses: expenses });
};

exports.delexpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        if (req.params.id == 'undefined') {
            console.log('id is missing');
        }
        const id = req.params.id;
        console.log('id===',id)
        const deletedExpense = await Expenses.findOne({ where: { id: id, userID: req.user.id } });

        if (!deletedExpense) {
            throw new Error('Expense not found');
        }

        const totalExpense = Number(req.user.totalExpense) - Number(deletedExpense.amount);

        await Expenses.destroy({ where: { id: id, userID: req.user.id }, transaction: t });

        await Users.update(
            {
                totalExpense: totalExpense
            },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();
        res.sendStatus(200);
    } catch (err) {
        await t.rollback();
        console.log(err);
    }
};



exports.downloadexpense = async (req, res, next) => {
    try {
        const expenses = await UserServices.getExpenses(req)
        console.log(expenses)
        const stringifiedexpense = JSON.stringify(expenses)
        console.log(stringifiedexpense)
        const uid = req.user.id
        const filename = `Expense${uid}/${new Date()}.txt`
        const fileURL = await S3services.uploadToS3(stringifiedexpense, filename)

        res.status(200).json({ fileURL, success: true })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ fileURL: '', success: false, error: err })
    }
}