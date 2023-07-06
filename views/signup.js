const signupform=document.getElementById('signupform')

async function signup(name,email,password){
    try{
        let user={
            name,
            email,
            password
        }
        await axios.post("http://localhost:3000/user/signup",user)
        alert("Sign Up Successfull")
        window.location.href="login.html"
    }
    catch(err){
        const p=document.createElement('p')
        p.textContent="Email already registered, Please Login"
        signupform.appendChild(p)
    }
}

signupform.addEventListener('submit',(e)=>{
    e.preventDefault()

    let name=document.getElementById('name').value
    let email=document.getElementById('email').value
    let password=document.getElementById('password').value

    signup(name,email,password)

    name=""
    email=""
    password=""
})
