package com.smhrd.web.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.smhrd.web.dto.ImageRequestDto;
import com.smhrd.web.entity.ImageGenEntity;
import com.smhrd.web.repository.ImageRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageMaker {  // 진짜 이미지 생성을 담당
	
	private final ImageRepository imageRepository;
	
	@Async
	public void generateAsync(Integer calliid, Integer userid, ImageRequestDto imagedto) {
		  
		
		
		
		
		
		
	}
	@Transactional   // 엔티티 변경감지(Dirty Checking)로 status/path 변경 내용을 커밋 시 DB에 반영
	public void sucimage(Integer callid, String path) { 
		ImageGenEntity genEntity =  imageRepository.findById(callid)  // 
										.orElseThrow(() -> new IllegalArgumentException("해당 이미지를 찾을 수 없습니다"));
		genEntity.makesuc(path); // 이미지가 생성이 됐다면 경로 저장
	}
	@Transactional  // 실패시 DB저장
	public void failimage(Integer callid,String path) {
		ImageGenEntity genEntity = imageRepository.findById(callid)
									.orElseThrow(()-> new IllegalArgumentException("해당 이미지를 찾을 수 없습니다."));
		genEntity.makefail("이미지 생성 실패");  // 이미지 생성 실패
	}
}
