package ca.dannywilson.ctf;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class Main {
	private static ChromeDriver browser1,browser2,browser3,browser4,browser5,browser6,browser7,browser8;

	private static final String gameUrl = "http://127.0.0.1/ctf/";

	@BeforeClass
	public static void setupClass() throws Exception {
		System.setProperty("webdriver.chrome.driver", "chromedriver.exe");

		// Clear the database
		ChromeDriver cleardb = new ChromeDriver();
		cleardb.get(gameUrl + "cleardb.html");

		Thread.sleep(1000);

		cleardb.quit();
		// load two instances of the game
		browser1 = new ChromeDriver();
		browser1.manage().window().setSize(new Dimension(480, 800));
		browser1.manage().window().setPosition(new Point(0,0));
		browser1.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt1 = browser1.switchTo().alert();
		javascriptprompt1.sendKeys("Test user 1");
		javascriptprompt1.accept();

		Thread.sleep(1000);

		browser2 = new ChromeDriver();
		browser2.manage().window().setSize(new Dimension(480, 800));
		browser2.manage().window().setPosition(new Point(480,0));
		browser2.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt2 = browser2.switchTo().alert();
		javascriptprompt2.sendKeys("Test user 2");
		javascriptprompt2.accept();

		// give some time for the js to load
		Thread.sleep(1000);
	}

	// check that each player is assigned to the correct team
	@Test
	public void test1() throws Exception {
		// the first browser should be assigned to the first team
		WebElement team = browser1.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 1"));

		team = browser2.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 2"));
	}

	// Place flag
	@Test
	public void test2() throws Exception {
		// move to 1,1 and place the flag for user 1
		((JavascriptExecutor) browser1)
				.executeScript("game.updateCoords({latitude: 1,longitude: 1})");

		Thread.sleep(1000);

		WebElement placeButton = browser1.findElementByClassName("placeflag");
		if (placeButton.isDisplayed()) {
			placeButton.click();
		}

		// move to 2,2 and place the flag for user 1
		((JavascriptExecutor) browser2)
				.executeScript("game.updateCoords({latitude: 2,longitude: 2})");

		Thread.sleep(1000);

		placeButton = browser2.findElementByClassName("placeflag");
		if (placeButton.isDisplayed()) {
			placeButton.click();
		}

		Thread.sleep(1000);
		// make sure the buttons are now gone
		assertTrue(!(browser1.findElementsByClassName("placeflag").size() < 0));
		assertTrue(!(browser2.findElementsByClassName("placeflag").size() < 0));
	}

	// Pickup flag
	@Test
	public void test3() throws Exception {
		((JavascriptExecutor) browser1)
				.executeScript("game.updateCoords({latitude: 2,longitude: 2})");
		
		Thread.sleep(2000);
		
		((JavascriptExecutor) browser2)
				.executeScript("game.updateCoords({latitude: 1,longitude: 1})");

		Thread.sleep(1000);

		WebElement capButton = browser1.findElementByClassName("captureflag");
		if (capButton.isDisplayed()) {
			capButton.click();
		}

		capButton = browser2.findElementByClassName("captureflag");
		if (capButton.isDisplayed()) {
			capButton.click();
		}

		Thread.sleep(1000);

	}

	// Return flag
	@Test
	public void test4() throws Exception {
		((JavascriptExecutor) browser1)
				.executeScript("game.updateCoords({latitude: 1,longitude: 1})");
		
		Thread.sleep(2000);
		
		((JavascriptExecutor) browser2)
				.executeScript("game.updateCoords({latitude: 2,longitude: 2})");

		Thread.sleep(2000);

		// maker sure both users got the scores
		String team1_score = browser1.findElementById("team1_score").getText();
		String team2_score = browser1.findElementById("team1_score").getText();

		assertEquals("Check team 1 score", "1", team1_score);
		assertEquals("Check team 2 score", "1", team2_score);

		// maker sure both users got the scores
		team1_score = browser2.findElementById("team1_score").getText();
		team2_score = browser2.findElementById("team1_score").getText();

		assertEquals("Check team 1 score", "1", team1_score);
		assertEquals("Check team 2 score", "1", team2_score);

	}
	
	//test team balancing
	@Test
	public void test5() throws Exception {
		
		//Create a bunch of game instances
		
		browser3 = new ChromeDriver();
		browser3.manage().window().setSize(new Dimension(480, 360));
		browser3.manage().window().setPosition(new Point(0,0));
		browser3.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt3 = browser3.switchTo().alert();
		javascriptprompt3.sendKeys("Test user 3");
		javascriptprompt3.accept();

		Thread.sleep(500);
		
		browser4 = new ChromeDriver();
		browser4.manage().window().setSize(new Dimension(480, 360));
		browser4.manage().window().setPosition(new Point(480,0));
		browser4.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt4 = browser4.switchTo().alert();
		javascriptprompt4.sendKeys("Test user 4");
		javascriptprompt4.accept();
		
		Thread.sleep(500);
		
		browser5 = new ChromeDriver();
		browser5.manage().window().setSize(new Dimension(480, 360));
		browser5.manage().window().setPosition(new Point(960,0));
		browser5.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt5 = browser5.switchTo().alert();
		javascriptprompt5.sendKeys("Test user 5");
		javascriptprompt5.accept();
		
		Thread.sleep(500);
		
		browser6 = new ChromeDriver();
		browser6.manage().window().setSize(new Dimension(480, 360));
		browser6.manage().window().setPosition(new Point(0,360));
		browser6.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt6 = browser6.switchTo().alert();
		javascriptprompt6.sendKeys("Test user 6");
		javascriptprompt6.accept();
		
		Thread.sleep(500);
		
		browser7 = new ChromeDriver();
		browser7.manage().window().setSize(new Dimension(480, 360));
		browser7.manage().window().setPosition(new Point(480,360));
		browser7.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt7 = browser7.switchTo().alert();
		javascriptprompt7.sendKeys("Test user 7");
		javascriptprompt7.accept();
		
		Thread.sleep(500);
		
		browser8 = new ChromeDriver();
		browser8.manage().window().setSize(new Dimension(480, 360));
		browser8.manage().window().setPosition(new Point(960,360));
		browser8.get(gameUrl);
		// handle the prompts
		Alert javascriptprompt8 = browser8.switchTo().alert();
		javascriptprompt8.sendKeys("Test user 8");
		javascriptprompt8.accept();
		
		//Do the players alternate 
		//from one team to another when joining?
		
		WebElement team = browser3.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 1"));

		team = browser4.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 2"));
		
		team = browser5.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 1"));

		team = browser6.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 2"));
		
		team = browser7.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 1"));
		
		team = browser8.findElementByClassName("team");
		assertTrue(team.getText().contains("Team 2"));
	}

	// Sleep 1 seconds between each test
	@After
	public void setUp() throws Exception {
		Thread.sleep(1000);
	}

	// after all the tests are done, quit the browser
	@AfterClass
	public static void tearDownClass() throws Exception {
		Thread.sleep(2000);
		browser1.quit();
		browser2.quit();
		browser3.quit();
		browser4.quit();
		browser5.quit();
		browser6.quit();
		browser7.quit();
		browser8.quit();
		
	}
}