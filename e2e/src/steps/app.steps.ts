import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { AppPage } from '../page_objects/app.po';

let page: AppPage;

Before(() => {
  page = new AppPage();
});

Given(/^I am on the home page$/, async () => {
  await page.navigateTo();
});

When(/^I do nothing \(home page\)$/, () => {});

Then(/^I should see the title \(home page\)$/, async () => {
  expect(await page.getParagraphText()).to.equal('DE-CHAT');
});
