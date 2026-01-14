package com.smhrd.web.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.web.entity.CreditEntity;
import com.smhrd.web.enumm.CreditType;

@Repository
public interface CreditRepository extends JpaRepository<CreditEntity,Integer>{

	Optional<CreditEntity> findFirstByUser_UserIdAndRefIdAndTypeOrderByCreditIdDesc(Integer userId, Integer calliId, CreditType minus);

}
