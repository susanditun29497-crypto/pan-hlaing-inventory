let purchaseHistoryData = [];

async function loadPurchaseHistory(){


const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`

purchase_date,

quantity,

buying_price,

expiry_date,


products(

food_type,

variety,

weight,

brands(

brand_name

)

),


vendors(

vendor_name

)

`)

.order("purchase_date",{ascending:false});



if(error){

console.log(error);

return;

}



const grouped={};



data.forEach(item=>{


const key =
item.purchase_date + "_" + item.vendors.vendor_name;



if(!grouped[key]){


grouped[key]={

date:item.purchase_date,

vendor:item.vendors.vendor_name,

items:[],

total:0

};


}



const product=item.products;



const amount =
item.quantity * item.buying_price;


grouped[key].total += amount;



grouped[key].items.push({


name:
`${product.brands.brand_name} | ${product.food_type} | ${product.variety} | ${product.weight}`,

quantity:item.quantity,

price:item.buying_price,

expiry:item.expiry_date


});


});


purchaseHistoryData =
Object.values(grouped)

.sort((a,b)=> new Date(b.date) - new Date(a.date));

populateFilters();

displayPurchaseHistory(
purchaseHistoryData
);



}

function populateFilters(){

const vendorSelect =
document.getElementById("vendorFilter");


vendorSelect.innerHTML =
'<option value="">All Vendors</option>';


const vendors =
[...new Set(
purchaseHistoryData.map(p=>p.vendor)
)].sort();

vendors.forEach(vendor=>{

const option =
document.createElement("option");

option.value = vendor;
option.textContent = vendor;

vendorSelect.appendChild(option);

});


}



function displayPurchaseHistory(data){


const list =
document.getElementById("purchaseList");


list.innerHTML="";

let purchaseValue = 0;
let purchaseUnits = 0;



data.forEach((purchase,index)=>{

    purchaseValue += purchase.total;

purchase.items.forEach(item=>{

purchaseUnits += item.quantity;

});

const div=document.createElement("div");


div.className="card";



let details="";



purchase.items.forEach(item=>{


details += `

<p>

${item.name}

<br>

Qty:
${item.quantity}

|

Buy:
${item.price.toLocaleString()} MMK

|

Expiry:
${item.expiry || "-"}

</p>

`;


});




div.innerHTML=`
<p>

<strong>
${purchase.vendor}
</strong>

&nbsp; | &nbsp;

Date:
${purchase.date}

&nbsp; | &nbsp;

Total:
<strong>
${purchase.total.toLocaleString()} MMK
</strong>

&nbsp; | &nbsp;

<button 
onclick="togglePurchase(${index})"
style="padding:5px 10px;"
>

View Details

</button>

</p>


<div 
id="purchase-detail-${index}"
style="display:none;margin-top:10px;"
>

<hr>

${details}

</div>


`;



list.appendChild(div);



});

document.getElementById("purchaseValue").innerText =
purchaseValue.toLocaleString() + " MMK";

document.getElementById("purchaseUnits").innerText =
purchaseUnits.toLocaleString();


}





function togglePurchase(index){


const box =
document.getElementById(
"purchase-detail-"+index
);



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
.getElementById("search")
.value
.toLowerCase()
.trim();

const vendor =
document
.getElementById("vendorFilter")
.value;


const fromDate =
document
.getElementById("fromDate")
.value;

const toDate =
document
.getElementById("toDate")
.value;

const filtered =
purchaseHistoryData.filter(purchase=>{

const searchText = `
${purchase.vendor}
${purchase.items.map(i=>i.name).join(" ")}
`
.toLowerCase();

if(keyword){

const words =
keyword.split(/\s+/);

if(
!words.every(word=>searchText.includes(word))
){
return false;
}

}

if(
vendor &&
purchase.vendor !== vendor
){
return false;
}


if(
fromDate &&
purchase.date < fromDate
){
return false;
}

if(
toDate &&
purchase.date > toDate
){
return false;
}

return true;

});

displayPurchaseHistory(filtered);

}

document
.getElementById("search")
.addEventListener(
"input",
applyFilters
);

document
.getElementById("vendorFilter")
.addEventListener(
"change",
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

document.getElementById("search").value = "";

document.getElementById("vendorFilter").value = "";


document.getElementById("fromDate").value = "";

document.getElementById("toDate").value = "";

applyFilters();

}
);


loadPurchaseHistory();