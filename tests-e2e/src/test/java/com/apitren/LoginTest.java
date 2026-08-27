package com.apitren;

// Importación de clases de Selenium WebDriver
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

// Importaciones de JUnit 5
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class LoginTest {

    @SuppressWarnings("deprecation")
    @Test
    public void testUserLogin() throws Exception {
        
        // Inicializa el navegador Chrome
        WebDriver driver = new ChromeDriver();  
        
        try {
            // Navega a la URL especificada
            driver.get("https://api-trains.onrender.com/login");
            
            String currentUserHTMLPath="username";
            String currentUser="QAuser";
            String currentPasswordHTMLPath="password";
            String currentPassword="123456789";
            
            // 1. Localizar el campo de usuario y escribir el texto
            Thread.sleep(2000);
            var userInput = driver.findElement(By.name(currentUserHTMLPath));
            userInput.sendKeys(currentUser);

            // Comprobar si el usuario se escribió correctamente
            if (userInput.getAttribute("value").equals(currentUser)) {
            System.out.println("[OK] Nombre de usuario ingresado correctamente: " + currentUser);
            } else {
            System.err.println("[ERROR] No se pudo escribir el nombre de usuario.");
            }

            // 2. Localiza el campo de contraseña y escribe el texto
            Thread.sleep(2000);
            var passInput = driver.findElement(By.name(currentPasswordHTMLPath));
            passInput.sendKeys(currentPassword);

            // Comprueba si la contraseña se escribió correctamente
            if (!passInput.getAttribute("value").isEmpty()) {
            System.out.println("[OK] Password ingresado correctamente.");
            } else {
            System.err.println("[ERROR] No se pudo escribir la contrasena.");
            }

            // Pausa para dar tiempo a que la página procese la redirección
            Thread.sleep(3000);

            // Envía el formulario
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Obtiene la URL actual
            String currentUrl = driver.getCurrentUrl();
            String expectedUrl = "https://api-trains.onrender.com/";

            // Comprueba si la URL actual coincide con la esperada
            if (currentUrl.equals(expectedUrl)) {
            System.out.println("Test COMPLETADO con exito: URL correcta (" + currentUrl + ")");
            } else {
            System.err.println("Test FALLIDO: Se esperaba " + expectedUrl + " pero se obtuvo " + currentUrl);
            }

            // Mantiene la aserción de JUnit para que el runner marque el test como PASSED/FAILED formalmente
            assertEquals(expectedUrl, currentUrl);
            
            
        } finally {
            // Cierra el navegador
            driver.quit();
        }
    }
}