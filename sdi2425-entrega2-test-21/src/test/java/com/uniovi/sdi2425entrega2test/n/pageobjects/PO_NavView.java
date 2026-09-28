package com.uniovi.sdi2425entrega2test.n.pageobjects;

import com.uniovi.sdi2425entrega2test.n.util.SeleniumUtils;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Clase base para las vistas de navegación dentro de la aplicación.
 * Proporciona métodos reutilizables para acceder a secciones del menú,
 * cambiar de idioma y navegar a vistas específicas validando su carga.
 */
public class PO_NavView extends PO_View {

    /**
     * Accede a una sección del menú de navegación especificada por una ruta XPath,
     * y posteriormente a una sub-sección también indicada por XPath.
     *
     * @param driver              WebDriver que controla el navegador.
     * @param xPathNavSection     XPath de la sección principal del menú a la que se desea acceder.
     * @param xPathConcreteSection XPath de la subsección concreta dentro del menú.
     */
    public static void accessSection(WebDriver driver, String xPathNavSection, String xPathConcreteSection) {
        List<WebElement> elements = PO_View.checkElementBy(driver, "free", xPathNavSection);
        elements.get(0).click();
        // Esperamos a que aparezca la opción concreta y la seleccionamos
        elements = PO_View.checkElementBy(driver, "free", xPathConcreteSection);
        elements.get(0).click();
    }

    /**
     * Hace clic en una opción principal de la interfaz (por ejemplo, un enlace o botón)
     * y verifica que se ha navegado correctamente a la vista de destino comprobando
     * que contiene un elemento identificado por un criterio con un texto esperado.
     *
     * @param driver     WebDriver que controla el navegador.
     * @param textOption Texto o identificador del enlace o botón a pulsar.
     * @param criterio   Criterio de búsqueda del elemento en la vista de destino.
     *                   Puede ser "id", "class", "text", "@atributo" o "free" (XPath completo).
     * @param targetText Texto esperado del elemento que debe aparecer tras la navegación.
     */
    public static void clickOption(WebDriver driver, String textOption, String criterio, String targetText) {
        // Esperamos a que se cargue el enlace
        List<WebElement> elements = SeleniumUtils.waitLoadElementsBy(driver, "@href", textOption, getTimeout());
        Assertions.assertEquals(1, elements.size());
        elements.get(0).click();

        // Esperamos que se cargue la vista de destino
        elements = SeleniumUtils.waitLoadElementsBy(driver, criterio, targetText, getTimeout());
        Assertions.assertEquals(1, elements.size());
    }

    /**
     * Accede a una sección del menú de navegación
     * @param driver:       apuntando al navegador abierto actualmente
     * @param sectionXPath:  Xpath de la sección a la que se quiere acceder
     * @param checkText: texto que permite comprobar que se ha accedido a dicha sección
     */
    public static void accessClientApiSection(WebDriver driver, String sectionXPath, String checkText) {
        //CLickamos en la opción de registro y esperamos a que se cargue el enlace de Registro.
        List<WebElement> elements = SeleniumUtils.waitLoadElementsByXpath(driver, sectionXPath, getTimeout());
        Assertions.assertEquals(1, elements.size());
        elements.get(0).click();
        SeleniumUtils.waitLoadElementsBy(driver, "text", checkText, getTimeout());
    }
}
