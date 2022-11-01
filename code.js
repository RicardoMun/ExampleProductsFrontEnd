/* Here comes the Javascript code */

// Update the REST API server's URL
const url = "http://192.168.1.22:8000/api/v1/";

// List of records loaded from API REST
var records = [];

// Login modal dialog
const loginDialog = new bootstrap.Modal('#login-dialog', {
    focus: true
});

/**
 * Execute as soon as the page is completely loaded.
 */

window.onload = function () {
    // Set the listeners for the page's buttons

    const bLogin = document.getElementById("bLogin");
    const bLoginAccept = document.getElementById("blogin-accept");
    const bAdd = document.getElementById("bAdd");
    const bClear = document.getElementById("bClear");
    const bDelete = document.getElementById("bDelete");
    const bReload = document.getElementById("bReload");
    const bSort = document.getElementById("bSort")

    bLogin.addEventListener("click", handleLogin);
    bLoginAccept.addEventListener("click", handleLogin);
    bAdd.addEventListener("click", addRecord);
    bClear.addEventListener("click", clearForm);
    bDelete.addEventListener("click", deleteRecord);
    bReload.addEventListener("click", reloadList);
    bSort.addEventListener("click", sortTable);
};

/**
 * Clear the fields of the product's form.
 */

function clearForm() {
    
    const textFieldId = document.getElementById("id");
    const textFieldName = document.getElementById("name");
    const textFieldPrice = document.getElementById("price");
    const textFieldExpiration = document.getElementById("expiration");

    textFieldId.value = "";
    textFieldName.value = "";
    textFieldPrice.value = "";
    textFieldExpiration.value = "";
}

/**
 * Handle the login/logout magic: 
 * 
 *  - Show the login dialog
 *  - Call the login procedure
 *  - Call the logout procedure
 * 
 * @param {*} event 
 */

function handleLogin(event) {
    var flag = event.target.innerText;

    if (flag == "Login") {  // Show the login dialog
        loginDialog.show();
    } else if (flag == "Accept") {  // Login the user (get new token)
        login();
        document.getElementById("bLogin").innerText = "Logout";
        loginDialog.hide();
    } else if (flag == "Logout") {  // Logout the user (release token)
        logout();
        document.getElementById("bLogin").innerText = "Login";
    } else {    // Error, the flag has unknown value
        alert("ERROR: flag type unknown: " + flag);
    }
}

/**
 * Login the user.
 */

async function login() {

    var valorEmail = document.getElementById("login_email").value;
    var valorPassword = document.getElementById("login_password").value;


    const params = {
        email: valorEmail,
        password: valorPassword,
    }


    const response = await fetch(url + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'  
        },
        body: JSON.stringify(params)
        //stringify funciona para pasar objetos js a json
    });
    
    
    const answer = await response.json(); //aquí pasamos el token del login
    //console.log(answer);
    
    if(response.status == 200){
        var token = answer.token;

        localStorage.setItem('token', token); //Guardamos solo el token
    
    }else{
        alert("Error loging in: " + response.statusText);
    }

    /* console.log(email);
    console.log(password); */
}

/**
 * Logout the user.
 */

async function logout() {

    const response = await fetch(url + 'logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token') 
        }
        
    });


    if(response.status == 200){
        localStorage.removeItem('token');
        alert("Success logout");
    }else{
        alert("Error loging out: " + response.statusText);
    }

}

/**
 * Create a new product.
 */

async function addRecord() {
    
    const valorName = document.getElementById("name").value;
    const valorPrice = document.getElementById("price").value;
    const valorExpiration = document.getElementById("expiration").value;


    const params = {
        name: valorName,
        price: valorPrice,
        expiration: valorExpiration
    }

    const response = await fetch(url + 'products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' ,
            'Authorization': 'Bearer ' + localStorage.getItem('token')  
        },
        body: JSON.stringify(params)
        //stringify funciona para pasar objetos js a json
    });
    
    
    const answer = await response.json(); //aquí pasamos el token del login
    //console.log(answer);
    
    console.log(response.status ); 
    console.log(response.statusText ); 

    if(response.status == 201){
        
        alert("Product added: " + answer.data.id);
    
    }else{
        alert("Error adding product: " + answer.message);
    }
}

/**
 * Load the list of products.
 */

async function reloadList() {
    
    const response = await fetch(url + 'products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' ,
            'Authorization': 'Bearer ' + localStorage.getItem('token')  
        }
        
        //stringify funciona para pasar objetos js a json
    });
    
    
    const answer = await response.json(); //aquí pasamos el token del login
    //console.log(answer);

    if(response.status != 200){
        alert("Error loading list of products: " + answer.message);
        return;
    
    }
    //console.log(answer);

    records = answer.data;

    var tableBody = document.getElementById('products-list')
                            .getElementsByTagName('tbody')[0];

    tableBody.innerHTML = "";

    

    records.forEach( function(item, index){

        var id = item.id;
        var name = item.name;
        var price = item.price;
        var expiration = item.expiration;

        
        var newRow = tableBody.insertRow(tableBody.rows.length);

        newRow.innerHTML =  `
            <tr>
                <th scope="row">${id}</th>
                <td>${name}</td>
                <td>${price}</td>
                <td>${expiration}</td>
            </tr>`;
        newRow.setAttribute("onclick", "loadListItem(" + index + ")");
        
    });
    sortTable();

}

/**
 * Load the data of a product.
 * 
 * @param {*} id 
 */

function loadListItem(id) {
    
    var record = records[id];

    var id = record.id;
    var name = record.name;
    var price = record.price;
    var expiration = record.expiration;

    var textId = document.getElementById("id");
    var textName = document.getElementById("name");
    var textPrice = document.getElementById("price");
    var textExpiration = document.getElementById("expiration");
    
    textId.value = id;
    textName.value = name;
    textPrice.value = price;
    textExpiration.value = expiration;

}

/*
    Sorting the table
*/ 
function sortTable() {
    
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("products-list");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[0];
            y = rows[i + 1].getElementsByTagName("TD")[0];
            //check if the two rows should switch place:
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

/**
 * Delete a product.
 */

async function deleteRecord() {
    
    var id = document.getElementById("id").value;
    
    const response = await fetch(url + 'products/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' ,
            'Authorization': 'Bearer ' + localStorage.getItem('token')  
        }
    });

    const answer = await response.text();

    if(response.status == 204){
        alert("The product was succesful deleted")

        var textFieldId = document.getElementById("id");
        var textFieldName = document.getElementById("name");
        var textFieldPrice = document.getElementById("price");
        var textFieldExpiration = document.getElementById("expiration");

        textFieldId.value = "";
        textFieldName.value = "";
        textFieldPrice.value = "";
        textFieldExpiration.value = "";

    }
}