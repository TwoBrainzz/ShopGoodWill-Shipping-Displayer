(function() {
  const shippingCache = {};
  let cachedZip = "000000";

  chrome.storage.sync.get("userZip", (data) => {
    cachedZip = data.userZip || "000000";
  });

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight * 1.5 && rect.bottom >= 0;
  }

  function checkForOneCent(product, shippingInfo, productId) {
    const oneCentIcon = product.querySelector('.btn-1c');
    shippingInfo.textContent = oneCentIcon ? "Shipping: $0.01" : "Shipping: Pickup Only";
    shippingCache[productId] = shippingInfo.textContent;
  }

  function addShippingInfo(product) {
    const priceElem = product.querySelector('.feat-item_price');
    if (!priceElem || product.querySelector('.shipping-info')) return;

    const shippingInfo = document.createElement('div');
    shippingInfo.textContent = "Loading...";
    shippingInfo.style.color = 'green';
    shippingInfo.classList.add('shipping-info');
    priceElem.parentNode.insertBefore(shippingInfo, priceElem.nextSibling);

    const productLink = product.querySelector('.feat-item_name');
    const productId = productLink?.getAttribute('id');
    if (!productId) return;

    if (shippingCache[productId]) {
      shippingInfo.textContent = shippingCache[productId];
      return;
    }

    fetch("https://buyerapi.shopgoodwill.com/api/ItemDetail/CalculateShipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: parseInt(productId, 10),
        country: "US",
        zipCode: cachedZip,
        quantity: 1,
        clientIP: ""
      })
    })
    .then(response => response.text())
    .then(htmlResponse => {
      const shippingMatch = htmlResponse.match(/<b>(.*?)<\/b>/i);
      if (shippingMatch) {
        shippingInfo.textContent = shippingMatch[1];
        shippingCache[productId] = shippingMatch[1];
      } else {
        checkForOneCent(product, shippingInfo, productId);
      }
    })
    .catch(() => checkForOneCent(product, shippingInfo, productId));
  }

  function initializeExtension() {
    const products = Array.from(document.querySelectorAll('.feat-item'));
    products.filter(isInViewport).forEach(addShippingInfo);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) initializeExtension();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(initializeExtension, 100);
  });

  initializeExtension();
})();