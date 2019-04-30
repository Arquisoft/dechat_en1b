import { browser, by, element } from 'protractor';

export class ChatPage {

    userName: string = 'Test1';
    password: string = 'Test1Solid/';

    async signout() {
        return await browser.driver.findElement(by.css('#logout')).click().then(() => browser.sleep(2000));
    }

    async solidLogin() {
        await browser.driver.get('localhost:4200');
        await element(by.css('.login-select')).click().then(() => browser.sleep(2000));
        await element(by.xpath('(//div[@class="provider"])[2]')).click();
        await element(by.css('#btn-go')).click().then(() => browser.sleep(2000));
        await browser.driver.findElement(by.id('username')).sendKeys(this.userName);
        await browser.driver.findElement(by.id('password')).sendKeys(this.password);
        await browser.driver.findElement(by.id('login')).click();
        return await browser.driver.get('localhost:4200/chat').then(() => browser.sleep(2000));
    }

    async goToPage() {
    }

    async selectChat() {
        browser.get('/chat').then(() => browser.sleep(2000));
        return await browser.driver.findElement(by.css('.userItem')).click();
    }

    async writeMessage(msg: string) {
        return await browser.driver.findElement(by.css('.chatInput')).sendKeys(msg);
    }

    async clickSend() {
        return await browser.driver.findElement(by.css('.chatButton')).click().then(() => browser.sleep(1000));
    }

    async getMessageText() {
        return await browser.driver.findElement(by.css('.messageContent')).getText();
    }

    async clickDelete() {
        return await browser.driver.findElement(by.css('#del')).click();
    }

    async getNumberOfMessages() {
        var messages = await browser.driver.findElements(by.css('.messageContent'));
        return messages.length;
    }
}
