package com.smhrd.web.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smhrd.web.dto.UpdateDto;
import com.smhrd.web.dto.UserRequestDto;
import com.smhrd.web.entity.UserEntity;
import com.smhrd.web.repository.UserRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final PasswordEncoder encoder;
	private final UserRepository repo;
	
	
	public int join(UserRequestDto dto) {  // 회원가입
		String loginId = dto.getLoginId(); // 입력받은 id 
		String name = dto.getUserName();
		
		boolean chk =repo.existsByLoginId(loginId); // id 중복 체크 일반회원 
		
		if(chk) { // id가 중복이라면
			return 0;
		}
		String PwEncode = encoder.encode(dto.getLoginPw()); // 비밀번호 암호화
		
		UserEntity user= UserEntity.createLocal(loginId, PwEncode, dto.getUserEmail(), dto.getUserName(), dto.getUserPhone());
						
		repo.save(user); // 회원가입
		return 1;
		
	}

	public String findid(String useremail) { // 아이디찾기
		UserEntity entity = repo.findByUserEmail(useremail);
		if(entity==null) {
			System.out.println("존재하지 않는 회원입니다");
			return null;
		}
		return entity.getLoginId();
		
		
	}
	@Transactional  // 트랜잭션 어노테이션이 있기때문에 save 명시안해도됌
	public void updateme(UpdateDto dto,String loginId) {
		
		UserEntity user = repo.findByLoginId(loginId);  // 기존 정보 불러오기
		boolean change = false;
		if(user==null) {
			throw new IllegalArgumentException("해당 유저를 찾을 수 없습니다");  // 기존 회원이 아닐경우
		}
	
		if(dto.getUserEmail()!= null && !dto.getUserEmail().isBlank()) {  // 수정할 이메일값 비어있나 검증
			user.setUserEmail(dto.getUserEmail());
			change = true;
		}
		if(dto.getUserPhone()!= null && !dto.getUserPhone().isBlank()) {  // 수정할 폰넘버 비어있나 검증
			user.setUserPhone(dto.getUserPhone());
			change =true;
		}
		if(!change) {  // 아무것도 입력 안했을 경우
			throw new IllegalArgumentException("수정할 값을 입력해주세요");
		}
		
	}

	public boolean chkid(String loginId) {
		boolean chkid =repo.existsByLoginId(loginId);
		return chkid;
	}

}
