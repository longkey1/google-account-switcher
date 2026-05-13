// Initialize rules when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  updateAllRules();
});

// Listen for storage changes to update rules dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.rules) {
    updateAllRules();
  }
});

async function updateAllRules() {
  const result = await chrome.storage.sync.get(['rules']);
  const rules = result.rules || [];

  // Get current dynamic rules to remove them
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(rule => rule.id);

  // Generate new rules
  const newRules = rules.map(rule => ({
    id: rule.id,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        transform: {
          queryTransform: {
            addOrReplaceParams: [
              { key: 'authuser', value: rule.account }
            ]
          }
        }
      }
    },
    condition: {
      urlFilter: `||${rule.domain}`,
      resourceTypes: ['main_frame']
    }
  }));

  // Update rules: remove all old ones and add new ones
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules
  });

  console.log('Rules updated:', newRules);
}
