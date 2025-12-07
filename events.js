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

        let residentAddress = null;

        // 🔍 Inspect each line item
        lineItems.forEach((item, index) => {
            console.log(`-- Line item ${index + 1} --`);
            console.log("Product ID:", item.productId);
            console.log("item.customTextFields:", JSON.stringify(item.customTextFields, null, 2));
            console.log("item.options:", JSON.stringify(item.options, null, 2));
        });

        // 🔍 Look for the residentAddress in both locations for safety
        for (const item of lineItems) {
            const topLevelFields = item.customTextFields || [];
            const optionFields = (item.options && item.options.customTextFields) || [];

            const allFields = [...topLevelFields, ...optionFields];

            const addressField = allFields.find(
                f => f && f.title === "residentAddress" && f.value
            );

            if (addressField) {
                residentAddress = addressField.value;
                console.log("FOUND residentAddress in order:", residentAddress);
                break;
            }
        }

        if (!residentAddress) {
            console.warn("⚠ No residentAddress found in lineItems.customTextFields or options.customTextFields.");
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

        // Update dues status
        resident.hoa_dues_paid = true;

        console.log("Updating resident record with hoa_dues_paid = true");

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
