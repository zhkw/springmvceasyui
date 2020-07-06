package com.cisdi.enfi.pbs.dao;

import com.cisdi.enfi.pbs.entity.Student;

import java.util.List;

public interface StudentDao {
    public List<Student> findAll();
}
