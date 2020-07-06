package com.cisdi.enfi.pbs.controller;

import com.cisdi.enfi.pbs.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class OracleController {
    @Autowired
    private StudentService studentService;

    @RequestMapping("/mainoracle")
    public String ListStudents(ModelMap map){
        map.addAttribute("todos",studentService.getAllStudents());
        return "mainoracle";
    }

    @RequestMapping("/test")
    public String TestJqueryUI(ModelMap map){
        //map.addAttribute("todos",studentService.getAllStudents());
        return "test";
    }
}
