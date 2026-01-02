// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from 'wix-data';
import wixStores from 'wix-stores';
import wixLocation from 'wix-location';
import wixEcomFrontend from 'wix-ecom-frontend';

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
let autoSelectedProducts = []; // SKUs to automatically include (e.g. Unit 10)

const availableHoaTier1Products = [
    {
        label: "Pay HOA Dues",
        value: "hoa-dues-tier-one",
        productId: "b30c58b5-ee86-be37-0fd3-6286d9a04e22",
        productSku: "hoa-dues-tier-one"
    },
    {
        label: "Pay Both HOA and Rec Dues",
        value: "hoa-and-rec-dues-bundle",
        productId: "8cc31e70-2e21-4c03-16a5-7b395faa740c",
        productSku: "hoa-and-rec-dues-bundle"
    }
];
const availableHoaTier2Products = [
    {
        label: "Pay HOA Dues",
        value: "hoa-dues-tier-two",
        productId: "bb55dc81-b9e3-b472-a6ce-02deaea8d8f2",
        productSku: "hoa-dues-tier-two"
    },

    {
        label: "Pay Both HOA and Rec Dues",
        value: "hoa-and-rec-dues-bundle",
        productId: "8cc31e70-2e21-4c03-16a5-7b395faa740c",
        productSku: "hoa-and-rec-dues-bundle"
    }
];
const availableHoaTier3Products = [
    { 
        label: "Pay HOA Dues - Includes Rec Membership", 
        value: "hoa-dues-tier-three",
        productId: "a536bb9b-e2a7-d22b-4062-3ec8ad89ee3d",
        productSku: "hoa-dues-tier-three"
    }
   
];
const availableRecMemberProducts = [
    { 
        label: "Pavilion Reservation", 
        value: "pavilion-2-hrs",
        productId: "e251c1ab-e43e-aaba-9491-9f8615e5b59e",
        productSku: "pavilion-2-hrs" 
    },
    { 
        label: "Order a New Key Fob", 
        value: "key-fob",
        productId: "4c48e732-1048-d572-7c94-59539ea14cee",
        productSku: "key-fob" 
    }
   
];
// The additional pavilion products are added in dynamically based on user selections in the pavilion form
const pavilionReservationProduct = [
        { 
        label: "Pavilion Reservation", 
        value: "pavilion-2-hrs",
        productId: "e251c1ab-e43e-aaba-9491-9f8615e5b59e",
        productSku: "pavilion-2-hrs" 
    }
];

const extraPavilionHourProduct = [
    {
        label: "Pavilion Reservation, Four Hours",
        value: "pavilion-4-hours",
        productId: "c31a5c0d-c95f-c47d-a167-7f6fb24281b9",
        productSku: "pavilion-4-hours"
    }
];

const jumboPavilionProduct = [
    {
        label: "Pavilion Reservation, Two Hours, Over 50 Guests",
        value: "pavilion-jumbo",
        productId: "25a9c7f1-c631-3136-dcb1-9f4df2d758a7",
        productSku: "pavilion-jumbo"
    }
];

const jumboPavilionFourHourProduct = [
    {
        label: "Pavilion Reservation, Four Hours, Over 50 Guests",
        value: "pavilion-jumbo-4-hours",
        productId: "1f1abbf2-eb25-221f-9ad1-3e3affb1b9f5",
        productSku: "pavilion-jumbo-4-hours"
    }
];

const unit10Product = [
    {
        label: "Unit 10 Additional HOA Dues",
        value: "hoa-dues-unit-ten",
        productId: "5c189125-6094-7239-992d-12f6c5c71511",
        productSku: "hoa-dues-unit-ten"
    }
];
const availableHoaMemberTier1and2Products = [
    { 
        label: "Pay Rec Center Dues", 
        value: "rec-center-resident",
        productId: "36055bac-4855-b8b3-ff0d-3f5c06d18363",
        productSku: "rec-center-resident"
    }

];
//need to set up logic for non-resident products
const availableNonResidentProducts = [
    {
        label: "Pay Rec Center Dues",
        value: "rec-center-non-resident",
        productId: "f7960293-7772-25ce-ca3e-1ce11d5ef324",
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
let formBoxPavilion = 'pavilionState';
let backButton = $w('#group7');

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
let formReservationDate = null;
let formStartTime = null;
let formTotalHours = null;
let formGuestCount = null;
let formPoolUse = null;
let formKeyFobBox = null;
let submitHandlerBound = false; // guard to prevent multiple submit bindings

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
    fobs: ['input11', 'input12', 'input13', 'input14'],
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
    fobs: ['input30', 'input29', 'input28', 'input27'],
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
    nameAgeBox: 'namesAgesBox2',
    adultsRec: 'adultsBox2',
    dependentsRec: 'dependentsBox2'
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
        nameAgeBox: formElementsNewKeyFob.nameAgeBox,
        adultsRec: formElementsNewKeyFob.adultsRec,
        dependentsRec: formElementsNewKeyFob.dependentsRec
    };
}

const formElementsPavilion = {
    address: 'input51',
    error: 'text110',
    submit: 'button12',
    docs: ['text116', 'text117', 'text118'],   
    signature: 'signatureInput4',
    productDisplay: 'text112',
    firstName: 'input55',
    lastName: 'input53',
    email: 'input52',
    phone: 'input54',
    reservationDate: 'datePicker1',
    startTime: 'timePicker1',
    totalHours: 'radioGroup5',
    guestCount: 'radioGroup6',
    poolUse: 'radioGroup8'
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
        poolUse: formElementsPavilion.poolUse
    };
}

// New central resolver: take an ID-map (strings/arrays) and populate module-level element variables
function resolveAndAssignFormElements(idMap) {
    const getEl = id => (id ? $w(`#${id}`) : null);
    const getElsArray = arr => (Array.isArray(arr) ? arr.map(id => $w(`#${id}`)) : []);

    formPropertyAddress = getEl(idMap.address);
    formErrorMessage = getEl(idMap.error);
    formSubmitButton = getEl(idMap.submit);
    // reset binding guard whenever the resolved submit button changes so a new handler can be attached
    submitHandlerBound = false;
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
            // Clear global document and display arrays so each lookup replaces previous results
            formDocumentLinks = [];
            productDisplayHTML = [];
            
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

                // Try several matching strategies: sku, productSku, _id, or product_id_from_app
                let match = items.find(it =>
                    (it.sku && it.sku === sel) ||
                    (it.productSku && it.productSku === sel) ||
                    (it._id && it._id === sel) ||
                    (it.product_id_from_app && it.product_id_from_app.replace(/^product_/, '') === sel) 
                    
                );

                if (match) {
                    // Only use product_id_from_app – never fall back to _id for productId
                    const normalizedProductId = match.product_id_from_app
                        ? match.product_id_from_app.replace(/^product_/, '')
                        : '';

                    if (!normalizedProductId) {
                        console.warn(`No valid product_id_from_app for SKU: ${sel}`, match);
                    } else {
                        console.log(`Resolved productId for ${sel}:`, normalizedProductId);
                    }

                    selectedProductsObject[sel] = {
                        productId: normalizedProductId,
                        sku: match.sku || sel,
                        price: match.price || 0,
                        rawItem: match
                    };

                    if (normalizedProductId) {
                        productsToBuy.push(selectedProductsObject[sel]);
                    } else {
                        console.warn(`Skipping SKU ${sel} because it has no valid productId.`);
                    }
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
    $w('#text126').hide(); //non-resident registration closed message

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
            $w('#text126').hide(); //non-resident registration closed message
        } else {
            isNonResident = true;
            $w('#text126').show(); //non-resident registration closed message
            // nonResidentBox.expand();
            // nonResidentRecMemberQuestion.expand();
            residentBox.collapse();
            residentAddressDropdown.collapse();
            residentDropdownMessage.hide();
            

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

        // Reset any prior auto-selected SKUs (e.g. Unit 10) for a new selection
        autoSelectedProducts = [];

        console.log('Dropdown value (householdId):', householdId);
        
        if (!householdId || householdId === 'undefined') { 
            selectProductStatebox.collapse();
            console.log('No resident address was entered.');
            return;
        }
        
        // Reset variables and UI state *per selection*
        let hh = null;
        selectProductStatebox.collapse();

        // 🔥 IMPORTANT: reset membership flags for each new household
        isHoaMember = false;
        isRecMember = false;
        tierNumber = '';
        formName = '';
        formCollectionName = '';
        
        console.log('Searching datasetResidents...');

        const dataset = $w('#datasetResidents');

        try {
            // Clear any existing filters
            await dataset.setFilter(wixData.filter());
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Filter to find matching address
            await dataset.setFilter(wixData.filter().eq('full_address', householdId));
            
            const result = await dataset.getItems(0, 50);
            const items = (result && result.items) ? result.items : [];
            
            if (items.length > 0) {
                console.log('Found matching item in dataset:', items[0]);
                residentDropdownMessage.hide();
                hh = items[0];
                currentHousehold = hh;
                autoSelectedProducts = [];
            } else {
                console.log('No matching address found for:', householdId);
                residentDropdownMessage.show();

                // Try all items manually as fallback
                await dataset.setFilter(wixData.filter());
                const allResult = await dataset.getItems(0, 1000);
                const allItems = (allResult && allResult.items) ? allResult.items : [];
                
                console.log('Searching through', allItems.length, 'items manually...');
                const matchingItem = allItems.find(item => item.full_address === householdId);
                
                if (matchingItem) {
                    console.log('Found matching item manually:', matchingItem);
                    residentDropdownMessage.hide();
                    hh = matchingItem;
                    currentHousehold = hh;
                    autoSelectedProducts = [];
                } else {
                    console.log('Still no matching address found');
                    residentDropdownMessage.show();
                    return;
                }
            }
        } catch (error) {
            console.error('Dataset error:', error);
            return;
        }

        // ----- Decide which products to show based on HOA / Rec member status and tier -----
        const hoaPaid = !!hh?.hoa_dues_paid || !!hh?.override_hoa_dues;
        const recPaid = !!hh?.rec_dues_paid || !!hh?.override_rec_dues;

        isHoaMember = hoaPaid;
        isRecMember = recPaid;

        console.log('Resolved dues status for household:', {
            address: hh.full_address,
            hoa_dues_paid: hh?.hoa_dues_paid,
            override_hoa_dues: hh?.override_hoa_dues,
            rec_dues_paid: hh?.rec_dues_paid,
            override_rec_dues: hh?.override_rec_dues,
            isHoaMember,
            isRecMember
        });

        // Normalize tier so "1" and 1 both work
        const tier = Number(hh?.tier_number);
        console.log('Normalized tier:', tier, 'raw tier_number:', hh?.tier_number);

        if (isHoaMember) { 
            switch (tier) {
                case 1: {
                    console.log('HOA member, tier 1');
                    tierNumber = '1';
                    selectProductStatebox.changeState('isHoaMemberIsTier1');
                    const radioGroup11 = $w('#radioGroup11');
                    
                    if (isRecMember) {
                        radioGroup11.options = availableRecMemberProducts;
                    } else {
                        radioGroup11.options = availableHoaMemberTier1and2Products;
                    }
                    break;
                }

                case 2: {
                    console.log('HOA member, tier 2');
                    tierNumber = '2';
                    selectProductStatebox.changeState('isHoaMemberIsTier2');
                    const radioGroup13 = $w('#radioGroup13');
                    
                    if (isRecMember) {
                        radioGroup13.options = availableRecMemberProducts;
                    } else {
                        radioGroup13.options = availableHoaMemberTier1and2Products;
                    }
                    break;
                }

                case 3: {
                    console.log('HOA member, tier 3');
                    tierNumber = '3';
                    selectProductStatebox.changeState('isHoaMemberIsTier3');
                    const radioGroup15 = $w('#radioGroup15');
                    // Tier 3 rec dues included with HOA dues - only show rec products
                    radioGroup15.options = availableRecMemberProducts;
                    break;
                }

                default:
                    console.log('is HOA member, but tier number is empty or invalid:', hh?.tier_number);
                    break;
            }
        } else {
            let isUnit10 = false;
            if (hh?.unit_number && hh.unit_number.toLowerCase().includes('10')) {
                isUnit10 = true;
                console.log('Resident is in Unit 10');
            }
            console.log('HOA dues not paid yet', hh?.hoa_dues_paid, 'tier:', hh?.tier_number);
            
            switch (tier) {
                case 1: {
                    console.log('NOT HOA member, tier 1');
                    tierNumber = '1';
                    formName = 'hoa_dues_tier_one_and_two';
                    formCollectionName = 'formSubsHoaDuesTier1and2';
                    selectProductStatebox.changeState('notHoaMemberIsTier1');
                    const radioGroup10 = $w('#radioGroup10');
                    radioGroup10.options = availableHoaTier1Products;

                    if (isUnit10) {
                        console.log('Added Unit 10 product option for resident');
                        autoSelectedProducts = [unit10Product[0].value];
                    }
                    break;
                }

                case 2: {
                    console.log('NOT HOA member, tier 2');
                    tierNumber = '2';
                    formName = 'hoa_dues_tier_one_and_two';
                    formCollectionName = 'formSubsHoaDuesTier1and2';
                    selectProductStatebox.changeState('notHoaMemberIsTier2');
                    const radioGroup12 = $w('#radioGroup12');
                    radioGroup12.options = availableHoaTier2Products;

                    if (isUnit10) {
                        console.log('Added Unit 10 product option for resident');
                        autoSelectedProducts = [unit10Product[0].value];
                    }
                    break;
                }

                case 3: {
                    console.log('NOT HOA member, tier 3');
                    tierNumber = '3';
                    formName = 'hoa_dues_tier_three';
                    formCollectionName = 'FormSubsHoaDuesTier3';
                    selectProductStatebox.changeState('notHoaMemberIsTier3');
                    const radioGroup14 = $w('#radioGroup14');
                    radioGroup14.options = availableHoaTier3Products;

                    if (isUnit10) {
                        console.log('Added Unit 10 product option for resident');
                        autoSelectedProducts = [unit10Product[0].value];
                    }
                    break;
                }

                default:
                    console.log('is not HOA member and tier number is empty or invalid:', hh?.tier_number);
                    break;
            }
        }

        selectProductStatebox.expand();
    });

// ------------------------------------------Display the forms in the multi-state box ------------------------------------------
    //if backButton exists, set onClick to go back to select products state
    if (backButton) {
        backButton.onClick(() => {
            $w('#section2').expand();
            formSection.collapse();
            //uncheck all selected products
            selectProductsCheckboxes.forEach(cb => {
                if (cb && typeof cb.value !== 'undefined') {
                    cb.value = [];
                }
            });
        });
    }    
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
            // Merge any auto-selected SKUs (e.g. unit10) so they are added to cart even if user didn't check them
            if (autoSelectedProducts && autoSelectedProducts.length > 0) {
                if (!Array.isArray(selectedProducts)) selectedProducts = [selectedProducts];
                autoSelectedProducts.forEach(sku => {
                    if (!selectedProducts.includes(sku)) selectedProducts.push(sku);
                });
            }
            console.log('Initial selected products from', cb.id, ':', selectedProducts);
            formSection.expand();

            // determine matchedState for the aggregated selections
            if (selectedProducts) {
                console.log('Processing selected product SKU(s) for matchedState logic:', selectedProducts);

                // Determine selections to iterate over (normalize to array)
                const selections = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];

                // Use last matching SKU to determine which form to show (last match wins)
                for (const sel of selections) {
                    switch (sel) {
                        case 'rec-center-resident':
                        case 'rec-center-non-resident':
                            matchedState = formBoxRecMember;
                            formName = 'rec_membership';
                            formCollectionName = 'formSubsRecMember';
                            getElementsFunction = getRecMembershipFormElements;
                            break;

                        case 'hoa-dues-tier-one':
                        case 'hoa-dues-tier-two':
                            matchedState = formBoxHoaTier1and2;
                            formName = 'hoa_dues_tier_one_and_two';
                            formCollectionName = 'formSubsHoaDuesTier1and2';
                            getElementsFunction = getHoa1and2FormElements;
                            break;

                        case 'hoa-dues-tier-three':
                        case 'hoa-and-rec-dues-bundle':
                            matchedState = formBoxHoaTier3;
                            formName = 'hoa_dues_tier_three';
                            formCollectionName = 'FormSubsHoaDuesTier3';
                            getElementsFunction = getHoa3FormElements;
                            break;

                        case 'key-fob':
                            matchedState = formBoxKeyFob;
                            formName = 'rec_new_key_fob';
                            formCollectionName = 'formSubsRecNewKeyFob';
                            getElementsFunction = getNewKeyFobFormElements;
                            break;

                        case 'pavilion-2-hrs':
                        case 'pavilion-addl-hour':
                        case 'pavilion-jumbo':
                            matchedState = formBoxPavilion;
                            formName = 'rec_reserve_pavilion';
                            formCollectionName = 'formSubsRecReservePavilion';
                            getElementsFunction = getPavilionFormElements;
                            break;

                        default:
                            // no match for this sku; leave any previously determined matchedState intact
                            break;
                    }
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
                    productDisplay,
                    formSignature
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
                // if a user selects a value of '4 hours' in totalHours, and the guestCount is 'large', the selectedProduct should be only the jumboPavilionFourHourProduct.
                // if a user selects a value of '2 hours' in totalHours, and 'large' in guestCount, the selectedProduct should be only the jumboPavilionProduct.
                // if a user selects a value of '4 hours' in totalHours, and guestCount is not 'large', the selectedProduct should be only the extraPavilionHourProduct.
                // if a user selects a value of '2 hours' in totalHours, and guestCount is not 'large', the selectedProduct should be only the pavilionReservationProduct.
                if (formTotalHours) {
                    // make handler async so we can refresh product lookup and UI after changing selection
                    formTotalHours.onChange(async () => {
                        productDisplayHTML = [];
                        selectedProducts = []; // Reset to only include the new selection
                        
                        try {
                            const hours = formTotalHours.value;
                            const guestCount = formGuestCount?.value;
                            
                            // Based on hours and guest count, select the appropriate product
                            if (hours === '4 hours') {
                                if(guestCount === 'large') {
                                    // 4 hours + large party = jumbo 4-hour product
                                    selectedProducts.push(jumboPavilionFourHourProduct[0].value);
                                    if (!productDisplayHTML.includes(jumboPavilionFourHourProduct[0].label)) productDisplayHTML.push(jumboPavilionFourHourProduct[0].label);
                                } else {
                                    // 4 hours + not large = 4-hour product
                                    selectedProducts.push(extraPavilionHourProduct[0].value);
                                    if (!productDisplayHTML.includes(extraPavilionHourProduct[0].label)) productDisplayHTML.push(extraPavilionHourProduct[0].label);
                                }
                            } else if (hours === '2 hours') {
                                if(guestCount === 'large') {
                                    // 2 hours + large party = jumbo 2-hour product
                                    selectedProducts.push(jumboPavilionProduct[0].value);
                                    if(!productDisplayHTML.includes(jumboPavilionProduct[0].label)) productDisplayHTML.push(jumboPavilionProduct[0].label);
                                } else {
                                    // 2 hours + not large = regular 2-hour product
                                    selectedProducts.push(pavilionReservationProduct[0].value);
                                    if(!productDisplayHTML.includes(pavilionReservationProduct[0].label)) productDisplayHTML.push(pavilionReservationProduct[0].label);
                                }
                            } 

                            console.log('After totalHours change, selectedProducts:', selectedProducts);

                            // Refresh productsToBuy by re-running the product lookup
                            if (typeof getProductData === 'function') {
                                await getProductData(selectedProducts);
                            }

                            // dedupe display html and refresh the documents & product display section
                            productDisplayHTML = Array.from(new Set(productDisplayHTML || []));
                            try { populateFormDocuments(); } catch (e) { console.warn('populateFormDocuments not callable here', e); }

                        } catch (err) {
                            console.error('Error handling totalHours change:', err);
                        }
                    });
                }

                if (formGuestCount) {
                    formGuestCount.onChange(async () => {
                        productDisplayHTML = [];
                        selectedProducts = []; // Reset to only include the new selection

                        try {
                            const guestCountValue = formGuestCount.value;
                            const hours = formTotalHours?.value;

                            // Based on guest count and hours, select the appropriate product
                            if (guestCountValue === 'large') {
                                if(hours === '4 hours') {
                                    // Large party + 4 hours = jumbo 4-hour product
                                    selectedProducts.push(jumboPavilionFourHourProduct[0].value);
                                    console.log('Large party, 4 hours:', selectedProducts);
                                    if (!productDisplayHTML.includes(jumboPavilionFourHourProduct[0].label)) productDisplayHTML.push(jumboPavilionFourHourProduct[0].label);
                                } else if(hours === '2 hours') {
                                    // Large party + 2 hours = jumbo 2-hour product
                                    selectedProducts.push(jumboPavilionProduct[0].value);
                                    if (!productDisplayHTML.includes(jumboPavilionProduct[0].label)) productDisplayHTML.push(jumboPavilionProduct[0].label);
                                }
                            } else {
                                // Not large party
                                if(hours === '4 hours') {
                                    // Not large + 4 hours = 4-hour product
                                    selectedProducts.push(extraPavilionHourProduct[0].value);
                                    if (!productDisplayHTML.includes(extraPavilionHourProduct[0].label)) productDisplayHTML.push(extraPavilionHourProduct[0].label);
                                } else if(hours === '2 hours') {
                                    // Not large + 2 hours = regular 2-hour product
                                    selectedProducts.push(pavilionReservationProduct[0].value);
                                    if (!productDisplayHTML.includes(pavilionReservationProduct[0].label)) productDisplayHTML.push(pavilionReservationProduct[0].label);
                                }
                            }
                               
                            console.log('After guestCount change, selectedProducts:', selectedProducts);

                            // Refresh productsToBuy by re-running the product lookup
                            if (typeof getProductData === 'function') {
                                await getProductData(selectedProducts);
                            }

                            // dedupe display html and refresh the documents & product display section
                            productDisplayHTML = Array.from(new Set(productDisplayHTML || []));
                            try { populateFormDocuments(); } catch (e) { console.warn('populateFormDocuments not callable here', e); }

                        } catch (err) {
                            console.error('Error handling guestCount change:', err);
                        }
                    });                    
                }

                // Re-bind submit handler now that formSubmitButton is set
                setupFormHandlers();

                await getProductData(selectedProducts);

                populateFormDocuments();

                // Collapse the section with the first few questions after form has loaded to keep UI focused
                try {
                    const section2 = $w('#section2');
                    if (section2 && typeof section2.collapse === 'function') {
                        section2.collapse();
                        // Scroll to top of formStatebox to ensure user sees the beginning of the form
                        if (typeof formStatebox.scrollTo === 'function') {
                            formStatebox.scrollTo();
                        }
                    }
                } catch (collapseErr) {
                    console.warn('Could not collapse #section2:', collapseErr);
                }

            }
            
            //populate the form documents section and other dynamic elements
            function populateFormDocuments() {
                // collapse optional boxes and reset error
                if (formKeyFobBox) {
                    formKeyFobBox.collapse();
                }
                if (formNameAgeBox) {
                    formNameAgeBox.collapse();
                }
                if (formErrorMessage) formErrorMessage.text = '';
                if (typeof formPropertyAddress.disable === 'function') formPropertyAddress.disable();

                // Render required documents (same behavior as before)
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
                    console.log('No document links to display');
                }

                // Build product display entries from productsToBuy (ensures price is shown when available)
                try {
                    const displayEntries = [];

                    // Build a small lookup of local product definitions by their value (sku)
                    const localLookup = {};
                    [extraPavilionHourProduct, jumboPavilionProduct, jumboPavilionFourHourProduct, unit10Product].forEach(arr => {
                        if (Array.isArray(arr)) arr.forEach(p => { if (p && p.value) localLookup[p.value] = p; });
                    });

                    // Helper to format label+price
                    const formatEntry = (label, price) => {
                        const priceStr = (typeof price === 'number' && !isNaN(price) && price > 0) ? ` — $${price.toFixed(2)}` : '';
                        return `${label}${priceStr}`;
                    };

                    // If productsToBuy contains entries, respect multiplicity (duplicates represent quantity)
                    if (Array.isArray(productsToBuy) && productsToBuy.length > 0) {
                        // Maintain insertion order of distinct SKUs/productIds
                        const seenKeys = new Set();
                        const keysInOrder = [];
                        const reps = {}; // key -> representative product object
                        const counts = {}; // key -> count

                        for (const p of productsToBuy) {
                            const key = (p.sku || p.productId || JSON.stringify(p)).toString();
                            if (!seenKeys.has(key)) {
                                seenKeys.add(key);
                                keysInOrder.push(key);
                                reps[key] = p;
                                counts[key] = 1;
                            } else {
                                counts[key] = (counts[key] || 0) + 1;
                            }
                        }

                        for (const key of keysInOrder) {
                            const p = reps[key];
                            // resolve label
                            let label = '';
                            if (p && p.rawItem) {
                                const rawName = p.rawItem.name;
                                if (typeof rawName === 'string') label = rawName;
                                else if (Array.isArray(rawName) && rawName.length > 0) label = rawName[0];
                                else if (typeof rawName === 'object' && rawName && rawName.text) label = rawName.text;
                            }
                            if (!label) label = p.sku || '';
                            if ((!label || label === '') && p.sku && localLookup[p.sku]) {
                                label = localLookup[p.sku].label;
                            }
                            const price = p.price;

                            const qty = counts[key] || 1;
                            for (let i = 0; i < qty; i++) {
                                if (label && label !== '') displayEntries.push(formatEntry(label, price));
                            }
                        }

                        // If displayEntries ended up empty but selectedProducts contains known local SKUs, show those (respect multiplicity)
                        if (displayEntries.length === 0 && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
                            const selCounts = {};
                            for (const sku of selectedProducts) selCounts[sku] = (selCounts[sku] || 0) + 1;
                            for (const sku of Object.keys(selCounts)) {
                                const local = localLookup[sku];
                                const qty = selCounts[sku];
                                if (local) {
                                    for (let i = 0; i < qty; i++) {
                                        displayEntries.push(local.label + (local.price ? ` — $${local.price.toFixed(2)}` : ''));
                                    }
                                }
                            }
                        }
                    } else {
                        // No productsToBuy entries; try to render from selectedProducts and local lookup (respect multiplicity)
                        if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
                            const selCounts = {};
                            for (const sku of selectedProducts) selCounts[sku] = (selCounts[sku] || 0) + 1;
                            for (const sku of Object.keys(selCounts)) {
                                const local = localLookup[sku];
                                const qty = selCounts[sku];
                                if (local) {
                                    for (let i = 0; i < qty; i++) {
                                        displayEntries.push(local.label + (local.price ? ` — $${local.price.toFixed(2)}` : ''));
                                    }
                                }
                            }
                        }
                    }

                    // Preserve duplicates (so 4 hours shows two extra-hour lines). Remove only exact consecutive empties if any.
                    productDisplayHTML = displayEntries.filter(d => d && d !== '');

                } catch (err) {
                    console.warn('Error building product display entries:', err);
                }

                // Render the product display element (replace HTML instead of appending)
                if (productDisplay && Array.isArray(productDisplayHTML) && productDisplayHTML.length > 0) {
                    productDisplay.html = productDisplayHTML.map(htmlContent => `<div style="padding-bottom:10px; font-size:18px; font-weight:500;">${htmlContent}</div>`).join('<br>');
                    productDisplay.show();
                } else if (productDisplay) {
                    productDisplay.html = '';
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

                if (matchedState === formBoxKeyFob) {
                    formNameAgeBox.expand();
                }
            }
        });
    });
    
    // Initialize form submission handlers
    setupFormHandlers();
});

// Setup form submission handlers
function setupFormHandlers() {
    // Do nothing if there's no resolved submit button yet
    if (!formSubmitButton) return;
    // Avoid attaching duplicate handlers to the same element
    if (submitHandlerBound) return;

    formSubmitButton.onClick(async () => {
        await submitHoaForm();
    });

    submitHandlerBound = true;
}

// ------------------------------------------ Form validation and submission ------------------------------------------

// validateHoaForm performs all form-field validation and returns fobNumbers when valid
async function validateHoaForm({ firstName, lastName, phone, email, signature } = {}) {
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
        // Validate that all required documents have been reviewed and clicked on
        // The form_document_links_xx in the Products Rich Collection must be the urls from the pdfs stored in the Wix Media library in the file 'documents'.
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
        if (formSignature) {
            if (!signature) {
                const errorMessage = 'Please provide your signature. If using a mouse, left click in the signature box and hold while moving the mouse to draw your signature.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            }
        }
        if(formBoxKeyFob && !formHasKeyFob) {
            if (formAdultsRec) {
                if (!formAdultsRec.value) {
                    const errorMessage = 'Please list the names and ages of adults using the rec center.';
                    if (formErrorMessage) formErrorMessage.text = errorMessage;
                    return { valid: false };
                }
            }
            if (formDependentsRec) {
                if (!formDependentsRec.value) {
                    const errorMessage = 'Please list the names and ages of dependents using the rec center.';
                    if (formErrorMessage) formErrorMessage.text = errorMessage;
                    return { valid: false };
                }
            }
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

        if(formReservationDate) {
            if (!formReservationDate.value) {
                const errorMessage = 'Please select a reservation date.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            }
        }

        if(formStartTime) {
            if (!formStartTime.value) {
                const errorMessage = 'Please select the time when you would like your reservation to begin.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            }
        }   

        if(formTotalHours) {
            if (!formTotalHours.value) {
                const errorMessage = 'Please select the total hours for the pavilion reservation.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            }
        }   

        if(formGuestCount) {
            if (!formGuestCount.value) {
                const errorMessage = 'Please select expected guest count for the pavilion reservation.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
            }
        }   

        if(formPoolUse) {
            if (!formPoolUse.value) {
                const errorMessage = 'Please indicate whether you will be using the pool during your pavilion reservation.';
                if (formErrorMessage) formErrorMessage.text = errorMessage;
                return { valid: false };
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

        return { valid: true, fobNumbers };

    } catch (error) {
        console.error('Error in validateHoaForm:', error);
        if (formErrorMessage) formErrorMessage.text = 'Error validating form. Try again later.';
        return { valid: false };
    }
}
let itemToInsert = null;
// Function to submit HOA form without using the submit connection to the button in the Wix UI
async function submitHoaForm() {
    try {
        console.log('Submitting the form...');
        if (typeof formPropertyAddress.disable === 'function') formPropertyAddress.disable();
        // Hide any previous error messages
        formErrorMessage.text = '';
        
        // Validate required fields
        const firstName = formFirstName.value?.trim();
        const lastName = formLastName.value?.trim();
        const phone = formPhone.value?.trim();
        const email = formEmail.value?.trim();
        const signature = formSignature ? formSignature.value : null;
        const propertyAddress = formPropertyAddress.value;
        const adultsBox = formAdultsRec ? formAdultsRec.value : null;
        const dependentsBox = formDependentsRec ? formDependentsRec.value : null;
        const hasKeyFob = formHasKeyFob ? formHasKeyFob.value : null;

        // Use the extracted validation function; it must succeed before proceeding
        let fobNumbers = [];
        const validation = await validateHoaForm({ firstName, lastName, phone, email, signature, adultsBox, dependentsBox });
        if (!validation || !validation.valid) {
            return;
        }
        fobNumbers = validation.fobNumbers || [];

        // Merge any auto-selected SKUs (e.g. unit10) so they are added to cart even if user didn't check them
        if (autoSelectedProducts && autoSelectedProducts.length > 0) {
            if (!Array.isArray(selectedProducts)) selectedProducts = [selectedProducts];
            autoSelectedProducts.forEach(sku => {
                if (!selectedProducts.includes(sku)) selectedProducts.push(sku);
            });
            console.log('Final selected SKUs after merge with autoSelectedProducts:', selectedProducts, autoSelectedProducts);
        }

        console.log('Selected products to submit:', selectedProducts);

        itemToInsert = {
            "form_name": formName,
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
            "form_has_key_fob": hasKeyFob,
            "form_documents_signed": formDocumentLinks.join(', '), // Join all document links into a single string
            "form_rec_reserve_date": formReservationDate ? formReservationDate.value : null,
            "form_rec_reserve_time": formStartTime ? formStartTime.value : null,
            "form_rec_reserve_num_hours": formTotalHours ? formTotalHours.value : null,
            "form_rec_reserve_guest_number": formGuestCount ? formGuestCount.value : null,
            "form_pool_use": formPoolUse ? formPoolUse.value : null
        };
        // Insert the form record and capture the inserted id so we can attach it to the order
        try {
            const insertedItem = await wixData.insert(formCollectionName, itemToInsert);
            console.log("Item inserted successfully:", insertedItem);
            // Store the record id and collection for later inclusion in the order custom fields
            itemToInsert.form_record_id = insertedItem._id;
            itemToInsert.form_collection = formCollectionName;
        } catch (error) {
            console.error("Error inserting item:", error);
            // proceed without record id if insert failed
        }
     
        // Show success message before redirecting
        console.log('Form submitted successfully, adding to cart...');
        console.log('Final selectedProducts before addToCart:', selectedProducts);
        console.log('Products to add to cart:', productsToBuy);
        
        if (productsToBuy.length > 0) {
            // We no longer send the full sanitized payload, just store form_record_id & form_collection on itemToInsert
            await addToCart(productsToBuy);
        } else {
            console.warn('No valid products found via dynamic lookup, add to cart skipped...');
        }

        // ✅ Use Wix eCom frontend API instead of manual /cart URL
        console.log('Refreshing cart UI and navigating to cart page via wix-ecom-frontend...');

        try {
            // This syncs the cart UI (icon, side cart, etc.) with the backend cart
            await wixEcomFrontend.refreshCart();
            console.log('refreshCart completed successfully.');
        } catch (refreshErr) {
            console.warn('refreshCart failed, will still try to navigate to cart:', refreshErr);
        }

        try {
            await wixEcomFrontend.navigateToCartPage();
            console.log('navigateToCartPage completed. Browser should now be on the Cart page.');
        } catch (navErr) {
            console.error('navigateToCartPage failed:', navErr);
        }
        
    } catch (error) {
        console.error('Error in function submitHoaForm:', error);
        
        const errorMessage = 'Error submitting form. Please try again.';
        formErrorMessage.text = errorMessage;

    }
}
// ------------------------------------------ Add to cart functionality ------------------------------------------

// Function to add selected products to cart
async function addToCart(productsToBuy) {
    try {
        console.log('Adding products to cart:', productsToBuy);
        
        if (!productsToBuy || productsToBuy.length === 0) {
            console.warn('No products to add to cart');
            return;
        }

        const residentAddress = formPropertyAddress.value;
        console.log('Using residentAddress for customTextFields:', residentAddress);

        const productsToAdd = [];

        for (const product of productsToBuy) {
            if (!product.productId) {
                console.warn('Skipping product with missing productId:', product);
                continue;
            }

            const customFields = [];

            // Small, safe fields only
            if (residentAddress) {
                customFields.push({
                    title: 'residentAddress',
                    value: String(residentAddress).slice(0, 480)
                });
            }

            // Attach record id + collection so backend can fetch full document
            if (itemToInsert && itemToInsert.form_record_id) {
                customFields.push({
                    title: 'form_record_id',
                    value: String(itemToInsert.form_record_id)
                });
            }
            if (itemToInsert && itemToInsert.form_collection) {
                customFields.push({
                    title: 'form_collection',
                    value: String(itemToInsert.form_collection)
                });
            }

            const lineItemToAdd = {
                productId: product.productId,
                quantity: 1,
                options: {
                    customTextFields: customFields
                }
            };

            console.log('Prepared line item for cart:', lineItemToAdd);
            productsToAdd.push(lineItemToAdd);
        }

        if (!productsToAdd.length) {
            console.warn('No valid products to add to cart');
            return;
        }

        console.log('Products to add using wix-stores API:', productsToAdd);

        try {
            const updatedCart = await wixStores.cart.addProducts(productsToAdd);
            console.log("Products added to cart successfully with customTextFields. Updated cart:", updatedCart);
        } catch (storesError) {
            console.error("Error with wix-stores API, trying alternative method:", storesError);

            // Fallback: try adding products one by one
            for (const productToAdd of productsToAdd) {
                try {
                    const updatedCart = await wixStores.cart.addProducts([productToAdd]);
                    console.log(`Successfully added individual product ${productToAdd.productId}`, updatedCart);
                } catch (individualError) {
                    console.error(`Failed to add individual product ${productToAdd.productId}:`, individualError);
                }
            }
        }

    } catch (error) {
        console.error("Error adding products to cart:", error);
    }
}
