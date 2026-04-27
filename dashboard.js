import wixData from 'wix-data';
$w('#box2').collapse();
// One sort state per selection tags control
const sortStates = {};

// Configuration for each sortable table/dataset pair
const sortConfigs = {
  selectionTags6: {
    selectionTagsId: '#selectionTags6',
    datasetId: '#dataset1',
    defaultField: 'street_name'
  },
  selectionTags5: {
    selectionTagsId: '#selectionTags5',
    datasetId: '#dataset3',
    defaultField: 'last_name'
  },
  selectionTags4: {
    selectionTagsId: '#selectionTags4',
    datasetId: '#dataset2',
    defaultField: 'last_name'
  },
  selectionTags3: {
    selectionTagsId: '#selectionTags3',
    datasetId: '#dataset4',
    defaultField: 'last_name'
  },
  selectionTags2: {
    selectionTagsId: '#selectionTags2',
    datasetId: '#dataset5',
    defaultField: 'last_name'
  },
  selectionTags7: {
    selectionTagsId: '#selectionTags7',
    datasetId: '#dataset6',
    defaultField: 'last_name'
  }
};

$w.onReady(() => {
  Object.keys(sortConfigs).forEach((key) => {
    setupSortableSelectionTags(key, sortConfigs[key]);
  });
});

/**
 * Sets up one selection tags control + dataset pair
 */
function setupSortableSelectionTags(configKey, config) {
  sortStates[configKey] = {
    field: null,
    ascending: true
  };

  // Optional default sort on page load
  applySort(configKey, config.defaultField);

  $w(config.selectionTagsId).onChange((event) => {
    let selectedField = event.target.value;

    // Safety for multi-select mode
    if (Array.isArray(selectedField)) {
      selectedField = selectedField[0];
    }

    if (!selectedField) {
      return;
    }

    applySort(configKey, selectedField);
  });
}

/**
 * Applies sort for one specific dataset/controller pair
 */
function applySort(configKey, field) {
  const config = sortConfigs[configKey];
  const state = sortStates[configKey];

  if (!config || !state) {
    return;
  }

  // Toggle direction if same field selected again
  if (state.field === field) {
    state.ascending = !state.ascending;
  } else {
    state.field = field;
    state.ascending = true;
  }

  let sort = wixData.sort();

  sort = state.ascending
    ? sort.ascending(field)
    : sort.descending(field);

  $w(config.datasetId).setSort(sort);
  countCurrentViewResults();
}


const DATASETS = {
  residentsDataset: '#dataset1'
};

const COLLECTIONS = {
  recAndHoaForms: 'FormSubsHoaDuesTier3',
  recForms: 'formSubsRecMember'
};

$w.onReady(() => {
  countCurrentViewResults();
  countOtherTablesResults();

  $w('#dropdown6').onChange(async (event) => {
    countCurrentViewResults() 
  });
  $w('#dropdown8').onChange(async (event) => {
    countCurrentViewResults() 
  });
  $w('#dropdown9').onChange(async (event) => {
    countCurrentViewResults() 
  });

  $w('#radioGroup1').onChange(async (event) => {
    const selectedView = event.target.value;

    if (selectedView === 'viewAll') {
      await showViewAll();
    }

    if (selectedView === 'registeredForRec') {
      await showRegisteredForRec();
    }

    if (selectedView === 'isHoaMember') {
      await showHoaMembers();
    }

    if (selectedView === 'isRecMember') {
      await showRecMembers();
    }

    countCurrentViewResults();
  });
});

/**
 * View All
 */
async function showViewAll() {
  await $w(DATASETS.residentsDataset).setFilter(
    wixData.filter()
  );
}

/**
 * Registered for Rec (based on form collections)
 */
async function showRegisteredForRec() {
  const registeredAddresses = await getRegisteredRecAddresses();

  if (registeredAddresses.length === 0) {
    await showNoRows();
    return;
  }

  await $w(DATASETS.residentsDataset).setFilter(
    wixData.filter().hasSome('full_address', registeredAddresses)
  );
}

/**
 * HOA Members
 */
async function showHoaMembers() {
  await $w(DATASETS.residentsDataset).setFilter(
    wixData.filter()
      .eq('hoa_dues_paid', true)
      .or(wixData.filter().eq('override_hoa_dues', true))
      .or(wixData.filter().isNotEmpty('hoa_dues_paid_date'))
  );
}

/**
 * REC Members 
 */
async function showRecMembers() {
  await $w(DATASETS.residentsDataset).setFilter(
    wixData.filter()
      .eq('rec_dues_paid', true)
      .or(wixData.filter().eq('override_rec_dues', true))
  );
}

/**
 * No rows fallback
 */
async function showNoRows() {
  await $w(DATASETS.residentsDataset).setFilter(
    wixData.filter().eq('_id', 'NO_MATCHES')
  );
}

/**
 * Fresh query every time (no cache)
 */
async function getRegisteredRecAddresses() {
  const [recAndHoaResult, recResult] = await Promise.all([
    wixData.query(COLLECTIONS.recAndHoaForms)
      .isNotEmpty('form_property_address')
      .limit(1000)
      .find(),

    wixData.query(COLLECTIONS.recForms)
      .isNotEmpty('form_property_address')
      .limit(1000)
      .find()
  ]);

  const addresses = [
    ...recAndHoaResult.items,
    ...recResult.items
  ]
    .map(item => item.form_property_address)
    .filter(Boolean);

  return [...new Set(addresses)];
}

// count the number of rows with addresses in the current dataset view and display it
async function countCurrentViewResults() {

  const currentItems = await $w(DATASETS.residentsDataset).getItems(0, 1000);
  const results = currentItems.items.filter(item => item.full_address);

  const resultsText = $w('#text150');
  resultsText.text = `Found ${results.length} results`;
}

// count the number of rows with addresses in the other tables and display it
async function countOtherTablesResults() {
  const otherDatasets = ['#dataset2', '#dataset3', '#dataset4', '#dataset5', '#dataset6', '#dataset7', '#dataset8', '#dataset9'];
  let count = 0;
  const textFields = {
    '#dataset3': '#text151',
    '#dataset2': '#text152',
    '#dataset4': '#text153',
    '#dataset5': '#text154',
    '#dataset6': '#text155',
    '#dataset7': '#text156',
    '#dataset8': '#text157',
    '#dataset9': '#text158'
  };

  for (const datasetId of otherDatasets) {
    const numEntriesText = $w(textFields[datasetId]);
    const items = await $w(datasetId).getItems(0, 1000);

    if (items.items.length > 1) {
      count = items.items.filter(item => item._updatedDate).length;
      numEntriesText.text = `(${count} entries)`;
    } else if (items.items.length === 1) {
      numEntriesText.text = `(1 entry)`;
    } else {
      numEntriesText.text = `(0 entries)`;
    }
  }

}

$w('#text159').onClick($w('#box2').collapse);
$w('#button12').onClick($w('#box2').expand);