package com.smhrd.web.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smhrd.web.dto.PreviewResponseDto;
import com.smhrd.web.entity.DownloadEntity;
import com.smhrd.web.entity.ImageGenEntity;
import com.smhrd.web.entity.UserEntity;
import com.smhrd.web.enumm.CreditType;
import com.smhrd.web.enumm.ImageStatus;
import com.smhrd.web.enumm.MinusAction;
import com.smhrd.web.repository.DownloadRepository;
import com.smhrd.web.repository.ImageRepository;
import com.smhrd.web.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;


@Service
@RequiredArgsConstructor
public class ImageAccessService {
	
	private final ImageRepository imageRepository;
	private final UserRepository userRepository;
	private final DownloadRepository downloadRepository;
	
	private final CreditService creditService;
	private final S3Client s3Client;
	private final S3Presigner s3Presigner;
	
    @Value("${ncp.bucket-name}")  //   버켓만들면 추가
    private String bucketName;
    
    @Transactional   // 생성된 이미지를 히스토리에서 보기
    public PreviewResponseDto preview(Integer userId,Integer calliId) {
		
    	ImageGenEntity img = imageRepository.findByCalliIdAndUser_UserId(calliId,userId)
    						.orElseThrow(()->new IllegalArgumentException("이미지를 찾을 수 없습니다"));
    	if(img.getCalliPath() == null || img.getCalliPath().isBlank()) {
    		throw new IllegalStateException("사진을 찾을 수 없습니다");
    	}
    	if(img.getStatus() != ImageStatus.SUCCESS) {
    		throw new IllegalStateException("이미지가 아직 준비되지 않았습니다."); 
    	}
    	String key = extractkey(img.getCalliPath());
    	
    	int expiresSec = 60;
    	GetObjectRequest getObjectRequest = GetObjectRequest.builder()
    										.bucket(bucketName)
    										.key(key).build();
    	GetObjectPresignRequest presign = GetObjectPresignRequest.builder()
    														.signatureDuration(Duration.ofSeconds(expiresSec))
    														.getObjectRequest(getObjectRequest).build();
    	PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presign);
    	
    	return new PreviewResponseDto(presigned.url().toString(), expiresSec);
    	
    }
    @Transactional
    public PreviewResponseDto  download(Integer userId, Integer calliId) {
    	ImageGenEntity img = imageRepository.findByCalliIdAndUser_UserId(calliId, userId)
    							.orElseThrow(()-> new IllegalArgumentException("이미지를 찾을 수 없습니다."));
    	
    	if(img.getStatus() != ImageStatus.SUCCESS || img.getCalliPath()==null) {
    		throw new IllegalStateException("이미지가 아직 준비되지 않았습니다.");
    	}
    	creditService.minus(userId, MinusAction.DOWNLOAD, calliId);
    	
    	UserEntity userEntity = userRepository.findById(userId)
    							.orElseThrow(()-> new IllegalArgumentException("회원을 찾을 수 없습니다"));
    	DownloadEntity downloadEntity= DownloadEntity.builder()
    									.user(userEntity)
    					    			.image(img).build();
    	downloadRepository.save(downloadEntity);
    	String key= extractkey(img.getCalliPath());
    	int expiresSec = 60;
    	GetObjectRequest getObjectRequest = GetObjectRequest.builder()
    										.bucket(bucketName)
    										.key(key).build();
    	GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
    													 .signatureDuration(Duration.ofSeconds(expiresSec))
    													 .getObjectRequest(getObjectRequest).build();
    	PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(getObjectPresignRequest);
    	
    	return new PreviewResponseDto(presigned.url().toString(), expiresSec);
    	
    }
    
    private String extractkey(String callipath) {
    	String marker = "/" + bucketName + "/";
    	int idx= callipath.indexOf(marker);
    	if(idx >= 0) {
    		return callipath.substring(idx+marker.length());
    	}	
    	return callipath;
    }
    
}
