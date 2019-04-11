document.addEventListener('DOMContentLoaded', () => {

  const btn = document.getElementById('btn-set-enumerate');
  btn.addEventListener('click', enumerateTickets);

  const cbx = document.getElementById('cbx-advanced-settings');
  cbx.addEventListener('change', (event) => {
    const settingsDiv = document.getElementsByClassName('advanced-settings');
    if (event.target.checked) {
      settingsDiv[0].classList.remove('hide');
    } else {
      settingsDiv[0].classList.add('hide');
    }
  })
});

function enumerateTickets() {
  chrome.tabs.executeScript(
    null,
    {
      code: "[].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.innerText = `№: ${i+1} - ${el.innerText}` });"
    }
  );
  window.close();
}

