package com.example.demo2.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movie_casts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieCast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "role_type", length = 50)
    private String roleType; // actor, director, producer

    @Column(name = "person_name", length = 255)
    private String personName;

    @Column(name = "character_name", length = 255)
    private String characterName;

    @Column(name = "display_order")
    private Integer displayOrder;
}
