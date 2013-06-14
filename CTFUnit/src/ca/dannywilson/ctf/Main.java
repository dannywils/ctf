package ca.dannywilson.ctf;

import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Alert;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Main {
	private static ChromeDriver browser;

	@BeforeClass
	public static void setupClass() throws Exception {
		String username = "Danny Wilson";

		System.setProperty("webdriver.chrome.driver",
				"chromedriver.exe");

		browser = new ChromeDriver();
		browser.get("http://127.0.0.1/ctf");

		// handle the prompt
		Alert javascriptprompt = browser.switchTo().alert();
		javascriptprompt.sendKeys(username);
		javascriptprompt.accept();

		// give some time for the js to load
		Thread.sleep(2000);
	}

	// check that we are assigned to a team
	@Test
	public void checkTeam() throws Exception {
		// check that we're on a team
		WebElement team = browser.findElementByClassName("team");
		assertTrue(team.getText().contains("1") || team.getText().contains("2"));
	}

	@Test
	public void checkLocation() throws Exception {
		((JavascriptExecutor) browser)
				.executeScript("game.updateCoords({latitude: 1,longitude: 1})");

		Thread.sleep(1000);
		WebElement captureButton = browser
				.findElementByClassName("captureflag");
		if (captureButton.isDisplayed()) {
			captureButton.click();
		}

		Thread.sleep(1000);
		((JavascriptExecutor) browser)
				.executeScript("game.updateCoords({latitude: 0,longitude: 0})");

	}

	// Sleep 1 seconds between each test
	@After
	public void setUp() throws Exception {
		Thread.sleep(1000);
	}

	// after all the tests are done, quit the browser
	@AfterClass
	public static void tearDownClass() {
		browser.quit();
	}
}