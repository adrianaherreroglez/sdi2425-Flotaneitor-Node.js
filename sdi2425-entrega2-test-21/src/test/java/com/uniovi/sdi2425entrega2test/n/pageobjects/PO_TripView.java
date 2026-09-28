package com.uniovi.sdi2425entrega2test.n.pageobjects;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Clase de objeto de página (Page Object) para la vista de gestión de trayectos.
 * Extiende la clase {@link PO_NavView} para incluir funcionalidades específicas de trayectos.
 */
public class PO_TripView extends PO_NavView {

    /**
     * Registra el inicio de un trayecto seleccionando una matrícula específica.
     *
     * @param driver El controlador de Selenium WebDriver.
     * @param plate  La matrícula del vehículo a seleccionar.
     */
    public static void registerTrip(WebDriver driver, String plate) {
        // Esperar y seleccionar la matrícula del desplegable
        WebDriverWait wait = new WebDriverWait(driver, 10);
        WebElement plateDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("plate")));

        Select select = new Select(plateDropdown);
        select.selectByVisibleText(plate);

        // Hacer clic en el botón "Finalizar trayecto"
        WebElement startButton = driver.findElement(By.xpath("//button[text()='Registrar inicio']"));
        startButton.click();
    }

    /**
     * Finaliza un trayecto rellenando el odómetro y una observación opcional.
     *
     * @param driver   El controlador de Selenium WebDriver.
     * @param odometer El valor del odómetro final.
     */
    public static void finishTrip(WebDriver driver, String odometer) {
        WebDriverWait wait = new WebDriverWait(driver, 10);

        // Esperar a que el campo del odómetro esté presente y visible
        WebElement odometerInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.name("endingOdometer")));

        // Rellenar el valor del odómetro
        odometerInput.clear();
        odometerInput.sendKeys(String.valueOf(odometer));

        // (Opcional) Añadir observaciones
        WebElement obsInput = driver.findElement(By.name("observation"));
        obsInput.sendKeys("Finalización automática");

        // Hacer clic en el botón "Finalizar trayecto"
        WebElement finishButton = driver.findElement(By.xpath("//button[text()='Finalizar trayecto']"));
        finishButton.click();
    }

    /**
     * Verifica que los trayectos listados en la tabla pertenecen únicamente a las matrículas esperadas.
     *
     * @param driver         El controlador de Selenium WebDriver.
     * @param expectedPlates Lista de matrículas que se espera ver en los trayectos.
     * @return {@code true} si todos los trayectos coinciden con las matrículas esperadas, {@code false} en caso contrario.
     */
    public static boolean areTripsOfUser(WebDriver driver, List<String> expectedPlates) {
        List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));

        for (WebElement row : rows) {
            String rowText = row.getText();
            boolean foundPlate = false;

            for (String plate : expectedPlates) {
                if (rowText.contains(plate)) {
                    foundPlate = true;
                    break;
                }
            }

            if (!foundPlate) {
                // Se encontró un trayecto con una matrícula no esperada
                return false;
            }
        }

        // Todos los trayectos listados corresponden a las matrículas esperadas
        return true;
    }

    /**
     * Navega a la lista de trayectos de un vehículo específico identificado por su matrícula.
     *
     * @param driver       El controlador de Selenium WebDriver.
     * @param vehiclePlate La matrícula del vehículo cuyos trayectos se desean ver.
     */
    public static void goToList(WebDriver driver, String vehiclePlate) {
        List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));

        for (WebElement row : rows) {
            try {
                WebElement plateCell = row.findElement(By.xpath(".//td[normalize-space(text()) = '" + vehiclePlate + "']"));

                if (plateCell != null) {
                    WebElement viewButton = row.findElement(By.xpath(".//button[contains(text(),'Ver trayectos del vehículo')]"));
                    viewButton.click();
                    break;
                }
            } catch (NoSuchElementException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Verifica si las matrículas de los vehículos disponibles coinciden con una lista esperada.
     *
     * @param driver         El controlador de Selenium WebDriver.
     * @param expectedPlates Lista de matrículas esperadas.
     * @return {@code true} si todas las matrículas disponibles coinciden con las esperadas, {@code false} en caso contrario.
     */
    public static boolean areAvailableVehicles(WebDriver driver, List<String> expectedPlates) {
        List<WebElement> plateCells = driver.findElements(By.xpath("//table/tbody/tr/td[1]"));

        List<String> actualPlates = plateCells.stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());

        return actualPlates.size() == expectedPlates.size() && actualPlates.containsAll(expectedPlates);
    }
}
