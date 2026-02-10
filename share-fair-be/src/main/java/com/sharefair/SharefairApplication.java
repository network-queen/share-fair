package com.sharefair;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SharefairApplication {
    public static void main(String[] args) {
        SpringApplication.run(SharefairApplication.class, args);
    }
}
