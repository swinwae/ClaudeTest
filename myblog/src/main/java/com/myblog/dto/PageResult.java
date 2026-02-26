package com.myblog.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/** 通用分页结果包装 DTO（可用于 REST 接口或 Model 传参） */
public class PageResult<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasPrevious;
    private boolean hasNext;

    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.content = page.getContent();
        result.page = page.getNumber();
        result.size = page.getSize();
        result.totalElements = page.getTotalElements();
        result.totalPages = page.getTotalPages();
        result.hasPrevious = page.hasPrevious();
        result.hasNext = page.hasNext();
        return result;
    }

    public List<T> getContent() { return content; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public boolean isHasPrevious() { return hasPrevious; }
    public boolean isHasNext() { return hasNext; }
}
