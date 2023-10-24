chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    const messagePromise = chrome.tabs.sendMessage(tab.id ?? 0, "clickAction")
    messagePromise
        .then((response) => {console.log(response)})
        .catch((err) => {console.error(err)});
    return true;
});