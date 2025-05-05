package com.example.StartUp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
public class FileUploadController {

    @Value("${file.upload-dir:${user.home}/uploads}")
    private String uploadDir;

    @GetMapping("/upload")
    public String showUploadForm() {
        return "upload";
    }

    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleFileUpload(@RequestParam("file") MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 파일 이름 생성
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path path = Paths.get(uploadDir, filename);
        Files.write(path, file.getBytes());

        // Python 스크립트 실행
        // Python 스크립트 실행 부분에서
        ProcessBuilder processBuilder = new ProcessBuilder(
                "/opt/homebrew/bin/python3",
                "python/count_people_yolov8.py",
                path.toString());

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        // 결과 읽기
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        int count = 0;
        String resultImagePath = "";

        while ((line = reader.readLine()) != null) {
            System.out.println(line);
            if (line.startsWith("사람 수:")) {
                count = Integer.parseInt(line.replace("사람 수:", "").trim());
            }
            if (line.startsWith("결과 이미지 경로:")) {
                resultImagePath = line.replace("결과 이미지 경로:", "").trim();
            }
        }

        try {
            process.waitFor();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 결과 반환
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        response.put("originalImage", "/uploads/" + filename);

        // 결과 이미지 경로 처리
        if (!resultImagePath.isEmpty()) {
            File resultFile = new File(resultImagePath);
            String resultFileName = resultFile.getName();
            response.put("resultImage", "/uploads/" + resultFileName);
        } else {
            response.put("resultImage", "/uploads/" + filename);
        }

        return ResponseEntity.ok(response);
    }
}