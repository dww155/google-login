package com.dww.google_login.service;

import com.dww.google_login.GlobalException.AppException;
import com.dww.google_login.dto.AuthRequest;
import com.dww.google_login.dto.AuthResponse;
import com.dww.google_login.dto.IntrospectRequest;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthService {

    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${jwt.expiration-time}")
    long EXPIRY_TIME;

    @NonFinal
    @Value("${jwt.key}")
    private String SIGNER_KEY;

    public AuthResponse login(AuthRequest request) {
        String encodedPassword = passwordEncoder.encode("admin123");

        String username = request.getUsername();

        if (!username.equals("admin"))
            throw new AppException("UNAUTHENTICATED");

        if (!passwordEncoder.matches(request.getPassword(), encodedPassword))
            throw new AppException("UNAUTHENTICATED");

        return AuthResponse.builder()
                .valid(true)
                .token(tokenGenerate("admin", "ROLE_ADMIN"))
                .build();
    }

    public Boolean introspect(IntrospectRequest request) {
        try {
            String token = request.getToken();

            MACVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

            SignedJWT signedJWT = SignedJWT.parse(token);

            boolean verified = signedJWT.verify(verifier);

            log.info(String.valueOf(verified));

            return verified;
        } catch (JOSEException | ParseException e) {
            throw new RuntimeException(e);
        }
    }

    public SignedJWT verify(String token) {
        try {
            MACVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

            // check signer key validate
            SignedJWT signedJWT = SignedJWT.parse(token);
            boolean valid = signedJWT.verify(verifier);

            // check expiry date validate
            Date now = new Date();
            Date expiryDate = signedJWT.getJWTClaimsSet().getExpirationTime();

            if (valid && now.before(expiryDate))
                return signedJWT;
            else
                throw new AppException("UNAUTHENTICATED");
        } catch (JOSEException | ParseException e) {
            throw new RuntimeException(e);
        }
    }

    private String tokenGenerate(String username, String role) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .claim("scope", role)
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(new Date(Instant.now().plus(EXPIRY_TIME, ChronoUnit.SECONDS).toEpochMilli()))
                .issuer("Gtel")
                .issueTime(new Date())
                .build();
        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject object = new JWSObject(header, payload);

        try {
            MACSigner macSigner = new MACSigner(SIGNER_KEY.getBytes());
            object.sign(macSigner);
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }

        return object.serialize();
    }
}
