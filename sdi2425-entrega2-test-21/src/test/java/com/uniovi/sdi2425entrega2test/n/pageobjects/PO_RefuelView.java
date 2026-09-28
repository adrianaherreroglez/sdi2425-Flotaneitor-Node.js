package com.uniovi.sdi2425entrega2test.n.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


import static com.uniovi.sdi2425entrega2test.n.pageobjects.PO_View.checkElementBy;

public class PO_RefuelView {

    static public void fillNewRefuelForm(WebDriver driver, String stationName, Double ppu, Double quantity, boolean fullTank,
                                         Double odometerValue, String obs){
        WebElement name = driver.findElement(By.id("stationName"));
        name.click();
        name.clear();
        name.sendKeys(stationName);

        WebElement price = driver.findElement(By.id("pricePerUnit"));
        price.click();
        price.clear();
        if(ppu != null){
            price.sendKeys(String.valueOf(ppu));
        }

        WebElement refueledQuantity = driver.findElement(By.id("quantity"));
        refueledQuantity.click();
        refueledQuantity.clear();
        if(quantity != null){
            refueledQuantity.sendKeys(String.valueOf(quantity));
        }

        if(fullTank){
            WebElement isTankFull = driver.findElement(By.id("isTankFull"));
            isTankFull.click();
        }

        WebElement refuelOdometer = driver.findElement(By.id("odometerRefuelValue"));
        refuelOdometer.click();
        refuelOdometer.clear();
        if(odometerValue != null){
            refuelOdometer.sendKeys(String.valueOf(odometerValue));
        }


        WebElement observations = driver.findElement(By.id("observations"));
        observations.click();
        observations.clear();
        observations.sendKeys(obs);

        By boton = By.className("btn");
        driver.findElement(boton).click();
    }

    static public void addRefuel(WebDriver driver, String stationName, Double ppu, Double quantity, boolean fullTank,
                                 Double odometerValue, String obs, String checkText){

        fillNewRefuelForm(driver, stationName, ppu, quantity, fullTank, odometerValue, obs);
        checkElementBy(driver, "text", checkText);
    }

}
