import { browser, by, element } from 'protractor';

export class LoginPage {

  navigateTo() {
    return browser.get('/login');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getLoginSelector() {
    return element(by.css('logic-selector'));
  }

  getGoButton() {
    return element(by.id('btn-go'));
  }

  getRegisterButton() {
    return element(by.id('btn-register'));
  }

  selectProvider(provider) {
    let selector = element(by.id('provider-selector'));
    let providerBtn = selector.findElement(by.id(provider));
    providerBtn.click();
  }

  loginWithCredentials(user, password) {
    element(by.id('username')).sendKeys(user);
    element(by.id('password')).sendKeys(password);
    element(by.id('login')).click();
  }

}
