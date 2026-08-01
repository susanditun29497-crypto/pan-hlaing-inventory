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



stockListData =
Object.values(stock);



displayStock(stockListData);



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

const summary =
document.getElementById("stockSummary");

summary.innerHTML = `

<div class="summaryBox">
<h3>Inventory Value</h3>
<p>${inventoryValue.toLocaleString()} MMK</p>
</div>

<div class="summaryBox">
<h3>Total Units</h3>
<p>${totalUnits.toLocaleString()}</p>
</div>

`;

}




// Search by brand name

document
.getElementById("search")
.addEventListener(
"input",
function(){


const keyword =
this.value.toLowerCase();



// const filtered =
// stockListData.filter(product=> {


// const searchText =

// `${product.brand}
// ${product.food_type}
// ${product.variety}
// ${product.weight}`

// .toLowerCase();

// return searchText.includes(keyword);


// });

const filtered =
stockListData.filter(product => {

const searchText = `
${product.brand}
${product.food_type}
${product.variety}
${product.weight}
`
.toLowerCase();

const words = keyword
.toLowerCase()
.trim()
.split(/\s+/);

return words.every(word =>
searchText.includes(word)
);

});


displayStock(filtered);



});




loadStock();