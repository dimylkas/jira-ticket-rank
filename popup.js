document.addEventListener('DOMContentLoaded', () => {

  const btnSetEnumeration = document.getElementById('btn-set-enumerate');
  const btnApplyEnumeration = document.getElementById('btn-apply-enumeration');
  const cbxAdvancedSettings = document.getElementById('cbx-advanced-settings');

  btnSetEnumeration.addEventListener('click', enumerateTickets);

  btnApplyEnumeration.addEventListener('click', applyTicketEnumeration);

  cbxAdvancedSettings.addEventListener('change', (event) => {
    const settingsDiv = document.getElementsByClassName('advanced-settings');
    if (event.target.checked) {
      settingsDiv[0].classList.remove('hide');
    } else {
      settingsDiv[0].classList.add('hide');
    }
  });
});

function enumerateTickets() {
  chrome.tabs.executeScript(
    null,
    {
      code: "var list = [].map.call(document.getElementsByClassName('js-key-link'), (el, i) => el.innerText); [].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.innerText = `№: ${i+1} - ${el.innerText}` });"
    }
  );
  window.close();
}

function applyTicketEnumeration() {
  chrome.tabs.executeScript(
    null,
    {
      code: "[].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.innerText = `№: ${list.indexOf(el.innerText) + 1} - ${el.innerText}` });"
    }
  );
  window.close();
}
