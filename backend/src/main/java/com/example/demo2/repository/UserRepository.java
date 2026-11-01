package com.example.demo2.repository;

import com.example.demo2.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);

    @Query("""
        SELECT u FROM User u
        WHERE (:role IS NULL OR :role = '' OR LOWER(u.role) = LOWER(:role))
          AND (:status IS NULL OR :status = '' OR LOWER(u.status) = LOWER(:status))
          AND (:keyword IS NULL OR :keyword = ''
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<User> searchUsers(
            @Param("role") String role,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByRole(String role);
}
