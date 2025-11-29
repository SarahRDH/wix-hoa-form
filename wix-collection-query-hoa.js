// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from 'wix-data';
import wixStores from 'wix-stores';
import wixLocation from 'wix-location';

// Global variables to store state
let selectedAddress = '';
let selectedProducts = [];
let currentHousehold = null;
let selectedProductsObject = {};
let tierNumber = '';
let isHoaMember = false;
let isRecMember = false;
let isResident = false;
let isNonResident = false;
let productsToBuy = [];
let formDocumentLinks = [];
let productDisplayHTML = [];
const availableHoaTier1Products = [
    {
        label: "Pay HOA Dues",
        value: "hoa-dues-tier-one",
        productId: "product_b30c58b5-ee86-be37-0fd3-6286d9a04e22",
        productSku: "hoa-dues-tier-one"
    },
    {
        label: "Test Product",
        value: "test-product-physical",
        productId: "product_3c5b6bf0-7042-3909-35ed-9f1eb0112de9",
        productSku: "test-product-physical"
    }
];
const availableHoaTier2Products = [
    {
        label: "Pay HOA Dues",
        value: "hoa-dues-tier-two",
        productId: "product_bb55dc81-b9e3-b472-a6ce-02deaea8d8f2",
        productSku: "hoa-dues-tier-two"
    },
    {
        label: "Test Product",
        value: "test-product-physical",
        productId: "product_3c5b6bf0-7042-3909-35ed-9f1eb0112de9",
        productSku: "test-product-physical"
    }
];
const availableHoaTier3Products = [
    { 
        label: "Pay HOA Dues", 
        value: "hoa-dues-tier-three",
        productId: "product_a536bb9b-e2a7-d22b-4062-3ec8ad89ee3d",
        productSku: "hoa-dues-tier-three"
    },
    {
        label: "Test Product",
        value: "test-product-physical",
        productId: "product_3c5b6bf0-7042-3909-35ed-9f1eb0112de9",
        productSku: "test-product-physical"
    }
];
const availableRecMemberProducts = [
    { 
        label: "Pavilion Reservation", 
        value: "pavilion-2-hrs",
        productId: "product_e251c1ab-e43e-aaba-9491-9f8615e5b59e",
        productSku: "pavilion-2-hrs" 
    },
    {
        label: "Extra Pavilion Hour",
        value: "pavilion-addl-hour",
        productId: "product_c31a5c0d-c95f-c47d-a167-7f6fb24281b9",
        productSku: "pavilion-addl-hour"
    },
    {
        label: "Extra Large Party Fee",
        value: "pavilion-jumbo",
        productId: "product_25a9c7f1-c631-3136-dcb1-9f4df2d758a7",
        productSku: "pavilion-jumbo"
    },
    { 
        label: "Order a New Key Fob", 
        value: "key-fob",
        productId: "product_4c48e732-1048-d572-7c94-59539ea14cee",
        productSku: "key-fob" 
    },
    {
        label: "Test Product",
        value: "test-product-physical",
        productId: "product_3c5b6bf0-7042-3909-35ed-9f1eb0112de9",
        productSku: "test-product-physical"
    }
];
const unit10Product = [
    {
        label: "Unit 10 Rental",
        value: "hoa-dues-unit-ten",
        productId: "product_5c189125-6094-7239-992d-12f6c5c71511",
        productSku: "hoa-dues-unit-ten"
    }
];
const availableHoaMemberTier1and2Products = [
    { 
        label: "Pay Rec Center Dues", 
        value: "rec-center-resident",
        productId: "product_36055bac-4855-b8b3-ff0d-3f5c06d18363",
        productSku: "rec-center-resident"
    },
    {
        label: "Test Product",
        value: "test-product-physical",
        productId: "product_3c5b6bf0-7042-3909-35ed-9f1eb0112de9",
        productSku: "test-product-physical"
    }
];
//need to set up logic for non-resident products
const availableNonResidentProducts = [
    {
        label: "Pay Rec Center Dues",
        value: "rec-center-non-resident",
        productId: "product_f7960293-7772-25ce-ca3e-1ce11d5ef324",
        productSku: "rec-center-non-resident"
    },
];


// ------------------------------------------ Define HTML elements and helper functions ------------------------------------------
// These are the HTML elements for the first few questions and the container elements that hold the forms
// These variables have to be updated if changes to the first few questions are made, or if new form containers are created.
let residentAddressDropdown = $w('#dropdown1');
let residentDropdownMessage = $w('#text58');
let nonResidentAddressDropdown = $w('#dropdown2');
let nonResidentRecMemberQuestion = $w('#radioGroup2');
let selectProductStatebox = $w('#statebox8');
let formStatebox = $w('#statebox9');
let formSection = $w('#section1');
let residentBox = $w('#box11');
let nonResidentBox = $w('#box12');
let formBoxHoaTier1and2 = 'hoaDuesTier1State';
let formBoxHoaTier3 = 'hoaDuesTier3State';
let formBoxRecMember = 'recMemberState';
let formBoxKeyFob = 'keyFobState';
let formBoxPavilion = 'pavilionsState';

// These elements will change depending on the form shown
// They are defined in an object for each form, then the helper functions use the object to store the elements in a reusable variable.
// The objects and the helper functions have to be updated if changes are made to any of the forms.
let formPropertyAddress = null;
let formErrorMessage = null;
let formSubmitButton = null;
let formSignature = null;
let formDocumentsElems = null;
let productDisplay = null;
let formFirstName = null;
let formLastName = null;
let formEmail = null;
let formPhone = null;
let formAdultsRec = null;
let formDependentsRec = null;
let formNameAgeBox = null;
let formFobNumbers = null;
let formHasKeyFob = null;
let formFobQuantity = null;
let formReservationDate = null;
let formStartTime = null;
let formTotalHours = null;
let formGuestCount = null;
let formPoolUse = null;
let formLifeGuard = null;
let formKeyFobBox = null;

const formElementsHoa1and2 = {
    address: 'input5',
    error: 'text119',
    submit: 'button8',
    signature: 'signatureInput1',
    docs: ['text60', 'text71', 'text72', 'text73'],
    productDisplay: 'text68',
    firstName: 'input1',
    lastName: 'input2',
    email: 'input4',
    phone: 'input3'
};
// Helper to resolve active elements for HOA dues tiers 1 and 2 form
function getHoa1and2FormElements() {
    console.log('getHoa1and2FormElements called');
    return {
        address: formElementsHoa1and2.address,
        error: formElementsHoa1and2.error,
        submit: formElementsHoa1and2.submit,
        signature: formElementsHoa1and2.signature,
        docs: formElementsHoa1and2.docs,
        productDisplay: formElementsHoa1and2.productDisplay,
        firstName: formElementsHoa1and2.firstName,
        lastName: formElementsHoa1and2.lastName,
        email: formElementsHoa1and2.email,
        phone: formElementsHoa1and2.phone
    };
}

const formElementsHoa3 = {
    address: 'input6',
    error: 'text77',
    submit: 'button9',
    signature: 'signatureInput2',
    docs: ['text82', 'text81', 'text80', 'text79'],
    productDisplay: 'text83',
    firstName: 'input10',
    lastName: 'input8',
    email: 'input7',
    phone: 'input9',
    adultsRec: 'adultsBox',
    dependentsRec: 'dependentsBox',
    nameAgeBox: 'namesAgesBox',
    fobs: ['input11', 'input12', 'input13', 'input14', 'input15', 'input16', 'input17', 'input18', 'input19', 'input20'],
    hasFob: 'radioGroup3',
    keyFobBox: 'keyFobBox'
};
// Helper to resolve active elements for HOA dues tier 3 form
function getHoa3FormElements() {
    console.log('getHoa3FormElements called');
    return {
        address: formElementsHoa3.address,
        error: formElementsHoa3.error,
        submit: formElementsHoa3.submit,
        signature: formElementsHoa3.signature,
        docs: formElementsHoa3.docs,
        productDisplay: formElementsHoa3.productDisplay,
        firstName: formElementsHoa3.firstName,
        lastName: formElementsHoa3.lastName,
        email: formElementsHoa3.email,
        phone: formElementsHoa3.phone,
        adultsRec: formElementsHoa3.adultsRec,
        dependentsRec: formElementsHoa3.dependentsRec,
        nameAgeBox: formElementsHoa3.nameAgeBox,
        fobs: formElementsHoa3.fobs,
        hasFob: formElementsHoa3.hasFob,
        keyFobBox: formElementsHoa3.keyFobBox
    };
}

const formElementsRecMembership = {
    address: 'input31',
    error: 'text88',
    submit: 'button10',
    signature: 'signatureInput3',
    docs: ['text93', 'text92', 'text91', 'text90'],
    productDisplay: 'text94',
    firstName: 'input35',
    lastName: 'input33',
    email: 'input32',
    phone: 'input34',
    adultsRec: 'adultsBox1',
    dependentsRec: 'dependentsBox1', 
    nameAgeBox: 'namesAgesBox1',   
    fobs: ['input30', 'input29', 'input28', 'input27', 'input26', 'input25', 'input24', 'input23', 'input22', 'input21'],
    hasFob: 'radioGroup4',
    keyFobBox: 'keyFobBox1'
};
// Helper to resolve active elements for rec membership form
function getRecMembershipFormElements() {
    console.log('getRecMembershipFormElements called');
    return {
        address: formElementsRecMembership.address,
        error: formElementsRecMembership.error,
        submit: formElementsRecMembership.submit,
        signature: formElementsRecMembership.signature,
        docs: formElementsRecMembership.docs,
        productDisplay: formElementsRecMembership.productDisplay, 
        firstName: formElementsRecMembership.firstName,
        lastName: formElementsRecMembership.lastName,
        email: formElementsRecMembership.email,
        phone: formElementsRecMembership.phone,
        adultsRec: formElementsRecMembership.adultsRec,
        dependentsRec: formElementsRecMembership.dependentsRec,
        nameAgeBox: formElementsRecMembership.nameAgeBox,
        fobs: formElementsRecMembership.fobs,
        hasFob: formElementsRecMembership.hasFob,
        keyFobBox: formElementsRecMembership.keyFobBox
    };
}

const formElementsNewKeyFob = {
    address: 'input46',
    error: 'text99',
    submit: 'button11',
    productDisplay: 'text105',
    firstName: 'input50',
    lastName: 'input48',
    email: 'input47',
    phone: 'input49',
    fobQuantity: 'fobQty',
    nameAgeBox: 'namesAgesBox2'
};
// Helper to resolve active elements for new key fob form
function getNewKeyFobFormElements() {
    console.log('getNewKeyFobFormElements called');
    return {
        address: formElementsNewKeyFob.address,
        error: formElementsNewKeyFob.error,
        submit: formElementsNewKeyFob.submit,
        productDisplay: formElementsNewKeyFob.productDisplay,
        firstName: formElementsNewKeyFob.firstName,
        lastName: formElementsNewKeyFob.lastName,
        email: formElementsNewKeyFob.email,
        phone: formElementsNewKeyFob.phone,
        fobQuantity: formElementsNewKeyFob.fobQuantity,
        nameAgeBox: formElementsNewKeyFob.nameAgeBox
    };
}

const formElementsPavilion = {
    address: 'input61',
    error: 'text110',
    submit: 'button12',
    docs: ['text116', 'text117', 'text118'],   
    signature: 'signatureInput4',
    productDisplay: 'text117',
    firstName: 'input55',
    lastName: 'input53',
    email: 'input52',
    phone: 'input54',
    reservationDate: 'datePicker1',
    startTime: 'timePicker1',
    totalHours: 'radioGroup5',
    guestCount: 'radioGroup6',
    poolUse: 'radioGroup8',
    lifeGuard: 'radioGroup9'
};
// Helper to resolve active elements for pavilion reservation form
function getPavilionFormElements() {
    console.log('getPavilionFormElements called');
    return {
        address: formElementsPavilion.address,
        error: formElementsPavilion.error,
        submit: formElementsPavilion.submit,
        docs: formElementsPavilion.docs,
        signature: formElementsPavilion.signature,
        productDisplay: formElementsPavilion.productDisplay,
        firstName: formElementsPavilion.firstName,
        lastName: formElementsPavilion.lastName,
        email: formElementsPavilion.email,
        phone: formElementsPavilion.phone,
        reservationDate: formElementsPavilion.reservationDate,
        startTime: formElementsPavilion.startTime,
        totalHours: formElementsPavilion.totalHours,
        guestCount: formElementsPavilion.guestCount,
        poolUse: formElementsPavilion.poolUse,
        lifeGuard: formElementsPavilion.lifeGuard
    };
}

// New central resolver: take an ID-map (strings/arrays) and populate module-level element variables
function resolveAndAssignFormElements(idMap) {
    const getEl = id => (id ? $w(`#${id}`) : null);
    const getElsArray = arr => (Array.isArray(arr) ? arr.map(id => $w(`#${id}`)) : []);

    formPropertyAddress = getEl(idMap.address);
    formErrorMessage = getEl(idMap.error);
    formSubmitButton = getEl(idMap.submit);
    formSignature = getEl(idMap.signature);
    formDocumentsElems = getElsArray(idMap.docs || []);
    productDisplay = getEl(idMap.productDisplay);
    formFirstName = getEl(idMap.firstName);
    formLastName = getEl(idMap.lastName);
    formEmail = getEl(idMap.email);
    formPhone = getEl(idMap.phone);
    formAdultsRec = getEl(idMap.adultsRec);
    formDependentsRec = getEl(idMap.dependentsRec);
    formNameAgeBox = getEl(idMap.nameAgeBox);
    formFobNumbers = getElsArray(idMap.fobs || []);
    formHasKeyFob = getEl(idMap.hasFob);
    formKeyFobBox = getEl(idMap.keyFobBox);
    formReservationDate = getEl(idMap.reservationDate);
    formStartTime = getEl(idMap.startTime);
    formTotalHours = getEl(idMap.totalHours);
    formGuestCount = getEl(idMap.guestCount);
    formPoolUse = getEl(idMap.poolUse);
    formLifeGuard = getEl(idMap.lifeGuard);
}

// ------------------------------------------- End of HTML elements and helper functions ------------------------------------------

let formCollectionName = ''; // the data collection to submit the form data to
let formName = ''; // the name of the form the user filled out
let activeForm = null; // the active form elements object
let getProductData; // will be assigned inside $w.onReady so it's accessible globally

$w.onReady(function () {
    // Get all the product data from the Products Rich Content Collection for the product selected by the user
    // If changes to the products are made, the Products Rich Content Collection must be updated accordingly. This includes documents and sku and product IDs.
    async function getProductData(selectedProducts) {
        try {
            console.log('getProductData called with:', selectedProducts);
            const result = await wixData.query('productsRichContent').find();
            const items = (result && result.items) ? result.items : [];

            selectedProductsObject = {}; // reset global map
            productsToBuy = []; // reset global array

            if (!items.length) {
                console.log('No items found in Products Rich Content collection.');
                return productsToBuy;
            }
            
            console.log('Found', items.length, 'items in Products Rich Content collection');
            console.log('First few items:', items.slice(0, 3).map(item => ({
                sku: item.sku,
                productSku: item.productSku,
                product_id_from_app: item.product_id_from_app,
                name: item.name
            })));

            // Ensure selectedProducts is an array
            // it does not have to be an array if only one product is selected
            if (!Array.isArray(selectedProducts)) {
                selectedProducts = [selectedProducts];  
            }  
            const selections = Array.isArray(selectedProducts) ? selectedProducts : [];
            console.log('Processing selected products:', selections);
            // Loop through selected products and match against products rich content collection items
            for (const sel of selections) {
                console.log('Trying to match selected product:', sel);

                // Try several matching strategies: sku, productSku, _id, product_id_from_app, or mapped name
                let match = items.find(it =>
                    (it.sku && it.sku === sel) ||
                    (it.productSku && it.productSku === sel) ||
                    (it._id && it._id === sel) ||
                    (it.product_id_from_app && it.product_id_from_app.replace(/^product_/, '') === sel) 
                    
                );

                if (match) {
                    // Normalize product id (remove 'product_' prefix if present)
                    const normalizedProductId = (match.product_id_from_app || match._id || '').replace(/^product_/, '');
                    selectedProductsObject[sel] = {
                        productId: normalizedProductId,
                        sku: match.sku || sel,
                        price: match.price || 0,
                        rawItem: match
                    };
                    console.log('Matched product for', sel, selectedProductsObject[sel]);
                    productsToBuy.push(selectedProductsObject[sel]);
                    // Extract document links from the matched item's raw data fields that start with 'form_document_'
                    const docs = [];
                    const productHTML = [];
                    const raw = match || selectedProductsObject[sel].rawItem;
                    if (raw && typeof raw === 'object') {
                        for (const key of Object.keys(raw)) {
                            if (key.startsWith('form_document_')) {
                                const val = raw[key];
                                if (val === undefined || val === null || val === '') continue;

                                if (Array.isArray(val)) {
                                    for (const entry of val) {
                                        if (!entry) continue;
                                        if (typeof entry === 'string') docs.push(entry);
                                        else if (typeof entry === 'object') {
                                            if (entry.fileUrl) docs.push(entry.fileUrl);
                                            else if (entry.url) docs.push(entry.url);
                                            else if (entry.src) docs.push(entry.src);
                                        }
                                    }
                                } else if (typeof val === 'string') {
                                    docs.push(val);
                                } else if (typeof val === 'object') {
                                    if (val.fileUrl) docs.push(val.fileUrl);
                                    else if (val.url) docs.push(val.url);
                                    else if (val.src) docs.push(val.src);
                                }
                            }

                            if (key == 'name') {
                                const val = raw[key];
                                if (val === undefined || val === null || val === '') continue;

                                if (Array.isArray(val)) {
                                    for (const entry of val) {
                                        if (!entry) continue;
                                        if (typeof entry === 'string') productHTML.push(entry);
                                        else if (typeof entry === 'object') {
                                            if (entry.fileUrl) productHTML.push(entry.fileUrl);
                                            else if (entry.url) productHTML.push(entry.url);
                                            else if (entry.src) productHTML.push(entry.src);
                                        }
                                    }
                                } else if (typeof val === 'string') {
                                    productHTML.push(val);
                                } else if (typeof val === 'object') {
                                    if (val.fileUrl) productHTML.push(val.fileUrl);
                                    else if (val.url) productHTML.push(val.url);
                                    else if (val.src) productHTML.push(val.src);
                                }
                            }

                            if (key == 'price') {
                                const val = raw[key];
                                if (val === undefined || val === null) continue;

                                // Handle numeric price (preferred)
                                if (typeof val === 'number') {
                                    // store numeric price and add a formatted display entry
                                    selectedProductsObject[sel].price = val;
                                    productHTML.push(`$${val.toFixed(2)}`);
                                } else if (Array.isArray(val)) {
                                    for (const entry of val) {
                                        if (entry === undefined || entry === null) continue;
                                        if (typeof entry === 'number') {
                                            selectedProductsObject[sel].price = entry;
                                            productHTML.push(`$${entry.toFixed(2)}`);
                                        } else if (typeof entry === 'string') {
                                            const parsed = parseFloat(entry);
                                            if (!isNaN(parsed)) {
                                                selectedProductsObject[sel].price = parsed;
                                                productHTML.push(`$${parsed.toFixed(2)}`);
                                            } else {
                                                productHTML.push(entry);
                                            }
                                        } else if (typeof entry === 'object') {
                                            const num = (typeof entry.amount === 'number') ? entry.amount :
                                                        (typeof entry.price === 'number') ? entry.price :
                                                        (entry.value && typeof entry.value === 'number') ? entry.value : null;
                                            if (num !== null) {
                                                selectedProductsObject[sel].price = num;
                                                productHTML.push(`$${num.toFixed(2)}`);
                                            } else if (entry.fileUrl) productHTML.push(entry.fileUrl);
                                            else if (entry.url) productHTML.push(entry.url);
                                            else if (entry.src) productHTML.push(entry.src);
                                        }
                                    }
                                } 
                            }          
                        }
                        
                    }

                    // Merge into global formDocumentLinks, remove duplicates
                    formDocumentLinks = Array.from(new Set([...(formDocumentLinks || []), ...docs]));
                    productDisplayHTML = Array.from(new Set([...(productDisplayHTML || []), ...productHTML]));
                    
                    console.log('Extracted form document links for', sel, formDocumentLinks);
                    console.log('Extracted product HTML content for', sel, productDisplayHTML);
                } else {
                    console.warn('No product match for', sel);
                    console.log('Available SKUs:', items.map(it => it.sku).filter(Boolean));
                    console.log('Available productSkus:', items.map(it => it.productSku).filter(Boolean));
                    
                    selectedProductsObject[sel] = {
                        productId: '',
                        sku: sel,
                        price: 0
                    };
                }
            }
            
            console.log('Final productsToBuy array:', productsToBuy);
            return productsToBuy;

        } catch (error) {
            console.error('Error loading product details:', error);
        }
    }

// ------------------------------------------Display and hide form elements based on user input ------------------------------------------

    // Q1: own property?
    formSection.collapse();
    residentDropdownMessage.hide();
    residentAddressDropdown.collapse();
    nonResidentRecMemberQuestion.collapse();
    nonResidentAddressDropdown.collapse();
    selectProductStatebox.collapse();
    formStatebox.collapse();
    residentBox.collapse();
    nonResidentBox.collapse();

    // Are you a resident?
    $w('#radioGroup1').onChange(() => {
        const owns = $w('#radioGroup1').value === 'Yes';
        if (owns) {
            isResident = true;
            residentBox.expand();
            residentAddressDropdown.expand();
            residentDropdownMessage.show();
            nonResidentRecMemberQuestion.collapse();
            nonResidentAddressDropdown.collapse();
        } else {
            isNonResident = true;
            nonResidentBox.expand();
            nonResidentRecMemberQuestion.expand();
            residentAddressDropdown.collapse();
            residentDropdownMessage.hide();
            $w('#radioGroup1').hide();
        }
    });

    // If non-resident, are you a rec center member?
    nonResidentRecMemberQuestion.onChange(() => {
        const isNonResRecMember = nonResidentRecMemberQuestion.value === 'Yes';
        if (isNonResRecMember) {
            nonResidentAddressDropdown.expand();
            //make recMember true only if the address is found ******* need to set up
            isRecMember = true;
            selectProductStatebox.changeState('nonResidentIsRecMember');
        } else {
            selectProductStatebox.changeState('notResidentNotRecMember');
        }
    });
    
    // When resident address chosen, decide which statebox to show
    residentAddressDropdown.onChange(async () => {
        const householdId = residentAddressDropdown.value;
        selectedAddress = householdId; // Store selected address globally
        console.log('Dropdown value (householdId):', householdId);
        
        if (householdId == '' || householdId == 'undefined') { 
            selectProductStatebox.collapse();
            console.log('No resident address was entered.');
            return;
        }
        
        // Reset variables and UI state
        let hh = null;
        selectProductStatebox.collapse();
        
        console.log('Searching datasetResidents...');

        const dataset = $w('#datasetResidents');

        try {
            // IMPORTANT: Clear any existing filters completely before setting new ones
            await dataset.setFilter(wixData.filter());
            
            // Small delay to ensure filter is cleared
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Set the filter to find matching address
            await dataset.setFilter(wixData.filter().eq('full_address', householdId));
            
            // Get items with proper parameters
            const result = await dataset.getItems(0, 50); // fromIndex: 0, count: 50
            
            const items = (result && result.items) ? result.items : [];
            if (items.length > 0) {
                console.log('Found matching item in dataset:', items[0]);
                residentDropdownMessage.hide();
                hh = items[0];
                currentHousehold = hh; // Store household data globally
                console.log('hh: tier number', hh.tier_number);
            } else {
                console.log('No matching address found for:', householdId);
                residentDropdownMessage.show();

                // Try alternative approach: get all items and search manually
                await dataset.setFilter(wixData.filter()); // Clear filter
                const allResult = await dataset.getItems(0, 1000); // Get more items
                const allItems = (allResult && allResult.items) ? allResult.items : [];
                
                console.log('Searching through', allItems.length, 'items manually...');
                const matchingItem = allItems.find(item => item.full_address === householdId);
                
                if (matchingItem) {
                    console.log('Found matching item manually:', matchingItem);
                    residentDropdownMessage.hide();
                    hh = matchingItem;
                    currentHousehold = hh; // Store household data globally
                } else {
                    console.log('Still no matching address found');
                    residentDropdownMessage.show();
                }
            }
        } catch (error) {
            console.error('Dataset error:', error);
        }

        // Decide which products to show based on HOA / Rec member status and tier
        if (hh?.hoa_dues_paid) { 
            isHoaMember = true;

            switch(hh?.tier_number) {
                case 1: {
                    console.log('tier 1');
                    tierNumber = '1';
                    selectProductStatebox.changeState('isHoaMemberIsTier1');
                    const radioGroup11 = $w('#radioGroup11'); // checkbox for user to select products
                    
                    if(hh?.rec_dues_paid) {
                        // HOA and Rec dues already paid - only show rec products
                        isRecMember = true;
                        radioGroup11.options = availableRecMemberProducts;
                    } else {
                        // HOA paid but rec dues not paid - only show rec dues
                        radioGroup11.options = availableHoaMemberTier1and2Products;
                    }
                    break;
                }

                case 2: {
                    console.log('tier 2');
                    tierNumber = '2';
                    selectProductStatebox.changeState('isHoaMemberIsTier2');
                    const radioGroup13 = $w('#radioGroup13'); // checkbox for user to select products
                    
                    if(hh?.rec_dues_paid) {
                        // HOA and Rec dues already paid - only show rec products
                        isRecMember = true;
                        radioGroup13.options = availableRecMemberProducts;
                    } else {
                        // HOA paid but rec dues not paid - only show rec dues
                        radioGroup13.options = availableHoaMemberTier1and2Products;
                    }
                    break;
                }

                case 3: {
                    console.log('tier 3');
                    tierNumber = '3';
                    selectProductStatebox.changeState('isHoaMemberIsTier3');
                    const radioGroup15 = $w('#radioGroup15');
                    isRecMember = true;
                    // Tier 3 rec dues included with HOA dues - only show rec products
                    radioGroup15.options = availableRecMemberProducts;

                    break;
                }

                case '':
                case 'undefined':
                default:
                    console.log('is HOA member, but tier number is empty or undefined');
                    break;
            }
        } else {
            isHoaMember = false;
            isRecMember = false;
            let isUnit10 = false;
            // Check if Unit 10 resident
            if (hh?.unit_number && hh.unit_number.toLowerCase().includes('10')) {
                isUnit10 = true;
                console.log('Resident is in Unit 10');
            }
            console.log('HOA dues not paid yet' + hh?.hoa_dues_paid + hh?.tier_number);
            
            switch(hh?.tier_number) {
                case 1: {
                    console.log('tier 1');
                    tierNumber = '1';
                    formName = 'hoa_dues_tier_one_and_two';
                    formCollectionName = 'formSubsHoaDuesTier1and2';
                    selectProductStatebox.changeState('notHoaMemberIsTier1');
                    const radioGroup10 = $w('#radioGroup10');
                    // Only show available options - HOA Dues only
                    radioGroup10.options = availableHoaTier1Products;

                    if (isUnit10) {
                        // Add Unit 10 product option
                        radioGroup10.options = radioGroup10.options.concat(unit10Product);
                        console.log('Added Unit 10 product option for resident');
                    }
                    break;
                }

                case 2: {
                    console.log('tier 2');
                    tierNumber = '2';
                    formName = 'hoa_dues_tier_one_and_two';
                    formCollectionName = 'formSubsHoaDuesTier1and2';
                    selectProductStatebox.changeState('notHoaMemberIsTier2');
                    const radioGroup12 = $w('#radioGroup12');
                    
                    // Only show available options - HOA Dues only
                    radioGroup12.options = availableHoaTier2Products;

                    if (isUnit10) {
                        // Add Unit 10 product option
                        radioGroup12.options = radioGroup12.options.concat(unit10Product);
                        console.log('Added Unit 10 product option for resident');
                    }
                    break;
                }

                case 3: {
                    console.log('tier 3');
                    tierNumber = '3';
                    formName = 'hoa_dues_tier_three';
                    formCollectionName = 'FormSubsHoaDuesTier3';
                    selectProductStatebox.changeState('notHoaMemberIsTier3');
                    const radioGroup14 = $w('#radioGroup14');
                    console.log('radioGroup14:', radioGroup14, 'statebox:', selectProductStatebox);
                    // Only show available options - HOA Dues only
                    radioGroup14.options = availableHoaTier3Products;

                    if (isUnit10) {
                        // Add Unit 10 product option
                        radioGroup14.options = radioGroup14.options.concat(unit10Product);
                        console.log('Added Unit 10 product option for resident');
                    }

                    break;
                }

                case '':
                case 'undefined':
                default:
                    console.log('is not HOA member and tier number is empty or undefined');
                    break;
            }
        }

        selectProductStatebox.expand();
    });
// ------------------------------------------Display the forms in the multi-state box ------------------------------------------
    // Use a switch over selected product SKUs to pick the form state (last match wins)
    let matchedState = null;
    let getElementsFunction = null;
    //get all the radioGroup elements (contain the products) to attach onChange event handlers
    const radioGroupIds = [
        'radioGroup11',
        'radioGroup13',
        'radioGroup15',
        'radioGroup14',
        'radioGroup12',
        'radioGroup10',
        'radioGroup16', // non-resident not rec member
        'radioGroup17'  // non-resident is rec member
    ];

    const selectProductsCheckboxes = radioGroupIds.map(id => $w(`#${id}`));
    console.log('selectProductsCheckboxes:', selectProductsCheckboxes);
    // Attach individual onChange handlers so any visible group will trigger processing
    selectProductsCheckboxes.forEach(cb => {

        if (!cb || typeof cb.onChange !== 'function') return;
        cb.onChange(async () => {
            console.log(`${cb.id} onChange triggered`);
            
            // reset form document links and product display
            formDocumentLinks = [];
            productDisplayHTML = [];
            selectedProducts = [];
            matchedState = null;
            formName = '';
            formCollectionName = '';
            getElementsFunction = null;

            selectedProducts = cb.value || [];
            console.log('Initial selected products from', cb.id, ':', selectedProducts);
            formSection.expand();

            // determine matchedState for the aggregated selections
            if(selectedProducts) {
                console.log('Processing selected product SKU for matchedState logic:', selectedProducts);
                switch (selectedProducts) {
                
                    case 'rec-center-resident':
                    case 'rec-center-non-resident':
                        // show Rec Center Dues form
                        matchedState = formBoxRecMember;
                        formName = 'rec_membership';
                        formCollectionName = 'formSubsRecMember';
                        getElementsFunction = getRecMembershipFormElements; // store function reference
                        break;

                    case 'hoa-dues-tier-one':
                    case 'hoa-dues-tier-two':
                        // show HOA Tier 1 & 2 form
                        matchedState = formBoxHoaTier1and2;
                        formName = 'hoa_dues_tier_one_and_two';
                        formCollectionName = 'formSubsHoaDuesTier1and2';
                        getElementsFunction = getHoa1and2FormElements; // store function reference
                        break;

                    case 'hoa-dues-tier-three':
                    case 'test-product-physical':
                        // show HOA Tier 3 form
                        matchedState = formBoxHoaTier3;
                        formName = 'hoa_dues_tier_three';
                        formCollectionName = 'FormSubsHoaDuesTier3';
                        getElementsFunction = getHoa3FormElements; // store function reference
                        break;

                    case 'key-fob':
                        // show Key Fob form
                        matchedState = formBoxKeyFob;
                        formName = 'rec_new_key_fob';
                        formCollectionName = 'formSubsRecNewKeyFob';
                        getElementsFunction = getNewKeyFobFormElements; // store function reference
                        break;

                    case 'pavilion-2-hrs':
                    case 'pavilion-addl-hour':
                    case 'pavilion-jumbo':
                        // show Pavilion Reservation form
                        matchedState = formBoxPavilion;
                        formName = 'rec_reserve_pavilion';
                        formCollectionName = 'formSubsRecReservePavilion';
                        getElementsFunction = getPavilionFormElements; // store function reference
                        break;

                    default:
                        // no match for this sku
                    break;
                }
            }

            // If any matching state was found, display it and load product data & docs once
            if (matchedState) {
                console.log('Displaying form for matchedState:', matchedState);    
                formStatebox.expand();
                formStatebox.changeState(matchedState);

                // Resolve the elements object returned by the helper: the code elsewhere sometimes assigns
                // either the function reference or the already-invoked result to getElementsFunction.
                // Handle both cases here and then populate the module-level element variables.
                let idMap = {};
                if (typeof getElementsFunction === 'function') {
                    try {
                        idMap = getElementsFunction();
                    } catch (e) {
                        console.warn('getElementsFunction threw when invoked; falling back to value or empty object', e);
                        idMap = getElementsFunction || {};
                    }
                } else {
                    idMap = getElementsFunction || {};
                }

                // Use centralized resolver to populate module-level element variables
                resolveAndAssignFormElements(idMap);

                console.log('first few resolved form elements:', {
                    formPropertyAddress,
                    formErrorMessage,
                    formSubmitButton,
                    formDocumentsElemsLength: (formDocumentsElems && formDocumentsElems.length) || 0,
                    productDisplay
                });

                // Set the selected address on the resolved address element(s).
                if (formPropertyAddress) {
                    try {
                        formPropertyAddress.value = selectedAddress;
                        if (typeof formPropertyAddress.disable === 'function') formPropertyAddress.disable();

                        // Enforce disabled state: if the element supports onChange, revert any user edits
                        // and re-disable the input. This ensures the address cannot be changed once the
                        // form is displayed even if the element becomes enabled elsewhere.
                        try {
                            if (typeof formPropertyAddress.onChange === 'function') {
                                formPropertyAddress.onChange(() => {
                                    try {
                                        if (formPropertyAddress.value !== selectedAddress) {
                                            formPropertyAddress.value = selectedAddress;
                                        }
                                        if (typeof formPropertyAddress.disable === 'function') {
                                            formPropertyAddress.disable();
                                        }
                                    } catch (e2) {
                                        console.warn('Could not enforce disabled state on formPropertyAddress:', e2);
                                    }
                                });
                            }
                        } catch (eOn) {
                            // Element may not support onChange; ignore silently
                        }
                    } catch (e) {
                        console.warn('Could not set formPropertyAddress value:', e);
                    }
                }

                // Re-bind submit handler now that formSubmitButton is set
                setupFormHandlers();

                await getProductData(selectedProducts);
                populateFormDocuments();

            }
            
            //populate the form documents section
            function populateFormDocuments() {
                if(formKeyFobBox) {
                    formKeyFobBox.collapse();
                }
                if(formNameAgeBox) {
                    formNameAgeBox.collapse();
                }
                formErrorMessage.text = '';
                if (typeof formPropertyAddress.disable === 'function') formPropertyAddress.disable();

                if (formDocumentLinks.length > 0) {
                    const docElems = formDocumentsElems;
                    // Clear and hide all first
                    docElems.forEach(el => { if (el) { el.html = ''; el.hide(); }});

                    for (let i = 0; i < formDocumentLinks.length && i < docElems.length; i++) {
                        const el = docElems[i];
                        if (!el) continue;
                        const link = formDocumentLinks[i];
                        console.log(`Document ${i + 1}: ${link}`);
                        el.html = `<a href="${link}" style="font-size:18px; font-weight:700; color:blue; text-decoration:underline" target="_blank">📄 Click to review document #${i + 1}</a>
                                    <span id="status-${i + 1}" style="font-size: 16px; color: #ff6600; font-weight: bold;">
                                        ⏳ Pending Review
                                    </span>`;
                        el.show();

                        el.onClick(() => {
                            el.html = `<a href="${link}" style="font-size:18px; font-weight:700; color:blue; text-decoration:underline" target="_blank">📄 Click to review document #${i + 1}</a>
                                        <span id="status-${i + 1}" style="font-size: 16px; color: #008000; font-weight: bold;">
                                            ✅ Reviewed
                                        </span>`;
                        });
                    }
                } else {
                    // Hide all document elements if none
                    formDocumentsElems.hide();
                }
                // populate the form with the product name, productID, price
                if (productDisplay && productDisplayHTML.length > 0) {
                    productDisplay.html += '<br>' + productDisplayHTML.map(htmlContent => `<div style="padding-bottom:10px; font-size:18px; font-weight:700;">${htmlContent}</div>`).join('<br>');
                    productDisplay.show();
                } else {
                    productDisplay.hide();
                }

                //if user selected 'yes' for having a key fob, show the key fob number input field
                if (formHasKeyFob) {
                    formHasKeyFob.onChange(() => {
                        const hasFob = formHasKeyFob.value === 'Yes';
                        const wantsFob = formHasKeyFob.value === 'No but wants key fob';
                        if (hasFob) {
                            formKeyFobBox.expand();
                            formNameAgeBox.expand();
                        } else if (wantsFob) {
                            formKeyFobBox.collapse();
                            formNameAgeBox.expand();
                        } else {
                            formKeyFobBox.collapse();
                            formNameAgeBox.collapse();
                        }
                    }); 
                }
            }
        });
    });
    
    // Initialize form submission handlers
    setupFormHandlers();
});

// Setup form submission handlers
function setupFormHandlers() {
    // The button should be in the HOA form state
    if (formSubmitButton) {
        formSubmitButton.onClick(async () => {

            await submitHoaForm();
        });
    }
}

// New: validateHoaForm performs all form-field validation and returns fobNumbers when valid
async function validateHoaForm({ firstName, lastName, phone, email, signature, propertyAddress } = {}) {
    try {
        // Validate required fields are not empty
        if (!firstName) {
            const errorMessage = 'Please enter your first name.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }
        if (!lastName) {
            const errorMessage = 'Please enter your last name.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }
        if (!phone) {
            const errorMessage = 'Please enter your phone number.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }
        if (!email) {
            const errorMessage = 'Please enter your email address.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }
        if (!signature) {
            const errorMessage = 'Please provide your signature.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }
        
        if (formHasKeyFob) {
            if (formHasKeyFob.value === '') {
                const errorMessage = 'Please indicate whether you have key fobs.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            } else if (formHasKeyFob.value === 'Yes' || formHasKeyFob.value === 'No but wants key fob') {
                // User indicated they have key fobs or want new ones; ensure name and age box is filled
                if (formNameAgeBox) {
                    if (formAdultsRec && formAdultsRec.value === '') {
                        const errorMessage = 'Please list the names and ages of adults using the rec center and these key fobs.';
                        if (formErrorMessage) formErrorMessage.text = errorMessage;
                        return { valid: false };
                    }
                    if (formDependentsRec && formDependentsRec.value === '') {
                        const errorMessage = 'Please list the names and ages of dependents using the rec center and these key fobs.';
                        if (formErrorMessage) formErrorMessage.text = errorMessage;
                        return { valid: false };
                    }
                }
            }
        }


        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const errorMessage = 'Please enter a valid email address.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }

        // validate phone number format (simple check for digits only)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            const errorMessage = 'Please enter a valid 10-digit phone number.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }

        // Prepare an array to hold key fob numbers (accessible later when inserting the form record)
        let fobNumbers = [];

        // Validate that the fob numbers are provided if user indicated they have key fobs
        if (formHasKeyFob && formHasKeyFob.value === 'Yes') {
            // loop through the fob numbers and ensure they are numeric and of correct length, 5 digits
            const fobRegex = /^\d{5}$/;
            const fobElems = formFobNumbers || [];
            for (let i = 0; i < fobElems.length; i++) {
                const fobNumber = (fobElems[i] && typeof fobElems[i].value === 'string') ? fobElems[i].value.trim() : '';
                if (!fobNumber) {
                    // If none of the fob fields have been provided, show an error only after checking the last field.
                    // Skip empty entries until the final iteration; if no valid fobs were collected by then, show message.
                    if (i === fobElems.length - 1 && fobNumbers.length === 0) {
                        if (formErrorMessage) formErrorMessage.text = 'Please provide your key fob numbers.';
                        return { valid: false };
                    }
                    continue;
                }
                if (!fobRegex.test(fobNumber)) {
                    if (formErrorMessage) formErrorMessage.text = `"${fobNumber}" is not a valid key fob number. Each key fob number should be exactly 5 digits.`;
                    return { valid: false };
                }
                fobNumbers.push(fobNumber);
            }

            // Ensure we have 10 slots (fill with empty strings if fewer provided)
            while (fobNumbers.length < 10) {
                fobNumbers.push('');
            }
        } else {
            // If user does not indicate they have key fobs, ensure fobNumbers is an array of 10 empty strings
            fobNumbers = new Array(10).fill('');
        }

        // Validate that all required documents have been reviewed and clicked on
        const requiredDocCount = formDocumentLinks.length;
        let allReviewed = true;
        const docElems = formDocumentsElems;
        for (let i = 0; i < requiredDocCount && i < docElems.length; i++) {
            const el = docElems[i];
            const html = (el && el.html) ? el.html.toLowerCase() : '';
            if (!html.includes('reviewed')) { // requires the word 'reviewed' in element HTML
                allReviewed = false;
                break;
            }
        }
        if (!allReviewed) {
            const errorMessage = 'Please review all required documents before submitting the form.';
            if (formErrorMessage) formErrorMessage.text = errorMessage;
            return { valid: false };
        }

        return { valid: true, fobNumbers };

    } catch (error) {
        console.error('Error in validateHoaForm:', error);
        if (formErrorMessage) formErrorMessage.text = 'Error validating form. Please check your entries.';
        return { valid: false };
    }
}

// Function to submit HOA form without using the submit connection to the button in the Wix UI
async function submitHoaForm() {
    try {
        console.log('Submitting HOA Dues form...');
        if (typeof formPropertyAddress.disable === 'function') formPropertyAddress.disable();
        // Hide any previous error messages
        formErrorMessage.text = '';
        
        // Validate required fields
        const firstName = formFirstName.value?.trim();
        const lastName = formLastName.value?.trim();
        const phone = formPhone.value?.trim();
        const email = formEmail.value?.trim();
        const signature = formSignature.value;
        const propertyAddress = formPropertyAddress.value;
        const adultsBox = formAdultsRec ? formAdultsRec.value : null;
        const dependentsBox = formDependentsRec ? formDependentsRec.value : null;
        const hasKeyFob = formHasKeyFob ? formHasKeyFob.value : null;

        // Use the extracted validation function; it must succeed before proceeding
        let fobNumbers = [];
        const validation = await validateHoaForm({ firstName, lastName, phone, email, signature, propertyAddress, adultsBox, dependentsBox });
        if (!validation || !validation.valid) {
            return;
        }
        fobNumbers = validation.fobNumbers || [];

        console.log('Selected products to submit:', selectedProducts);
        let itemToInsert = {
            "form_name": formName, // For a text field
            "form_property_address": propertyAddress, // Value from an input element
            "first_name": firstName,
            "last_name": lastName,
            "form_phone_number": phone,
            "form_email": email,
            "form_signature": signature,
            "form_adults": adultsBox,
            "form_dependents": dependentsBox,
            "form_product_sku_01": Array.isArray(selectedProducts) ? selectedProducts.join(', ') : (selectedProducts || ''), // Join all selected SKUs into a single string
            "form_key_fob_01": fobNumbers[0] || '',
            "form_key_fob_02": fobNumbers[1] || '',
            "form_key_fob_03": fobNumbers[2] || '',
            "form_key_fob_04": fobNumbers[3] || '',
            "form_key_fob_05": fobNumbers[4] || '',
            "form_key_fob_06": fobNumbers[5] || '',
            "form_key_fob_07": fobNumbers[6] || '',
            "form_key_fob_08": fobNumbers[7] || '',
            "form_key_fob_09": fobNumbers[8] || '',
            "form_key_fob_10": fobNumbers[9] || '',
            "form_has_key_fob": hasKeyFob,
            "form_documents_signed": formDocumentLinks.join(', ') // Join all document links into a single string
        };
        wixData.insert(formCollectionName, itemToInsert)
            .then((insertedItem) => {
                console.log("Item inserted successfully:", insertedItem);
            })
            .catch((error) => {
                console.error("Error inserting item:", error);
                // Add any error handling here
            });
     
        // Show success message before redirecting
        console.log('Form submitted successfully, adding to cart...');
        
        // Ensure we have product data before adding to cart
        if (productsToBuy.length === 0) {
            console.log('No products in productsToBuy, loading product data...');
            await getProductData(selectedProducts);
        }
        
        console.log('Products to add to cart:', productsToBuy);
        
        if (productsToBuy.length > 0) {
            await addToCart(productsToBuy);
        } else {
            console.warn('No valid products found via dynamic lookup, add to cart failed...');
        }

        // Redirect to checkout
        console.log('Redirecting to checkout...');
        wixLocation.to('/checkout');
        
    } catch (error) {
        console.error('Error in function submitHoaForm:', error);
        
        const errorMessage = 'Error submitting form. Please try again.';
        formErrorMessage.text = errorMessage;

    }
}

// Function to add selected products to cart
async function addToCart(productsToBuy) {
    try {
        console.log('Adding products to cart:', productsToBuy);
        
        if (!productsToBuy || productsToBuy.length === 0) {
            console.warn('No products to add to cart');
            return;
        }
        
        const productsToAdd = [];
        
        for (const product of productsToBuy) {
            if (product.productId && product.productId !== '') {
                productsToAdd.push({
                    productId: product.productId,
                    quantity: 1
                });
                console.log(`Preparing to add product: ${product.sku} (ID: ${product.productId})`);
            } else {
                console.warn(`Skipping product with missing ID:`, product);
            }
        }
        
        if (productsToAdd.length > 0) {
            console.log('Products to add using wix-stores API:', productsToAdd);
            
            try {
                await wixStores.cart.addProducts(productsToAdd);
                console.log("Products added to cart successfully using wix-stores API");
            } catch (storesError) {
                console.error("Error with wix-stores API, trying alternative method:", storesError);
                
                // Fallback: try adding products one by one
                for (const productToAdd of productsToAdd) {
                    try {
                        await wixStores.cart.addProducts([productToAdd]);
                        console.log(`Successfully added individual product: ${productToAdd.productId}`);
                    } catch (individualError) {
                        console.error(`Failed to add individual product ${productToAdd.productId}:`, individualError);
                    }
                }
            }
        } else {
            console.warn('No valid products to add to cart');
        }
        
    } catch (error) {
        console.error("Error adding products to cart:", error);
    }
}


