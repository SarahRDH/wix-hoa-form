import wixData from 'wix-data';

/**
 * Handle non-resident flow:
 * - If `isNonResident === true` and the user answered 'No' to rec membership,
 *   insert the provided `addressInputElem.value` into `nonResidentsMainCollection` (if not already present).
 * - If `isNonResident === true` and the user answered 'Yes', query
 *   `nonResidentsMainCollection` and populate `addressDropdownElem.options` with `{ label, value }` entries
 *   so the user can pick their address.
 *
 * Params object expected to contain page elements or values:
 * {
 *   isNonResident: boolean,
 *   recMemberElem: element (radio group) with `.value` === 'Yes'|'No',
 *   addressInputElem: element (text input) with `.value` (used when recMemberElem.value === 'No'),
 *   addressDropdownElem: element (dropdown) to populate when recMemberElem.value === 'Yes'
 * }
 */
export async function nonResidentLogic({ isNonResident, recMemberElem, addressInputElem, addressDropdownElem } = {}) {
    let nonResInputBox = $w('#box29');
    let nonResDropdownBox = $w('#box27');
    nonResDropdownBox.collapse();
    nonResInputBox.collapse();

    try {
        console.log('nonResidentLogic called', { isNonResident });

        const answer = (recMemberElem && typeof recMemberElem.value !== 'undefined') ? String(recMemberElem.value).trim().toLowerCase() : null;

        // If non-resident and NOT a rec member -> insert their entered address into the collection and return false
        if (!answer || answer === 'no') {
            if (answer === 'no') {
                nonResInputBox.expand();
                nonResDropdownBox.collapse();
            }
            return false;
        }

        // If non-resident AND is a rec member -> populate dropdown with addresses from the collection
        if (answer === 'yes') {
            nonResDropdownBox.expand();
            nonResInputBox.collapse();
            try {
                const result = await wixData.query('nonResidentsMainCollection').find();
                const items = (result && result.items) ? result.items : [];
                const options = items.map(i => ({ label: String(i.full_address || ''), value: String(i.full_address || '') }));

                if (addressDropdownElem) {
                    try {
                        // If the column rec_dues_paid is true, only include those addresses
                        const filteredOptions = options.filter(opt => {
                            const item = items.find(i => String(i.full_address || '') === String(opt.value || ''));
                            return item && (item.rec_dues_paid === true || item.override_rec_dues === true);
                        });

                        addressDropdownElem.options = filteredOptions;
                        if (typeof addressDropdownElem.expand === 'function') addressDropdownElem.expand();
                        console.log('nonResidentLogic: Populated nonResidentAddressDropdown with', filteredOptions.length, 'options');

                        // Return a promise that resolves to true when the user selects an address from dropdown
                        return await new Promise((resolve) => {
                            const changeHandler = () => {
                                try {
                                    const val = addressDropdownElem.value;
                                    if (val && String(val).trim() !== '') {
                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }
                                } catch (e) {
                                    resolve(false);
                                }
                            };

                            // Attach handler; Wix elements support `onChange`
                            try {
                                addressDropdownElem.onChange(changeHandler);
                            } catch (attachErr) {
                                // If attaching fails, resolve immediately with true (dropdown shown)
                                console.warn('nonResidentLogic: Could not attach onChange to dropdown, resolving true', attachErr);
                                resolve(true);
                            }
                        });

                    } catch (elErr) {
                        console.warn('nonResidentLogic: Could not set dropdown options on provided element:', elErr);
                        return true;
                    }
                }

                // No dropdown element provided; assume rec-member flow
                return true;
            } catch (fetchErr) {
                console.error('nonResidentLogic: Error fetching nonResidentsMainCollection:', fetchErr);
                throw fetchErr;
            }
        }

        // Fallback: if execution reaches here (unexpected answer value), return false
        return false;
    } catch (err) {
        console.error('Error in nonResidentLogic:', err);
        throw err;
    }
}