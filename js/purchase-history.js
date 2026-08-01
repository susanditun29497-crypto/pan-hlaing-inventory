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




displayPurchaseHistory(
Object.values(grouped)
);



}




function displayPurchaseHistory(data){


const list =
document.getElementById("purchaseList");


list.innerHTML="";



data.forEach((purchase,index)=>{


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

</p>


<button onclick="togglePurchase(${index})">

View Details

</button>


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



loadPurchaseHistory();