let allSales = [];
let analysisData = [];


// ==========================
// LOAD SALES DATA
// ==========================

async function loadSalesAnalysis(){

    const { data, error } = await supabaseClient

        .from("sale_items")

        .select(`

            quantity,

            selling_price,

            purchase_batches(

                buying_price,

                products(

                    id,
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
                sale_date

            )

        `);


    if(error){

        console.log(error);

        return;

    }


    allSales = data;

    populateAnalysisFilters();

    applyAnalysisFilters();

}


// ==========================
// POPULATE FILTERS
// ==========================

function populateAnalysisFilters(){

    const brandSelect =
        document.getElementById("brandFilter");

    const productSelect =
        document.getElementById("productFilter");

        const categorySelect =
    document.getElementById("categoryFilter");


    brandSelect.innerHTML =
        '<option value="">All Brands</option>';

    productSelect.innerHTML =
        '<option value="">All Products</option>';

        categorySelect.innerHTML =
    '<option value="">All Categories</option>';


    const brands =
        [
            ...new Set(
                allSales.map(item =>
                    item.purchase_batches
                        .products
                        .brands
                        .brand_name
                )
            )
        ].sort();


    brands.forEach(brand => {

        const option =
            document.createElement("option");

        option.value = brand;

        option.textContent = brand;

        brandSelect.appendChild(option);

    });


    const products = [];


    allSales.forEach(item => {

        const product =
            item.purchase_batches.products;

        const brand =
            product.brands.brand_name;


        const productName =
            `${brand} | ${product.food_type} | ${product.variety} | ${product.weight}`;


        if(!products.includes(productName)){

            products.push(productName);

        }

    });


    products.sort();


    products.forEach(productName => {

        const option =
            document.createElement("option");

        option.value = productName;

        option.textContent = productName;

        productSelect.appendChild(option);

    });

    const categories =
    [
        ...new Set(
            allSales.map(item =>
                item.purchase_batches
                    .products
                    .food_type
            )
        )
    ].sort();


categories.forEach(category => {

    const option =
        document.createElement("option");

    option.value = category;

    option.textContent = category;

    categorySelect.appendChild(option);

});

}


// ==========================
// APPLY FILTERS
// ==========================

function applyAnalysisFilters(){

    const fromDate =
        document.getElementById("fromDate").value;


    const toDate =
        document.getElementById("toDate").value;


    const selectedBrand =
        document.getElementById("brandFilter").value;


    const selectedProduct =
        document.getElementById("productFilter").value;

        const selectedCategory =
    document.getElementById("categoryFilter").value;


// Product search
const productSearch =
    document
        .getElementById("productSearch")
        .value
        .toLowerCase()
        .trim();


    const filtered =
        allSales.filter(item => {


            const saleDate =
                item.sales.sale_date;


            const product =
                item.purchase_batches.products;


            const brand =
                product.brands.brand_name;


            const productName =
                `${brand} | ${product.food_type} | ${product.variety} | ${product.weight}`;


            if(
                fromDate &&
                saleDate < fromDate
            ){

                return false;

            }


            if(
                toDate &&
                saleDate > toDate
            ){

                return false;

            }


            if(
                selectedBrand &&
                brand !== selectedBrand
            ){

                return false;

            }


            if(
                selectedProduct &&
                productName !== selectedProduct
            ){

                return false;

            }

            if(
    selectedCategory &&
    product.food_type !== selectedCategory
){

    return false;

}

if(productSearch){

    const searchText =
        `${brand} ${product.food_type} ${product.variety} ${product.weight}`
        .toLowerCase();

    const searchWords =
        productSearch.split(/\s+/);

    const matched =
        searchWords.every(word =>
            searchText.includes(word)
        );

    if(!matched){

        return false;

    }

}


            return true;

        });


    displayAnalysis(filtered);

}


// ==========================
// DISPLAY ANALYSIS
// ==========================

function displayAnalysis(data){

    const list =
        document.getElementById("analysisList");


    list.innerHTML = "";


    let totalSales = 0;

    let totalProfit = 0;

    let totalUnits = 0;


    const transactions =
        new Set();


    const products = {};


    data.forEach(item => {


        transactions.add(
            item.sales.id
        );


        const product =
            item.purchase_batches.products;


        const brand =
            product.brands.brand_name;


        const productName =
            `${brand} | ${product.food_type} | ${product.variety} | ${product.weight}`;


        const quantity =
            item.quantity;


        const salesAmount =
            quantity * item.selling_price;


        const profit =
            (
                item.selling_price -
                item.purchase_batches.buying_price
            ) * quantity;


        totalSales += salesAmount;

        totalProfit += profit;

        totalUnits += quantity;


        if(!products[productName]){

            products[productName] = {

                brand: brand,

                name: productName,

                units: 0,

                sales: 0,

                profit: 0

            };

        }


        products[productName].units +=
            quantity;


        products[productName].sales +=
            salesAmount;


        products[productName].profit +=
            profit;

    });


    const productList =
        Object.values(products);


    productList.sort(
        (a,b) => b.units - a.units
    );


    productList.forEach((product,index) => {


        const div =
            document.createElement("div");


        div.className = "card";


        div.innerHTML = `

    <p>

        <strong>
            ${index + 1}.
            ${product.name}
        </strong>

        &nbsp; | &nbsp;

        Units Sold:
        <strong>
            ${product.units.toLocaleString()}
        </strong>

        &nbsp; | &nbsp;

        Sales:
        <strong>
            ${product.sales.toLocaleString()}
        </strong>

        &nbsp; | &nbsp;

        Profit:
        <strong>
            ${product.profit.toLocaleString()}
        </strong>

    </p>

`;


        list.appendChild(div);

    });


    document.getElementById(
        "analysisSummary"
    ).innerHTML =

        "Transactions: " +
        transactions.size +

        " | Units Sold: " +
        totalUnits.toLocaleString() +

        " | Sales: " +
        totalSales.toLocaleString() +

        " MMK | Profit: " +
        totalProfit.toLocaleString() +

        " MMK";

}


// ==========================
// FILTER EVENTS
// ==========================

document
    .getElementById("fromDate")
    .addEventListener(
        "change",
        applyAnalysisFilters
    );


document
    .getElementById("toDate")
    .addEventListener(
        "change",
        applyAnalysisFilters
    );


document
    .getElementById("brandFilter")
    .addEventListener(
        "change",
        applyAnalysisFilters
    );


document
    .getElementById("productFilter")
    .addEventListener(
        "change",
        applyAnalysisFilters
    );

    document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        applyAnalysisFilters
    );

    document
    .getElementById("productSearch")
    .addEventListener(
        "input",
        applyAnalysisFilters
    );


// ==========================
// RESET
// ==========================

document
    .getElementById("resetFilters")
    .addEventListener(
        "click",
        function(){

            document.getElementById(
                "fromDate"
            ).value = "";


            document.getElementById(
                "toDate"
            ).value = "";


            document.getElementById(
                "brandFilter"
            ).value = "";


            document.getElementById(
                "productFilter"
            ).value = "";

            document.getElementById(
    "categoryFilter"
).value = "";

document.getElementById(
    "productSearch"
).value = "";


            applyAnalysisFilters();

        }
    );


// ==========================
// START
// ==========================

loadSalesAnalysis();