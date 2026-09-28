package com.uniovi.sdi2425entrega2test.n.pageobjects;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Clase Page Object para la gestión de vehículos en la aplicación.
 * Contiene métodos para añadir, verificar, seleccionar y eliminar vehículos mediante Selenium WebDriver.
 */
public class PO_VehicleView extends PO_NavView {

    /**
     * Rellena el formulario de registro de un nuevo vehículo y lo envía.
     *
     * @param driver              Instancia del navegador controlado por Selenium.
     * @param plateInput          Matrícula del vehículo.
     * @param chassisNumberInput  Número de chasis.
     * @param brandInput          Marca del vehículo.
     * @param modelInput          Modelo del vehículo.
     * @param fuelTypeInput       Tipo de combustible.
     */
    public static void fillAddVehicleForm(WebDriver driver, String plateInput, String chassisNumberInput,
                                          String brandInput, String modelInput, String fuelTypeInput) {
        WebElement plateField = driver.findElement(By.name("plate"));
        plateField.click();
        plateField.clear();
        plateField.sendKeys(plateInput);

        WebElement chassisNumberField = driver.findElement(By.name("chassisNumber"));
        chassisNumberField.click();
        chassisNumberField.clear();
        chassisNumberField.sendKeys(chassisNumberInput);

        WebElement brandField = driver.findElement(By.name("brand"));
        brandField.click();
        brandField.clear();
        brandField.sendKeys(brandInput);

        WebElement modelField = driver.findElement(By.name("model"));
        modelField.click();
        modelField.clear();
        modelField.sendKeys(modelInput);

        if (!fuelTypeInput.isEmpty()) {
            Select fuelTypeDropdown = new Select(driver.findElement(By.name("fuelType")));
            fuelTypeDropdown.selectByVisibleText(fuelTypeInput);
        }

        WebDriverWait wait = new WebDriverWait(driver, 10);
        WebElement submitButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("/html/body/div/form/div[6]/div/button")));
        submitButton.click();
    }

    /**
     * Verifica si todas las matrículas esperadas están presentes en la lista de vehículos.
     *
     * @param driver         Instancia del navegador controlado por Selenium.
     * @param expectedPlates Lista de matrículas que deberían estar presentes.
     * @return {@code true} si todas las matrículas están presentes, {@code false} en caso contrario.
     */
    public static boolean areVehiclesAdded(WebDriver driver, List<String> expectedPlates) {
        Set<String> collectedPlates = new HashSet<>();
        List<WebElement> pageLinks = driver.findElements(By.xpath("//ul[@class='pagination']/li/a"));
        int totalPages = pageLinks.size();

        for (int i = 1; i <= totalPages; i++) {
            driver.get("http://localhost:8081/vehicles?page=" + i);
            List<WebElement> plateElements = driver.findElements(By.xpath("//table/tbody/tr/td[2]"));
            for (WebElement el : plateElements) {
                collectedPlates.add(el.getText().trim());
            }
        }

        return collectedPlates.containsAll(expectedPlates);
    }

    /**
     * Verifica si una matrícula específica está presente en alguna de las páginas de la lista de vehículos.
     *
     * @param driver Instancia del navegador controlado por Selenium.
     * @param plate  Matrícula del vehículo a buscar.
     * @return {@code true} si se encuentra el vehículo, {@code false} en caso contrario.
     */
    public static boolean isVehicleAdded(WebDriver driver, String plate) {
        WebDriverWait wait = new WebDriverWait(driver, 10);
        List<WebElement> firstPageLinks = driver.findElements(By.xpath("//ul[@class='pagination']/li/a[contains(text(), '«')]"));
        if (!firstPageLinks.isEmpty()) {
            WebElement firstPage = firstPageLinks.get(0);
            if (firstPage.isDisplayed() && firstPage.isEnabled()) {
                firstPage.click();
                wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.xpath("//table/tbody/tr")));
            }
        }

        while (true) {
            List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));
            for (WebElement row : rows) {
                if (row.getText().contains(plate)) {
                    return true;
                }
            }

            List<WebElement> nextButtons = driver.findElements(By.xpath("//ul[@class='pagination']/li/a[contains(text(), '»')]"));
            if (!nextButtons.isEmpty()) {
                WebElement nextButton = nextButtons.get(0);
                if (nextButton.getAttribute("class") != null && nextButton.getAttribute("class").contains("disabled")) {
                    break;
                }
                nextButton.click();
                wait.until(ExpectedConditions.stalenessOf(rows.get(0)));
            } else {
                break;
            }
        }

        return false;
    }

    /**
     * Elimina un vehículo específico buscándolo por matrícula.
     *
     * @param driver Instancia del navegador controlado por Selenium.
     * @param plate  Matrícula del vehículo a eliminar.
     */
    public static void deleteVehicle(WebDriver driver, String plate) {
        List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));

        for (WebElement row : rows) {
            if (row.getText().contains(plate)) {
                WebElement checkbox = row.findElement(By.xpath(".//td/input[@type='checkbox']"));
                checkbox.click();
                break;
            }
        }

        WebElement deleteButton = driver.findElement(By.xpath("//button[contains(@class, 'btn-danger')]"));
        deleteButton.click();
    }

    /**
     * Elimina el primer vehículo de la lista visible.
     *
     * @param driver Instancia del navegador controlado por Selenium.
     */
    public static void deleteFirstVehicleFromList(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, 10);
        List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));
        WebElement firstRow = rows.get(0);

        WebElement checkbox = firstRow.findElement(By.xpath(".//td/input[@type='checkbox']"));
        checkbox.click();

        WebElement deleteButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[text()='Eliminar']")));
        deleteButton.click();

        wait.until(ExpectedConditions.invisibilityOf(firstRow));
    }

    /**
     * Elimina el último vehículo de la lista navegando hasta la última página.
     *
     * @param driver Instancia del navegador controlado por Selenium.
     */
    public static void deleteLastVehicleFromList(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, 10);
        List<WebElement> paginationLinks = driver.findElements(By.xpath("//ul[@class='pagination']/li/a"));
        if (!paginationLinks.isEmpty()) {
            WebElement lastPageLink = paginationLinks.get(paginationLinks.size() - 1);
            lastPageLink.click();
            wait.until(ExpectedConditions.stalenessOf(paginationLinks.get(0)));
        }

        List<WebElement> rows = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                By.xpath("//table/tbody/tr")));
        WebElement lastRow = rows.get(rows.size() - 1);
        String plate = lastRow.findElement(By.xpath("./td[2]")).getText();

        WebElement checkbox = lastRow.findElement(By.xpath(".//td/input[@type='checkbox']"));
        checkbox.click();

        WebElement deleteButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[text()='Eliminar']")));
        deleteButton.click();

        wait.until(ExpectedConditions.invisibilityOf(lastRow));

        System.out.println("Vehículo con matrícula " + plate + " eliminado de la última página.");
    }
}
