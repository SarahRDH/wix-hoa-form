import wixData from 'wix-data';

const RESIDENTS_COLLECTION = "Import1"; // <-- replace with your actual collection ID

// Helper: update payment_successful_date on the NEWEST matching form submission
async function updateCollectionPaymentDate(collectionId, residentAddress, paymentDate) {
    try {
        console.log(`Updating payment_successful_date in ${collectionId} for address:`, residentAddress);

        // Find newest record for this address (by _createdDate)
        const result = await wixData.query(collectionId)
            .eq("form_property_address", residentAddress)
            .descending("_createdDate")
            .limit(1)
            .find();

        if (!result.items.length) {
            console.log(`No records found in ${collectionId} for address:`, residentAddress);
            return;
        }

        const item = result.items[0];
        console.log(`Newest record in ${collectionId} for address ${residentAddress}:`, JSON.stringify(item, null, 2));

        item.payment_successful_date = paymentDate;

        const updated = await wixData.update(collectionId, item);
        console.log(`Updated newest record in ${collectionId} for address ${residentAddress}:`, JSON.stringify(updated, null, 2));

    } catch (err) {
        console.error(`Error updating newest record in ${collectionId} for address ${residentAddress}:`, err);
    }
}


/**
 * Runs when a Wix Stores order is marked as PAID.
 */
export async function wixStores_onOrderPaid(event) {
    console.log("=== wixStores_onOrderPaid FIRED ===");
    console.log("Event object (trimmed):", JSON.stringify({
        _id: event._id,
        status: event.status,
        lineItemsCount: event.lineItems && event.lineItems.length
    }, null, 2));

    try {
        console.log("Order ID:", event._id);
        console.log("Order status:", event.status);

        const lineItems = event.lineItems || [];
        console.log("Line items count:", lineItems.length);

        // 🔹 SKUs that represent HOA dues payments (for Residents.hoa_dues_paid)
        const HOA_DUES_SKUS = [
            "hoa-dues-tier-one",
            "hoa-and-rec-dues-bundle",
            "hoa-dues-tier-two",
            "hoa-dues-tier-three",
            "test-product-physical" // for testing purposes
        ];

        // 🔹 SKUs that represent Rec dues payments (for Residents.rec_dues_paid)
        const REC_DUES_SKUS = [
            "rec-center-non-resident",
            "rec-center-resident",
            "hoa-and-rec-dues-bundle", // bundle covers Rec dues too
            "test-product-physical" // for testing purposes
        ];

        // 🔹 SKUs that trigger payment_successful_date updates in each form collection
        const HOA_T1_T2_FORM_SKUS = [
            "hoa-dues-tier-one",
            "hoa-dues-tier-two"
        ];

        const HOA_T3_FORM_SKUS = [
            "hoa-dues-tier-three",
            "hoa-and-rec-dues-bundle",
            "test-product-physical" // for testing purposes
        ];

        const REC_MEMBER_FORM_SKUS = [
            "rec-center-non-resident",
            "rec-center-resident"
        ];

        const REC_KEY_FOB_FORM_SKUS = [
            "rec-key-fob"
        ];

        const PAVILION_FORM_SKUS = [
            "pavilion-2-hrs",
            "pavilion-4-hours",
            "pavilion-jumbo",
            "pavilion-jumbo-4-hours"
        ];

        let hoaDuesPurchased = false;
        let recDuesPurchased = false;

        let updateTier1and2Forms = false;
        let updateTier3Forms = false;
        let updateRecMemberForms = false;
        let updateKeyFobForms = false;
        let updatePavilionForms = false;

        let residentAddress = null;

        // 🔍 Inspect each line item
        lineItems.forEach((item, index) => {
            console.log(`-- Line item ${index + 1} --`);
            console.log("Product ID:", item.productId);
            console.log("item.sku:", item.sku);
            console.log("item.physicalProperties:", JSON.stringify(item.physicalProperties, null, 2));
            console.log("item.customTextFields:", JSON.stringify(item.customTextFields, null, 2));
            console.log("item.options:", JSON.stringify(item.options, null, 2));
        });

        // 🔍 Scan line items: figure out which SKUs were bought + find residentAddress
        for (const item of lineItems) {
            const sku =
                (item.sku ||
                (item.physicalProperties && item.physicalProperties.sku) ||
                "").trim();

            if (sku) {
                // ---- Flags for Residents collection ----
                if (HOA_DUES_SKUS.includes(sku)) {
                    hoaDuesPurchased = true;
                }
                if (REC_DUES_SKUS.includes(sku)) {
                    recDuesPurchased = true;
                }

                // ---- Flags for form collections ----
                if (HOA_T1_T2_FORM_SKUS.includes(sku)) {
                    updateTier1and2Forms = true;
                }
                if (HOA_T3_FORM_SKUS.includes(sku)) {
                    updateTier3Forms = true;
                }
                if (REC_MEMBER_FORM_SKUS.includes(sku)) {
                    updateRecMemberForms = true;
                }
                if (REC_KEY_FOB_FORM_SKUS.includes(sku)) {
                    updateKeyFobForms = true;
                }
                if (PAVILION_FORM_SKUS.includes(sku)) {
                    updatePavilionForms = true;
                }
            }

            // ---- residentAddress from customTextFields ----
            const topLevelFields = item.customTextFields || [];
            const optionFields =
                (item.options && item.options.customTextFields) || [];

            const allFields = [...topLevelFields, ...optionFields];

            const addressField = allFields.find(
                (f) => f && f.title === "residentAddress" && f.value
            );

            if (addressField) {
                residentAddress = addressField.value;
                console.log("FOUND residentAddress in order:", residentAddress);
                // don't break; keep scanning SKUs in other items
            }
        }

        console.log("hoaDuesPurchased:", hoaDuesPurchased);
        console.log("recDuesPurchased:", recDuesPurchased);
        console.log("updateTier1and2Forms:", updateTier1and2Forms);
        console.log("updateTier3Forms:", updateTier3Forms);
        console.log("updateRecMemberForms:", updateRecMemberForms);
        console.log("updateKeyFobForms:", updateKeyFobForms);
        console.log("updatePavilionForms:", updatePavilionForms);

        if (!residentAddress) {
            console.warn(
                "⚠ No residentAddress found in lineItems.customTextFields or options.customTextFields."
            );
            return;
        }

        // If NO dues-related products were purchased, skip Residents update (but we might still update forms)
        if (!hoaDuesPurchased && !recDuesPurchased &&
            !updateTier1and2Forms && !updateTier3Forms &&
            !updateRecMemberForms && !updateKeyFobForms &&
            !updatePavilionForms) {
            console.log(
                "No HOA or Rec-related products in this order; skipping all updates."
            );
            return;
        }

        // Use either the gateway's timestamp if available, or current server time
        const paymentDate = new Date(); // you can also use new Date(event._createdDate) if present
        console.log("Using paymentDate:", paymentDate.toISOString());

        // ---------------- Update Residents collection (hoa_dues_paid / rec_dues_paid) ----------------
        if (hoaDuesPurchased || recDuesPurchased) {
            const queryResult = await wixData.query(RESIDENTS_COLLECTION)
                .eq("full_address", residentAddress) 
                .find();

            console.log("Residents query results:", JSON.stringify(queryResult.items, null, 2));

            if (!queryResult.items.length) {
                console.warn("⚠ No resident found with address:", residentAddress);
            } else {
                const resident = queryResult.items[0];
                console.log("Resident found:", JSON.stringify(resident, null, 2));

                if (hoaDuesPurchased) {
                    resident.hoa_dues_paid = true;
                }
                if (recDuesPurchased) {
                    resident.rec_dues_paid = true;
                }

                console.log("Updating resident with:", {
                    hoa_dues_paid: resident.hoa_dues_paid,
                    rec_dues_paid: resident.rec_dues_paid
                });

                const updatedResident = await wixData.update(RESIDENTS_COLLECTION, resident);
                console.log("Resident update successful:", JSON.stringify(updatedResident, null, 2));
            }
        }

        // ---------------- Update form collections with payment_successful_date ----------------
        const updates = [];

        if (updateTier1and2Forms) {
            updates.push(
                updateCollectionPaymentDate("formSubsHoaDuesTier1and2", residentAddress, paymentDate)
            );
        }

        if (updateTier3Forms) {
            updates.push(
                updateCollectionPaymentDate("FormSubsHoaDuesTier3", residentAddress, paymentDate)
            );
        }

        if (updateRecMemberForms) {
            updates.push(
                updateCollectionPaymentDate("formSubsRecMember", residentAddress, paymentDate)
            );
        }

        if (updateKeyFobForms) {
            updates.push(
                updateCollectionPaymentDate("formSubsRecNewKeyFob", residentAddress, paymentDate)
            );
        }

        if (updatePavilionForms) {
            updates.push(
                updateCollectionPaymentDate("formSubsRecReservePavilion", residentAddress, paymentDate)
            );
        }

        if (updates.length > 0) {
            console.log("Running form collection updates...");
            await Promise.all(updates);
        } else {
            console.log("No form collection updates needed for this order.");
        }

        console.log("=== FINISHED wixStores_onOrderPaid SUCCESSFULLY ===");

    } catch (err) {
        console.error("❌ Error inside wixStores_onOrderPaid:", err);
        console.log("=== wixStores_onOrderPaid FAILED ===");
    }
}
