package ca.dannywilson.ctf;

import static org.junit.Assert.assertTrue;


import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class Teams extends Main{

	public Teams() {
		// TODO Auto-generated constructor stub
	}
	@Test
	public void teamBalanceTest() throws Exception{
		
		int numberOfBrowsers = 4;
		ChromeDriver[] browsers = new ChromeDriver[numberOfBrowsers];

		for(int i = 0; i < browsers.length; i++){
			browsers[i] = new ChromeDriver();
			browsers[i].manage().window().setSize(new Dimension(480, 360));
			browsers[i].manage().window().setPosition(new Point(960,360));
			browsers[i].get(gameUrl);

			// handle the prompts
			Alert javascriptprompt = browsers[i].switchTo().alert();
			javascriptprompt.sendKeys("Test user " + (i + 1));
			javascriptprompt.accept();
			
			Thread.sleep(2000);

			WebElement team = browsers[i].findElementByClassName("team");
			assertTrue(team.getText().contains("Team " + (i%2 + 1)));
			System.out.print("######Team " + (i%2 + 1));

			Thread.sleep(500);
			
			browsers[i].quit();
		}
		
		
	}
	}

