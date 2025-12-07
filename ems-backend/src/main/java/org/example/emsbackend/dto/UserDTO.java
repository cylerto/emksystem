package org.example.emsbackend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class UserDTO {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String role;
}
