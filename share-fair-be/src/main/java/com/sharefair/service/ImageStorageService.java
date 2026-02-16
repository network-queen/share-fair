package com.sharefair.service;

import io.minio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final MinioClient minioClient;
    private final String bucket;
    private final String endpoint;

    public ImageStorageService(MinioClient minioClient,
                               @Value("${minio.bucket}") String bucket,
                               @Value("${minio.endpoint}") String endpoint) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        this.endpoint = endpoint;
    }

    public List<String> uploadImages(String listingId, List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("File too large: " + file.getOriginalFilename());
            }
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Unsupported file type: " + contentType);
            }

            String ext = getExtension(file.getOriginalFilename());
            String objectName = "listings/" + listingId + "/" + UUID.randomUUID() + ext;

            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectName)
                        .stream(is, file.getSize(), -1)
                        .contentType(contentType)
                        .build());
                urls.add(endpoint + "/" + bucket + "/" + objectName);
            } catch (Exception e) {
                log.error("Failed to upload image: {}", e.getMessage());
                throw new RuntimeException("Image upload failed", e);
            }
        }
        return urls;
    }

    public void deleteImage(String imageUrl) {
        try {
            String prefix = endpoint + "/" + bucket + "/";
            if (!imageUrl.startsWith(prefix)) return;
            String objectName = imageUrl.substring(prefix.length());
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to delete image: {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}
