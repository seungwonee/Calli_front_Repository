package com.smhrd.web.service;

import org.springframework.stereotype.Service;

import com.smhrd.web.dto.CreditRequestDto;
import com.smhrd.web.entity.CreditEntity;
import com.smhrd.web.entity.UserEntity;
import com.smhrd.web.enumm.CreditType;
import com.smhrd.web.enumm.MinusAction;
import com.smhrd.web.repository.CreditRepository;
import com.smhrd.web.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreditService {

	private final CreditRepository creditRepository;
	private final UserRepository userRepository;
	// 충전하기
	@Transactional
	public int plus(Integer userid, CreditRequestDto dto) {
		
		if(dto.getAmount()<= 0) {  // 충전량이 1이하일때
			throw new IllegalArgumentException("충전 금액은 1이상입니다");
		}
		UserEntity userEntity = userRepository.findByUserIdForUpdate(userid); // 동시성 제어
		if(userEntity==null) { // 회원정보를 못찾을 때
			throw new IllegalArgumentException("회원을 찾을 수 없습니다.");
		}
		int amount = dto.getAmount();
		int balance = userEntity.getBalance();
		int sum= balance+amount;  // 잔액 + 충전량
		userEntity.setBalance(sum); // 저장
		
        creditRepository.save(CreditEntity.builder() // 충전 기록 남기기
                .user(userEntity)
                .amount(dto.getAmount())            // PLUS는 +
                .type(CreditType.PLUS)
                .description("크레딧 충전")
                .payType(MinusAction.PayType.BALANCE) // 충전은 사실 payType 의미 없지만 NOT NULL이라 BALANCE로 통일
                .refId(null)
                .refunded(false)
                .build());
								
		return sum;

	}
	@Transactional
	public String minus(Integer userid,MinusAction action, Integer refId) {

		UserEntity user=userRepository.findByUserIdForUpdate(userid);
		if(user==null) { // 해당유저를 찾을 수 없을때
			throw new IllegalArgumentException("회원을 찾을 수 없습니다.");
		}

        // 1) 생성은 무료토큰 우선 차감
        if (action == MinusAction.GENERATE && user.getFreeToken() > 0) { // 생성이고 프리토큰이1개이상일때
            user.setFreeToken(user.getFreeToken() - 1);  // 프리토큰 먼저 소비

            // ✅ 무료토큰 사용 로그(돈이 빠진 건 아니니까 amount=0, payType으로 구분)
            creditRepository.save(CreditEntity.builder() // 기록 남기기
                    .user(user)
                    .amount(0)
                    .type(CreditType.MINUS)
                    .description("무료토큰 사용(이미지 생성)")
                    .payType(MinusAction.PayType.FREE_TOKEN)
                    .refId(refId)
                    .refunded(false)
                    .build());


            return action.description();
        }
        // 프리토큰이 없을때
		int cost = action.cost();
		if(cost>user.getBalance()) {
			throw new IllegalArgumentException(action.description()+ "실패 : 크레딧이 부족합니다");
		}
		user.setBalance(user.getBalance()-cost);  // 잔액 - 생성 or 다운로드 차감량
		creditRepository.save(CreditEntity.builder() // 기록 남기기
                .user(user) 
                .amount(-cost)
                .type(CreditType.MINUS)
                .description(action.description())
                .payType(MinusAction.PayType.BALANCE)
                .refId(refId)
                .refunded(false)
                .build());
		
		return action.description();
	}
	
	@Transactional
	public void refund(Integer userId, Integer calliId) {
		  // 1) 해당 작업(calliId)에 대한 차감 로그 찾기
        CreditEntity minusLog = creditRepository 
                .findFirstByUser_UserIdAndRefIdAndTypeOrderByCreditIdDesc(userId, calliId, CreditType.MINUS)
                .orElseThrow(() -> new IllegalArgumentException("환불할 차감 로그를 찾을 수 없습니다."));
        if(minusLog.isRefunded()) { // 이미 환불이 됐을 경우
        	return;
        }
        UserEntity user = userRepository.findByUserIdForUpdate(userId);
        if(user==null) {
        	throw new IllegalArgumentException("회원정보를 찾을 수 없습니다");
        }
        if(minusLog.getPayType() == MinusAction.PayType.FREE_TOKEN) { // 이미지 생성을 프리토큰으로 했을경우
        	user.setFreeToken(user.getFreeToken()+1); // 무료토큰 환불
        	   creditRepository.save(CreditEntity.builder()  // 기록저장
                       .user(user)
                       .amount(0)
                       .type(CreditType.PLUS)
                       .description("무료토큰 환불(이미지 생성 실패)")
                       .payType(MinusAction.PayType.FREE_TOKEN)
                       .refId(calliId)
                       .refunded(false)
                       .build());
        }else { // 크레딧을 사용했을 경우 
        	int refundamount = Math.abs(minusLog.getAmount());
        	user.setBalance(user.getBalance()+refundamount);
        	creditRepository.save(CreditEntity.builder()
        						.user(user)
        						.amount(refundamount)
        						.type(CreditType.PLUS)
        						.description("크레딧 환불(이미지 생성 실패)")
        						.payType(MinusAction.PayType.BALANCE)
        						.refId(calliId)
        						.refunded(false).build());
        }
        minusLog.markRefunded();
	}
	
}
