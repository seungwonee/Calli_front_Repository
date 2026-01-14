package com.smhrd.web.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class ImageConfig {

	@Value("${ncp.access-key}")
	private String accessKey;
	
	@Value("${ncp.secret-key}")
	private String secretKey;
	
	@Value("${ncp.region}")
	private String region;
	
	@Value("${ncp.end-Point}")
	private String endPoint;
	
	@Bean
	public S3Client s3client() {
		return S3Client.builder()
				.region(Region.of(region))
				.endpointOverride(URI.create(endPoint))
				.credentialsProvider(StaticCredentialsProvider
						.create(AwsBasicCredentials.create(accessKey, secretKey)))
				.build();
	}
	
	@Bean
	public S3Presigner s3Presigner() {
		return S3Presigner.builder()
				.region(Region.of(region))
				.endpointOverride(URI.create(endPoint))
				.credentialsProvider(
						StaticCredentialsProvider.create(
								AwsBasicCredentials.create(accessKey, secretKey)))
				.build();
	}
}
