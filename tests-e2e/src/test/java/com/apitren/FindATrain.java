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

public class FindATrain {

    // Método auxiliar para tipear simulando a un usuario real (letra por letra)
    private void typeHumanLike(WebElement element, String text) throws InterruptedException {
        element.click(); // Hace foco visual en el input
        for (char ch : text.toCharArray()) {
            element.sendKeys(String.valueOf(ch));
            Thread.sleep(120); // Pausa de 120ms entre cada tecla para que sea visible
        }
    }

    @Test
    public void testFindATrain() {
        System.setProperty("webdriver.chrome.silentOutput", "true");
        Logger.getLogger("org.openqa.selenium").setLevel(Level.OFF);

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--log-level=3");
        options.addArguments("--silent");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            driver.get("https://api-trains.onrender.com/");
            String expectedUrl = "https://api-trains.onrender.com/";
            
            String currentUserHTMLPath="usernameLogIn";
            String currentUser="QAuser_1";
            String currentPasswordHTMLPath="passwordLogIn";
            String currentPassword="QApassword123";
            
            String inputSearchElement="search";
            String currentTrain="metro";
            String idSpecificTrain="11";
            String expectedUrlTrainDetails="https://api-trains.onrender.com/html/TrenesDetalles.html?id="+idSpecificTrain;
            
            // 1. Escribir usuario de forma visible
            WebElement userInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.name(currentUserHTMLPath))
            );
            typeHumanLike(userInput, currentUser);
            Thread.sleep(500);
            
            // 2. Escribir contraseña de forma visible
            WebElement passInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.name(currentPasswordHTMLPath))
            );
            typeHumanLike(passInput, currentPassword);
            Thread.sleep(500);
            
            // 3. Clic en el botón de submit
            WebElement submitBtn = wait.until(
                ExpectedConditions.elementToBeClickable(By.xpath("//button[text()='Iniciar sesión']"))
            );
            Thread.sleep(800); // Pausa visual antes de pulsar el botón
            submitBtn.click();
            
            Thread.sleep(6000);
            
            String currentUrl = driver.getCurrentUrl();
            // 4. Validar redirección
            wait.until(ExpectedConditions.urlToBe(expectedUrl));
            if (currentUrl.equals(expectedUrl)) {
                System.out.println("[OK] INICIO SESIÓN CORRECTO : " + currentUrl);
            } else {
                System.err.println("[ERROR] INICIO SESIÓN FALLIDO: " + currentUrl);
            }

            assertEquals(expectedUrl, currentUrl, "La URL tras el INICIO DE SESIÓN no coincide con la esperada.");

            //5.ESCRIBIR EN EL BUSCADOR
            WebElement inputSearch = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id(inputSearchElement))
            );
            Thread.sleep(800); // Pausa visual antes de pulsar el botón
            typeHumanLike(inputSearch,currentTrain );
            Thread.sleep(1000);

            //6. LOCALIZAR TABLA , Y LOCALIZAR "TREN" EN CONCRETO
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//tbody[@id='tabla-trenes']")));
            WebElement specificTrain = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//tr[@data-id='"+idSpecificTrain+"']"))
            );
            specificTrain.click();
            Thread.sleep(4000);
            
            //7.VALIDAR URL EXACTA DE DETALLES DEL TREN
            String currentUrlTrainDetails = driver.getCurrentUrl();

            wait.until(ExpectedConditions.urlToBe(expectedUrlTrainDetails));
            Thread.sleep(800);
            if (currentUrlTrainDetails.equals(expectedUrlTrainDetails)) {
                Thread.sleep(800);
                System.out.println("[OK] ACCESO A TREN CORRECTO : " + expectedUrlTrainDetails);
            } else {
                System.err.println("[ERROR] ACCESO A TREN FALLIDO: " + expectedUrlTrainDetails);
            }

            assertEquals(expectedUrlTrainDetails, currentUrlTrainDetails, "La URL tras entrar en LOS DETALLES DEL TREN no coincide con la esperada.");

        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}