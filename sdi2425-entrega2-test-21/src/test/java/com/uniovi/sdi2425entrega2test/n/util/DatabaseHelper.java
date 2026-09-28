package com.uniovi.sdi2425entrega2test.n.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class DatabaseHelper {

    public static void runNodeScript() {
        // Ruta al script Node.js
        String scriptPath = "src/test/java/com/uniovi/sdi2425entrega2test/n/util/scripts/testInitDB.js";

        // Construir el comando para ejecutar el script con Node.js
        ProcessBuilder processBuilder = new ProcessBuilder("node", scriptPath);

        try {
            // Ejecutar el script
            Process process = processBuilder.start();

            // Leer el flujo de salida estándar (stdout) del proceso
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);  // Imprime la salida estándar
            }

            // Leer el flujo de error estándar (stderr) del proceso
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            String errorLine;
            while ((errorLine = errorReader.readLine()) != null) {
                System.err.println(errorLine);  // Imprime el error estándar
            }

            // Esperar a que termine el proceso y obtener el código de salida
            int exitCode = process.waitFor();

            // Verificar el código de salida
            if (exitCode == 0) {
                System.out.println("El script se ejecutó correctamente.");
            } else {
                System.err.println("Hubo un error al ejecutar el script. Código de salida: " + exitCode);
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
