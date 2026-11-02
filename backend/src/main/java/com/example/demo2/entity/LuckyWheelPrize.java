package com.example.demo2.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lucky_wheel_prizes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LuckyWheelPrize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "prize_type", nullable = false, length = 30)
    private String prizeType; // POINTS, COUPON, FNB, NO_PRIZE

    @Column(name = "prize_value")
    @Builder.Default
    private Integer prizeValue = 0;

    @Column(name = "probability_weight", nullable = false)
    @Builder.Default
    private Integer probabilityWeight = 10;

    @Column(length = 30)
    private String color;

    @Column(length = 50)
    private String icon;

    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
