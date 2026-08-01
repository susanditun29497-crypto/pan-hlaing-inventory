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



const list =
document.getElementById("purchaseList");


list.innerHTML="";



data.forEach(item=>{


const product=item.products;


const div=document.createElement("div");


div.className="card";


div.innerHTML=`

<p>

Date:
${item.purchase_date}

|

<strong>
${product.brands.brand_name}
</strong>


${product.food_type}


${product.variety}

${product.weight}
|

Qty:
${item.quantity}

|

Buy:
${item.buying_price}

|

Vendor:
${item.vendors.vendor_name}

|

Expiry:
${item.expiry_date || "-"}

</p>

`;



list.appendChild(div);


});



}



loadPurchaseHistory();