function populateDropdown(id, items){

    const select = document.getElementById(id);

    select.innerHTML = `<option value="">Select</option>`;

    items.forEach(item => {

        const option = document.createElement("option");

        option.value = item;

        option.textContent = item;

        select.appendChild(option);

    });

}

function populateBrandSearch(){

    const list =
    document.getElementById("brandList");

    list.innerHTML="";


    INVENTORY_DATA.brands.forEach(brand=>{

        const option =
        document.createElement("option");

        option.value = brand;

        list.appendChild(option);

    });

}


populateBrandSearch();

populateDropdown("category", INVENTORY_DATA.categories);

populateDropdown("vendor", INVENTORY_DATA.vendors);

const existingStock =
document.getElementById("existingStock");

const purchaseDate =
document.getElementById("purchaseDate");

existingStock.addEventListener("change",function(){

    if(this.checked){

        purchaseDate.value =
        new Date().toISOString().split("T")[0];

    }else{

        purchaseDate.value="";

    }

});

document
.getElementById("category")
.addEventListener("change", function(){

    const category = this.value;

    const weightSelect =
    document.getElementById("weight");

    weightSelect.innerHTML =
    '<option value="">Select Weight</option>';

    if(!category) return;

    const weights =
    INVENTORY_DATA.weights[category] || [];

    weights.forEach(weight=>{

        const option =
        document.createElement("option");

        option.value = weight;

        option.textContent = weight;

        weightSelect.appendChild(option);

    });

});

function loadVarieties(){

    const brand =
    document.getElementById("brand").value;

    const category =
    document.getElementById("category").value;

    const varietySelect =
    document.getElementById("variety");

    varietySelect.innerHTML =
    '<option value="">Select Variety</option>';

    if(!brand || !category) return;

    const brandData =
    INVENTORY_DATA.products[brand];

    if(!brandData) return;

    const varieties =
    brandData[category] || [];

    varieties.forEach(variety=>{

        const option =
        document.createElement("option");

        option.value = variety;

        option.textContent = variety;

        varietySelect.appendChild(option);

    });

}

document
.getElementById("brand")
.addEventListener("change", loadVarieties);

document
.getElementById("category")
.addEventListener("change", loadVarieties);


document

.getElementById("purchaseForm")
.addEventListener("submit", async function(e){

e.preventDefault();


const brandName =
document.getElementById("brand").value;


const category =
document.getElementById("category").value;


const variety =
document.getElementById("variety").value;


const weight =
document.getElementById("weight").value;


const vendorName =
document.getElementById("vendor").value;


const purchaseDate =
document.getElementById("purchaseDate").value;


const quantity =
Number(document.getElementById("quantity").value);


const buyingPrice =
Number(document.getElementById("buyingPrice").value);

const expiryMonth =
document.getElementById("expiryMonth").value;

const expiryYear =
document.getElementById("expiryYear").value;

let expiryDate = null;

if(expiryYear && expiryMonth){

    expiryDate =
    `${expiryYear}-${expiryMonth}-01`;

}



try{


// 1. Find or create brand

let {data: brand} =
await supabaseClient
.from("brands")
.select("*")
.eq("brand_name", brandName)
.single();



if(!brand){

const result =
await supabaseClient
.from("brands")
.insert({
brand_name: brandName
})
.select()
.single();


brand = result.data;

}



// 2. Find or create vendor

let {data: vendor} =
await supabaseClient
.from("vendors")
.select("*")
.eq("vendor_name", vendorName)
.single();



if(!vendor){

const result =
await supabaseClient
.from("vendors")
.insert({
vendor_name: vendorName
})
.select()
.single();


vendor=result.data;

}



// 3. Find or create product

let {data: product} =
await supabaseClient
.from("products")
.select("*")
.eq("brand_id", brand.id)
.eq("food_type", category)
.eq("variety", variety)
.eq("weight", weight)
.single();



if(!product){

const result =
await supabaseClient
.from("products")
.insert({

brand_id: brand.id,

food_type: category,

variety: variety,

weight: weight

})
.select()
.single();


console.log("Product insert result:", result);


if(result.error){

throw result.error;

}


product = result.data;


}



// 4. Create purchase batch


const {error} =
await supabaseClient
.from("purchase_batches")
.insert({

product_id:product.id,

vendor_id:vendor.id,

purchase_date:purchaseDate,

quantity:quantity,

remaining_quantity:quantity,

buying_price:buyingPrice,

expiry_date: expiryDate

});



if(error){

throw error;

}



alert("Purchase saved successfully!");



document.getElementById("variety").value="";

document.getElementById("quantity").value="";

document.getElementById("buyingPrice").value="";


}

catch(error){

console.log(error);

alert(error.message);

}


});