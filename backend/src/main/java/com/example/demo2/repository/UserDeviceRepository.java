package com.example.demo2.repository;

import com.example.demo2.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    Optional<UserDevice> findByUserIdAndDeviceToken(Long userId, String deviceToken);

    List<UserDevice> findByUserIdAndIsActiveTrue(Long userId);

    List<UserDevice> findByUserIdOrderByLastActiveAtDesc(Long userId);

    void deleteByUserIdAndDeviceToken(Long userId, String deviceToken);
}
