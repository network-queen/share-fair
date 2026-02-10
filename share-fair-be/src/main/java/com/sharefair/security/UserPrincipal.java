package com.sharefair.security;

import com.sharefair.entity.User;

public class UserPrincipal {
    private final String id;
    private final String email;
    private final String name;

    private UserPrincipal(String id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }

    public static UserPrincipal create(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getName());
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}
