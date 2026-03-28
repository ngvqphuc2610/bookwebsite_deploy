package com.example.Nhom8.service;

import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.repository.PremiumPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PremiumPackageService {
    private final PremiumPackageRepository premiumPackageRepository;

    public List<PremiumPackage> getAllPackages() {
        return premiumPackageRepository.findAll();
    }

    public PremiumPackage getPackageById(Long id) {
        return premiumPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
    }

    public PremiumPackage createPackage(PremiumPackage pkg) {
        return premiumPackageRepository.save(pkg);
    }

    public PremiumPackage updatePackage(Long id, PremiumPackage pkgDetails) {
        PremiumPackage pkg = getPackageById(id);
        pkg.setName(pkgDetails.getName());
        pkg.setDescription(pkgDetails.getDescription());
        pkg.setPrice(pkgDetails.getPrice());
        pkg.setDurationDays(pkgDetails.getDurationDays());
        return premiumPackageRepository.save(pkg);
    }

    public void deletePackage(Long id) {
        premiumPackageRepository.deleteById(id);
    }
}
