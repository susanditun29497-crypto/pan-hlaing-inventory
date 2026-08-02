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
purchase_date,
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


const grouped = {};


data.forEach(batch=>{


const product = batch.products;

const key = product.id;



if(!grouped[key]){

grouped[key]={

productId: product.id,

brand:
product.brands.brand_name,

food_type:
product.food_type,

variety:
product.variety,

weight:
product.weight,

totalStock:0

};

}


grouped[key].totalStock += batch.remaining_quantity;


});


productsList = Object.values(grouped);


console.log("Grouped products:", productsList);


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



productsList.forEach(product=>{


const text =
`${product.brand} | ${product.food_type} | ${product.variety} | ${product.weight} | Stock: ${product.totalStock}`;



const searchText =
text.toLowerCase();



if(searchText.includes(keyword.toLowerCase())){


const div=document.createElement("div");


div.className="card";


div.innerHTML=text;



div.onclick=function(){


document
.getElementById("productSelect")
.value=product.productId;


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
// Save all items using FIFO

for(const item of saleItems){



const {data:batches,error:batchError}=await supabaseClient

.from("purchase_batches")

.select("*")

.eq("product_id",item.productId)

.gt("remaining_quantity",0)

.order("purchase_date",{ascending:true});



if(batchError) throw batchError;



let remainingNeed = item.quantity;



for(const batch of batches){



if(remainingNeed <= 0){

break;

}



const takeQuantity =
Math.min(
remainingNeed,
batch.remaining_quantity
);



// Create sale item

const {error:itemError}=await supabaseClient

.from("sale_items")

.insert({

sale_id:sale.id,

batch_id:batch.id,

quantity:takeQuantity,

selling_price:item.sellingPrice

});



if(itemError) throw itemError;




// Reduce stock

const {error:updateError}=await supabaseClient

.from("purchase_batches")

.update({

remaining_quantity:
batch.remaining_quantity - takeQuantity

})

.eq("id",batch.id);



if(updateError) throw updateError;



remainingNeed -= takeQuantity;



}



if(remainingNeed > 0){

throw new Error(
"Not enough stock available"
);

}


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


const productId =
document.getElementById("productSelect").value;


const quantity =
Number(document.getElementById("quantity").value);


const sellingPrice =
Number(document.getElementById("sellingPrice").value);



if(!productId){

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

productId:productId,

quantity:quantity,

sellingPrice:sellingPrice,

productText:productText || "Product"

});



// displaySaleItems();



// document.getElementById("quantity").value="";

// document.getElementById("sellingPrice").value="";

displaySaleItems();

// Clear for next product
document.getElementById("productSearch").value = "";
document.getElementById("productSelect").value = "";
document.getElementById("productResults").innerHTML = "";

document.getElementById("quantity").value = "";
document.getElementById("sellingPrice").value = "";

// Put cursor back into search box
document.getElementById("productSearch").focus();

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