package com.demo.rbac.service;

import com.demo.rbac.dto.ChangePasswordRequest;
import com.demo.rbac.dto.UpdateProfileRequest;
import com.demo.rbac.model.User;

public interface UserService {
    User updateProfile(String username, UpdateProfileRequest request);

    void changePassword(String username, ChangePasswordRequest request);
}
