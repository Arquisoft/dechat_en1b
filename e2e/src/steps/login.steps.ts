import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { LoginPage } from '../page_objects/login.po';
import { element } from '@angular/core/src/render3/instructions';
import { browser } from 'protractor';

let page: LoginPage;

Before(() => {
  page = new LoginPage();

});

Given(/^I am on the login page$/, async () => {
  await page.navigateTo();
});

When(/^I introduce my data/, async () => {
  //funciona!
  await page.openCombobox();
  //funciona!
  await page.selectSolidCommunity();
  //?????
  await page.clickGoButton();
  browser.sleep(1000);
  await browser.waitForAngularEnabled(false);
  //await page.getUsernameField().clear();
  expect(await page.getLoginParagraph()).to.equal('Login');
  await page.getUsernameField().sendKeys("dummyTest");
  //await page.getPasswordField().clear();
  
  await page.getPasswordField().sendKeys("ASW_dechat19");
  expect(await page.getLoginParagraph()).to.equal('Login');
  await page.clickBtnLogin();
});

Then(/^I should be able to see the profile/, async () => {
  
  let result=""
  if(browser.isElementPresent(page.getSaveButton())){
    result="You have login successfully";
  }else{
    result="login has failed :(";
  }
  expect(result).to.equal("You have login successfully");
  
 // await browser.sleep(2000);
 // expect(await page.getParagraphText()).to.equal('Profile');
});