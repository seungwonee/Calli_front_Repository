package com.smhrd.web.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.dto.ImageRequestDto;
import com.smhrd.web.dto.PreviewResponseDto;
import com.smhrd.web.dto.oauth.UserPrincipalDetails;
import com.smhrd.web.service.ImageAccessService;
import com.smhrd.web.service.ImageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageController {
	
	private final ImageService imageService;
	private final ImageAccessService accessService;
	
	@PostMapping("/generation")  // 이미지 생성
	public ResponseEntity<?> imagegen(@AuthenticationPrincipal UserPrincipalDetails user,
			@Valid @RequestBody ImageRequestDto imagedto) {
		
		Integer userid = user.getEntity().getUserId();
		Integer callid =imageService.imagegen(userid,imagedto);
		return ResponseEntity.ok(callid);
	}
	
	@PostMapping("/{calliId}/download")
	public ResponseEntity<PreviewResponseDto> download(
			@AuthenticationPrincipal UserPrincipalDetails user, @PathVariable Integer calliId){
		
		Integer userId = user.getEntity().getUserId();
		PreviewResponseDto responseDto = accessService.download(userId, calliId);
		return ResponseEntity.ok(responseDto);
		
	}
}
