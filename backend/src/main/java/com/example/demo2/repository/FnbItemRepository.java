package com.example.demo2.repository;

import com.example.demo2.entity.FnbItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FnbItemRepository extends JpaRepository<FnbItem, Long> {

    List<FnbItem> findByIsActiveTrue();

    List<FnbItem> findByCategory(String category);

    List<FnbItem> findByCategoryAndIsActiveTrue(String category);
}
