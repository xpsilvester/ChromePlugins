const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const progressFill = document.getElementById('progressFill');
const exportBtn = document.getElementById('exportBtn');

let isScraping = false;
let updateInterval = null;

startBtn.addEventListener('click', () => {
  if (isScraping) return;
  
  isScraping = true;
  startBtn.disabled = true;
  exportBtn.disabled = true;
  statusDiv.textContent = '正在爬取数据...';
  progressFill.style.width = '0%';
  
  chrome.runtime.sendMessage({ action: 'startScraping' }, (response) => {
    if (response?.success) {
      updateInterval = setInterval(updateProgress, 500);
    }
  });
});

exportBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    if (response?.data) {
      exportToExcel(response.data);
    }
  });
});

function updateProgress() {
  chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    if (response) {
      const progress = (response.currentIndex / response.totalUrls) * 100;
      progressFill.style.width = `${progress}%`;
      
      if (response.currentIndex > 0 && response.currentIndex <= response.totalUrls) {
        statusDiv.textContent = `正在爬取第 ${response.currentIndex}/${response.totalUrls} 个页面...`;
      }
      
      if (response.currentIndex >= response.totalUrls) {
        clearInterval(updateInterval);
        isScraping = false;
        startBtn.disabled = false;
        exportBtn.disabled = false;
        statusDiv.textContent = '爬取完成！共获取 ' + countTotalArticles(response.data) + ' 篇文章';
        progressFill.style.width = '100%';
      }
    }
  });
}

function countTotalArticles(data) {
  return data.reduce((sum, item) => sum + item.articles.length, 0);
}

function exportToExcel(data) {
  let csv = '标题,摘要,作者,浏览量,点赞量\n';
  
  data.forEach(item => {
    item.articles.forEach(article => {
      const title = escapeCsv(article.title);
      const summary = escapeCsv(article.summary);
      const author = escapeCsv(article.author);
      const views = escapeCsv(article.views);
      const likes = escapeCsv(article.likes);
      
      csv += `${title},${summary},${author},${views},${likes}\n`;
    });
  });
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'juejin_articles.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(text) {
  if (!text) return '';
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}
