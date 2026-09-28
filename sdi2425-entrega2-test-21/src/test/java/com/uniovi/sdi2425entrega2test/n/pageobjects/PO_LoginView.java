package com.uniovi.sdi2425entrega2test.n.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Clase que representa la vista de login como un objeto de página (Page Object). Proporciona
 * métodos para rellenar y enviar el formulario de inicio de sesión, realizar el login completo y
 * cerrar sesión utilizando Selenium WebDriver.
 */
public class PO_LoginView extends PO_NavView {

  /**
   * Rellena el formulario de inicio de sesión con el DNI y la contraseña proporcionados y envía el
   * formulario pulsando el botón de login.
   *
   * @param driver    Instancia de WebDriver usada para interactuar con el navegador.
   * @param dnip      DNI del usuario.
   * @param passwordp Contraseña del usuario.
   */
  static public void fillLoginForm(WebDriver driver, String dnip, String passwordp) {
    WebElement dni = driver.findElement(By.name("dni"));
    dni.click();
    dni.clear();
    dni.sendKeys(dnip);

    WebElement password = driver.findElement(By.name("password"));
    password.click();
    password.clear();
    password.sendKeys(passwordp);

    // Pulsar el botón de login
    WebElement loginButton = driver.findElement(By.className("btn-primary"));
    loginButton.click();
  }

  /**
   * Realiza el proceso de inicio de sesión completo: navega hasta la vista de login, introduce las
   * credenciales y verifica que se ha accedido correctamente comprobando un texto esperado.
   *
   * @param driver    Instancia de WebDriver usada para interactuar con el navegador.
   * @param user      DNI o usuario con el que iniciar sesión.
   * @param password  Contraseña correspondiente al usuario.
   * @param checkText Texto esperado que debe aparecer tras el login para confirmar el éxito.
   */
  static public void login(WebDriver driver, String user, String password, String checkText) {
    clickOption(driver, "login", "class", "btn btn-primary");
    fillLoginForm(driver, user, password);
    // Comprobamos que hemos accedido correctamente a la página
    checkElementBy(driver, "text", checkText);
  }

  static public void incorrectLogin(WebDriver driver, String user, String password,
      String checkText) {
    clickOption(driver, "login", "class", "btn btn-primary");
    fillLoginForm(driver, user, password);
    //Comprobamos que entramos en la pagina privada del Profesor
    WebDriverWait wait = new WebDriverWait(driver, 10);
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("dni")));
    checkElementBy(driver, "text", checkText);
  }

  static public void logout(WebDriver driver, String checkText) {
    clickOption(driver, "logout", "text", checkText);
  }

  static public void fillApiClientLoginForm(WebDriver driver, String emailInput,
      String passwordInput) {
    WebElement dni = driver.findElement(By.name("email"));
    dni.click();
    dni.clear();
    dni.sendKeys(emailInput);
    WebElement password = driver.findElement(By.name("password"));
    password.click();
    password.clear();
    password.sendKeys(passwordInput);
    //Pulsar el boton de Alta.
    By boton = By.className("btn");
    driver.findElement(boton).click();
  }
}
