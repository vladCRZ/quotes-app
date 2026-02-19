package com.demo.rbac.service;

import com.demo.rbac.model.Quote;
import com.demo.rbac.model.Role;
import com.demo.rbac.model.User;
import com.demo.rbac.repository.QuoteRepository;
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
    private final QuoteRepository quoteRepository;
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

        // Seed sample quotes
        if (quoteRepository.count() == 0) {
            saveQuote("The only way to do great work is to love what you do.", "Steve Jobs", "admin");
            saveQuote("In the middle of every difficulty lies opportunity.", "Albert Einstein", "admin");
            saveQuote("It does not matter how slowly you go as long as you do not stop.", "Confucius", "admin");
            saveQuote("The mind is everything. What you think you become.", "Buddha", "admin");
            saveQuote("Your time is limited, so don't waste it living someone else's life.", "Steve Jobs", "admin");
            saveQuote("Stay hungry, stay foolish.", "Steve Jobs", "admin");
            saveQuote("The best way to predict the future is to invent it.", "Alan Kay", "admin");
            saveQuote("Life is what happens when you're busy making other plans.", "John Lennon", "admin");
            saveQuote("Get busy living or get busy dying.", "Stephen King", "admin");
            saveQuote("You only live once, but if you do it right, once is enough.", "Mae West", "admin");
            saveQuote(
                    "Many of life's failures are people who did not realize how close they were to success when they gave up.",
                    "Thomas A. Edison", "admin");
            saveQuote("If you want to live a happy life, tie it to a goal, not to people or things.", "Albert Einstein",
                    "admin");
            saveQuote("Never let the fear of striking out keep you from playing the game.", "Babe Ruth", "admin");
            saveQuote("Money and success don’t change people; they merely amplify what is already there.", "Will Smith",
                    "admin");
            saveQuote("Not how long, but how well you have lived is the main thing.", "Seneca", "admin");
            saveQuote("If life were predictable it would cease to be life, and be without flavor.", "Eleanor Roosevelt",
                    "admin");
            saveQuote(
                    "The whole secret of a successful life is to find out what is one’s destiny to do, and then do it.",
                    "Henry Ford", "admin");
            saveQuote("In order to write about life first you must live it.", "Ernest Hemingway", "admin");
            saveQuote("The big lesson in life, baby, is never be scared of anyone or anything.", "Frank Sinatra",
                    "admin");
            saveQuote(
                    "Curiosity about life in all of its aspects, I think, is still the secret of great creative people.",
                    "Leo Burnett", "admin");
            log.info("20 sample quotes seeded.");
        }
    }

    private void saveQuote(String content, String author, String createdBy) {
        Quote q = new Quote();
        q.setContent(content);
        q.setAuthor(author);
        q.setCreatedBy(createdBy);
        quoteRepository.save(q);
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
