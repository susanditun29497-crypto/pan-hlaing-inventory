let stockListData = [];



async function loadStock(){


const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`

remaining_quantity,
buying_price,
expiry_date,

products(

id,

food_type,

variety,

weight,

brands(

brand_name

)

)

`);




if(error){

console.log(error);

return;

}




const stock={};



data.forEach(item=>{


const product=item.products;


const key=product.id;



if(!stock[key]){


stock[key]={


brand:
product.brands.brand_name,


food_type:
product.food_type,


variety:
product.variety,


weight:
product.weight,


quantity:0,
value:0,

expiry_dates:[]


};


}



stock[key].quantity += item.remaining_quantity;

stock[key].value +=
item.remaining_quantity *
item.buying_price;


if(item.expiry_date){

stock[key].expiry_dates.push(
item.expiry_date
);

}

});

stockListData = Object.values(stock);

// Populate filters
populateFilters();

displayStock(stockListData);



}


// ADD THIS ENTIRE FUNCTION HERE
function populateFilters(){

const brandSelect =
document.getElementById("brandFilter");

const categorySelect =
document.getElementById("categoryFilter");

brandSelect.innerHTML =
'<option value="">All Brands</option>';

categorySelect.innerHTML =
'<option value="">All Categories</option>';

const brands =
[...new Set(stockListData.map(p=>p.brand))]
.sort();

const categories =
[...new Set(stockListData.map(p=>p.food_type))]
.sort();

brands.forEach(brand=>{

const option =
document.createElement("option");

option.value = brand;
option.textContent = brand;

brandSelect.appendChild(option);

});

categories.forEach(category=>{

const option =
document.createElement("option");

option.value = category;
option.textContent = category;

categorySelect.appendChild(option);

});

}





function displayStock(data){


const stockList =
document.getElementById("stockList");


stockList.innerHTML="";
let inventoryValue = 0;
let totalUnits = 0;


data.forEach(product=>{

 inventoryValue += product.value;

totalUnits += product.quantity;

const div=document.createElement("div");


div.className="card";


let warning="";


// Low stock rule

if(
product.food_type === "Dry Food"
&& product.quantity === 0
){

warning="⚠️ OUT OF STOCK";


}


if(
product.food_type !== "Dry Food"
&& product.quantity < 12
){

warning="⚠️ LOW STOCK";

}




// Expiry check

const today =
new Date();


const sixMonths =
new Date();


sixMonths.setMonth(
today.getMonth()+6
);



product.expiry_dates.forEach(date=>{


const expiry =
new Date(date);



if(
expiry <= sixMonths
&& expiry >= today
){

warning += " ⚠️ EXPIRING SOON";

}


});


let nearestExpiry = "-";

if(product.expiry_dates.length){

product.expiry_dates.sort();

nearestExpiry =
product.expiry_dates[0].substring(0,7);

}

div.innerHTML=`

<p>


${warning}


<br>


<strong>
${product.brand}
</strong>

|

${product.food_type}

|

${product.variety}

|

${product.weight}

|

<strong>
Stock: ${product.quantity}
</strong>

|

Value:
${product.value.toLocaleString()} MMK

|

Expiry:
${nearestExpiry}


</p>

`;


stockList.appendChild(div);

});

document.getElementById("inventoryValue").innerText =
inventoryValue.toLocaleString() + " MMK";

document.getElementById("totalUnits").innerText =
totalUnits.toLocaleString();

}


function applyFilters(){

const keyword =
document.getElementById("search")
.value
.toLowerCase()
.trim();

const brand =
document.getElementById("brandFilter").value;

const category =
document.getElementById("categoryFilter").value;

const words =
keyword === ""
? []
: keyword.split(/\s+/);

const filtered =
stockListData.filter(product=>{

const searchText = `
${product.brand}
${product.food_type}
${product.variety}
${product.weight}
`
.toLowerCase();

const searchMatch =
words.every(word =>
searchText.includes(word)
);

const brandMatch =
!brand ||
product.brand === brand;

const categoryMatch =
!category ||
product.food_type === category;

return searchMatch &&
brandMatch &&
categoryMatch;

});

displayStock(filtered);

}

document
.getElementById("search")
.addEventListener(
"input",
applyFilters
);

document
.getElementById("brandFilter")
.addEventListener(
"change",
applyFilters
);

document
.getElementById("categoryFilter")
.addEventListener(
"change",
applyFilters
);



loadStock();