import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { LoginPage } from '../page_objects/login.po';

let page: LoginPage;

Before(() => {
  page = new LoginPage();
});

Given(/^I am on the login page$/, async () => {
  await page.navigateTo();
});

When(/^I enter my credentials$/, () => {
  page.selectProvider("solid");
  page.loginWithCredentials("Test1", "");
});

Then(/^I should see the chat page$/, async () => {
  
});
