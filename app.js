const express=require('express')
const userRoutes=require('./routes/userRoutes')
const expenseRoutes=require('./routes/expenseRoutes')
const purchaseRoutes=require('./routes/purschaseRoutes')
const premiumRoutes=require('./routes/premiumRoutes')
const resetpwdRoutes=require('./routes/forgotpwdRoutes')
const sequelize=require('./util/database')
const bodyparser=require('body-parser')
const cors=require('cors')
const Users = require('./models/users')
const Expenses = require('./models/expenses')
const Order = require('./models/orders')
const Forgotpassword=require('./models/forgotpwd')
const dotenv = require('dotenv');
const helmet=require('helmet')
const compression=require('compression')
const fs=require('fs')
const morgan=require('morgan')
const path=require('path')

const app=express()

app.use(bodyparser.json())

app.use(cors())

dotenv.config();


app.use(userRoutes)

app.use(expenseRoutes)

app.use(purchaseRoutes)

app.use(premiumRoutes)

app.use(resetpwdRoutes)

const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})

app.use(helmet())

app.use(compression())

app.use(morgan('combined',{stream:accessLogStream}))

Users.hasMany(Expenses)
Expenses.belongsTo(Users)

Users.hasMany(Order)
Order.belongsTo(Users)

Users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(Users);

sequelize.sync()
    .then((res) => {
        app.listen(3000)
    })
    .catch((err) => {
        console.log(err)
    })
