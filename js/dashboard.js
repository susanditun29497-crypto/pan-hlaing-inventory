async function loadDashboard(){


// ======================
// Total Products
// ======================

const {data:products,error:productError}=await supabaseClient

.from("products")

.select("id");



if(productError){

console.log(productError);

return;

}



document
.getElementById("productCount")
.innerText =
products.length;



// ======================
// Stock Quantity
// ======================


const {data:stock,error:stockError}=await supabaseClient

.from("purchase_batches")

.select("remaining_quantity");



if(stockError){

console.log(stockError);

return;

}



let totalStock = 0;


stock.forEach(item=>{


totalStock += item.remaining_quantity;


});



document
.getElementById("stockCount")
.innerText =
totalStock;



// ======================
// Today's Sales
// ======================


const today =
new Date()
.toISOString()
.split("T")[0];



const {data:sales,error:salesError}=await supabaseClient

.from("sales")

.select("id")

.eq(
"sale_date",
today
);



if(salesError){

console.log(salesError);

return;

}



let todayTotal = 0;



for(const sale of sales){


const {data:items}=await supabaseClient

.from("sale_items")

.select(`
quantity,
selling_price
`)

.eq(
"sale_id",
sale.id
);



items.forEach(item=>{


todayTotal +=
item.quantity *
item.selling_price;


});


}



document
.getElementById("salesAmount")
.innerText =
todayTotal.toLocaleString()
+
" MMK";



}

async function loadAlerts(){


const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`

remaining_quantity,

expiry_date,

products(

food_type

)

`);



if(error){

console.log(error);

return;

}



let lowStock = 0;

let expirySoon = 0;



const today =
new Date();


const sixMonths =
new Date();


sixMonths.setMonth(
today.getMonth()+6
);



data.forEach(item=>{


const type =
item.products.food_type;



// Low stock rule

if(
type === "Dry Food"
&& item.remaining_quantity === 0
){

lowStock++;

}



if(
type !== "Dry Food"
&& item.remaining_quantity < 12
){

lowStock++;

}



// Expiry rule

if(item.expiry_date){


const expiry =
new Date(item.expiry_date);



if(
expiry >= today
&& expiry <= sixMonths
){

expirySoon++;

}


}



});



document
.getElementById("stockAlerts")
.innerHTML =

"⚠️ Low Stock: "
+
lowStock
+
"<br>⚠️ Expiring Soon: "
+
expirySoon;



}



loadAlerts();

loadDashboard();