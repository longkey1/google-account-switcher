const ruleForm = document.getElementById('rule-form');
const rulesList = document.getElementById('rules-list');
const domainInput = document.getElementById('domain');

// Load rules on startup
document.addEventListener('DOMContentLoaded', loadRules);

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    domainInput.value = btn.getAttribute('data-domain');
  });
});

ruleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let domain = document.getElementById('domain').value.trim();
  const account = document.getElementById('account').value.trim();

  // Sanitize domain: remove protocol and trailing slashes
  domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (domain && account) {
    addRule(domain, account);
    ruleForm.reset();
  }
});

function loadRules() {
  chrome.storage.sync.get(['rules'], (result) => {
    const rules = result.rules || [];
    renderRules(rules);
  });
}

function addRule(domain, account) {
  chrome.storage.sync.get(['rules', 'nextId'], (result) => {
    const rules = result.rules || [];
    const nextId = result.nextId || 1;

    const newRule = {
      id: nextId,
      domain: domain,
      account: account
    };

    rules.push(newRule);
    chrome.storage.sync.set({ rules: rules, nextId: nextId + 1 }, () => {
      renderRules(rules);
    });
  });
}

function deleteRule(id) {
  chrome.storage.sync.get(['rules'], (result) => {
    const rules = result.rules || [];
    const updatedRules = rules.filter(rule => rule.id !== id);
    chrome.storage.sync.set({ rules: updatedRules }, () => {
      renderRules(updatedRules);
    });
  });
}

function renderRules(rules) {
  rulesList.innerHTML = '';
  rules.forEach((rule) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(rule.domain)}</td>
      <td>${escapeHtml(rule.account)}</td>
      <td>
        <button class="delete-btn" data-id="${rule.id}">Delete</button>
      </td>
    `;
    rulesList.appendChild(tr);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      deleteRule(id);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
