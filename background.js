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

  const newRules = [];
  
  rules.forEach(rule => {
    // 1. Exclusion Rule (Higher Priority): 
    // Do nothing if "authuser" is already present in the query string (respect existing choice)
    // or if the URL already contains "/u/" (resolved user path).
    newRules.push({
      id: rule.id * 2,
      priority: 2,
      action: { type: 'allow' },
      condition: {
        urlFilter: `||${rule.domain}`,
        resourceTypes: ['main_frame'],
        // Skip redirection if any "authuser" is present or path is resolved
        queryParameters: [{ key: 'authuser' }],
      }
    });

    newRules.push({
      id: rule.id * 2 + 1,
      priority: 2,
      action: { type: 'allow' },
      condition: {
        urlFilter: `||${rule.domain}*/u/*`,
        resourceTypes: ['main_frame']
      }
    });

    // 2. Redirect Rule (Lower Priority):
    // Only add "authuser" if it's completely missing and we're not on a resolved path.
    newRules.push({
      id: rule.id * 1000 + rule.id, // Ensure unique ID
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
    });
  });

  // Update rules: remove all old ones and add new ones
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules
  });

  console.log('Rules updated:', newRules);
}
