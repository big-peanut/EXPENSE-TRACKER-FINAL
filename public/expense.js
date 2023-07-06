const expenseform = document.getElementById('expenseform');
const expenselist = document.getElementById('expenselist');
const pagediv=document.getElementById('page')



async function download() {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://13.53.42.119:3000/user/download', { headers: { "Authorization": token } })

        const isPremium = await checkUserPremiumStatus(token);
        if (!isPremium) {
            alert("subscribe to premium membership to download file");
            return;
        }

        var a = document.createElement("a");
        a.href = response.data.fileURL;
        a.download = 'myexpense.txt';
        a.click();
    }
    catch (err) {
        console.log(err)
    }
}

async function showleaderboard() {
    const token = localStorage.getItem('token');
    const isPremium = await checkUserPremiumStatus(token);

    const leaderboardList = document.querySelector('.leaderboard-list');

    if (isPremium && !leaderboardList) {
        const leaderboard = await axios.get("http://13.53.42.119:3000/premium/leaderboard", { headers: { 'Authorization': token } });
        const leaderboardData = leaderboard.data;

        const leaderboardList = document.createElement('ul');
        leaderboardList.classList.add('leaderboard-list');

        leaderboardData.forEach((entry) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Name: ${entry.name} | Total Cost: ${entry.totalExpense}`;
            leaderboardList.appendChild(listItem);
        });

        // Append the new leaderboard list to the DOM
        document.body.appendChild(leaderboardList);
    } else if (!isPremium && leaderboardList) {
        // Remove the leaderboard list from the DOM
        leaderboardList.remove();
    }
}

async function checkUserPremiumStatus(token) {
    try {
        const response = await axios.get("http://13.53.42.119:3000/user/getuser", { headers: { 'Authorization': token } });
        const isPremium = response.data.user.ispremium;
        return isPremium;
    } catch (err) {
        console.log(err);
        return false; // Default to non-premium if an error occurs
    }
}

document.getElementById('buypremium').onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response = await axios.get("http://13.53.42.119:3000/purchase/premium", { headers: { 'Authorization': token } });

    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            await axios.post("http://13.53.42.119:3000/purchase/updatepremium", {
                orderid: options.order_id,
                payment_id: response.razorpay_payment_id
            },
                { headers: { 'Authorization': token } });

            alert("YOU ARE A PREMIUM USER");
            document.getElementById('buypremium').style.display = "none";
            window.location.reload();
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response) {
        console.log(response);
        alert('Something went wrong');
    });
};

function displayexpense(expenses, isPremium) {
    expenselist.innerHTML = "";
    const premiumContainer = document.createElement('div');
    premiumContainer.style.position = 'absolute';
    premiumContainer.style.top = '10px';
    premiumContainer.style.right = '10px';

    for (let i = 0; i < expenses.length; i++) {
        const li = document.createElement('li');
        li.textContent = `AMOUNT : Rs.${expenses[i].amount} ==> DESCRIPTION : ${expenses[i].description} ==> CATEGORY : ${expenses[i].category}`;
        expenselist.appendChild(li);
        console.log(expenses[i].id)
        const delbtn = document.createElement('button');
        delbtn.textContent = "Remove";
        li.appendChild(delbtn);

        delbtn.addEventListener('click', () => {
            delexpense(expenses[i].id);
        });
    }

    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.id="leaderboardbtn"
    leaderboardBtn.textContent = 'Leaderboard';

    if (isPremium) {
        const premiumMsg = document.createElement('p');
        premiumMsg.textContent = "YOU ARE A PREMIUM MEMBER";
        premiumContainer.appendChild(premiumMsg);
        document.getElementById('buypremium').style.display = "none";
        premiumContainer.appendChild(leaderboardBtn);
        leaderboardBtn.addEventListener('click', async () => {
            await showleaderboard();
        });
    }

    document.body.appendChild(premiumContainer);
}

async function delexpense(id) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://13.53.42.119:3000/expense/delexpense/${id}`, { headers: { 'Authorization': token } });
        getExpense();
    } catch (err) {
        console.log(err);
    }
}

async function getExpense(page=1) {
    try {
        const token = localStorage.getItem('token');
        const isPremium = await checkUserPremiumStatus(token); // Wait for premium status
        const response = await axios.get(`http://13.53.42.119:3000/expense/getexpense?page=${page}&pagesize=${3}`, { headers: { 'Authorization': token } });
        let expenses = response.data.expenses;
        const {...pageData}=response.data
        displayexpense(expenses, isPremium); // Display expenses with premium status
        pagination(pageData)
    } catch (err) {
        console.log(err);
    }
}

async function addexpense(amount, description, category) {
    try {
        let expense = {
            amount,
            description,
            category
        };
        const token = localStorage.getItem('token');
        await axios.post("http://13.53.42.119:3000/expense/addexpense", expense, { headers: { 'Authorization': token } });
        getExpense(page); // Retrieve and display updated expenses
    } catch (err) {
        console.log(err);
    }
}

function pagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
}){
    pagediv.innerHTML=""
    if(hasPreviousPage){
        const btn2=document.createElement('button')
        btn2.innerHTML=previousPage
        btn2.addEventListener('click',()=>{
            getExpense(previousPage)
        })
        pagediv.appendChild(btn2)
    }
    const btn1=document.createElement('button')
    btn1.innerHTML=currentPage
    btn1.addEventListener('click',()=>{
        getExpense(currentPage)
    })
    pagediv.appendChild(btn1)

    if(hasNextPage){
        const btn3=document.createElement('button')
        btn3.innerHTML=nextPage
        btn3.addEventListener('click',()=>{
            getExpense(nextPage)
        })
        pagediv.appendChild(btn3)
    }
}


expenseform.addEventListener('submit', (e) => {
    e.preventDefault();

    let amount = document.getElementById('amount').value;
    let description = document.getElementById('description').value;
    let category = document.getElementById('category').value;

    addexpense(amount, description, category);

    // Reset the form fields
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const page=1
        const token = localStorage.getItem('token');
        const isPremium = await checkUserPremiumStatus(token); // Wait for premium status
        const response = await axios.get(`http://13.53.42.119:3000/expense/getexpense?page=${page}`, { headers: { 'Authorization': token } });
        const {...pageData}=response.data
        displayexpense(response.data.expenses, isPremium); // Display expenses with premium status
        pagination(pageData)
    } catch (err) {
        console.log(err);
    }
});