function extractArticles() {
  const articles = [];
  const articleElements = document.querySelectorAll('.entry-list>.item');
  
  articleElements.forEach((element, index) => {
    if (index >= 10) return;
    
    try {
      const title = element.querySelector('.jj-link.title')?.textContent?.trim() || '';
      const summary = element.querySelector('.abstract')?.textContent?.trim() || '';
      const author = element.querySelector('.user-message')?.textContent?.trim() || '';
      const views = element.querySelector('.item.view span')?.textContent?.trim() || '';
      const likes = element.querySelector('.item.like span')?.textContent?.trim() || '';
      
      articles.push({ title, summary, author, views, likes });
    } catch (e) {
      console.error('提取文章数据失败:', e);
    }
  });
  
  return articles;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const articles = extractArticles();
    sendResponse({ success: true, data: articles, url: window.location.href });
  }
});
