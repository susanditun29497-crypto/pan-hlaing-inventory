let saleItems = [];
let productsList = [];


// ==========================
// LOAD PRODUCTS
// ==========================

async function loadProducts(){

const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`
id,
remaining_quantity,
products(
id,
food_type,
variety,
weight,
brands(
brand_name
)
)
`)
.gt("remaining_quantity",0);



if(error){

console.log(error);

return;

}


productsList = data || [];

console.log("Loaded products:", productsList);


}



// ==========================
// SEARCH PRODUCTS
// ==========================

function showProducts(keyword){


const results =
document.getElementById("productResults");


results.innerHTML="";


if(keyword===""){

return;

}



productsList.forEach(batch=>{


const product = batch.products;


const text =
`${product.brands.brand_name} | ${product.food_type} | ${product.variety} | ${product.weight} | Stock: ${batch.remaining_quantity}`;



const brandName =
product.brands.brand_name;


if(brandName.toLowerCase().includes(keyword.toLowerCase())){


const div=document.createElement("div");


div.className="card";


div.innerHTML=text;



div.onclick=function(){


document
.getElementById("productSelect")
.value=batch.id;


document
.getElementById("productSearch")
.value=text;


results.innerHTML="";


};



results.appendChild(div);


}



});


}



// Search typing

document
.getElementById("productSearch")
.addEventListener(
"input",
function(){

showProducts(this.value);

}
);



// ==========================
// SAVE SALE
// ==========================

// ==========================
// SAVE SALE
// ==========================


document
.getElementById("salesForm")
.addEventListener("submit", async function(e){


e.preventDefault();



if(saleItems.length === 0){

alert("Please add at least one product");

return;

}



const customerName =
document.getElementById("customerName").value;



try{


// Create sale

const {data:sale,error:saleError}=await supabaseClient

.from("sales")

.insert({

sale_date:new Date()
.toISOString()
.split("T")[0],

customer_name:customerName || null

})

.select()
.single();



if(saleError) throw saleError;



// Save all items

for(const item of saleItems){



const {data:batch,error:batchError}=await supabaseClient

.from("purchase_batches")

.select("*")

.eq("id",item.batchId)

.single();



if(batchError) throw batchError;



if(batch.remaining_quantity < item.quantity){

alert("Not enough stock");

return;

}



// Insert sale item

const {error:itemError}=await supabaseClient

.from("sale_items")

.insert({

sale_id:sale.id,

batch_id:item.batchId,

quantity:item.quantity,

selling_price:item.sellingPrice

});



if(itemError) throw itemError;



// Reduce stock

const {error:updateError}=await supabaseClient

.from("purchase_batches")

.update({

remaining_quantity:
batch.remaining_quantity - item.quantity

})

.eq("id",item.batchId);



if(updateError) throw updateError;



}



alert("Sale saved successfully!");



saleItems=[];

displaySaleItems();



document
.getElementById("salesForm")
.reset();



document
.getElementById("productResults")
.innerHTML="";



loadProducts();



}


catch(error){

console.log(error);

alert(error.message);

}


});



// Start loading

// Start loading

loadProducts().then(()=>{

console.log("Products loaded:", productsList);

});


function addItemToSale(){


const batchId =
document.getElementById("productSelect").value;


const quantity =
Number(document.getElementById("quantity").value);


const sellingPrice =
Number(document.getElementById("sellingPrice").value);



if(!batchId){

alert("Please select a product");

return;

}


if(!quantity || quantity <=0){

alert("Please enter quantity");

return;

}


if(!sellingPrice || sellingPrice <=0){

alert("Please enter selling price");

return;

}



const productText =
document.getElementById("productSearch").value;



saleItems.push({

batchId:batchId,

quantity:quantity,

sellingPrice:sellingPrice,

productText:productText || "Product"

});



displaySaleItems();



document.getElementById("quantity").value="";

document.getElementById("sellingPrice").value="";

}

// add display function

function displaySaleItems(){


const container =
document.getElementById("saleItems");


container.innerHTML="";


saleItems.forEach((item,index)=>{


const div=document.createElement("div");


div.className="card";


div.innerHTML=`

<p>

${item.productText}

<br>

Qty: ${item.quantity}

|

Price: ${item.sellingPrice}

</p>

<button onclick="removeSaleItem(${index})">
Remove
</button>

`;


container.appendChild(div);


});


}

// add remove function

function removeSaleItem(index){

saleItems.splice(index,1);

displaySaleItems();

}

// connect the buttom

document
.getElementById("addItem")
.addEventListener(
"click",
addItemToSale
);