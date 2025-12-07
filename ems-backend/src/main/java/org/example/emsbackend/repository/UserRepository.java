package org.example.emsbackend.repository;

import org.example.emsbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Можно добавить методы поиска по username, если понадобится
}
