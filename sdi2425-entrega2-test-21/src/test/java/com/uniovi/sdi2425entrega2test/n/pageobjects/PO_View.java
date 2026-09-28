package com.uniovi.sdi2425entrega2test.n.pageobjects;

import java.util.List;
import com.uniovi.sdi2425entrega2test.n.util.SeleniumUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_View {

	protected static final int timeout = 5;

	public static int getTimeout() {
		return timeout;
	}

	/**
	 *  Espera por la visibilidad de un elemento/s en la vista actualmente cargandose en driver..
	 * 
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param type: 
	 * @param text:
	 * @return Se retornará la lista de elementos resultantes de la búsqueda.
	 */
	static public List<WebElement> checkElementBy(WebDriver driver, String type, String text) {
		return  SeleniumUtils.waitLoadElementsBy(driver, type, text, getTimeout());
	}
}
