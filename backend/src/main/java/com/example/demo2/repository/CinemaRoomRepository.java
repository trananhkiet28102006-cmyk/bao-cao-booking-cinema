package com.example.demo2.repository;

import com.example.demo2.entity.CinemaRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRoomRepository extends JpaRepository<CinemaRoom, Long> {
    List<CinemaRoom> findByCinemaId(Long cinemaId);

    boolean existsByCinemaIdAndNameIgnoreCase(Long cinemaId, String name);
}
