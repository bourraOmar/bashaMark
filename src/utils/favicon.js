export function getFaviconUrl(pageUrl) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const url = new URL(chrome.runtime.getURL('/_favicon/'));
      url.searchParams.set('pageUrl', pageUrl);
      url.searchParams.set('size', '32');
      return url.toString();
    }
    const domain = new URL(pageUrl).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch (e) {
    // If URL parsing fails, return a data URI for a generic globe icon
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
  }
}
