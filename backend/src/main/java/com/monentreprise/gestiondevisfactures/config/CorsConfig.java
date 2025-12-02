package com.monentreprise.gestiondevisfactures.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Configuration CORS pour permettre les appels depuis le frontend
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:3000",
                "http://localhost:8080",
                "http://localhost:4200",

                // Domains Vercel
                "https://gestion-des-devis-et-factures.vercel.app",
                "https://gestion-des-devis-et-factu-git-8936ec-riyadmaj10-5705s-projects.vercel.app",
                "https://gestion-des-devis-et-factures-lv97574mo.vercel.app"
        ));

        corsConfiguration.setAllowedHeaders(Arrays.asList(
            "Origin", "Access-Control-Allow-Origin", "Content-Type",
            "Accept", "Authorization", "Origin, Accept", "X-Requested-With",
            "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        corsConfiguration.setExposedHeaders(Arrays.asList(
            "Origin", "Content-Type", "Accept", "Authorization",
            "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials",
            "Content-Disposition"
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = 
            new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
        
        return new CorsFilter(urlBasedCorsConfigurationSource);
    }
}
