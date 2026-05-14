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
  
  rules.forEach((rule, index) => {
    const baseId = (index + 1) * 10;

    // Rule 1 (Priority 3: Highest): ALLOW
    // If "authuser" is already in the query string, do nothing.
    newRules.push({
      id: baseId + 1,
      priority: 3,
      action: { type: 'allow' },
      condition: {
        urlFilter: `||${rule.domain}*authuser=*`,
        resourceTypes: ['main_frame']
      }
    });

    // Rule 2 (Priority 2: Medium): ALLOW
    // If we are already on a resolved user path (/u/...), do nothing.
    // This is crucial for preventing redirect loops in Drive/Gmail.
    newRules.push({
      id: baseId + 2,
      priority: 2,
      action: { type: 'allow' },
      condition: {
        urlFilter: `||${rule.domain}*/u/*`,
        resourceTypes: ['main_frame']
      }
    });

    // Rule 3 (Priority 1: Lowest): REDIRECT
    // If Rule 1 and Rule 2 didn't match (meaning no authuser and no /u/ path),
    // then redirect and add the authuser parameter.
    newRules.push({
      id: baseId + 3,
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
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules
    });
    console.log('Rules updated successfully:', newRules);
  } catch (error) {
    console.error('Failed to update rules:', error);
  }
}
