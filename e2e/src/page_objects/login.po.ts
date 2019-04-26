import { browser, by, element } from 'protractor';

export class LoginPage {

  navigateTo() {
    return browser.get('/login');
  }

  getParagraphText() {
    return element(by.name('profileName')).getText();
  }

  getLoginSelector() {
  //  return element(by.css('logic-selector'));
  return element(by.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Select ID Provider'])[1]/following::input[1]"));
  }

  getSolidCommProvider(){
    return element(by.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Inrupt'])[1]/following::div[4]"));
  }

  getUsernameField(){
   // this.sleep(2000);
    return element(by.id('username'));
  }
  getPasswordField(){
    return element(by.id('password'));
  }

  getGoButton() {
    //this.sleep(3000);
    return element(by.id('btn-go'));
  }

  getBtnLogin(){
    return element(by.id('login'));
  }


  getRegisterButton() {
    return element(by.id('btn-register'));
  }


    private sleep(milliseconds: number): void {
      const start = new Date().getTime();
      for (let i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds) {
              break;
          }
      }
  }
}
