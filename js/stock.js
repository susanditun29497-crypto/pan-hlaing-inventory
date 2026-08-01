let stockListData = [];



async function loadStock(){


const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`

remaining_quantity,
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

expiry_dates:[]


};


}



stock[key].quantity += item.remaining_quantity;


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



data.forEach(product=>{


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


</p>

`;



stockList.appendChild(div);



});


}




// Search by brand name

document
.getElementById("search")
.addEventListener(
"input",
function(){


const keyword =
this.value.toLowerCase();



const filtered =
stockListData.filter(product=>


product.brand
.toLowerCase()
.includes(keyword)


);



displayStock(filtered);



});




loadStock();