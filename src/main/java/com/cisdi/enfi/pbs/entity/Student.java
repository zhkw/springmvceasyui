package com.cisdi.enfi.pbs.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name="CUX_STUDENT", schema="CUX")
public class Student {

    private int id;
    private String name;

    public Student() {
    }

    @Id
    @GeneratedValue(generator = "sid")
    @GenericGenerator(name="sid",strategy = "assigned")
    @Column(name="ID")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Column(name="NAME")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
