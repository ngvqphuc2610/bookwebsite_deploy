package com.example.Nhom8.controllers;

import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.service.PremiumPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/premium/packages")
@RequiredArgsConstructor
public class PremiumPackageController {
    private final PremiumPackageService premiumPackageService;

    @GetMapping
    public ResponseEntity<List<PremiumPackage>> getAllPackages() {
        return ResponseEntity.ok(premiumPackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PremiumPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(premiumPackageService.getPackageById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<PremiumPackage> createPackage(@RequestBody PremiumPackage pkg) {
        return ResponseEntity.ok(premiumPackageService.createPackage(pkg));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<PremiumPackage> updatePackage(@PathVariable Long id, @RequestBody PremiumPackage pkg) {
        return ResponseEntity.ok(premiumPackageService.updatePackage(id, pkg));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        premiumPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
