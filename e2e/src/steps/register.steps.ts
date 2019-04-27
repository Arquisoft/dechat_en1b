import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { LoginPage } from '../page_objects/login_nacho.po';
import { element } from '@angular/core/src/render3/instructions';
import { browser } from 'protractor';

let page: LoginPage;

Before(() => {
  page = new LoginPage();
});

Given(/^I am on the login page to register$/, async () => {
  await page.navigateTo();
});

When(/^click on the register button/,async () => { 
   expect(await page.getParagraphText()).to.equal('DE-CHAT');
    await page.clickRegisterButton();
    browser.sleep(1000);
  });

  Then(/^I should be able to see the different providers/, async () => { 
    expect(await page.getRegisterProviderText()).to.equal('Inrupt');
  });