package com.example.Nhom8;

import com.example.Nhom8.models.Role;
import com.example.Nhom8.repository.FaqItemRepository;
import com.example.Nhom8.repository.RoleRepository;
import com.example.Nhom8.service.CustomerCareService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Nhom8Application {

	public static void main(String[] args) {
		SpringApplication.run(Nhom8Application.class, args);
	}
}
