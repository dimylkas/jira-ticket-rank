document.addEventListener('DOMContentLoaded', init);

const exControls = {
  btnSetEnum: null,
  btnContinueEnumeration: null,
  btnApplyEnum: null,
  btnIdentifyTicket: null,
  btnClearEnumeration: null,
};

function init() {
  exControls.btnSetEnum = document.getElementById('btn-set-enumerate');
  exControls.btnContinueEnumeration = document.getElementById('btn-continue-enum');
  exControls.btnApplyEnum = document.getElementById('btn-apply-enumeration');
  exControls.btnIdentifyTicket = document.getElementById('btn-identify-ticket');
  exControls.btnClearEnumeration = document.getElementById('btn-clear-enum-list');

  initEventHandlers();
}

function initEventHandlers() {
  exControls.btnSetEnum.addEventListener('click', enumerateTickets);
  exControls.btnContinueEnumeration.addEventListener('click', continueEnumeration);
  exControls.btnApplyEnum.addEventListener('click', applyTicketEnumeration);
  exControls.btnIdentifyTicket.addEventListener('click', identifyTicket);
  exControls.btnClearEnumeration.addEventListener('click', clearEnumeration);
}

function isJiraStructure(callback) {
    const code = "!!document.getElementsByClassName('st-view').length && !document.getElementsByClassName('ghx-backlog-group').length";
  chrome.tabs.executeScript(
      null,
      { code },
      (isStructure) => callback(isStructure[0]),
  );
}

function enumerateTickets() {
  isJiraStructure((structure) => {
    // @description: For simple jira list
    let code = "" +
        "[].forEach.call(document.getElementsByClassName('js-key-link'), (el, i) => { el.insertAdjacentHTML('beforebegin', `<span class=\"jira-ticket-enumeration\" data-number=${i+1}>№: ${i+1} - </span>`)});";
    let getListEnumeration = "(() => [].map.call(document.getElementsByClassName('js-key-link'), (el, i) => el.innerText))();";

    if (structure) {
        const alertCode = '' +
            'var topCSS = document.querySelector(".cacheTable").style.top;' +
            'if (!topCSS || topCSS !== "0px") { alert("Be careful! Page scrolled down and listing for enumeration might not be correct. Better is scroll to top of the list and enumerate + use \'Continue\' bnt") }';

        chrome.tabs.executeScript(
            null,
            { code: alertCode }
        );
      // @description: For jira structure list
      code = "" +
          "[].forEach.call(document.querySelectorAll('.s-sema-inserted .s-f-issuekey'), (el, i) => { el.getElementsByClassName('s-item-link')[0].insertAdjacentHTML('beforebegin', `<span class=\"jira-ticket-enumeration\" data-number=${i+1}>№: ${i+1} - </span>`)});";

      getListEnumeration = "(() => [].map.call(document.querySelectorAll('.s-sema-inserted .s-f-issuekey'), (el, i) => el.getElementsByClassName('s-item-link')[0].innerText))();"
    } else {
        const loadAllIssues = ' ' +
            'if (document.getElementsByClassName("js-show-all-link").length) { document.getElementsByClassName("js-show-all-link")[0].click(); }' +
            'var waitForIssues = setInterval(() => { if (!document.getElementById("jira").classList.contains("ghx-loading-backlog")) { clearInterval(waitForIssues); return ' + code +' } }, 500)';

        code = loadAllIssues;
    }

    chrome.tabs.executeScript(
        null,
        { code },
        () => {
            chrome.tabs.executeScript(
                null,
                { code: getListEnumeration },
                (result) => {
                    chrome.storage.local.set({ list: result[0] });
                    window.close();
                }
            );
        }
    );
  });
}

// Find last element that were enumerated, and continue emuneration, (push new items to the saved list)
function continueEnumeration() {
    isJiraStructure((structure) => {
        if (!structure) {
            window.close();
        }

        const code = "" +
            "var enumList = document.querySelectorAll('.jira-ticket-enumeration');" +
            "if (enumList && enumList.length) {" +
                "var lastNum = +enumList[enumList.length - 1].getAttribute('data-number');" +
                "var filteredItems = [].filter.call(document.querySelectorAll('.s-sema-inserted .s-f-issuekey'), (el) => !el.getElementsByClassName('s-item-link')[0].parentElement.innerHTML.includes('jira-ticket-enumeration'));" +
                "[].forEach.call(filteredItems, (el, i) => { el.getElementsByClassName('s-item-link')[0].insertAdjacentHTML('beforebegin', `<span class='jira-ticket-enumeration' data-number=${ i + lastNum + 1}>№: ${ i + lastNum + 1} - </span>`)});" +
                "(() => [].map.call(filteredItems, (el, i) => el.getElementsByClassName('s-item-link')[0].innerText))();" +
            "}";

        chrome.tabs.executeScript(
            null,
            { code },
            (nextItems) => {
                if (nextItems && nextItems.length) {
                    chrome.storage.local.get(['list'], (result) => {
                        const newList = result.list.concat(nextItems[0]);
                        chrome.storage.local.set({ list: newList });
                    });
                }
                window.close();
            }
        )
    });
}

function applyTicketEnumeration() {
  isJiraStructure((structure) => {
    chrome.storage.local.get(['list'], (result) => {
      // @description: For simple jira list
      let code = '' +
          'var tmpList = ' + JSON.stringify(result.list) + ';' +
          '[].forEach.call(document.getElementsByClassName("js-key-link"), (el, i) => { el.insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.innerText) + 1} - </span>`)});';

      if (structure) {
        // @description: For jira structure list
        code = '' +
            'var tmpList = '+ JSON.stringify(result.list) + ';' +
            '[].forEach.call(document.querySelectorAll(".s-sema-inserted .s-f-issuekey"), (el, i) => { el.getElementsByClassName(\'s-item-link\')[0].insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.getElementsByClassName(\'s-item-link\')[0].innerText) + 1} - </span>`)});';
      }

      chrome.tabs.executeScript(
          null,
          { code },
          () => {
            window.close();
          }
      );
    });
  });
}

function identifyTicket() {
  chrome.storage.local.get(['list'], (result) => {
    const code = '' +
        'var tmpList = '+ JSON.stringify(result.list) + ';' +
        '[].forEach.call(document.getElementsByClassName("links-container")[0].getElementsByClassName("issue-link"), (el, i) => { el.insertAdjacentHTML(\'beforebegin\', `<span class=\"jira-ticket-enumeration\">№: ${tmpList.indexOf(el.innerText) + 1} - </span>`)});';

    chrome.tabs.executeScript(
      null,
      { code },
      () => { window.close(); }
    );
  });
}

function clearEnumeration() {
  const code = 'document.querySelectorAll(".jira-ticket-enumeration").forEach(el => el.remove());';
  chrome.tabs.executeScript(
      null,
      { code },
      () => { window.close(); }
  );
}
