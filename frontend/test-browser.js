const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (e) {
    console.log("Nav timeout, proceeding to check html");
  }
  
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log("Body length:", body.length);
  
  await browser.close();
})();