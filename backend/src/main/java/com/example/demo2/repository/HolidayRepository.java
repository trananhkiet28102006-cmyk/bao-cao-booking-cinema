package com.example.demo2.repository;

import com.example.demo2.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByHolidayDate(LocalDate holidayDate);

    @Query("SELECT h FROM Holiday h WHERE YEAR(h.holidayDate) = :year")
    List<Holiday> findByYear(@Param("year") int year);
}
