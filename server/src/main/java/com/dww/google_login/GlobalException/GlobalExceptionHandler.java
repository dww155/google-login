package com.dww.google_login.GlobalException;

import com.dww.google_login.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> runtimeException(AppException exception) {

        ApiResponse response = ApiResponse.error(410, exception.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

    }
}
