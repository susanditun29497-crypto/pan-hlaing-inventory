let allSales = [];


// Load all sales

async function loadSalesHistory(){


const {data,error}=await supabaseClient


.from("sale_items")

.select(`

quantity,

selling_price,


purchase_batches(
buying_price,

products(

food_type,

variety,

weight,


brands(

brand_name

)

)

),


sales(

id,
sale_date,

customer_name

)

`);



if(error){

console.log(error);

return;

}



allSales=data;


displaySales(allSales);



}



// Display function
function displaySales(data){


const list =
document.getElementById("salesList");


list.innerHTML="";


let total = 0;
let totalProfit = 0;



const grouped = {};


// Group items by sale

data.forEach(item=>{


const saleId = item.sales.id;



if(!grouped[saleId]){


// grouped[saleId]={

// date:item.sales.sale_date,

// customer:item.sales.customer_name,

// items:[],

// total:0

// };

grouped[saleId]={

date:item.sales.sale_date,

customer:item.sales.customer_name,

items:[],

total:0,

profit:0

};

}



const product =
item.purchase_batches.products;



// const amount =
// item.quantity * item.selling_price;



// grouped[saleId].total += amount;

const amount =
item.quantity * item.selling_price;

const profit =
(item.selling_price - item.purchase_batches.buying_price)
* item.quantity;

grouped[saleId].total += amount;

grouped[saleId].profit += profit;

grouped[saleId].items.push({

name:
`${product.brands.brand_name} | ${product.food_type} | ${product.variety} | ${product.weight}`,

quantity:item.quantity,

buyPrice:item.purchase_batches.buying_price,

price:item.selling_price,

profit:profit

});


});




// Display grouped sales
// Display grouped sales

Object.values(grouped)
.sort((a,b)=> new Date(b.date) - new Date(a.date))
.forEach((sale,index)=>{


total += sale.total;
totalProfit += sale.profit;


const div=document.createElement("div");


div.className="card";



let itemsHTML="";

sale.items.forEach(item=>{


itemsHTML += `

<p>

${item.name}

|

Qty:
${item.quantity}

|

Buy:
${item.buyPrice.toLocaleString()} MMK

|

Sell:
${item.price.toLocaleString()} MMK

|

Profit:
${item.profit.toLocaleString()} MMK

</p>


`;

});

div.innerHTML = `

<p>

<strong>
${sale.customer || "Walk-in Customer"}
</strong>

&nbsp; | &nbsp;

Date:
${sale.date}

&nbsp; | &nbsp;

Sales:
<strong>
${sale.total.toLocaleString()} MMK
</strong>

&nbsp; | &nbsp;

Profit:
<strong>
${sale.profit.toLocaleString()} MMK
</strong>

&nbsp; | &nbsp;

<button onclick="toggleDetails(${index})">
View Details
</button>

</p>



<div 
id="details-${index}" 
style="display:none;margin-top:10px;"
>


<hr>


${itemsHTML}


</div>


`;


list.appendChild(div);



});

document.getElementById("totalSales").innerHTML =
"Sales: " + total.toLocaleString() +
" MMK | Profit: " +
totalProfit.toLocaleString() +
" MMK";


}

function toggleDetails(id){


const box =
document.getElementById("details-"+id);



if(box.style.display==="none"){

box.style.display="block";

}

else{

box.style.display="none";

}


}

function applyFilters(){


const keyword =
document
.getElementById("customerSearch")
.value
.toLowerCase()
.trim();


const fromDate =
document
.getElementById("fromDate")
.value;


const toDate =
document
.getElementById("toDate")
.value;



const filtered =
allSales.filter(item=>{


const customer =
(item.sales.customer_name || "walk-in customer")
.toLowerCase();



if(keyword){

if(!customer.includes(keyword)){

return false;

}

}



if(
fromDate &&
item.sales.sale_date < fromDate
){

return false;

}



if(
toDate &&
item.sales.sale_date > toDate
){

return false;

}



return true;


});



displaySales(filtered);


}

document
.getElementById("customerSearch")
.addEventListener(
"input",
applyFilters
);


document
.getElementById("fromDate")
.addEventListener(
"change",
applyFilters
);


document
.getElementById("toDate")
.addEventListener(
"change",
applyFilters
);

document
.getElementById("resetFilters")
.addEventListener(
"click",
function(){


document.getElementById("customerSearch").value="";

document.getElementById("fromDate").value="";

document.getElementById("toDate").value="";


displaySales(allSales);


});



loadSalesHistory();