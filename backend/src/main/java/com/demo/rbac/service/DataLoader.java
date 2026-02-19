package com.demo.rbac.service;

import com.demo.rbac.model.Role;
import com.demo.rbac.model.User;
import com.demo.rbac.repository.RoleRepository;
import com.demo.rbac.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Seeding database...");

        // Create roles
        Role adminRole = createRoleIfNotExists("ROLE_ADMIN");
        Role managerRole = createRoleIfNotExists("ROLE_MANAGER");
        Role userRole = createRoleIfNotExists("ROLE_USER");

        // Seed users
        createUserIfNotExists("admin", "admin123", "admin@rbac.demo", Set.of(adminRole, managerRole, userRole));
        createUserIfNotExists("manager", "manager123", "manager@rbac.demo", Set.of(managerRole, userRole));
        createUserIfNotExists("alice", "alice123", "alice@rbac.demo", Set.of(userRole));
        createUserIfNotExists("bob", "bob123", "bob@rbac.demo", Set.of(userRole));
        createUserIfNotExists("carol", "carol123", "carol@rbac.demo", Set.of(userRole));

        log.info("Database seeded successfully. Users: admin, manager, alice, bob, carol");
    }

    private Role createRoleIfNotExists(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role(name);
            roleRepository.save(role);
            log.debug("Created role: {}", name);
            return role;
        });
    }

    private void createUserIfNotExists(String username, String password, String email, Set<Role> roles) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setRoles(roles);
            userRepository.save(user);
            log.debug("Created user: {} with roles: {}", username, roles.stream().map(Role::getName).toList());
        }
    }
}
