let collectedData = [];
let currentIndex = 0;

const urls = [
  'https://juejin.cn/following',
  'https://juejin.cn/recommended',
  'https://juejin.cn/backend',
  'https://juejin.cn/frontend',
  'https://juejin.cn/android',
  'https://juejin.cn/ios',
  'https://juejin.cn/ai',
  'https://juejin.cn/freebie'
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScraping') {
    collectedData = [];
    currentIndex = 0;
    scrapeNextUrl();
    sendResponse({ success: true });
  } else if (request.action === 'getData') {
    sendResponse({ data: collectedData, currentIndex, totalUrls: urls.length });
  }
});

function scrapeNextUrl() {
  if (currentIndex >= urls.length) return;
  
  const url = urls[currentIndex];
  
  chrome.tabs.create({ url: url, active: false }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
        if (response && response.success) {
          collectedData.push({ sourceUrl: response.url, articles: response.data });
        }
        
        chrome.tabs.remove(tab.id);
        currentIndex++;
        
        if (currentIndex < urls.length) {
          setTimeout(scrapeNextUrl, 1000);
        }
      });
    }, 3000);
  });
}
