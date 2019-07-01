document.addEventListener('DOMContentLoaded', init);

const exControls = {
  btnSetEnum: null,
  btnApplyEnum: null,
  btnIdentifyTicket: null,
  btnClearEnumeration: null,
};

function init() {
  exControls.btnSetEnum = document.getElementById('btn-set-enumerate');
  exControls.btnApplyEnum = document.getElementById('btn-apply-enumeration');
  exControls.btnIdentifyTicket = document.getElementById('btn-identify-ticket');
  exControls.btnClearEnumeration = document.getElementById('btn-clear-enum-list');

  initEventHandlers();
}

function initEventHandlers() {
  exControls.btnSetEnum.addEventListener('click', enumerateTickets);
  exControls.btnApplyEnum.addEventListener('click', applyTicketEnumeration);
  exControls.btnIdentifyTicket.addEventListener('click', identifyTicket);
  exControls.btnClearEnumeration.addEventListener('click', clearEnumeration);
}

function isJiraStructure(callback) {
  chrome.tabs.executeScript(
      null,
      {
        code: "!!document.getElementsByClassName('s-f-issuekey').length;"
      },
      (isStructure) => {
        return callback(isStructure[0]);
      }
  );
}

function enumerateTickets() {
  isJiraStructure((structure) => {
    // @description: For simple jira list
    let code = "[].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.insertAdjacentHTML('beforebegin', `<span class=\"jira-ticket-enumeration\">№: ${i+1} - </span>`)}); (() => [].map.call(document.getElementsByClassName('js-key-link'), (el, i) => el.innerText))();"

    if (structure) {
      // @description: For jira structure list
      code = "[].forEach.call(document.getElementsByClassName('s-f-issuekey'), (el, i) => { el.getElementsByClassName('s-item-link')[0].insertAdjacentHTML('beforebegin', `<span class=\"jira-ticket-enumeration\">№: ${i+1} - </span>`)}); (() => [].map.call(document.getElementsByClassName('s-f-issuekey'), (el, i) => el.getElementsByClassName('s-item-link')[0].innerText))();"
    }

    chrome.tabs.executeScript(null,
        {
          code,
        },
        (result) => {
          chrome.storage.local.set({ list: result[0] });
        }
    );

    window.close();
  });
}

function applyTicketEnumeration() {
  isJiraStructure((structure) => {
    chrome.storage.local.get(['list'], (result) => {
      // @description: For simple jira list
      let code = 'var tmpList = '+ JSON.stringify(result.list) + '; [].forEach.call(document.getElementsByClassName("js-key-link"), (el, i) => { el.insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.innerText) + 1} - </span>`)});';

      if (structure) {
        // @description: For jira structure list
        code = 'var tmpList = '+ JSON.stringify(result.list) + '; [].forEach.call(document.getElementsByClassName("s-f-issuekey"), (el, i) => { el.getElementsByClassName(\'s-item-link\')[0].insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.getElementsByClassName(\'s-item-link\')[0].innerText) + 1} - </span>`)});';
      }

      chrome.tabs.executeScript(
          null,
          {
            code,
          },
          () => {
            window.close();
          }
      );
    });
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

function clearEnumeration() {
  chrome.tabs.executeScript(null,
      {
        code: 'document.querySelectorAll(".jira-ticket-enumeration").forEach(el => el.remove());',
      },
      () => { window.close(); }
  );
}
