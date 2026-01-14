package com.smhrd.web.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.web.entity.DownloadEntity;

public interface DownloadRepository extends JpaRepository<DownloadEntity, Integer> {

}
