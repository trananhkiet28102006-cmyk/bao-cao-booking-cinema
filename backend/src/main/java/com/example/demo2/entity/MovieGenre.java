package com.example.demo2.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movie_genres", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"movie_id", "genre_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieGenre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;
}
