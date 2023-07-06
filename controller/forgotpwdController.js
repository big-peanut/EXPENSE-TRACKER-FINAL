const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const dotenv=require('dotenv')

const Users = require('../models/users');
const Forgotpassword = require('../models/forgotpwd');
dotenv.config()

const forgotpassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        
        const user=await Users.findOne({where:{email}})
        
        const id=uuid.v4()
        user.createForgotpassword({ id , active: true })
    

        const client=Sib.ApiClient.instance
        const apiKey=client.authentications['api-key']
        apiKey.apiKey=process.env.BREVO_API_KEY

        const transEmailApi=new Sib.TransactionalEmailsApi()

        const sender={
            email:'sandeepsundarlenka22@gmail.com'
        }
        const reciever=[{
            email:email
        }]

        transEmailApi.sendTransacEmail({
            sender,
            to:reciever,
            subject:'Reset password',
            textContent:'Email sent to reset your password',
            htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`
        })
        res.json({})
       
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err, success: false });
    }
};

const resetpassword = (req, res) => {
    const id = req.params.id;
    Forgotpassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
        if (forgotpasswordrequest) {
            forgotpasswordrequest.update({ active: false });
            res.status(200).send(`<html>
          <script>
              function formsubmitted(e){
                  e.preventDefault();
                  console.log('called')
              }
          </script>
  
          <form action="/password/updatepassword/${id}" method="get">
              <label for="newpassword">Enter New password</label>
              <input name="newpassword" type="password" required></input>
              <button>reset password</button>
          </form>
      </html>`);
            res.end();
        }
    });
};

const updatepassword = (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where: { id: resetpasswordid } }).then((resetpasswordrequest) => {
            Users.findOne({ where: { id: resetpasswordrequest.userId } }).then((user) => {
                if (user) {
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        if (err) {
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function (err, hash) {
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({ message: 'Successfully updated the new password' });
                            });
                        });
                    });
                } else {
                    return res.status(404).json({ error: 'No user exists', success: false });
                }
            });
        });
    } catch (error) {
        return res.status(403).json({ error, success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword,
};
