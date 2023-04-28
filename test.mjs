// You must run the app.mjs in order to let the Selenium Test workable
import assert from 'assert';

import { Builder, By, Key, until } from 'selenium-webdriver';

// Please input those information if you want to test by yourself
const yourEmail = "Hello@nyu.edu";

const driver = new Builder()
  .forBrowser('chrome')
  .build();

// test whether the user is able to log to the page
async function testWelcomePage() {
  await driver.get('http://localhost:3002/');
  await driver.wait(until.elementLocated(By.css('video')), 5000);
  const text = await driver.findElement(By.css('h1')).getText();
  assert.strictEqual(text, '🍃 StockInnerFlow');
}

// test whether user are able to register a new account
async function testRegister() { 
    await driver.get('http://localhost:3002/register');
    const username = await driver.findElement(By.id("username"));
    await driver.wait(until.elementIsVisible(username), 5000);
    await driver.wait(until.elementIsEnabled(username), 5000);
    await username.sendKeys("Testuser1");
    const password = await driver.findElement(By.id("password"));
    await driver.wait(until.elementIsVisible(password), 10000);
    await driver.wait(until.elementIsEnabled(password), 10000);
    await password.sendKeys("Testuser1");
    const register = await driver.findElement(By.id("register"));
    await driver.wait(until.elementIsEnabled(register), 10000);
    await register.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const text = await driver.findElement(By.id("validateUser")).getText();
    assert.strictEqual(text, 'Hi Testuser1');

}



// test whether user are able to login with the account that they just created
async function testLogin() { 
    await driver.get('http://localhost:3002/login');
    const username = await driver.findElement(By.id("username"));
    await driver.wait(until.elementIsVisible(username), 5000);
    await driver.wait(until.elementIsEnabled(username), 5000);
    await username.sendKeys("Testuser1");
    const password = await driver.findElement(By.id("password"));
    await driver.wait(until.elementIsVisible(password), 10000);
    await driver.wait(until.elementIsEnabled(password), 10000);
    await password.sendKeys("Testuser1");
    const register = await driver.findElement(By.id("login"));
    await driver.wait(until.elementIsEnabled(register), 10000);
    await register.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const text = await driver.findElement(By.id("add-button")).getText();
    assert.strictEqual(text, 'Do you want to add more stock?');

    const addButton = await driver.findElement(By.id("add-button"));
    await addButton.click();
    const stockname = await driver.findElement(By.id("stockname"));
    await driver.wait(until.elementIsVisible(stockname), 5000);
    await driver.wait(until.elementIsEnabled(stockname), 5000);
    await stockname.sendKeys("AAA");
    const ticket = await driver.findElement(By.id("ticket"));
    await driver.wait(until.elementIsVisible(ticket), 10000);
    await driver.wait(until.elementIsEnabled(ticket), 10000);
    await ticket.sendKeys("BBB");
    const price = await driver.findElement(By.id("price"));
    await driver.wait(until.elementIsVisible(price), 10000);
    await driver.wait(until.elementIsEnabled(price), 10000);
    await price.sendKeys(160);
    const Add = await driver.findElement(By.id("Add"));
    await driver.wait(until.elementIsEnabled(Add), 10000);
    await Add.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const firstRow = await driver.findElement(By.xpath("//tbody/tr[1]"));
    const priceElement = await firstRow.findElement(By.xpath("./td[4]"));
    const price2 = await priceElement.getText();
    assert.strictEqual(price2, "160");



}



async function testEmailPage() {
  await driver.get('http://localhost:3002/email');
  const firstname = await driver.findElement(By.id("name"));
  await driver.wait(until.elementIsVisible(firstname), 5000);
  await driver.wait(until.elementIsEnabled(firstname), 5000);
  await firstname.sendKeys("John");

  const lastname = await driver.findElement(By.id("lastname"));
  await driver.wait(until.elementIsVisible(lastname), 5000);
  await driver.wait(until.elementIsEnabled(lastname), 5000);
  await lastname.sendKeys("Li");

  const email = await driver.findElement(By.id("email"));
  await driver.wait(until.elementIsVisible(email), 5000);
  await driver.wait(until.elementIsEnabled(email), 5000);
  await email.sendKeys(yourEmail);

  const message = await driver.findElement(By.id("message"));
  await driver.wait(until.elementIsVisible(message), 5000);
  await driver.wait(until.elementIsEnabled(message), 5000);
  await message.sendKeys("hello");

  let sendButton = await driver.findElement(By.css("button[type='submit']"));
  await sendButton.click();
  await driver.wait(until.alertIsPresent(), 5000);
  let alert = await driver.switchTo().alert();
  let alertText = await alert.getText();

  // Check that the alert text is correct
  assert.strictEqual(alertText, "Your message was sent successfully");

  // Close/dismiss the alert
  await alert.accept();
 

  //success_alert = driver.switchTo.alert;
  //assert.strictEqual(text, 'Your message was sent successfully');

  
}

async function testChatGPT() {
    await driver.get('http://localhost:3002/ask-chatgpt');
    const input = await driver.findElement(By.id("inputButton"));
    await driver.wait(until.elementIsVisible(input), 5000);
    await driver.wait(until.elementIsEnabled(input), 5000);
    await input.sendKeys("How is your day?");

    const sendButton = await driver.findElement(By.id("send"));
    await driver.wait(until.elementIsEnabled(sendButton), 10000);
    await sendButton.click();

    await new Promise(resolve => setTimeout(resolve, 3000));

    const response = await driver.findElement(By.id("chatlog"));
    await driver.wait(until.elementIsEnabled(response), 10000);

  // Write code to fill out email form and send email
}

async function runTests() {
  try {
    await testWelcomePage();
    await testRegister();
    await testLogin();
    await testEmailPage();
    await testChatGPT();
    console.log('All tests passed!');
  } catch (error) {
    console.error('Sorry, the test is failed:', error);
  } finally {
    await driver.quit();
  }
}

runTests();