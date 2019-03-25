
// Saves options to chrome.storage
function save_options() {
  let toSave = {
    hostname: document.getElementById('hostname').value,
    client_id: document.getElementById('client_id').value,
    client_secret: document.getElementById('client_secret').value,
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    whitepages_key: document.getElementById('whitepages_key').value
  };
  debugger;
  chrome.storage.sync.set(toSave, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get([
    'hostname',
    'client_id',
    'client_secret',
    'username',
    'password',
    'whitepages_key',
  ], function(items) {
    if (items != null && typeof items.hostname != "undefined")
    {
      document.getElementById('hostname').value = items.hostname;
      document.getElementById('client_id').value = items.client_id;
      document.getElementById('client_secret').value = items.client_secret;
      document.getElementById('username').value = items.username;
      document.getElementById('password').value = items.password;
      document.getElementById('whitepages_key').value = items.whitepages_key;
    }

  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
