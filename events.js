import wixData from 'wix-data';

/**
 * Runs when a Wix Stores order is marked as PAID.
 */
export async function wixStores_onOrderPaid(event) {
    console.log("=== wixStores_onOrderPaid FIRED ===");
    console.log("Event object:", JSON.stringify(event, null, 2));

    try {
        console.log("Order ID:", event._id);
        console.log("Order status:", event.status);

        const lineItems = event.lineItems || [];
        console.log("Line items count:", lineItems.length);

        // 🔹 SKUs that represent HOA dues payments
        const HOA_DUES_SKUS = [
            "hoa-dues-tier-one",
            "hoa-and-rec-dues-bundle",
            "hoa-dues-tier-two",
            "hoa-dues-tier-three",
            "test-product-physical" // for testing purposes
        ];

        // 🔹 SKUs that represent Rec dues payments
        // (Includes the bundle, since it covers Rec dues too)
        const REC_DUES_SKUS = [
            "rec-center-non-resident",
            "rec-center-resident",
            "hoa-and-rec-dues-bundle",
            "test-product-physical" // for testing purposes
        ];

        let hoaDuesPurchased = false;
        let recDuesPurchased = false;


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

        // 🔍 Scan line items to:
        //   1) Find residentAddress from customTextFields
        //   2) See which dues products were purchased (by SKU)
        for (const item of lineItems) {
            // ---- 1) SKU-based logic ----
            const sku =
                (item.sku ||
                (item.physicalProperties && item.physicalProperties.sku) ||
                "").trim();

            if (sku) {
                if (HOA_DUES_SKUS.includes(sku)) {
                    hoaDuesPurchased = true;
                }
                if (REC_DUES_SKUS.includes(sku)) {
                    recDuesPurchased = true;
                }
            }

            // ---- 2) residentAddress from customTextFields ----
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
                // don't break here; we still want to see other SKUs
            }
        }

        console.log("hoaDuesPurchased:", hoaDuesPurchased);
        console.log("recDuesPurchased:", recDuesPurchased);

        if (!residentAddress) {
            console.warn(
                "⚠ No residentAddress found in lineItems.customTextFields or options.customTextFields."
            );
            return;
        }

        // If no dues-related products were purchased, skip updating the Residents collection
        if (!hoaDuesPurchased && !recDuesPurchased) {
            console.log(
                "No HOA or Rec dues products in this order; skipping Residents update."
            );
            return;
        }

        console.log("Searching Residents Main database for address:", residentAddress);

        // Query your Residents Main collection
        const queryResult = await wixData
            .query("Import1")
            .eq("full_address", residentAddress)
            .find()
            .catch(err => {
                console.error("Database query error:", err);
                throw err;
            });

        console.log("Query results:", JSON.stringify(queryResult.items, null, 2));

        if (!queryResult.items.length) {
            console.warn("⚠ No resident found with address:", residentAddress);
            return;
        }

        const resident = queryResult.items[0];
        console.log("Resident found:", JSON.stringify(resident, null, 2));

        // ✅ Only flip the flags that correspond to what was purchased
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

        const updatedRecord = await wixData
        .update("Import1", resident)
        .catch(err => {
            console.error("❌ Error updating resident:", err);
            throw err;
        });

        console.log("Update successful. Updated record:", JSON.stringify(updatedRecord, null, 2));
        console.log("=== FINISHED wixStores_onOrderPaid SUCCESSFULLY ===");

    } catch (err) {
        console.error("❌ Error inside wixStores_onOrderPaid:", err);
        console.log("=== wixStores_onOrderPaid FAILED ===");
    }
}
