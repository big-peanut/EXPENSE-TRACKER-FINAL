const loginform = document.getElementById('loginform')
const forgotpassword = document.getElementById('forgotpassword')

forgotpassword.addEventListener('click', async () => {
    try {
        const email = prompt("Enter your email")
            await axios.post("http://localhost:3000/password/forgotpassword", {email});
            alert("Password reset link sent to your email");
    }
    catch(err){
        console.log(err)
    }
    
})

async function login(email, password) {
    try {
        const user = {
            email,
            password
        };

        const response = await axios.post("http://localhost:3000/user/login", user);

        if (response.data.message) {
            alert("User login successful");
            localStorage.setItem('token', response.data.token)
            window.location.href = "expense.html"
        } else {
            const p = document.createElement('p')
            p.textContent = "Login failed. Incorrect password or email not registered."
            loginform.appendChild(p)
        }
    } catch (err) {
        if (err.response && err.response.data) {
            const p = document.createElement('p')
            p.textContent = err.response.data.error
            loginform.appendChild(p)
        } else {
            const p = document.createElement('p')
            p.textContent = err.message
            loginform.appendChild(p)
            //alert("An error occurred during login:", err.message);
        }
    }
}

loginform.addEventListener('submit', (e) => {
    e.preventDefault()

    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    login(email, password)

    email = ""
    password = ""
})
