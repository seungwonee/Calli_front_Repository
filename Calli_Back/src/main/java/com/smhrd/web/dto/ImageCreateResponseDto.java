package com.smhrd.web.dto;

import com.smhrd.web.enumm.ImageStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageCreateResponseDto {
    private Integer calliId;
    private ImageStatus status; // WAIT
}
