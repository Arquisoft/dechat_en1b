import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { LoginPage } from '../page_objects/login.po';
import { element } from '@angular/core/src/render3/instructions';

let page: LoginPage;

Before(() => {
  page = new LoginPage();
});

Given(/^I am on the login page$/, async () => {
  await page.navigateTo();
});

When(/^I introduce my data/, async () => {
  await page.getLoginSelector().click();
  await page.getSolidCommProvider().click();
  await page.getGoButton().click();
  console.log("Ya le dio al Go Button");
  
  await page.getGoButton().click();
  await page.getUsernameField().clear();
  await page.getUsernameField().sendKeys("dummyTest");
  await page.getPasswordField().clear();
  await page.getPasswordField().sendKeys("ASW_dechat19");
  
});

Then(/^I should be able to see the profile/, async () => {
  expect(await page.getParagraphText()).to.equal('Profile');
});
