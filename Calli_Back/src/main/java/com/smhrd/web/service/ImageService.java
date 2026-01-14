package com.smhrd.web.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.smhrd.web.dto.ImageRequestDto;
import com.smhrd.web.entity.ImageGenEntity;
import com.smhrd.web.entity.UserEntity;
import com.smhrd.web.enumm.ImageStatus;
import com.smhrd.web.enumm.MinusAction;
import com.smhrd.web.repository.ImageRepository;
import com.smhrd.web.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {
	
	private final CreditService creditService;
	private final ImageRepository imageRepository;
	private final UserRepository userRepository;
	private final ImageMaker imageMaker;
	
	@Transactional
	public Integer imagegen(Integer userid,ImageRequestDto imagedto) { // 이미지 생성세팅
		// imagedto => prompt, size 
		UserEntity userEntity = userRepository.findById(userid)
								.orElseThrow(()->new IllegalArgumentException("회원을 찾을 수 없습니다"));
		
		String styprm = imagedto.getStylePrompt(); // 각각의 프롬프트
		String bgprm = imagedto.getBgPrompt();
		String textprm = imagedto.getTextPrompt();
		
		ImageGenEntity genEntity = ImageGenEntity.builder() 
									.user(userEntity) // 회원번호
									.textPrompt(textprm) 
									.bgPrompt(bgprm)
									.stylePrompt(styprm)
									.status(ImageStatus.WAIT) // 이미지 생성대기
									.size(imagedto.getSize()) // 사이즈							
									.modelName("켈리").modelVersion("1.0").build();									
		ImageGenEntity imageGenEntity =imageRepository.save(genEntity);
		
		Integer calliId = imageGenEntity.getCalliId();
		creditService.minus(userid, MinusAction.GENERATE, calliId); // 크레딧 여부 확인
		
	    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                imageMaker.generateAsync(calliId, userid, imagedto);
            }
        });
		

	    return calliId;
		  	
	}
	
}
