package com.apitren;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class RegisterTest {

    // Método auxiliar para tipear simulando a un usuario real (letra por letra)
    private void typeHumanLike(WebElement element, String text) throws InterruptedException {
        element.click(); // Hace foco visual en el input
        for (char ch : text.toCharArray()) {
            element.sendKeys(String.valueOf(ch));
            Thread.sleep(120); // Pausa de 120ms entre cada tecla para que sea visible
        }
    }

    @Test
    public void testUserRegister() {
        System.setProperty("webdriver.chrome.silentOutput", "true");
        Logger.getLogger("org.openqa.selenium").setLevel(Level.OFF);

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--log-level=3");
        options.addArguments("--silent");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            driver.get("https://api-trains.onrender.com/");

            String userHTMLPath = "usernameRegister";
            String newUser = "QAuser_" + System.currentTimeMillis();

            String passHTMLPath = "passwordRegister";
            String newPassword = "123456789";

            // 1. Escribir usuario de forma visible
            WebElement userInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.name(userHTMLPath))
            );
            typeHumanLike(userInput, newUser);
            Thread.sleep(500);

            if (userInput.getAttribute("value").equals(newUser)) {
                System.out.println("[OK] Usuario de registro ingresado: " + newUser);
            } else {
                System.err.println("[ERROR] No se pudo escribir el usuario de registro");
            }

            // 2. Escribir contraseña de forma visible
            WebElement passInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.name(passHTMLPath))
            );
            typeHumanLike(passInput, newPassword);
            Thread.sleep(500);

            if (!passInput.getAttribute("value").isEmpty()) {
                System.out.println("[OK] Contrasena de registro ingresada correctamente");
            } else {
                System.err.println("[ERROR] No se pudo escribir la contrasena de registro");
            }

            // 3. Clic en el botón de submit
            WebElement submitBtn = wait.until(
                ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']"))
            );
            Thread.sleep(800); // Pausa visual antes de pulsar el botón
            submitBtn.click();

            // 4. Validar redirección
            String expectedUrl = "https://api-trains.onrender.com/login";
            wait.until(ExpectedConditions.urlToBe(expectedUrl));

            String currentUrl = driver.getCurrentUrl();

            if (currentUrl.equals(expectedUrl)) {
                System.out.println("[OK] Registro completado con exito. Redirigido a: " + currentUrl);
            } else {
                System.err.println("[ERROR] Registro fallido. URL obtenida: " + currentUrl);
            }

            assertEquals(expectedUrl, currentUrl, "La URL tras el registro no coincide con la esperada.");

        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}