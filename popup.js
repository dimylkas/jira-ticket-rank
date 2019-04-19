document.addEventListener('DOMContentLoaded', init);

const exControls = {
  btnSetEnum: null,
  btnApplyEnum: null,
  btnIdentifyTicket: null,
};

function init() {
  exControls.btnSetEnum = document.getElementById('btn-set-enumerate');
  exControls.btnApplyEnum = document.getElementById('btn-apply-enumeration');
  exControls.btnIdentifyTicket = document.getElementById('btn-identify-ticket');

  initEventHandlers();
}

function initEventHandlers() {
  exControls.btnSetEnum.addEventListener('click', enumerateTickets);
  exControls.btnApplyEnum.addEventListener('click', applyTicketEnumeration);
  exControls.btnIdentifyTicket.addEventListener('click', identifyTicket);
}

function enumerateTickets() {
  chrome.tabs.executeScript(
    null,
    {
      code: "[].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.insertAdjacentHTML('beforebegin', `<span class=\"jira-ticket-enumeration\">№: ${i+1} - </span>`)}); (() => [].map.call(document.getElementsByClassName('js-key-link'), (el, i) => el.innerText))();"
    },
    (result) => {
      chrome.storage.local.set({ list: result[0] });
      window.close();
    }
  );
}

function applyTicketEnumeration() {
  chrome.storage.local.get(['list'], (result) => {
    chrome.tabs.executeScript(
      null,
      {
        code: 'var tmpList = '+ JSON.stringify(result.list) + '; [].forEach.call(document.getElementsByClassName("js-key-link"), (el, i) => { el.insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.innerText) + 1} - </span>`)});'
      },
      () => { window.close(); }
    );
  });
}

function identifyTicket() {
  chrome.storage.local.get(['list'], (result) => {
    chrome.tabs.executeScript(
      null,
      {
        code: 'var tmpList = '+ JSON.stringify(result.list) + '; [].forEach.call(document.getElementsByClassName("links-container")[0].getElementsByClassName("issue-link"), (el, i) => { el.insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.innerText) + 1} - </span>`)});'
      },
      () => { window.close(); }
    );
  });
}
