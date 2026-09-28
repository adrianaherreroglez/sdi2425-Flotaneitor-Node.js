package com.uniovi.sdi2425entrega2test.n.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import static com.uniovi.sdi2425entrega2test.n.pageobjects.PO_View.checkElementBy;

public class PO_EmployeeView {

    static public void fillNewEmployeeForm(WebDriver driver, String dnie, String ename, String esurname) {
        WebElement dni = driver.findElement(By.id("dni"));
        dni.click();
        dni.clear();
        dni.sendKeys(dnie);

        WebElement name = driver.findElement(By.id("name"));
        name.click();
        name.clear();
        name.sendKeys(ename);

        WebElement surname = driver.findElement(By.id("surname"));
        surname.click();
        surname.clear();
        surname.sendKeys(esurname);

        By boton = By.className("btn");
        driver.findElement(boton).click();
    }

    static public void fillEditEmployeeForm(WebDriver driver, String dnie, String ename, String esurname, boolean changeRole) {
        WebElement dni = driver.findElement(By.id("dni"));
        dni.click();
        dni.clear();
        dni.sendKeys(dnie);

        WebElement name = driver.findElement(By.id("name"));
        name.click();
        name.clear();
        name.sendKeys(ename);

        WebElement surname = driver.findElement(By.id("surname"));
        surname.click();
        surname.clear();
        surname.sendKeys(esurname);


        if(changeRole) {
            WebDriverWait wait = new WebDriverWait(driver, 10);
            WebElement roleDropdown = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("/html/body/div/form/div[4]/div/select/option[2]")));
            roleDropdown.click();
        }

        By boton = By.className("btn");
        driver.findElement(boton).click();
    }



    static public void addEmployee(WebDriver driver, String dnie, String ename, String esurname, String checkText) {
        fillNewEmployeeForm(driver, dnie, ename, esurname);
        checkElementBy(driver, "text", checkText);
    }

    static public void editEmployee(WebDriver driver, String dnie, String ename, String esurname, boolean changeRole, String checkText) {
        new WebDriverWait(driver, 10);
        fillEditEmployeeForm(driver, dnie, ename, esurname, changeRole);
        checkElementBy(driver, "text", checkText);
    }

}
