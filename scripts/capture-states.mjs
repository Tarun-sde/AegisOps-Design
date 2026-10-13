import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({viewport:{width:1440,height:900},baseURL:process.env.TEST_BASE_URL || 'http://localhost:3002',recordVideo:{dir:'artifacts/interaction-video',size:{width:1440,height:900}}});
await context.addInitScript(()=>sessionStorage.setItem('heron-entered','1'));
const page = await context.newPage();
await page.goto('/');
await expect(page.locator('.workflow-track .pin-spacer')).toBeAttached();
await page.getByRole('button',{name:'Inspect all issues'}).click();
await page.screenshot({path:'artifacts/screenshots/home-1440-inspection.png'});
await page.locator('#workflow').scrollIntoViewIfNeeded();
for(const [i,name] of ['Observe','Advise','Act','Learn'].entries()){
 await page.locator('.phase-nav').getByRole('button',{name}).click();
 await expect(page.locator('.workflow-copy').nth(i)).toHaveCSS('opacity','1');
 await page.waitForTimeout(900);
 await page.screenshot({path:`artifacts/screenshots/home-1440-phase-${name.toLowerCase()}.png`});
}
const cta=await page.locator('.final-cta').evaluate(el=>el.getBoundingClientRect().top+scrollY);
for(const [name,offset] of [['sketch',-300],['bleed',-40],['render',320]]){
 await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),cta+offset);
 await page.waitForTimeout(1200);
 await page.screenshot({path:`artifacts/screenshots/home-1440-ink-${name}.png`});
}
await page.locator('.footer-wordmark').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
const footer=await page.locator('.footer-wordmark').boundingBox();await page.mouse.move(footer.x+footer.width*.55,footer.y+footer.height*.5);await page.waitForTimeout(900);
await page.screenshot({path:'artifacts/screenshots/home-1440-footer-lens.png'});
await page.goto('/heron-dashboard');await expect(page.locator('.feature-track .pin-spacer')).toBeAttached();
for(const [i,name] of ['One View','Approval Queue','Full History','Team View','Firm Standards'].entries()){
 await page.locator('.feature-tabs').getByRole('button',{name}).click();await expect(page.locator('.feature-panel').nth(i)).toHaveCSS('opacity','1');
 await page.screenshot({path:`artifacts/screenshots/dashboard-1440-feature-${i+1}.png`});
}
await page.getByRole('button',{name:'Can my team share the same dashboard?'}).click();await page.screenshot({path:'artifacts/screenshots/dashboard-1440-faq-expanded.png'});
await context.close();await browser.close();
