async function exportBackup(){

const {data,error}=await supabaseClient

.from("purchase_batches")

.select(`

purchase_date,

quantity,

remaining_quantity,

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

`);

if(error){

alert(error.message);

return;

}


let csv = 
"Date,Brand,Category,Variety,Weight,Vendor,Quantity,Remaining,Buying Price,Expiry\n";


data.forEach(item=>{


const product =
item.products;


csv +=
`${item.purchase_date},`+
`${product.brands.brand_name},`+
`${product.food_type},`+
`${product.variety},`+
`${product.weight},`+
`${item.vendors.vendor_name},`+
`${item.quantity},`+
`${item.remaining_quantity},`+
`${item.buying_price},`+
`${item.expiry_date || ""}\n`;

});



const blob =
new Blob([csv],{
type:"text/csv"
});


const url =
URL.createObjectURL(blob);



const a =
document.createElement("a");


a.href=url;

a.download =
"Pan-Hlaing-Inventory-Backup.csv";


a.click();


URL.revokeObjectURL(url);


}