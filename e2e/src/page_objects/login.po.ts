import { browser, by, element } from 'protractor';

export class LoginPage {

  navigateTo() {
    return browser.get('/login');
  }

  clickRegisterButton() {
    return element(by.buttonText('Register')).click();
  }

  openCombobox() {
    return element(by.className('ng-input')).click();
  }

  selectSolidCommunity() {
    return element(by.id('Solid Community')).click();
  }

  getLoginSelector() {
    return element(by.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Select ID Provider'])[1]/following::input[1]"));
  }

  getSolidCommProvider() {
    return element(by.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Inrupt'])[1]/following::span[1]"));
  }
  clickGoButton() {
    return element(by.buttonText('Go')).click();
  }

  getUsernameField() {
    return element(by.id('username'));
  }

  getPasswordField() {
    return element(by.id('password'));
  }


  clickBtnLogin() {
    return element(by.id('login')).click();
  }


  getLoginParagraph() {
    return element(by.css('h4')).getText();
  }

  getSaveButton() {
    return element(by.buttonText('Save'));
  }

  getPhoneProfileElem() {
    return element(by.name('phone'));
  }

  getAppText() {
    return element(by.css('app-root h1')).getText();
  }
  getParagraphText() {
    return element(by.css('h1')).getText();
  }
  getRegisterProviderText() {
    return element(by.css('h2')).getText();
  }

}