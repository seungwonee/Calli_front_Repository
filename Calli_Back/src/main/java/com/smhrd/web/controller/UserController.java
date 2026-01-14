package com.smhrd.web.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.dto.UpdateDto;
import com.smhrd.web.dto.UserRequestDto;
import com.smhrd.web.dto.oauth.UserPrincipalDetails;
import com.smhrd.web.entity.UserEntity;
import com.smhrd.web.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
 class UserController {
	
	private final UserService service;
	public UserController(UserService service) {
		this.service=service;
	}
	@PostMapping("/checkid")
	public ResponseEntity<?> checkId(@RequestBody Map<String,String> req){
		
		String loginId = req.get("loginId");
		Map<String, String> map = new HashMap<>();
		
		boolean chkid =service.chkid(loginId);
		if(chkid) { // 아이디가 있을경우
			map.put("msg","이미 사용중인 아이디입니다."); // 아이디 없을경우
			return ResponseEntity.badRequest().body(map);	
		}
		map.put("msg", "사용가능한 아이디입니다"); 
		return ResponseEntity.ok(map);
			
	}
	
	@PostMapping("/join")  // 회원가입
	public ResponseEntity<?> join(@Valid @RequestBody UserRequestDto dto) {
		
		int row = service.join(dto);
		if(row==0) {
			return ResponseEntity.status(409).body(Map.of("msg","회원가입 실패"));	
		}
		return ResponseEntity.status(201).body(Map.of("msg","회원가입 성공"));
		
	}
		
	@PostMapping("/findid")  // 아이디찾기 
	public ResponseEntity<?> findid(@RequestBody Map<String,String> map) {
		
		System.out.println(map.get("userEmail"));
		String loginid = service.findid(map.get("userEmail"));
		if(loginid==null) {	
			return ResponseEntity.status(404).body(Map.of(
					"msg","존재하지않는 회원입니다"));
		}
	    return ResponseEntity.ok(loginid);
	}
	
	@PostMapping("/updateme") // 회원정보수정
	public ResponseEntity<?> updateme(@Valid @RequestBody UpdateDto dto, @AuthenticationPrincipal UserPrincipalDetails principal){
		
		String loginId = principal.getUsername();
		service.updateme(dto,loginId);
		return ResponseEntity.ok("업데이트 완료");
	}
	
//	@GetMapping("/test")
//	public Map<String, Object> me(Authentication auth) {
//		
//	    Map<String, Object> res = new java.util.LinkedHashMap<>();
//	    res.put("authIsNull", auth == null);
//	    if (auth != null) {
//	        res.put("isAuthenticated", auth.isAuthenticated());
//	        res.put("name", auth.getName());
//	        res.put("principalClass", auth.getPrincipal().getClass().getName());
//	        res.put("principalValue", String.valueOf(auth.getPrincipal()));
//	        res.put("authorities", auth.getAuthorities().toString());
//	    }
//	    System.out.println(res);
//	    return res;
//	}

	@GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipalDetails auth) {
        // ✅ 로그인 안 된 경우
        if (auth == null ) {
            return ResponseEntity.status(401).body(Map.of("msg", "UNAUTHORIZED"));
        }

        // ✅ 로그인 된 경우 (아이디/이메일 등 네 정책에 맞게 내려주면 됨)
        return ResponseEntity.ok(Map.of(
                "loginId", auth.getName(),
                "msg", "OK"
        ));
    }
	
}
