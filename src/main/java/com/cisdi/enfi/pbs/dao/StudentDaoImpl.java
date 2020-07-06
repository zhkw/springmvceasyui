package com.cisdi.enfi.pbs.dao;

import com.cisdi.enfi.pbs.entity.Student;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "studentDao")
public class StudentDaoImpl implements StudentDao{
    @Autowired
    private SessionFactory sessionFactory;

//    @Autowired
//    private BaseService baseService;

    @Override
    public List<Student> findAll() {
        return sessionFactory.getCurrentSession().
                createQuery("from Student c").list();
    }

//    @Override
//    public List<Student> findAll() {
//        return baseService.getStudentsAll();
//    }
}
