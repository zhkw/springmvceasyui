package com.cisdi.enfi.pbs.service;

import com.cisdi.enfi.pbs.dao.StudentDao;
import com.cisdi.enfi.pbs.entity.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("studentService")
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentDao studentDao;

    @Override
    @Transactional
    public List<Student> getAllStudents() {
        return studentDao.findAll();
    }
}
