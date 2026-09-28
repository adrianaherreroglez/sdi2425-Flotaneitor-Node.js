package com.uniovi.sdi2425entrega2test.n;

import com.uniovi.sdi2425entrega2test.n.pageobjects.*;

import org.junit.jupiter.api.*;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.json.simple.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import com.uniovi.sdi2425entrega2test.n.util.*;
import org.openqa.selenium.support.ui.Select;

import static com.uniovi.sdi2425entrega2test.n.util.SeleniumUtils.*;

import java.util.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class Sdi2425Entrega2TestApplicationTests {

  // Path del driver
  static String Geckodriver = "Rellenar Path del Driver";
  // Path del firefox
  static String PathFirefox = "Rellenar el Path del Firefox";

  //Común a Windows y a MACOSX
  static final String APICLIENT_URL = "http://localhost:8081/apiclient/client.html";
  static final String URL = "http://localhost:8081";
  static WebDriver driver = getDriver(PathFirefox, Geckodriver);

  public static WebDriver getDriver(String PathFirefox, String Geckodriver) {
    System.setProperty("webdriver.firefox.bin", PathFirefox);
    System.setProperty("webdriver.gecko.driver", Geckodriver);
    driver = new FirefoxDriver();
    return driver;
  }

  @BeforeEach
  public void setUp() {
    DatabaseHelper.runNodeScript();
    driver.navigate().to(URL);
  }

  //Después de cada prueba se borran las cookies del navegador
  @AfterEach
  public void tearDown() {
    driver.manage().deleteAllCookies();
  }

  //Al finalizar la última prueba
  @AfterAll
  static public void end() {
    //Cerramos el navegador al finalizar las pruebas
    driver.quit();
  }

  /**
   * Inicio de sesión con datos válidos (administrador)
   */
  @Test
  @Order(1)
  void PR01() {
    String checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);
  }

  /**
   * Inicio de sesión con datos válidos (empleado)
   */
  @Test
  @Order(2)
  public void PR02() {

    String checkText = "Fecha y hora de inicio";
    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";

    PO_LoginView.login(driver, dni, password, checkText);
  }

  /**
   * Prueba de inicio de sesión inválida (employee)
   * Dni y contraseña vacios
   */
  @Test
  @Order(3)
  public void PR03() {

    String checkText = "Identificación de usuario";
    String dni = " ";
    String password = " ";

    PO_LoginView.incorrectLogin(driver, dni, password, checkText);

  }

  /**
   * Prueba de inicio de sesión inválida (employee)
   *
   */
  @Test
  @Order(4)
  public void PR04() {

    String checkText = "Identificación de usuario";
    String dni = "10000002E";
    String password = "Password";

    PO_LoginView.incorrectLogin(driver, dni, password, checkText);
  }

  /**
   * Prueba de cierre de sesión (autenticado)
   */
  @Test
  @Order(5)
  public void PR05() {
    String checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    checkText = "El usuario se ha desconectado correctamente";

    PO_LoginView.logout(driver, checkText);

    PO_LoginView.incorrectLogin(driver, "10000002E", "password", "Identificación de usuario");
  }

  /**
   * Prueba de cierre de sesión (no autenticado)
   */
  @Test
  @Order(6)
  public void PR06() {

    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    checkText = "Cerrar sesión";
    textIsNotPresentOnPage(driver, checkText);

  }

  /**
   * Prueba de registro de un empleado con datos válidos
   */
  @Test
  @Order(7)
  public void PR07() {

    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    WebElement employeeButton = driver.findElement(By.id("employeesDropdown"));
    employeeButton.click();
    WebElement addEmployeeButton = driver.findElement(By.id("addEmployee"));
    addEmployeeButton.click();

    textIsPresentOnPage(driver, "Agregar Empleado");

    String employeeDni = "12345678T";
    String name = "Prueba";
    String surname = "Pruebina";
    checkText = "Usuario";
    PO_EmployeeView.addEmployee(driver, employeeDni, name, surname, checkText);

    textIsPresentOnPage(driver, "12345678T");
    textIsPresentOnPage(driver, "Contraseña");

    By continueButton = By.className("btn");
    driver.findElement(continueButton).click();

    textIsPresentOnPage(driver, "Lista de empleados");
  }

  /**
   * Prueba de registro de un empleado inválido
   *  Dni vacio
   *  Nombre vacio
   *  Apellido vacio
   */
  @Test
  @Order(8)
  public void PR08() {

    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    WebElement employeeButton = driver.findElement(By.id("employeesDropdown"));
    employeeButton.click();
    WebElement addEmployeeButton = driver.findElement(By.id("addEmployee"));
    addEmployeeButton.click();

    textIsPresentOnPage(driver, "Agregar Empleado");

    String employeeDni = " ";
    String name = " ";
    String surname = " ";
    checkText = "Agregar Empleado";
    PO_EmployeeView.addEmployee(driver, employeeDni, name, surname, checkText);

    textIsPresentOnPage(driver, "El dni no puede ser nulo o vacio");
  }

  /**
   * Prueba de registro de un usuario inválido
   * Dni con formato incorrecto
   */
  @Test
  @Order(9)
  public void PR09() {
    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    WebElement employeeButton = driver.findElement(By.id("employeesDropdown"));
    employeeButton.click();
    WebElement addEmployeeButton = driver.findElement(By.id("addEmployee"));
    addEmployeeButton.click();

    textIsPresentOnPage(driver, "Agregar Empleado");

    String employeeDni = "123A";
    String name = "Prueba";
    String surname = "Pruebina";
    checkText = "Agregar Empleado";
    PO_EmployeeView.addEmployee(driver, employeeDni, name, surname, checkText);

    textIsPresentOnPage(driver, "Formato de dni incorrecto");
  }

  /**
   * Prueba de registro de un usuario inválido
   * Dni existente en la base de datos
   */
  @Test
  @Order(10)
  public void PR10() {
    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    WebElement employeeButton = driver.findElement(By.id("employeesDropdown"));
    employeeButton.click();
    WebElement addEmployeeButton = driver.findElement(By.id("addEmployee"));
    addEmployeeButton.click();

    textIsPresentOnPage(driver, "Agregar Empleado");

    String employeeDni = "10000002E";
    String name = "Prueba";
    String surname = "Pruebina";
    checkText = "Agregar Empleado";
    PO_EmployeeView.addEmployee(driver, employeeDni, name, surname, checkText);

    textIsPresentOnPage(driver, "El dni ya se encuentra en la base de datos");
  }



  // Registro de un Vehículo con datos válidos.
  @Test
  @Order(11)
  public void PR11(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "5678JNM", "DFGBKLPYH456RTY78", "Toyota", "X1", "Gasolina");
    boolean isVehicleAdded = PO_VehicleView.isVehicleAdded(driver, "5678JNM");
    Assertions.assertTrue(isVehicleAdded);

  }

  // Registro de un Vehículos con datos inválidos (matrícula vacía, número de bastidor vacío,
  //marca y modelo vacíos.
  @Test
  @Order(12)
  public void PR12(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "", "", "", "", "");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "No puede haber campos vacíos.");
    Assertions.assertEquals("No puede haber campos vacíos.",errors.get(0).getText());
  }

  // Registro de un Vehículos con datos inválidos (formato de matrícula inválido).
  @Test
  @Order(13)
  public void PR13(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "123AAA", "GHJKPI8965RFGB1WF", "BMW", "4x4", "Gasolina");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "La matrícula no tiene un formato válido para España.");
    Assertions.assertEquals("La matrícula no tiene un formato válido para España.",errors.get(0).getText());

  }

  // Registro de un Vehículos con datos inválidos (longitud del número de bastidor inválido).
  @Test
  @Order(14)
  public void PR14(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "8888SSS", "GHJ", "BMW", "4x4", "Gasolina");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "El número de bastidor no tiene la longitud adecuada.");
    Assertions.assertEquals("El número de bastidor no tiene la longitud adecuada.",errors.get(0).getText());

  }

  // Registro de un Vehículos con datos inválidos (matrícula existente).
  @Test
  @Order(15)
  public void PR15(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "1111CDF", "234FGHBNMLKYH8976", "Toyota", "X1", "Gasolina");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "1111CDF", "DFGBJN89765RTYHJB", "Toyota", "X1", "Gasolina");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "La matrícula introducida ya existe en el sistema.");
    Assertions.assertEquals("La matrícula introducida ya existe en el sistema.",errors.get(0).getText());

  }

  // Registro de un Vehículos con datos inválidos (número de bastidor existente).
  @Test
  @Order(16)
  public void PR16(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "4567TYG", "FGNMKLP9876TFGCVB", "Toyota", "X1", "Gasolina");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "El número de bastidor introducido ya existe en el sistema.");
    Assertions.assertEquals("El número de bastidor introducido ya existe en el sistema.",errors.get(0).getText());
  }

  /**
   * Prueba de listado de empleados del sistema. Se muestran todos los empleados del sistema,
   * incluidos el usuario registrado y los empleados administradores.
   */
  @Test
  @Order(17)
  public void PR17(){

    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    String[] registeredDnis = {
        "12345678Z",
        "10000002E",
        "10000003E",
        "10000004E",
        "10000005E",
        "10000006E",
        "10000007E",
        "10000008E",
        "10000009E",
        "10000010E",
        "10000011E",
        "10000012E",
        "10000013E",
        "10000014E",
        "10000015E"
    };
    String[] names = {
        "John",
        "Us3r@1",
        "Us3r@2",
        "Us3r@3",
        "Us3r@4",
        "Us3r@5",
        "Us3r@6",
        "Us3r@7",
        "Us3r@8",
        "Us3r@9",
        "Us3r@10",
        "Us3r@11",
        "Us3r@12",
        "Us3r@13",
        "Us3r@14"
    };

    for(int i = 0; i < registeredDnis.length; i++){
      textIsPresentOnPage(driver, registeredDnis[i]);
      textIsPresentOnPage(driver, names[i]);
      if (i == 4 || i == 9) {
        List<WebElement> paginationButtons = PO_View.checkElementBy(driver, "class", "page-link");
        paginationButtons.get(paginationButtons.size()-1).click();
      }
    }

  }

  /**
   * Prueba de edición válida de empleados del sistema.
   * Se cambia el dni, nombre, apellidos y role del empleado
   * Luego se cierra sesión y se autentifica el usuario editado para
   * comprobar que los cambios han tenido éxito.
   * (La contraseña no cambia)
   */
  @Test
  @Order(18)
  public void PR18(){

    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    List<WebElement> editButtons = driver.findElements(By.xpath("//a[contains(text(), 'Editar')]"));
    WebElement secondElement = editButtons.get(1);
    secondElement.click();

    String newDni = "12345678P";
    String newName = "Pruebina";
    String newSurname = "Editada";
    boolean newRole = true;

    PO_EmployeeView.editEmployee(driver, newDni, newName, newSurname, newRole, "Lista de empleados");

    checkText = "El usuario se ha desconectado correctamente";
    PO_LoginView.logout(driver, checkText);

    password = "Us3r@1-PASSWORD";

    checkText = "Lista de empleados";

    PO_LoginView.login(driver, newDni, password, checkText);

  }


  /**
   * Test de edición incorrecta de un empleado
   * Primero se prueba un DNI ya existente
   * Luego un nombre vacio
   * Por último, un apellido vacio
   */
  @Test
  @Order(19)
  public void PR19(){

    String checkText = "Identificación de usuario";

    textIsPresentOnPage(driver, checkText);

    checkText = "Lista de empleados";
    String dni = "12345678Z";
    String password = "@Dm1n1str@D0r";

    PO_LoginView.login(driver, dni, password, checkText);

    textIsPresentOnPage(driver, "Empleados");

    List<WebElement> editButtons = driver.findElements(By.xpath("//a[contains(text(), 'Editar')]"));
    WebElement secondElement = editButtons.get(1);
    secondElement.click();

    String newDni = "12345678P";
    String newName = "Us3r@1";
    String newSurname = "Userino";
    boolean newRole = false;

    checkText = "El dni seleccionado ya se encuentra registrado";
    PO_EmployeeView.editEmployee(driver, "12345678Z", newName, newSurname, newRole, checkText);

    checkText = "El nombre del empleado no puede ser nulo o vacío";
    PO_EmployeeView.editEmployee(driver, newDni, " ", newSurname, newRole, checkText);

    checkText = "El apellido del empleado no puede ser nulo o vacío";
    PO_EmployeeView.editEmployee(driver, newDni, newName, " ", newRole, checkText);
  }

  // Mostrar el listado de vehículos y comprobar que se muestran todos los que existen en el
  // sistema.
  @Test
  @Order(20)
  public void PR20(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    List<WebElement> result = PO_VehicleView.checkElementBy(driver, "free", "/html/body/div/h2");
    Assertions.assertEquals("Vehículos", result.get(0).getText());
    List<String> plates = Arrays.asList("3333CDF", "2222FGH","5467DTY", "1234BCD", "4567XYZ", "7890LMN");
    boolean areVehiclesAdded = PO_VehicleView.areVehiclesAdded(driver, plates);
    Assertions.assertTrue(areVehiclesAdded);

  }

  // Ir a la lista de vehículos, borrar el primer vehículo de la lista, comprobar que la lista se
  //actualiza y dicho vehículo desaparece.
  @Test
  @Order(21)
  public void PR21(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_VehicleView.deleteFirstVehicleFromList(driver);
    boolean isVehicleAdded = PO_VehicleView.isVehicleAdded(driver, "1234BCD");
    Assertions.assertFalse(isVehicleAdded);
  }

  // Ir a la lista de vehículos, borrar el último vehículo de la lista, comprobar que la lista se
  //actualiza y dicho vehículo desaparece.
  @Test
  @Order(22)
  public void PR22(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_VehicleView.deleteLastVehicleFromList(driver);
    boolean isVehicleAdded = PO_VehicleView.isVehicleAdded(driver, "123BCD");
    Assertions.assertFalse(isVehicleAdded);
  }

  // Ir a la lista de vehículos, borrar 3 vehículos, comprobar que la lista se actualiza y dichos
  //vehículos desaparecen.
  @Test
  @Order(23)
  public void PR23(){
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    PO_VehicleView.deleteVehicle(driver, "3333CDF");
    PO_VehicleView.deleteVehicle(driver, "2222FGH");
    PO_VehicleView.deleteVehicle(driver, "5467DTY");
    boolean isVehicleAdded = PO_VehicleView.isVehicleAdded(driver, "3333CDF");
    Assertions.assertFalse(isVehicleAdded);
    boolean isVehicleAdded2 = PO_VehicleView.isVehicleAdded(driver, "2222FGH");
    Assertions.assertFalse(isVehicleAdded2);
    boolean isVehicleAdded3 = PO_VehicleView.isVehicleAdded(driver, "5467DTY");
    Assertions.assertFalse(isVehicleAdded3);

  }

  // Mostrar el listado de trayectos y comprobar que se muestran todos los que tienen al
  //empleado actual asignado como conductor.
  @Test
  @Order(24)
  public void PR24(){
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id='tripsDropdown']/a", "//*[@id='mytrips']/a");
    List<String> expectedPlates = Arrays.asList("1234BCD", "4567XYZ", "7890LMN", "3333CDF", "2222FGH", "5467DTY");
    Assertions.assertTrue(PO_TripView.areTripsOfUser(driver, expectedPlates));
  }

  // Inicio de trayecto válido
  @Test
  @Order(25)
  public void PR25() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    List<WebElement> result = PO_View.checkElementBy(driver, "text", "Trayectos del vehículo 3333CDF");
    Assertions.assertEquals("Trayectos del vehículo 3333CDF",result.get(0).getText());
    List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));
    Assertions.assertFalse(rows.isEmpty());

  }

  // Inicio de trayecto no válido (el empleado tiene otro trayecto en curso).
  @Test
  @Order(26)
  public void PR26() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id=\"tripsDropdown\"]/a", "//*[@id=\"mytrips\"]/a");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-info");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "No puedes iniciar un nuevo trayecto. Ya tienes uno en curso.");
    Assertions.assertEquals("No puedes iniciar un nuevo trayecto. Ya tienes uno en curso.",errors.get(0).getText());
  }


  // Inicio de trayecto no válido (el vehículo para el que se quiere iniciar el trayecto no está
  //disponible).
  @Test
  @Order(27)
  public void PR27() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");

    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");

    PO_NavView.accessSection(driver, "//*[@id=\"myNavbar\"]/ul[3]/li/a", "/html/body/nav/div/div[2]/ul[3]/li/a");
    PO_LoginView.login(driver, "10000003E", "Us3r@2-PASSWORD", "Registrar inicio de trayecto");

    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    List<WebElement> options = driver.findElements(By.xpath("//select[@id='plate']/option"));
    boolean found = options.stream().anyMatch(option -> option.getText().contains("3333CDF"));
    Assertions.assertFalse(found);

  }

  // Registro de fin de trayecto válido.
  @Test
  @Order(28)
  public void PR28() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id=\"tripsDropdown\"]/a", "//*[@id=\"mytrips\"]/a");
    // Avanzamos en la paginación hasta la última página
    for (int i = 0; i < 11; i++) {
      List<WebElement> paginationButtons = PO_View.checkElementBy(driver, "class", "page-link");
      paginationButtons.get(paginationButtons.size()-1).click();
    }
    PO_NavView.clickOption(driver, "/trips/finish/", "text", "Finalizar trayecto para 3333CDF");
    PO_TripView.finishTrip(driver,"12.21");
    List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));
    Assertions.assertFalse(rows.isEmpty());

  }

  // Registro de fin de trayecto inválido (odómetro vacío).
  @Test
  @Order(29)
  public void PR29() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id=\"tripsDropdown\"]/a", "//*[@id=\"mytrips\"]/a");
    // Avanzamos en la paginación hasta la última página
    for (int i = 0; i < 11; i++) {
      List<WebElement> paginationButtons = PO_View.checkElementBy(driver, "class", "page-link");
      paginationButtons.get(paginationButtons.size()-1).click();
    }
    PO_NavView.clickOption(driver, "/trips/finish/", "text", "Finalizar trayecto para");
    PO_TripView.finishTrip(driver,"");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "El valor del odómetro final no puede estar vacío.");
    Assertions.assertEquals("El valor del odómetro final no puede estar vacío.",errors.get(0).getText());
  }

  //  Registro de fin de trayecto inválido (odómetro negativo).
  @Test
  @Order(30)
  public void PR30() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id=\"tripsDropdown\"]/a", "//*[@id=\"mytrips\"]/a");
    // Avanzamos en la paginación hasta la última página
    for (int i = 0; i < 11; i++) {
      List<WebElement> paginationButtons = PO_View.checkElementBy(driver, "class", "page-link");
      paginationButtons.get(paginationButtons.size()-1).click();
    }
    PO_NavView.clickOption(driver, "/trips/finish/", "text", "Finalizar trayecto para");
    PO_TripView.finishTrip(driver,"-6");
    List<WebElement> errors = PO_VehicleView.checkElementBy(driver, "text", "El valor del odómetro final no puede ser negativo.");
    Assertions.assertEquals("El valor del odómetro final no puede ser negativo.",errors.get(0).getText());

  }

  //  Registro de fin de trayecto inválido (no hay trayectos en curso).
  @Test
  @Order(31)
  public void PR31() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.accessSection(driver, "//*[@id=\"tripsDropdown\"]/a", "//*[@id=\"mytrips\"]/a");
    List<WebElement> finishLinks = driver.findElements(By.xpath("//a[contains(@href, '/trips/finish/')]"));
    Assertions.assertTrue(finishLinks.isEmpty());
  }


  // Mostrar el listado de trayectos y comprobar que se muestran todos los realizados por el
  //vehículo con la matrícula seleccionada.
  @Test
  @Order(32)
  public void PR32() {
    // Registrar un trayecto
    PO_NavView.accessSection(driver, "//*[@id=\"myNavbar\"]/ul[3]/li/a", "/html/body/nav/div/div[2]/ul[3]/li/a");
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");

    // Ir a la lista de trayectos del vehículo 3333CDF
    PO_NavView.accessSection(driver, "//*[@id='tripsDropdown']/a", "//*[@id='historyTrips']/a");
    PO_TripView.goToList(driver, "3333CDF");

    // Verificar que se muestran los trayectos del vehículo
    PO_View.checkElementBy(driver, "text", "Trayectos del vehículo 3333CDF");

    // Comprobar que la lista de trayectos no está vacía
    List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));
    Assertions.assertFalse(rows.isEmpty());
  }



  // Intentar acceder sin estar autenticado a la opción de administrador del listado de
  //empleados. Se deberá volver al formulario de login.
  @Test
  @Order(33)
  public void PR33() {
    List<WebElement> result = PO_View.checkElementBy(driver, "text", "Identificación de usuario");
    Assertions.assertFalse(result.isEmpty());
    Assertions.assertEquals("Identificación de usuario", result.get(0).getText());
    driver.get("http://localhost:8081/employees/list");

    List<WebElement> resultAfter = PO_View.checkElementBy(driver, "text", "Identificación de usuario");
    Assertions.assertEquals("Identificación de usuario", resultAfter.get(0).getText());
  }

  // Estando autenticado como usuario estándar intentar acceder a una opción disponible solo
  //para usuarios administradores (Añadir menú de auditoria (visualizar logs)). Se deberá indicar un
  //mensaje de acción prohibida.
  @Test
  @Order(34)
  public void PR34() {
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");

    driver.get("http://localhost:8081/log/list");

    List<WebElement> resultStatus = PO_View.checkElementBy(driver, "text", "Error 403");
    List<WebElement> resultMessage = PO_View.checkElementBy(driver, "text", "Acción prohibida: solo los administradores pueden acceder a esta sección.");

    Assertions.assertEquals("Error 403", resultStatus.get(0).getText());
    Assertions.assertEquals("Acción prohibida: solo los administradores pueden acceder a esta sección.", resultMessage.get(0).getText());
  }

  //Estando autenticado como usuario administrador visualizar todos los logs generados en
  //una serie de interacciones. Esta prueba deberá generar al menos dos interacciones de cada tipo y
  //comprobar que el listado incluye los logs correspondientes.
  @Test
  @Order(35)
  public void PR35() {
    // LOGIN-ERR
    PO_LoginView.login(driver, "12345", "claveerronea", "Identificación de usuario");
    PO_LoginView.login(driver, "2351", "claveerronea2", "Identificación de usuario");

    // LOGIN-EX
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");

    // PET (Accesos a páginas)
    // Lista de vehículos
    PO_NavView.accessSection(driver, "//*[@id=\"myvehicles\"]/a", "/html/body/nav/div/div[2]/ul[1]/ul/li[1]/a");
    // Añadir vehículos
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");


    // ALTA (Añadir vehículos)
    PO_VehicleView.fillAddVehicleForm(driver, "8888SSS", "CHASISNUM12345678", "Renault", "Clio", "Gasolina");
    PO_NavView.clickOption(driver, "vehicles/add", "class", "btn btn-primary");
    PO_VehicleView.fillAddVehicleForm(driver, "5678XYZ", "CHASISNUM98765432", "Peugeot", "208", "Microhíbrido");

    // LOGOUT
    PO_NavView.accessSection(driver, "//*[@id=\"myNavbar\"]/ul[3]/li/a", "/html/body/nav/div/div[2]/ul[3]/li/a");

    // LOGIN-EX (de nuevo, para acceder a logs)
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");

    // Acceder a logs
    PO_NavView.accessSection(driver, "//*[@id=\"logsDropdown\"]/a", "//*[@id=\"logsDropdown\"]/ul/li[1]/a");

    // Comprobamos que hay al menos 2 logs de cada tipo
    List<WebElement> petLogs = PO_View.checkElementBy(driver, "text", "PET");
    List<WebElement> altaLogs = PO_View.checkElementBy(driver, "text", "ALTA");
    List<WebElement> loginExLogs = PO_View.checkElementBy(driver, "text", "LOGIN-EX");
    List<WebElement> loginErrLogs = PO_View.checkElementBy(driver, "text", "LOGIN-ERR");
    List<WebElement> logoutLogs = PO_View.checkElementBy(driver, "text", "LOGOUT");

    Assertions.assertTrue(petLogs.size() >= 2);
    Assertions.assertTrue(altaLogs.size() >= 2);
    Assertions.assertTrue(loginExLogs.size() >= 2);
    Assertions.assertTrue(loginErrLogs.size() >= 2);
    Assertions.assertFalse(logoutLogs.isEmpty());

  }

  // Estando autenticado como usuario administrador, ir a visualización de logs y filtrar por un
  //tipo, pulsar el botón/enlace borrar logs y comprobar que se eliminan los logs del tipo seleccionado,
  //de la base de datos.
  @Test
  @Order(36)
  public void PR36() {
    // 1. Login como administrador
    PO_LoginView.login(driver, "12345678Z", "@Dm1n1str@D0r", "Lista de empleados");

    // 2. Acceder a la lista de logs
    PO_NavView.accessSection(driver, "//*[@id='logsDropdown']/a", "//*[@id='logsDropdown']/ul/li[1]/a");

    // 3. Filtrar por tipo PET
    WebElement select = SeleniumUtils.waitLoadElementsByXpath(driver, "//*[@id='logTypeSelect']", 10).get(0);
    Select dropdown = new Select(select);
    dropdown.selectByValue("PET");

    SeleniumUtils.waitLoadElementsByXpath(driver, "//*[@id='tableLogs']", 10);
    WebElement table = driver.findElement(By.id("tableLogs"));
    List<WebElement> rows = table.findElements(By.tagName("tr"));
    int petLogsBefore = rows.size() - 1;

    Assertions.assertTrue(petLogsBefore >= 1);

    // 4. Pulsar el botón de eliminar logs filtrados
    WebElement deleteButton = SeleniumUtils.waitLoadElementsByXpath(driver, "//button[contains(text(),'Eliminar logs filtrados')]", 10).get(0);
    deleteButton.click();

    // 5. Volver a aplicar filtro PET
    select = SeleniumUtils.waitLoadElementsByXpath(driver, "//*[@id='logTypeSelect']", 10).get(0);
    dropdown = new Select(select);
    dropdown.selectByValue("PET");

    SeleniumUtils.waitLoadElementsByXpath(driver, "//*[@id='tableLogs']", 10);
    table = driver.findElement(By.id("tableLogs"));
    rows = table.findElements(By.tagName("tr"));
    int petLogsAfter = rows.size() - 1;

    // 6. Debería quedar solo 1 log tipo PET: el que se genera tras eliminar
    Assertions.assertEquals(1, petLogsAfter);
  }

  /**
   * Prueba de repostaje válido
   */
  @Test
  @Order(37)
  public void PR37(){

    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Registrar inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    WebElement tripButton = driver.findElement(By.xpath("/html/body/div/div[2]/a"));
    tripButton.click();

    textIsPresentOnPage(driver, checkText);

    checkText = "1234BCD";

    PO_TripView.registerTrip(driver, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();
    WebElement addRefuelButton = driver.findElement(By.id("addRefuel"));
    addRefuelButton.click();

    String stationName = "Snuckey's";
    double ppu = 3.4;
    double quantity = 12.0;
    boolean fullTank = true;
    double odometerValue = 265.3;
    String obs = "Have you seen my Bigfoot?";

    checkText = "Repostajes: 1234BCD";

    PO_RefuelView.addRefuel(driver, stationName, ppu, quantity, fullTank, odometerValue, obs, checkText);
  }

  /**
   * Prueba de registro de un repostaje inválido, no hay ningún trayecto en curso
   */
  @Test
  @Order(38)
  public void PR38(){

    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Fecha y hora de inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();

    checkText = "Registrar repostaje";
    textIsNotPresentOnPage(driver, checkText);
  }

  /**
   * Prueba de un registro de repostaje inválido
   * Primero se prueba un nombre de estación vacio,
   * segundo se prueba un precio vacio,
   * tercero se prueba una cantidad vacia,
   * por último se prueba un odometro vacio
   */
  @Test
  @Order(39)
  public void PR39(){
    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Fecha y hora de inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    WebElement tripButton = driver.findElement(By.xpath("/html/body/div/div[2]/a"));
    tripButton.click();

    textIsPresentOnPage(driver, checkText);

    checkText = "1234BCD";

    PO_TripView.registerTrip(driver, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();
    WebElement addRefuelButton = driver.findElement(By.id("addRefuel"));
    addRefuelButton.click();

    String stationName = "Snuckey's";
    Double ppu = 3.4;
    Double quantity = 12.0;
    boolean fullTank = true;
    Double odometerValue = 265.3;
    String obs = "Have you seen my Bigfoot?";

    checkText = "El nombre de la estación no puede ser nulo o vacio";
    PO_RefuelView.addRefuel(driver, " ", ppu, quantity, fullTank, odometerValue, obs, checkText);

    checkText = "El precio por unidad no puede ser nulo o vacio";
    PO_RefuelView.addRefuel(driver, stationName, null , quantity, fullTank, odometerValue, obs, checkText);

    checkText = "La cantidad no puede ser nula o vacia";
    PO_RefuelView.addRefuel(driver, stationName, ppu , null, fullTank, odometerValue, obs, checkText);

    checkText = "El valor del odometraje no puede ser nulo o vacio";
    PO_RefuelView.addRefuel(driver, stationName, ppu , quantity, fullTank, null, obs, checkText);
  }

  /**
   * Prueba de un registro de un repostaje inválido, precio y cantidad negativos
   */
  @Test
  @Order(40)
  public void PR40(){

    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Fecha y hora de inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    WebElement tripButton = driver.findElement(By.xpath("/html/body/div/div[2]/a"));
    tripButton.click();

    textIsPresentOnPage(driver, checkText);

    checkText = "1234BCD";

    PO_TripView.registerTrip(driver, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();
    WebElement addRefuelButton = driver.findElement(By.id("addRefuel"));
    addRefuelButton.click();

    String stationName = "Snuckey's";
    Double ppu = 3.4;
    Double quantity = 12.0;
    boolean fullTank = true;
    Double odometerValue = 265.3;
    String obs = "Have you seen my Bigfoot?";

    checkText = "El precio por unidad no puede ser negativo";
    PO_RefuelView.addRefuel(driver, stationName, -2.0, quantity, fullTank, odometerValue, obs, checkText);

    checkText = "La cantidad no puede ser negativa";
    PO_RefuelView.addRefuel(driver, stationName, ppu , -2.0, fullTank, odometerValue, obs, checkText);
  }

  /**
   * Prueba de un registro de un repostaje inválido,
   * el valor del odometraje es menor que al inicio del trayecto
   */
  @Test
  @Order(41)
  public void PR41(){
    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Fecha y hora de inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    WebElement tripButton = driver.findElement(By.xpath("/html/body/div/div[2]/a"));
    tripButton.click();

    textIsPresentOnPage(driver, checkText);

    checkText = "1234BCD";

    PO_TripView.registerTrip(driver, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();
    WebElement addRefuelButton = driver.findElement(By.id("addRefuel"));
    addRefuelButton.click();

    String stationName = "Snuckey's";
    Double ppu = 3.4;
    Double quantity = 12.0;
    boolean fullTank = true;
    Double odometerValue = 0.0;
    String obs = "Have you seen my Bigfoot?";

    checkText = "El valor del odometro al repostar no puede ser menor que al comienzo del trayecto";
    PO_RefuelView.addRefuel(driver, stationName, ppu, quantity, fullTank, odometerValue, obs, checkText);
  }

  /**
   * Prueba de listado de repostajes
   */
  @Test
  @Order(42)
  public void PR42(){
    String checkText = "Identificación de usuario";
    textIsPresentOnPage(driver, checkText);

    String dni = "10000002E";
    String password = "Us3r@1-PASSWORD";
    checkText = "Fecha y hora de inicio";

    PO_LoginView.login(driver, dni, password, checkText);

    checkText = "Repostajes";
    textIsPresentOnPage(driver, checkText);

    WebElement refuelButton = driver.findElement(By.id("refuelsDropdown"));
    refuelButton.click();
    WebElement refuelListButton = driver.findElement(By.id("refuels"));
    refuelListButton.click();

    WebElement plateButton = driver.findElement(By.xpath("/html/body/div/form/div/table/tbody/tr[2]/td[8]/a"));
    plateButton.click();

    checkText = "Repostajes: 5467DTY";
    textIsPresentOnPage(driver, checkText);

    String[] stationNames = {
            "Snuckeys",
            "Shell Fuenlabrada",
            "Repostona",
            "Petrona",
            "Estacion1",
            "Estacion2",
            "Estacion3",
            "MadrePetrolera",
            "Estacion4",
            "Estacion5",
            "Estacion6",
            "Gasolinera",
            "Estacion7",
            "Estacion8",
            "Estacion9"
    };

    for(int i=0; i<stationNames.length; i++){
      textIsPresentOnPage(driver, stationNames[i]);
      if (i == 4 || i == 9) {
        List<WebElement> paginationButtons = PO_View.checkElementBy(driver, "class", "page-link");
        paginationButtons.get(paginationButtons.size()-1).click();
      }
    }
  }


  // Mostrar el listado de vehículos disponibles y comprobar que se muestren sólo los que no
  //estén siendo utilizados.
  @Test
  @Order(43)
  public void PR43(){
    PO_LoginView.login(driver, "10000002E", "Us3r@1-PASSWORD", "Registrar inicio de trayecto");
    PO_NavView.clickOption(driver, "/trips/start", "class", "btn btn-primary");
    PO_TripView.registerTrip(driver, "3333CDF");
    PO_NavView.accessSection(driver, "//*[@id=\"myavailablevehicles\"]/a", "/html/body/nav/div/div[2]/ul[2]/li[1]/a");
    List<String> expectedPlates = Arrays.asList("2222FGH","1234BCD","4567XYZ","5467DTY");
    Assertions.assertTrue(PO_TripView.areAvailableVehicles(driver, expectedPlates));
    List<String> notExpectedPlates = Arrays.asList("3333CDF","7890LMN");
    Assertions.assertFalse(PO_TripView.areAvailableVehicles(driver, notExpectedPlates));
  }

  /**
   * Prueba de inicio de sesión válido vía API REST
   */
  @Test
  @Order(44)
  public void PR44() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/users/login";
    //2. Preparamos el parámetro en formato JSON
    RequestSpecification request = RestAssured.given();
    Map<String, String> requestMap = new HashMap<>();
    requestMap.put("email", "10000002E@flotaneitor.com");
    requestMap.put("password", "Us3r@1-PASSWORD");

    JSONObject requestParams = new JSONObject(requestMap);

    request.header("Content-Type", "application/json");
    request.body(requestParams.toJSONString());
    //3. Hacemos la petición
    Response response = request.post(RestAssuredURL);
    //4. Comprobamos que el servicio ha tenido exito
    Assertions.assertEquals(200, response.getStatusCode());

  }

  /**
   * Prueba de inicio de sesión en API REST con datos inválidos (contraseña incorrecta)
   */
  @Test
  @Order(45)
  public void PR45() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/users/login";

    RequestSpecification request = RestAssured.given();
    Map<String, String> requestMap = new HashMap<>();
    //Email válido (existente)
    requestMap.put("email", "10000002E@flotaneitor.com");
    //Especificamos una contraseña incorrecta
    requestMap.put("password", "contraseñamal");
    JSONObject requestParams = new JSONObject(requestMap);

    request.header("Content-Type", "application/json");
    request.body(requestParams.toJSONString());

    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(401, response.getStatusCode());

    //Comprueba que el cuerpo de la respuesta contenga el mensaje esperado
    String bodyAsString = response.getBody().asString();
    //El inicio de sesión falla por credenciales erróneas
    Assertions.assertTrue(bodyAsString.contains("Usuario o contraseña incorrectos."),
        "El cuerpo de la respuesta no contiene el mensaje esperado.");
  }

  /**
   * Prueba de inicio de sesión en API REST con datos inválidos (campos vacíos)
   */
  @Test
  @Order(46)
  public void PR46() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/users/login";

    RequestSpecification request = RestAssured.given();
    JSONObject requestParams = new JSONObject();
    //Omitimos el email
    //Omitimos la contraseña
    request.header("Content-Type", "application/json");
    request.body(requestParams.toJSONString());

    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(422, response.getStatusCode());

    //Comprueba que el cuerpo de la respuesta contenga el mensaje esperado
    String bodyAsString = response.getBody().asString();
    //El inicio de sesión falla al no especificarse un email o una contraseña
    Assertions.assertTrue(bodyAsString.contains("Debe introducir un email."),
        "Se esperaba un fallo al no especificarse email.");
    Assertions.assertTrue(bodyAsString.contains("Debe introducir una contraseña."),
        "Se esperaba un fallo al no especificarse contraseña.");
  }

  /**
   * Prueba de obtención del listado de vehículos libres vía API REST
   */
  @Test
  @Order(47)
  public void PR47() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/vehicles";

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000003E@flotaneitor.com", "Us3r@2-PASSWORD");

    RequestSpecification request = RestAssured.given();
    request.header("token", authToken);

    Response response = request.get(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(200, response.getStatusCode());

    //Comprueba que el cuerpo de la respuesta tenga el contenido esperado
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(bodyAsString.contains("vehicles"),
        "Se esperaba obtener una lista de vehículos.");
    Assertions.assertFalse(bodyAsString.contains("OCUPADO"),
        "No se esperaban vehículos ocupados (ya en trayecto) en la lista de vehículos.");

  }

  /**
   * Prueba de inicio de un trayecto correctamente en API REST
   */
  @Test
  @Order(48)
  public void PR48() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/trips/start";
    final String GetTripsForVehicleURL = "http://localhost:8081/api/v1.0/vehicles/trips/aaaaaaaaaaaaaaaaaaaaaaaa";


    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000003E@flotaneitor.com", "Us3r@2-PASSWORD");

    RequestSpecification request = RestAssured.given();

    Map<String, String> requestMap = new HashMap<>();
    requestMap.put("plate", "1234BCD");
    JSONObject requestParams = new JSONObject(requestMap);
    request.header("Content-Type", "application/json");
    request.header("token", authToken);
    request.body(requestParams.toJSONString());


    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(201, response.getStatusCode());

    //Comprueba que el cuerpo de la respuesta tenga el contenido esperado
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(bodyAsString.contains("Trayecto iniciado correctamente."),
            "Se esperaba obtener un mensaje confirmando el inicio del trayecto.");

    String idTrayecto = response.jsonPath().getString("_id"); //Recuperamos el id del trayecto

    //Invocamos al servicio S4 que listará los trayectos del vehículo
    RequestSpecification newRequest = RestAssured.given();
    newRequest.header("token", authToken);

    Response newResponse = request.get(GetTripsForVehicleURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(200, newResponse.getStatusCode());

    //Comprueba que el id del trayecto creado está registrado (se ha registrado el trayecto)
    String newBodyAsString = newResponse.getBody().asString();
    Assertions.assertTrue(newBodyAsString.contains(idTrayecto),
            "Se esperaba encontrar el id del trayecto creado en la lista de trayectos.");
  }

  /**
   * Prueba de obtención de los trayectos de un vehículo dado vía API REST
   */
  @Test
  @Order(49)
  public void PR49() {
    final String vehicleId = "aaaaaaaaaaaaaaaaaaaaaaaa"; //Especificamos el ID del vehículo
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/vehicles/trips/" + vehicleId;

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000003E@flotaneitor.com", "Us3r@2-PASSWORD");

    RequestSpecification request = RestAssured.given();
    request.header("token", authToken);

    Response response = request.get(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(200, response.getStatusCode());

    //Extrae el número de elementos de la lista de trayectos (trips)
    int numberOfElements = response.jsonPath().getList("trips").size();
    //Comprueba que el número de trayectos de la lista sea el esperado
    Assertions.assertEquals(11, numberOfElements,
        "Se esperaba obtener un listado de 11 trayectos para el vehículo especificado");

  }

  /**
   * Prueba de obtención del listado de trayectos del usuario autenticado vía API REST
   */
  @Test
  @Order(50)
  public void PR50() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/trips";

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000003E@flotaneitor.com", "Us3r@2-PASSWORD");

    RequestSpecification request = RestAssured.given();
    request.header("token", authToken);

    Response response = request.get(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(200, response.getStatusCode());

    //Extrae el número de elementos de la lista de trayectos (trips) para el usuario autenticado
    int numberOfElements = response.jsonPath().getList("trips").size();

    //Comprueba que el número de trayectos de la lista sea el esperado
    Assertions.assertEquals(6, numberOfElements,
        "Se esperaba obtener un listado de 6 trayectos para el usuario autenticado.");
  }

  /**
   * Prueba de registro de un repostaje válido con API REST
   */
  // Se pone esta anotación pues, el objeto JSONObject provoca warning por usar Map sin especificar
  // los tipos de clave ni valor. Este warning no se puede evitar de ninguna otra manera
  @SuppressWarnings("unchecked")
  @Test
  @Order(51)
  public void PR51() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/refuel";

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000004E@flotaneitor.com", "Us3r@3-PASSWORD");

    RequestSpecification request = RestAssured.given();
    //Especificamos el cuerpo de la petición con los datos del repostaje

    JSONObject requestParams = new JSONObject();
    requestParams.put("id", "aaaaaaaaaaaaaaaaaaaaaaaa");
    requestParams.put("stationName", "Repsol Torrelavega");
    requestParams.put("pricePerUnit", 1.67);
    requestParams.put("quantity", 27);
    requestParams.put("isTankFull", false);
    requestParams.put("odometerRefuelValue", 340);
    requestParams.put("observations", "Sin observaciones.");
    request.header("Content-Type", "application/json");
    request.header("token", authToken);
    request.body(requestParams.toJSONString());


    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP
    Assertions.assertEquals(201, response.getStatusCode());

    //Comprueba que obtiene el mensaje de creación del trayecto
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(bodyAsString.contains("Repostaje realizado correctamente."),
        "Se esperaba obtener un mensaje confirmando el registro del repostaje.");
  }

  /**
   * Prueba de registro de un repostaje vía API REST al no tener el usuario ningún trayecto en curso.
   * Esto produce un conflicto (409)
   */
  // Se pone esta anotación pues, el objeto JSONObject provoca warning por usar Map sin especificar
  // los tipos de clave ni valor. Este warning no se puede evitar de ninguna otra manera
  @SuppressWarnings("unchecked")
  @Test
  @Order(52)
  public void PR52() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/refuel";

    //Hacemos login y obtenemos el token
    //Este usuario no tiene ningún trayecto en curso
    String authToken = loginAndGetToken("10000002E@flotaneitor.com", "Us3r@1-PASSWORD");

    RequestSpecification request = RestAssured.given();
    //Especificamos el cuerpo de la petición con los datos del repostaje
    JSONObject requestParams = new JSONObject();
    requestParams.put("id", "aaaaaaaaaaaaaaaaaaaaaaaa");
    requestParams.put("stationName", "Repsol Torrelavega");
    requestParams.put("pricePerUnit", 1.67);
    requestParams.put("quantity", 27);
    requestParams.put("isTankFull", false);
    requestParams.put("odometerRefuelValue", 340);
    requestParams.put("observations", "Sin observaciones.");
    request.header("Content-Type", "application/json");
    request.header("token", authToken);
    request.body(requestParams.toJSONString());


    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP (espera conflicto)
    Assertions.assertEquals(409, response.getStatusCode());

    //Comprueba que obtiene el mensaje de error al no tener trayectos abiertos
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(bodyAsString.contains(
            "El usuario no puede realizar un repostaje " + "si no tiene un trayecto en curso con el vehículo indicado."),
        "Se esperaba obtener un mensaje indicando que el usuario no puede realizar un repostaje " + "al no tener trayectos en curso.");
  }

  /**
   * Prueba de registro de un repostaje vía API REST al omitir/poner en blanco ciertos campos
   * El validador mostrará los errores y se devolverá un código 422.
   */
  // Se pone esta anotación pues, el objeto JSONObject provoca warning por usar Map sin especificar
  // los tipos de clave ni valor. Este warning no se puede evitar de ninguna otra manera
  @SuppressWarnings("unchecked")
  @Test
  @Order(53)
  public void PR53() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/refuel";

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000004E@flotaneitor.com", "Us3r@3-PASSWORD");

    RequestSpecification request = RestAssured.given();
    //Especificamos el cuerpo de la petición con datos vacíos
    JSONObject requestParams = new JSONObject();
    requestParams.put("id", "aaaaaaaaaaaaaaaaaaaaaaaa");
    requestParams.put("stationName", ""); //Estación vacía
    //Omitimos el precio
    //Omitimos la cantidad
    requestParams.put("isTankFull", false);
    //Omitimos el odómetro
    requestParams.put("observations", "Sin observaciones.");
    request.header("Content-Type", "application/json");
    request.header("token", authToken);
    request.body(requestParams.toJSONString());


    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP (entidad no procesable)
    Assertions.assertEquals(422, response.getStatusCode());

    //Comprueba que obtiene los mensajes de error del validador
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(
        bodyAsString.contains("El nombre de la estación de servicio debe especificarse."),
        "Se esperaba un error al no indicar el nombre de la estación.");
    Assertions.assertTrue(bodyAsString.contains("Debe indicar el precio unitario del combustible."),
        "Se esperaba un error al no especificar el precio unitario.");
    Assertions.assertTrue(
        bodyAsString.contains("Debe especificar la cantidad que está repostando."),
        "Se esperaba un error al no especificar la cantidad repostada.");
    Assertions.assertTrue(
        bodyAsString.contains("Debe especificar el valor del odómetro a la hora de repostar."),
        "Se esperaba un error al no especificar el valor del odómetro a la hora de repostar.");
  }

  /**
   * Prueba de registro de un repostaje vía API REST utilizando valores negativos para cantidad y PPU
   * El validador mostrará los errores y se devolverá un código 422
   */
  // Se pone esta anotación pues, el objeto JSONObject provoca warning por usar Map sin especificar
  // los tipos de clave ni valor. Este warning no se puede evitar de ninguna otra manera
  @SuppressWarnings("unchecked")
  @Test
  @Order(54)
  public void PR54() {
    final String RestAssuredURL = "http://localhost:8081/api/v1.0/refuel";

    //Hacemos login y obtenemos el token
    String authToken = loginAndGetToken("10000004E@flotaneitor.com", "Us3r@3-PASSWORD");

    RequestSpecification request = RestAssured.given();
    //Especificamos el cuerpo de la petición con los datos del repostaje
    JSONObject requestParams = new JSONObject();
    requestParams.put("id", "aaaaaaaaaaaaaaaaaaaaaaaa");
    requestParams.put("stationName", "Repsol Torrelavega");
    requestParams.put("pricePerUnit", -0.98); //Indicamos un precio negativo
    requestParams.put("quantity", -60); //Indicamos una cantidad negativa
    requestParams.put("isTankFull", false);
    requestParams.put("odometerRefuelValue", 340);
    requestParams.put("observations", "Sin observaciones.");
    request.header("Content-Type", "application/json");
    request.header("token", authToken);
    request.body(requestParams.toJSONString());


    Response response = request.post(RestAssuredURL);

    //Comprueba el código HTTP (entidad no procesable)
    Assertions.assertEquals(422, response.getStatusCode());

    //Comprueba que obtiene los mensajes de error al contener valores negativos
    String bodyAsString = response.getBody().asString();
    Assertions.assertTrue(
        bodyAsString.contains("El precio unitario del combustible debe ser un valor positivo."),
        "Se esperaba obtener un error al ser el precio unitario un valor negativo.");
    Assertions.assertTrue(
        bodyAsString.contains("La cantidad repostada debe ser un valor positivo."),
        "Se esperaba obtener un error al ser la cantidad repostada un valor negativo.");
  }

  /**
   * Prueba de Login en Cliente Ligero - Inicio de Sesión con Datos Válidos
   */
  @Test
  @Order(57)
  public void PR57() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000002E@flotaneitor.com";
    String password = "Us3r@1-PASSWORD";

    // Comprobamos que accedemos al login al no haber iniciado sesión con anterioridad
    SeleniumUtils.textIsPresentOnPage(driver, "Iniciar Sesión");
    // Rellenamos el formulario de login con datos válidos
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Comprobamos que se ha accedido correctamente
    SeleniumUtils.textIsPresentOnPage(driver, "Usuario autorizado.");
    // Comprobamos que se muestra el widget de listado de vehículos
    PO_LoginView.checkElementBy(driver, "text", "Vehículos Disponibles");
  }

  /**
   * Prueba de Login en Cliente Ligero - Inicio de Sesión con Contraseña Incorrecta
   */
  @Test
  @Order(58)
  public void PR58() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000002E@flotaneitor.com";
    String wrongPassword = "wrongPassword";

    // Comprobamos que accedemos al login al no haber iniciado sesión con anterioridad
    SeleniumUtils.textIsPresentOnPage(driver, "Iniciar Sesión");
    // Rellenamos el formulario de login con datos válidos
    PO_LoginView.fillApiClientLoginForm(driver, email, wrongPassword);
    // Comprobamos que sale el mensaje de error
    SeleniumUtils.textIsPresentOnPage(driver, "Usuario o contraseña incorrectos.");
    // Comprobamos que se sigue en el formulario de login
    PO_LoginView.checkElementBy(driver, "text", "Iniciar Sesión");
  }

  /**
   * Prueba de Login en Cliente Ligero - Inicio de Sesión con Email y Contraseña Vacíos
   */
  @Test
  @Order(59)
  public void PR59() {
    driver.navigate().to(APICLIENT_URL);
    String email = "";
    String password = "";

    // Comprobamos que accedemos al login al no haber iniciado sesión con anterioridad
    SeleniumUtils.textIsPresentOnPage(driver, "Iniciar Sesión");
    // Rellenamos el formulario de login con datos válidos
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Comprobamos que sale el mensaje de error
    SeleniumUtils.textIsPresentOnPage(driver, "Debe introducir un email.");
    SeleniumUtils.textIsPresentOnPage(driver, "El email debe tener un formato válido.");
    SeleniumUtils.textIsPresentOnPage(driver, "Debe introducir una contraseña.");
    // Comprobamos que se sigue en el formulario de login
    PO_LoginView.checkElementBy(driver, "text", "Iniciar Sesión");
  }

  /**
   * Prueba de Listado de Vehículos Disponibles en Cliente Ligero Se comprueba que se muestran solo
   * los vehículos libres
   */
  @Test
  @Order(60)
  public void PR60() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000002E@flotaneitor.com";
    String password = "Us3r@1-PASSWORD";
    // Sabemos que la base de datos tiene 3 vehículos, 2 de ellos libres, 1 ocupado
    int expectedFreeCars = 5;

    // Iniciamos sesión
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Comprobamos que se muestra el widget de listado de vehículos
    PO_View.checkElementBy(driver, "text", "Vehículos Disponibles");
    // Obtenemos los vehículos que se visualizan
    List<WebElement> freeVehicles =
        SeleniumUtils.waitLoadElementsBy(driver, "class", "panel-body", PO_View.getTimeout());
    // Comprobamos que se visualizan los vehículos esperados
    Assertions.assertEquals(expectedFreeCars, freeVehicles.size());
  }

  /**
   * Prueba de Listado de Vehículos Disponibles en Cliente Ligero. Se inicia un trayecto y se
   * comprueba que redirige a la lista de trayectos de dicho vehículo
   */
  @Test
  @Order(61)
  public void PR61() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000002E@flotaneitor.com";
    String password = "Us3r@1-PASSWORD";

    // Iniciamos sesión
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Comprobamos que se muestra el widget de listado de vehículos
    PO_View.checkElementBy(driver, "text", "Vehículos Disponibles");
    // Obtenemos el botón de empezar trayecto y la matrícula de dicho coche
    List<WebElement> plateList = SeleniumUtils.waitLoadElementsByXpath(driver,
        "/html/body/div[1]/div/div[2]/div[1]/div/div[2]/p[1]", PO_View.getTimeout());
    String plate = plateList.get(0).getText().split(" ")[1];
    List<WebElement> startTripButton = SeleniumUtils.waitLoadElementsByXpath(driver,
        "/html/body/div[1]/div/div[2]/div[1]/div/div[2]/button", PO_View.getTimeout());
    // Le damos click al botón
    startTripButton.get(0).click();
    // Comprobamos que se muestra el widget de listado de trayectos de dicho vehículo
    PO_View.checkElementBy(driver, "text", "Trayectos - " + plate);
    // Comprobamos que se muestra el trayecto actual
    List<WebElement> inCourseTrips =
        SeleniumUtils.waitLoadElementsBy(driver, "text", "En curso", PO_View.getTimeout());
    // Comprobamos que efectivamente hay un trayecto en curso
    Assertions.assertFalse(inCourseTrips.isEmpty());
  }

  /**
   * Prueba de Listado de Trayectos de un Vehículo. Se accede a la lista de trayectos de un
   * vehículo con 10 trayectos
   */
  @Test
  @Order(62)
  public void PR62() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000002E@flotaneitor.com";
    String password = "Us3r@1-PASSWORD";
    String plate = "1234BCD";

    // Iniciamos sesión
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Comprobamos que se muestra el widget de listado de vehículos
    PO_View.checkElementBy(driver, "text", "Vehículos Disponibles");
    // Accedemos al menú de trayectos de vehículos
    PO_NavView.
        accessClientApiSection(driver, "/html/body/nav/div/div[2]/ul[1]/li[2]/a",
        "Selecciona un vehículo");
    // Cogemos el select de los vehículos
    Select select = new Select(PO_View.checkElementBy(driver, "id", "vehicleSelect").get(0));
    select.selectByVisibleText(plate);
    PO_View.checkElementBy(driver, "text", "Trayectos - " + plate);
    // Obtenemos las filas de la tabla para comprobar que hay 3
    List<WebElement> trips = PO_View.checkElementBy(driver, "free", "//table/tbody/tr");
    Assertions.assertEquals(11, trips.size());
  }

  /**
   * Prueba de Listado de Trayectos de un Usuario. Se accede a la lista de trayectos de un
   * usuario con 6 trayectos
   */
  @Test
  @Order(63)
  public void PR63() {
    driver.navigate().to(APICLIENT_URL);
    String email = "10000003E@flotaneitor.com";
    String password = "Us3r@2-PASSWORD";

    // Iniciamos sesión
    PO_LoginView.fillApiClientLoginForm(driver, email, password);
    // Accedemos al menú de trayectos de vehículos
    PO_NavView.accessClientApiSection(driver, "/html/body/nav/div/div[2]/ul[1]/li[3]/a",
        "Mis Trayectos");
    // Obtenemos las filas de la tabla para comprobar que hay 2
    List<WebElement> trips = PO_View.checkElementBy(driver, "free", "//table/tbody/tr");
    Assertions.assertEquals(6, trips.size());
  }

}
