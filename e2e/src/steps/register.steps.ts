import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { LoginPage } from '../page_objects/login.po';
import { element } from '@angular/core/src/render3/instructions';
import { browser } from 'protractor';

let page: LoginPage;

Before(() => {
  page = new LoginPage();
});

Given(/^I am on the login page to register$/, async () => {
  await page.navigateTo();
  console.log("CURRENT URL: " + browser.getCurrentUrl());
});

When('click on the register button',async () => { 
    
  });

  Then('I should be able to see the different providers', async () => { 
    
  });