//采购类型
var typeArr = new Array();
// 专业
var majorList;
// 部门
var deptArr = new Array();
var majorArr = new Array();
// 搜索添加版本
var pbsVersionId;
var nodeArr = new Array();
// 关联预算版本
var pbsVersionId2;
// 关联预算节点
var budgetNodeArr = new Array();
var basePath = $("#basePath").val();
var editIndex;
var paramEditIndex;
// 单位
var unitList;
var unitListMap = new Array();
// 管理类型
var manageTypeList;
var manageTypeListMap = new Array();
var selectNode = new Object();
var materialIds;
var notProjectIntergration = ["固定资产","办公用品","劳保用品","修理维护",
    "公司经营其他","计算机及相关硬件","专业应用软件",
    "信息化技术服务","研发货物","研发工程","研发服务"];

var typeT;
var statusFlag = 0;//
$(function() {
    $(".easyui-panel").show();
    optType = $("#optType").val();
    if(optType > 3){
        if(optType > 4){
            statusFlag = 1;
        }
        optType = 3;
    }
    $(".purReqheaderIpt p").css("margin-bottom","10px");
    $.ajax({
        url : basePath + "/getDropDownItemDisplayData",
        data : "dropDownName=ManageTypeList&condition=&isNotNull=false",
        method : "post",
        dataType : "json",
        success : function(data) {
            manageTypeList = data;
            for ( var i in data) {
                manageTypeListMap[data[i].ID] = data[i].NAME;
            }
        }
    });
    $.ajax({
        url : basePath + "/getDropDownItemDisplayData",
        data : "dropDownName=MMUnitList&condition=&isNotNull=false",
        method : "post",
        dataType : "json",
        async : false,
        success : function(data) {
            unitList = data;
            for ( var i in data) {
                unitListMap[data[i].ID] = data[i].UNITNAME;
            }
        }
    });
    if(optType == 1){
        $("#purReqType").attr("disabled",false);
        $("#project").attr("disabled",false);
        $("#major").attr("disabled",false);
        $("#reqDept").attr("disabled",false);
        $("#reqName").attr("disabled",false);
        $("#remark").attr("disabled",false);
        $("#project").textbox({
            height:26,
            buttonText:"选择",
            required: true,
            value:$("#projectName").val(),
            editable: false,
            onClickButton:function(){
                var options = {
                    title : '项目选择',
                    url : basePath+'/projectU/prjDialog',
                    height: 400,
                    width: 350,
                    buttons : [{
                        text : '确认',
                        handler : function() {
                            var prj = dialog.find("iframe").get(0).contentWindow.getPrj();
                            if(prj.id == undefined){
                                $.messager.alert("提示","请选择一个项目");
                            }else{
                                if($("#projectId").val() != prj.id){
                                    Utils.ajaxJson(basePath + "/purReq/getBaseData",
                                        {names : "pbs_PurReqType",projectId:prj.id},
                                        function(obj){
                                            $("#purReqType").combobox("setValue","");
                                            $("#purReqType").combobox("loadData",obj.pbs_PurReqType);
                                        }
                                    );
                                }
                                $("#projectId").val(prj.id);
                                $("#project").textbox("setValue",prj.name);
                                $("#prjNum").textbox("setValue",prj.num);
                                $("#reqDeptId").val(prj.parentId);
                                $("#prjDept").textbox("setValue",prj.pdept);
                                dialog.dialog('destroy');
                            }
                        }
                    }]
                };
                var dialog = modalDialog(options);
            }
        });
        $("#purReqNum").textbox({height:26});
        $("#reqSuf").textbox({height:26});
        $("#reqName").textbox({height:26});
        $("#createTime").textbox({height:26});
        $("#prjDept").textbox({height:26});
        $("#prjNum").textbox({height:26});

    }else if(optType == 2 ){
        $("#reqDept").attr("disabled",false);
        $("#reqName").attr("disabled",false);
        $("#remark").attr("disabled",false);
        $(".ipts").textbox({
            height:26,
        });
    }else if(optType == 3 || optType == 10){
        $.ajax({
            url : basePath + "/getDropDownItemDisplayData",
            data : "dropDownName=ManageTypeList&condition=&isNotNull=false",
            method : "post",
            dataType : "json",
            success : function(data) {
                manageTypeList = data;
                for ( var i in data) {
                    manageTypeListMap[data[i].ID] = data[i].NAME;
                }
            }
        });
        Utils.ajaxJsonSync(basePath + "/purReq/getBaseData",
            {names : "pbs_view_MajorInformation",projectId:""},
            function(obj) {
                majorList = obj.pbs_view_MajorInformation;
                for (var i = 0; i < majorList.length; i++) {
                    majorArr[majorList[i].ID] = majorList[i].MAJORNAME;
                }
            });
        $(".ipts").textbox({
            height:26,
        });
        getView(optType);
        getTable(optType, $("#reqTypeCode").val());
        loadTabs(optType, $("#reqTypeCode").val());
    }
    if(optType == 1 || optType == 2){
        getView(optType);
        $("#reqDept").textbox({height:26,
            buttonText:"选择",
            editable: false,
            onClickButton:function(){
                var options = {
                    title : '部门选择',
                    url : basePath+'/projectU/deptDialog',
                    height: 400,
                    width: 360,
                    buttons : [{
                        text : '确认',
                        handler : function() {
                            var dept = dialog.find("iframe").get(0).contentWindow.getDept();
                            if(dept.id == undefined){
                                $.messager.alert("提示","请选择一个部门");
                            }else{
                                $("#reqDeptId").val(dept.id);
                                $("#reqDept").textbox("setValue",dept.name);
                                dialog.dialog('destroy');
                            }
                        }
                    }]
                };
                var dialog = modalDialog(options);
            }});
        Utils.ajaxJson(basePath + "/purReq/getBaseData",
            {names : "pbs_PurReqType,pbs_view_MajorInformation",projectId:$("#projectId").val()},
            function(obj) {
                for (var i = 0; i < obj.pbs_PurReqType.length; i++) {
                    typeArr[obj.pbs_PurReqType[i].ID] = obj.pbs_PurReqType[i].CODE;
                }
                majorList = obj.pbs_view_MajorInformation;
                if(optType == 1){
                    $("#purReqType").combobox({
                        required : true,
                        editable : false,
                        prompt : "请选择类型",
                        valueField : 'ID',
                        textField : 'NAME',
                        height : '26',
                        panelHeight : '250',
                        data : obj.pbs_PurReqType,
                        onChange : function(newValue, oldValue) {
                            $("#reqTypeId").val($(this).combobox("getValue"));
                            var reqDeptValue = $('#reqDept').textbox("getValue");
                            var majorValue = $('#major').combobox("getValue");
                            if (typeArr[newValue] == "采购分包") {
                                $('#reqDept').textbox({
                                    required : true
                                });
                                $('#major').combobox({
                                    required : true
                                });
                            } else {
                                $('#reqDept').textbox({
                                    required : false
                                });
                                $('#major').combobox({
                                    required : false
                                });
                            }
                            $('#reqDept').textbox("setValue",reqDeptValue);
                            $('#major').combobox("setValue",majorValue);
                        }
                    });

                    $('#major').combobox({
                        editable : true,
                        valueField : 'ID',
                        textField : 'MAJORNAME',
                        height : '26',
                        panelHeight : '250',
                        editable : false,
                        data : majorList,
                        onChange: function(){
                            $("#reqMajorId").val($(this).combobox("getValue"));
                        }
                    });
                }
                for (var i = 0; i < majorList.length; i++) {
                    majorArr[majorList[i].ID] = majorList[i].MAJORNAME;
                }

            });
        if(optType == 2){
            var typeCode = $("#reqTypeCode").val();
            loadDlgDate($("#projectId").val(), $("#reqMajorId").val(), optType, typeCode)
            getTable(optType, typeCode);
            loadTabs(optType, typeCode);
        }
    }
    // 清空
    $("#resetBtn").click(function() {
        $("#reqName").textbox("setValue", "");
        $("#purReqType").combobox("setValue", "");
        $("#project").textbox("setValue", "");
        $("#prjDept").textbox("setValue", "");
        $("#prjNum").textbox("setValue", "");
        $("#reqDept").textbox("setValue", "");
        $("#remark").val("");
    })
    // 保存请购单
    $("#savePurReq").click(function() {
        if (!$("#purReqForm").form("validate")) {
            return;
        }
        var data = $("#purReqForm").serialize();
        $.messager.progress({
            interval : 100,
            text : '正在处理中'
        });
        $.post(basePath + "/purReq/updatePurReq", data, function(obj) {
            $.messager.progress('close');
            if (obj.purReqId != null) {
                window.opener.$("#purReqTable").datagrid('reload');
                if (optType == 1) {
                    window.location.search = "optType=2&purReqId="+ obj.purReqId;
                } else {
                    $.messager.show({
                        title : '提示',
                        msg : '保存请购单成功。',
                        timeout : 3000,
                        showType : 'slide'
                    })
                    $("#limit").hide();
                }
            } else {
                $.messager.alert("提示", "保存失败");
            }
        }, "json");
        $("#saveLine").click();
    });
    $("#submitPurReq").click(commitPurReq);
    $("#saveLine").click(function() {
        if(editIndex != undefined){
            $("#lineTable").datagrid('endEdit', editIndex);
        }
        if ($("#lineTable").datagrid('getEditors',
            editIndex).length < 1) {
            var data = new Object();
            var rows = $("#lineTable").datagrid(
                "getChanges");
            if (rows.length == 0) {
                return;
            }
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].MAXQTY != null && rows[i].MAXQTY<rows[i].QTY && rows[i].REMARK.length < 1){
                    var index = $("#lineTable").datagrid("getRowIndex",rows[i]);
                    editIndex = index;
                    $("#lineTable").datagrid("beginEdit",index);
                    MyMessager.alert.show("提示", "请购数量大于可请购数量时备注必填！");
                    return;
                }
            }
            data.optType = 1;
            var typeCode = typeArr[$("#reqTypeId").val()];
            data.type = typeCode;
            data.purReqId = $("#purReqId").val();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].ID != undefined) {
                    data["purReqLineList[" + i+ "].purReqLineId"] = rows[i].ID;
                    data.optType = 2;
                }
                if (typeCode == "采购分包" || typeCode == "采购分包（物料变更）") {
                    data["purReqLineList[" + i + "].mmId"] = rows[i].MMID;
                    data["purReqLineList[" + i + "].name"] = rows[i].PRJMATERIALNAME;
                    data["purReqLineList[" + i + "].nodeId"] = rows[i].NODEID;
                    data["purReqLineList[" + i
                    + "].budgetId"] = rows[i].BUDGETID;
                    data["purReqLineList[" + i
                    + "].equipNum"] = rows[i].EQUIPNUM;
                    data["purReqLineList[" + i + "].qty"] = rows[i].QTY == null ? 0
                        : rows[i].QTY;
                    data["purReqLineList[" + i + "].unitId"] = rows[i].UNITID;
                    data["purReqLineList[" + i
                    + "].mngTypeId"] = rows[i].MNGTYPEID;
                } else if (typeCode == "设计（劳务）分包") {
                    data["purReqLineList[" + i + "].name"] = rows[i].OTHERNAME;
                    data["purReqLineList[" + i
                    + "].content"] = rows[i].OTHERCONTENT;
                    data["purReqLineList[" + i
                    + "].majorId"] = rows[i].MAJORID;
                } else if(Utils.containsByArr(notProjectIntergration,typeCode)){
                    data["purReqLineList[" + i + "].mmId"] = rows[i].MMID;
                    data["purReqLineList[" + i + "].name"] = rows[i].PRJMATERIALNAME;
                    data["purReqLineList[" + i + "].qty"] = rows[i].QTY == null ? 0
                        : rows[i].QTY;
                    data["purReqLineList[" + i + "].unitId"] = rows[i].UNITID;
                    data["purReqLineList[" + i
                    + "].mngTypeId"] = rows[i].MNGTYPEID;
                }
                data["purReqLineList[" + i + "].remark"] = rows[i].REMARK;
            }
            $.messager.progress({
                interval : 100,
                text : '正在处理中'
            });
            $.ajax({
                url:basePath+'/purReq/updatePurReqLine',
                type:'POST',
                data:data,
                success:function(obj){
                    $.messager.progress('close');
                    if (obj.rs == 0) {
                        $("#lineTable").datagrid('acceptChanges');
                        $("#lineTable").datagrid('reload');
                        $.messager.show({
                            title : '提示',
                            msg : '保存请购行信息成功',
                            timeout : 3000,
                            showType : 'slide'
                        })
                        data =undefined;
                    } else {
                        $.messager.alert("提示", "保存失败");
                    }
                },
                error: function(err){
                    $.messager.progress('close');
                    $.messager.alert("提示", "操作错误");
                }
            });
        }else{
            $.messager.show({
                title : '提示',
                msg : '自动保存请购行失败，请检查数据',
                timeout : 2000,
                showType : 'fade',
                style:{
                    right:'',
                    bottom:''
                }
            })
        }

    })
    $("#addLine").click(function() {
        var lineRows = $("#lineTable").datagrid("getRows");
        if (lineRows.length > 0) {
            $.messager.alert("提示", "一个设计（劳务）分包请购单只能包含一个请购行");
        } else {
            $("#lineTable").datagrid("appendRow", {});
            editIndex = 0;
            $("#lineTable").datagrid("beginEdit", editIndex);
        }
    })
    $("#deleteLine").click(function() {
        $("#saveLine").click();
        if ($("#lineTable").datagrid('getEditors', editIndex).length < 1) {
            var rows = $("#lineTable").datagrid("getChecked");
            if (rows.length == 0) {
                $.messager.alert("提示", "请先选择要删除的数据");
                return;
            }
            $.messager.confirm('确认对话框','确认删除数据吗？',
                function(r) {
                    if (r) {
                        var ids = "";
                        var indexArr = new Array();
                        for (var i = 0; i < rows.length; i++) {
                            ids += "'" + rows[i].ID
                                + "',";
                            var index = $("#lineTable").datagrid("getRowIndex",rows[i].ID);
                            indexArr.push(index);
                        }
                        $.messager.progress({
                            interval : 100,
                            text : '正在处理中'
                        });
                        indexArr = Utils.sortArr(indexArr,1);
                        Utils.ajaxJson(basePath+ "/purReq/delPurReqLine",{ids : ids},
                            function(obj) {
                                $.messager.progress('close');
                                if (obj.rs == 0) {
                                    //$("#lineTable").datagrid("reload");
                                    for(var i = 0;i < indexArr.length; i++){
                                        $("#lineTable").datagrid('deleteRow',indexArr[i]);
                                    }
                                    $("#lineTable").datagrid('acceptChanges');
                                    $("#lineTable").datagrid("uncheckAll");
                                    var row = $("#lineTable").datagrid('getSelected');
                                    if(row == null || !row.ID){
                                        $('#uploadAttachment').linkbutton('disable');
                                    }
                                    var typeCode = typeArr[$("#reqTypeId").val()];
                                    if(typeCode == "采购分包" || typeCode == "采购分包（物料变更）"){
                                        getLineListId();
                                    }
                                    MyMessager.slide.show('提示', '操作成功');
                                } else {
                                    $("#lineTable").datagrid('rejectChanges');
                                    $.messager.alert("提示","操作失败");
                                }
                                editIndex = undefined;
                            }
                        )
                    }
                }
            );
        }
    })
    $("#isBudget").combobox({
        height : 26,
        panelHeight : 'auto',
        onChange : function() {
            $("#lineTable").datagrid("load", {
                purReqId : $("#purReqId").val(),
                typeCode :  $("#reqTypeCode").val(),
                budget : $(this).combobox("getValue")
            });
        }
    })

    loadUniquePurPlan();
});
// 操作显示
function getView(optType) {
    if (optType == 1) {
        $("#resetBtn").show();
        $("#savePurReq").show();
    } else if (optType == 2) {
        $("#grid-data").show();
        $("#resetBtn").hide();
        $("#savePurReq").show();
        $("#submitPurReq").show();
    } else if (optType == 3 || optType == 10) {
        $("#uploadAttachment").hide();
        $("#grid-data").show();
    } else if (optType == 4) {

    }
}
// 搜索子项
function searchNode() {
    var projectId = $("#projectId").val();;
    var majorId = $("#reqMajorId").val();
    Utils.ajaxJson(basePath + "/purReq/getNodeTree", {
        projectId : projectId,
        majorId : majorId,
        type : 1,
        key : $("#nodeKey").val()
    }, function(obj) {
        $("#nodeTree").tree('loadData', obj);
    });
}

function getAuth(projectId){


}


// 关联预算搜索子项
function searchNode2() {
    var projectId = $("#projectId").val();;
    var majorId = $("#reqMajorId").val();
    Utils.ajaxJson(basePath + "/purReq/getNodeTree", {
        projectId : projectId,
        majorId : majorId,
        type : 2,
        key : $("#budgetNodeKey").val()
    }, function(obj) {
        $("#budgetNodeTree").tree('loadData', obj);
        $("#budgetEquipList").datagrid("uncheckAll");
    });
}

// 搜索物料
function searchMld() {
    var projectId = $("#projectId").val();;
    var majorId = $("#reqMajorId").val();
    var node = $("#nodeTree").tree('getSelected');
    var nodeId = "";
    if (node != null) {
        if (node.flag == 1) {
            nodeId = node.id;
        } else {
            nodeId = node.parentId;
        }
    }
    $("#equipList").datagrid({
        url : basePath + "/purReq/getMaterialListDetails",
        queryParams : {
            majorId : majorId,
            nodeId : nodeId,
            pbsVersionId : pbsVersionId,
            key:$("#equip-key").searchbox("getValue"),
            type : 1
        }
    });
    // $("#equipList").datagrid("options").url =
    // basePath+"/purReq/getMaterialListDetails";
    // $("#equipList").datagrid("load",{majorId: majorId,nodeId:nodeId,
    // pbsVersionId:pbsVersionId,key:$("#equip-key").searchbox("getValue"),type:1});
}
// 关联预算搜索物料
function searchMld2() {
    var projectId = $("#projectId").val();;
    var majorId = $("#reqMajorId").val();
    var node = $("#budgetNodeTree").tree('getSelected');
    var nodeId = "";
    if (node != null) {
        if (node.flag == 1) {
            nodeId = node.id;
        } else {
            nodeId = node.parentId;
        }
    }
    $("#budgetEquipList").datagrid("options").url = basePath
        + "/purReq/getMaterialListDetails";
    $("#budgetEquipList").datagrid("load", {
        majorId : majorId,
        nodeId : nodeId,
        pbsVersionId : pbsVersionId2,
        key : $("#budgetEquip-key").searchbox("getValue"),
        type : 2
    });
    $("#budgetEquipList").datagrid("uncheckAll");
}
// 搜索施工标段
function searchConstPlan() {
    var projectId = $("#projectId").val();;
    $("#constructdList").datagrid("load", {
        projectId : projectId,
        key : $("#constructd-key").searchbox("getValue"),
        type : 0
    });
}
// 搜索设计分包
function searchDesign() {
    var projectId = $("#projectId").val();
    $("#designList").datagrid("load", {
        projectId : projectId,
        key : $("#design-key").searchbox("getValue"),
        type : typeT
    });
}
//搜索采购计划
function searchPurPlan(){
    var projectId = $("#projectId").val();
    $("#planList").datagrid("load", {
        projectId : projectId,
        key : $("#plan-key").searchbox("getValue"),
        type : 3
    });
}

//搜索采购计划
function searchAllPurPlan(){
    var projectId = $("#projectId").val();
    Utils.ajaxJson(basePath + "/purReq/getAllPurPlan", {
        projectId : projectId,
        key : $("#purPlan-key").searchbox("getValue"),
        budgetId : function () {
            var row = $("#lineTable").datagrid("getSelected");
            if (row != null) {
                return row.BUDGETID;
            }else {
                return "";
            }
        }
    }, function(obj) {
        $("#purPlanList").datagrid("loadData", obj);
    });

}

//搜索采购计划设备
function searchPlanEqu(){
    var row = $("#planList").datagrid("getSelected");
    if(row == null){
        MyMessager.alert.show("提示","请先选择采购包");
    }else{
        $("#planEquipList").datagrid("load", {
            purPlanId: row.ID,
            projectId: $("#projectId").val(),
            key:$("#planEquip-key").searchbox("getValue")
        });
//		$("#planEquipList").datagrid("reload")
    }

}
//指定唯一采购包弹窗
function addPurPlan() {

    var row = $("#lineTable").datagrid("getSelected");
    if (row == null) {
        MyMessager.alert.show("提示","请选择请购行！");
        return ;
    }
    var budgetId = row.BUDGETID;
    $("#purPlanList").datagrid("options").url
        = basePath + '/purReq/getAllPurPlan?projectId='+$("#projectId").val()+'&key=&budgetId='+budgetId;
    $("#purPlanList").datagrid("reload");
    $('#uniquePlandlg').dialog({
        top:100,
        buttons : [
            {
                text : '关闭',
                iconCls : 'icon-remove',
                handler : function() {
                    $('#uniquePlandlg').dialog("close");
                }
            },
            {
                text : '添加',
                iconCls : 'icon-ok',
                handler : function() {
                    addUniquePurPlan();
                }
            } ],
        closed : false
    });
}

function loadUniquePurPlan() {
    $("#purPlanList").datagrid({
        // url : basePath + '/purReq/getAllPurPlan',
        fit : true,
        fitColumns : true,
        singleSelect : true,
        selectOnCheck:true,
        checkOnSelect:true,
        idField : 'ID',
        columns : [ [
            {field:'ck',title:'',width:'5%',checkbox:true},
            {
                field : 'CODE',
                title : '采购包号',
                width : '50%'
            },
            {
                field : 'NAME',
                title : '采购包名称',
                width : '45%'
            }
        ] ],
        // queryParams : {
        //     projectId : projectId,
        //     key : "",
        //     budgetId : function () {
        //         var row = $("#lineTable").datagrid("getSelected");
        //         if (row != null) {
        //             return row.BUDGETID;
        //         }else {
        //             return "";
        //         }
        //     }
        // }
    });
}

function addUniquePurPlan() {
    var row1 = $("#purPlanList").datagrid("getSelected");
    if (row1 == null) {
        return;
    }
    var row2 = $("#lineTable").datagrid("getSelected");
    var purReqLineId = row2.ID;
    var purPlanId = row1.ID;
    MyMessager.prog.show("请等待", "正在处理");
    $.ajax({
        url : basePath + "/purReq/updatePurReqUniquePackage",
        data : "purReqLineId="+purReqLineId+"&purPlanId="+purPlanId,
        method : "post",
        dataType : "json",
        success : function(data) {
            MyMessager.alert.show("提示","添加成功");
            $('#lineTable').datagrid("reload");
        },
        complete: function() {
            MyMessager.prog.close();
        }
    });
}

// 加载弹出框数据
function loadDlgDate(projectId, majorId, optType, typeCode) {
    if (majorId == null) {
        majorId = "";
    }
    if (typeCode == "施工分包") {
        var purListMap = new Array();
        Utils.ajaxJson(basePath + "/purReq/getBaseData", {
            names : "pbs_constructtype",
            projectId:""
        }, function(obj) {
            var constType = obj.pbs_constructtype;
            for (var i = 0; i < constType.length; i++) {
                purListMap[constType[i].ID] = constType[i].NAME
            };
        });
        $.ajax({
            url : basePath + "/getDropDownItemDisplayData",
            data : "dropDownName=MMUnitList&condition=&isNotNull=false",
            method : "post",
            dataType : "json",
            async : false,
            success : function(data) {
                unitList = data;
                for ( var i in data) {
                    unitListMap[data[i].ID] = data[i].UNITNAME;
                }
            }
        });
        $("#constructdList").datagrid({
            url : basePath + '/purReq/getNewPlan',
            fit : true,
            fitColumns : true,
            singleSelect : true,
            idField : 'ID',
            columns : [ [
                {
                    field : 'ck',
                    checkbox : true
                },
                {
                    field : 'CODE',
                    title : '标段号',
                    width : '24%'
                },
                {
                    field : 'NAME',
                    title : '标段名称',
                    width : '24%'
                },
                {
                    field : 'CONSTRUCTTYPEID',
                    title : '类型',
                    width : '24%',
                    formatter : function(value, row, index) {
                        if (purListMap[value] == null
                            || purListMap[value] == undefined) {
                            return '';
                        }
                        return purListMap[value];
                    }
                }, {
                    field : 'REMARK',
                    title : '备注',
                    width : '24%'
                }, ] ],
            queryParams : {
                projectId : projectId,
                key : "",
                type : 0
            }
        });
    } else if (typeCode == "采购分包（非物资类）") {
        $("#planList").datagrid({
            url : basePath + '/purReq/getNewPlan',
            fit : true,
            fitColumns : true,
            singleSelect : true,
            idField : 'ID',
            columns : [ [
                {
                    field : 'CODE',
                    title : '采购包号',
                    width : '50%'
                },
                {
                    field : 'NAME',
                    title : '采购包名称',
                    width : '51%'
                }
            ] ],
            queryParams : {
                projectId : projectId,
                key : "",
                type : 3
            },
            onClickRow : function(index, row) {
                $('#planEquipList').datagrid({
                    queryParams: {
                        purPlanId:row.ID,
                        projectId:projectId
                    }
                });
            }
        });
        $("#planEquipList").datagrid({
            url:basePath+'/purReq/queryPurPlanToEquip',
            width:'100%',
            height:'100%',
            idField: 'ID',
            checkOnSelect : true,
            selectOnCheck : true,
            columns:[[
                {
                    field : 'ck',
                    checkbox : true
                },
                {field:'PBSCODE',title:'pbscode',hidden:true},
                {field:'PMMCODE',title:'物料编码',halign:'center',width:'15%',
                    formatter: function(value,row) {
                        if (row.groupId != undefined) {
                            return "附";
                        } else {
                            return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                        }
                    }},
                {field:'PRJMATERIALNAME',title:'项目物料名称',halign:'center',width:'15%'},
                {title: '规格型号',field: 'DCP',width: "20%",halign: "center",align: "left",
                    formatter: function(value,row) {
                        if (value) {
                            return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                        }
                    }
                },
                {field:'ICQTY',title:'该包包含数量',halign:'center',width:'10%',editor:'numberbox'},
                {field:'QTY',title:'总数',halign:'center',width:'10%'},
                {field:'NODENAME',title:'所属子项',halign:'center',width:'13%'},
                {field:'MAJORID',title:'专业',halign:'center',width:'13%',
                    formatter: function(value,row) {
                        if (value) {
                            return majorArr[value];
                        }
                    }},
                {field:'UNITID',title:'单位',halign:'center',width:'6%',
                    formatter: function(value) {
                        return unitListMap[value];
                    }},
            ]],
        })
    } else if (typeCode == "设计（专业）分包" || typeCode == "管理及其他分包") {
        var boo = typeCode == "设计（专业）分包" ? false : true;
        typeT = typeCode == "设计（专业）分包" ? 1 : 2;
        $("#designList").datagrid({
            url : basePath + '/purReq/getNewPlan',
            fit : true,
            fitColumns : true,
            singleSelect : true,
            idField : 'ID',
            columns : [ [
                {
                    field : 'ck',
                    checkbox : true
                },
                {
                    field : 'CODE',
                    title : '分包号',
                    width : '20%'
                },
                {
                    field : 'NAME',
                    title : '分包名称',
                    width : '20%'
                },
                {
                    field : 'CONTENT',
                    title : '分包内容',
                    width : '20%'
                },
                {
                    field : 'MAJORID',
                    title : '设计专业',
                    width : '18%',
                    hidden : boo,
                    formatter : function(value, row, index) {
                        if (value) {
                            var arr = value.split(",");
                            var rs = "";
                            for (var i = 0; i < arr.length; i++) {
                                if (majorArr[arr[i]] != undefined) {
                                    rs += majorArr[arr[i]];
                                    if (i != arr.length - 1) {
                                        rs += ",";
                                    }
                                }
                            }
                            return '<span title=\"'
                                + rs
                                + '\" class=\"easyui-tooltip\">'
                                + rs + '</span>';
                        }
                    }
                }, {
                    field : 'REMARK',
                    title : '备注',
                    width : '20%'
                }, ] ],
            queryParams : {
                projectId : projectId,
                key : "",
                type : typeT
            }
        });
    }else{
        if (typeCode == "采购分包" || typeCode == "采购分包（物料变更）"){
            Utils.ajaxJson(basePath + "/purReq/getNodeTree",
                {
                    projectId : projectId,
                    majorId : majorId,
                    type : 1,
                    key : ""
                },
                function(obj) {
                    if (obj.length > 0) {
                        pbsVersionId2 = obj[0].versionId;
                    }
                    for (var i = 0; i < obj.length; i++) {
                        budgetNodeArr[obj[i].id] = obj[i].text;
                    }
                    $("#budgetNodeTree").tree({
                        lines : true,
                        loadFilter : treeConstructor,
                        data : obj,
                        height : 500,
                        onClick : function(node) {
                            if (node.flag == 1) {
                                nodeId = node.id;
                            } else {
                                nodeId = node.parentId;
                            }
                            $("#budgetEquipList").datagrid("options").url = basePath+ "/purReq/getMaterialListDetails";
                            $("#budgetEquipList").datagrid("load",
                                {
                                    majorId : majorId,
                                    nodeId : nodeId,
                                    pbsVersionId : obj[0].versionId,
                                    type : 2,
                                    key : $("#budgetEquip-key").searchbox("getValue")
                                }
                            );
                            $("#budgetEquipList").datagrid("uncheckAll");
                        }
                    })
                }
            );
        }
        Utils.ajaxJson(basePath + "/purReq/getNodeTree", {
            projectId : projectId,
            majorId : majorId,
            type : 1,
            key : ""
        }, function(obj) {
            for (var i = 0; i < obj.length; i++) {
                nodeArr[obj[i].id] = obj[i].text;
            }
            if (obj.length > 0) {
                pbsVersionId = obj[0].versionId;
            }
            $("#nodeTree").tree({
                lines : true,
                loadFilter : treeConstructor,
                data : obj,
                height : 500,
                onClick : function(node) {
                    var nodeId;
                    if (node.flag == 1) {
                        nodeId = node.id;
                    } else {
                        nodeId = node.parentId;
                    }
                    $("#equipList").datagrid("options").url = basePath
                        + "/purReq/getMaterialListDetails";
                    $("#equipList").datagrid("load", {
                        majorId : majorId,
                        nodeId : nodeId,
                        pbsVersionId : obj[0].versionId,
                        type : 1,
                        key : $("#equip-key").searchbox("getValue")
                    });
                }
            })

        })
        var options = {
            fit : true,
            fitColumns : true,
            idField : 'id',
            // pagination: true,
            treeField : 'materialCode',
            checkOnSelect : true,
            selectOnCheck : true,
            columns : [ [
                {
                    field : "ck",
                    checkbox : true
                },
                {
                    title : '物料编码',
                    field : 'materialCode',
                    width : "12%",
                    halign : "center",
                    align : "left",
                    formatter : function(value, row) {
                        if (row.groupId != undefined) {
                            return "附";
                        } else {
                            return '<span title=\"' + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                    }
                },
                {
                    title : '项目物料名称',
                    field : 'prjMaterialName',
                    width : "14%",
                    halign : "center",
                    align : "left",
                    editor : "text"
                },
                {
                    title : '参数',
                    field : 'description',
                    width : "14%",
                    halign : "center",
                    align : "left",
                    formatter : function(value, row) {
                        if (value) {
                            return '<span title=\"' + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                    }
                },
                {
                    title : '所属子项',
                    field : 'nodeId',
                    width : "15%",
                    halign : "center",
                    align : "left",
                    formatter : function(value, row, index) {
                        if (value) {
                            if (row.type == 1) {
                                value = nodeArr[value];
                            } else if (row.type == 2) {
                                value = budgetNodeArr[value];
                            }
                            return '<span title=\"' + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                    }
                }, {
                    title : '专业',
                    field : 'majorId',
                    width : "10%",
                    halign : "center",
                    align : "left",
                    formatter : function(value, row) {
                        if (value) {
                            return majorArr[value];
                        }
                    }
                }, {
                    title : '单位',
                    field : 'unitId',
                    width : "8%",
                    halign : "center",
                    align : "left",
                    formatter : function(value) {
                        return unitListMap[value];
                    }
                }, {
                    title : '总数量',
                    field : 'qty',
                    width : "8%",
                    halign : "center",
                    align : "left",
                    formatter: function(value,row,index){
                        if(value){
                            return decimalHandel(value,4);
                        }else{
                            return 0;
                        }
                    }
                }, {
                    title : '是否含附属设备',
                    field : 'hasChild',
                    width : "8%",
                    halign : "center",
                    align : "left",
                    formatter : function(value, row) {
                        if (value) {
                            return "是";
                        } else if (row.groupId != null) {
                            return "否";
                        }
                    }
                }, {
                    title : '是否进口',
                    field : 'isImport',
                    width : "8%",
                    halign : "center",
                    align : "left",
                    formatter : function(value) {
                        if (value == null || value == undefined)
                            return value;
                        return (value == 1) ? "是" : "否";
                    },
                }, ] ],
            onLoadSuccess : function(data) {
                getLineListId()
            },
            onClickRow : function(index, row) {
                if (!$(this).datagrid("options").singleSelect) {
                    for (var j = 0; j < materialIds.length; j++) {
                        if (row.id == materialIds[j]) {
                            $("#equipList").datagrid("unselectRow", index);
                            $("#equipList").prev().find(
                                "input[type='checkbox']")[index + 1].checked = true;
                        }
                    }
                }
            }
        };
        $("#equipList").datagrid($.extend(options, {
            singleSelect : false
        }))
        $("#budgetEquipList").datagrid($.extend(options, {
            singleSelect : true
        }));
        $("#materialList").datagrid({
            url : basePath + '/structure/getMaterialInfoList',
            fit : true,
            fitColumns : true,
            pagination : true,
            singleSelect : false,
            idField : 'ID',
            columns : [ [ {
                field : 'ck',
                checkbox : true
            }, {
                field : 'MATERIALCODE',
                title : '物料编码',
                width : '20%'
            }, {
                field : 'MATERIALNAME',
                title : '物料名称',
                width : '20%'
            },{
                field : 'MMDESCRIPTION',
                title : '规格型号',
                width : '40%',formatter: function (value) {
                    if(value){
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            }, {
                field : 'UNITNAME',
                title : '计量单位',
                width : '10%'
            }, {field:'CREATETIME',title:'创建时间',width:'8%',
                formatter: function(value,row,index){
                    if(value){
                        return Utils.dateFormat(new Date(value));
                    }
                }
            }] ],
            queryParams : {
                key : function() {
                    var mmCode = $("#mmCode").val();
                    var mmName = $("#mmName").val();
                    var mmAttr = $("#mmAttr").val();
                    var codeAcc = $("#codeAcc")[0].checked;
                    var nameAcc = $("#nameAcc")[0].checked;
                    var attrAcc = $("#attrAcc")[0].checked;
                    var key = mmCode+','
                        +codeAcc+','
                        +mmName+','
                        +nameAcc+','
                        +mmAttr+','
                        +attrAcc
                    return key;
                },/*
				categoryId : function() {
					var categoryId = "";
					var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
					if (treeObj != null) {
						var nodes = treeObj.getSelectedNodes();
						if (nodes.length > 0) {
							categoryId = nodes[0].ID;
						}
					}
					return categoryId;
				},*/
                filters: function() {
                    return "PDT";
                }
            }
        });
        querycategory();
    }

}

// 物料检索
function doSearch(value) {
    $("#materialList").datagrid("reload");
}
// 物料类别检索
function querycategory() {
    var treeData = $("#categoryTree");
    treeData = $.fn.zTree.init(treeData, categoryTreeSetting, null);
}
var categoryTreeSetting = {
    async : {
        enable : true,
        dataType : "json",
        url : basePath + '/structure/getMaterialcategory',
        otherParam : [ "page", 1, 'pageSize', 9999, 'key', function() {
            return $('#category-key').searchbox('getValue');
            ;
        },'filters','PDT' ],
        autoParam : [ "ID" ]
    },
    view : {
        dblClickExpand : false,
        showLine : true
    },
    data : {
        simpleData : {
            enable : true,
            idKey : "id",
            pIdKey : "pid",
            rootPId : ""
        },
        key : {
            name : "NAME",
        }
    },
    callback : {
        onClick : zTreeOnClick,
    }
}
// 加载更多
function categoryMore() {
    var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
    var nodes = treeObj.getNodes();
    var page = (nodes.length + 30) / 30;
    var url = treeObj.setting.async.url;
    $.ajax({
        url : url,
        type : 'POST',
        data : {
            page : page,
            pageSize : 9999
        },
        success : function(data) {
            treeObj.addNodes(null, data);
        }
    });
}
// 类别树点击检索物料
function zTreeOnClick(event, treeId, treeNode) {
    var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
    var code =  treeNode.CATEGORYCODE ;
    if (treeNode.ID == selectNode.ID) {
        treeObj.cancelSelectedNode(treeNode);
        selectNode = new Object();
        code = '';
    } else {
        selectNode = treeNode;
    }
    $("#mmCode").val(code);
};

// 加载请购行表格
function getTable(optType, typeCode) {
    var queryParam = {
        purReqId : $("#purReqId").val()
    };
    $("#lineTable").datagrid({
        url : basePath + '/purReq/getPurReqLine',
        queryParams : {
            purReqId : $("#purReqId").val(),
            typeCode : typeCode,
            budget : 0
        },
        width : '99%',
        height : '250',
        idField : "ID",
        loadMsg : '数据加载中,请稍候...',
        rownumbers : true,
        border : true,
        fitColumns : true,
        singleSelect : true,
        checkOnSelect: false,
        selectOnCheck: false,
        data : [],
        columns : [ [
            {
                field : "ck",
                checkbox : true
            },
            {
                field : "MATERIALCODE",
                title : "物料编码",
                width : "8%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "MATERIALNAME",
                title : "物料名称",
                width : "8%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "DESCRIPTION",
                title : "规格型号",
                width : "8%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "PRJMATERIALNAME",
                title : "项目物料名称",
                width : "8%",
                editor : "text",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "MMDESCRIPTION",
                title : "项目规格型号",
                width : "8%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "FROM",
                title : "选自",
                width : "0",
                hidden : true
            },
            {
                field : "NODEID",
                title : "子项ID",
                width : "0",
                hidden : true
            },{
                field : "NODENAME",
                title : "子项",
                width : "6%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
//					formatter : function(value, row, index) {
//
//						if (row.NODEID) {
//							return nodeArr[row.NODEID];
//						}
//					}
            },{
                field : "NODECODE",
                title : "子项号",
                width : "4%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
//					formatter : function(value, row, index) {
//
//						if (row.NODEID) {
//							return nodeArr[row.NODEID];
//						}
//					}
            },{
                field : "BUDGETID",
                title : "关联预算物料ID",
                width : "0",
                hidden : true
            },
            {
                field : "BUDGETNAME",
                title : "关联预算物料",
                width : "7%",
                halign : 'left',
                align : 'left',
                formatter : function(value, row, index) {
                    if(optType != 3){
                        var str = "";
                        if (value != null) {
                            str += '<span title=\"'
                                + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                        if (row.ISCOMEFROMPBS == 0) {
                            str += '<a style="cursor:pointer;" onclick="budgetBtn();"><i class="icon-search"></i></a>';
                        }
                        return str;
                    }else{
                        return value;
                    }
                }
            },
            {
                field : "EQUIPNUM",
                title : "设备位号",
                width : "10%",
                editor : {type:'validatebox',options : {
                        validType : {equipNum:[20]}
                    }},
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "MAXQTY",
                title : "可请购数量",
                width : "5%",
                formatter: function(value,row,index){
                    if(value != null){
                        return decimalHandel(value,4);
                    }
                }
            },
            {
                field : "QTY",
                title : "请购数量",
                width : "4%",
                styler: function(value,row,index){
                    if ((row.ISCOMEFROMPBS == 0 || row.MAXQTY == null || value > row.MAXQTY) && !Utils.containsByArr(notProjectIntergration,typeCode)){
                        return 'background-color:red;color:white';
                    }
                },
                formatter: function(value,row,index){
                    if(value){
                        return decimalHandel(value,4);
                    }else{
                        return 0;
                    }
                }
            },
            {
                field : "UNITID",
                title : "单位",
                width : "4%",
                formatter : function(value, row, index) {
                    return unitListMap[value];
                },
            },
            {
                field : "MNGTYPEID",
                title : "管理类型",
                width : "5%",
                formatter : function(value) {
                    return manageTypeListMap[value];
                },
            },
            {
                field : "CONSTCODE",
                title : "标段号",
                width : "10%"
            },
            {
                field : "CONSTNAME",
                title : "标段名称",
                width : "10%"
            },
            {
                field : "ESTPRICE",
                title : "费控目标",
                width : "10%"
            },
            {
                field : "COSTTYPENAME",
                title : "计价方式",
                width : "10%"
            },
            {
                field : "PURTYPENAME",
                title : "采购方式",
                width : "10%"
            },
            {
                field : "OTHERCODE",
                title : "包号",
                width : "6%"
            },
            {
                field : "OTHERNAME",
                title : "名称",
                width : "15%"
            },
            {
                field : "OTHERCONTENT",
                title : "内容",
                width : "15%"
            },
            {
                field : "MAJORID",
                title : "设计专业",
                width : "15%",
                formatter : function(value, row, index) {
                    if (value) {
                        var arr = value.split(",");
                        var rs = "";
                        for (var i = 0; i < arr.length; i++) {
                            if (majorArr[arr[i]] != undefined) {
                                rs += majorArr[arr[i]];
                                if (i != arr.length - 1) {
                                    rs += ",";
                                }
                            }
                        }
                        return '<span title=\"'
                            + rs
                            + '\" class=\"easyui-tooltip\">'
                            + rs + '</span>';
                    }
                }
            },{
                field : "REMARK",
                title : "备注",
                width : "13%",
                editor : {type:'text',options : {
                        validType : {length:[0, 50]}
                    }},
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },{
                field : "ISCANCEL",
                title : "是否取消",
                width : "4%",
                formatter: function(value,row,index){
                    if(row.CANCELNUM){
                        return "已取消";
                    }
                }
            },{
                field : "CANCELNUM",
                title : "取消数量",
                width : "4%",
                formatter: function(value,row,index){
                    if(value > 0){
                        return value;
                    }
                }
            } ] ],
        onLoadSuccess : function(data) {
            editIndex = undefined;
            if(statusFlag == 0){
                $("#lineTable").datagrid("hideColumn","ISCANCEL");
                $("#lineTable").datagrid("hideColumn","CANCELNUM");
            }
        },
        rowStyler:function(index,row){
            if (statusFlag != 0 && row.ISCANCEL && row.ISCANCEL != "N"){
                return 'background-color:pink;color:red;';
            }
        },
        onClickRow : function(index, row) {
            $(this).datagrid('endEdit', editIndex);
            if (typeCode == "采购分包"  || typeCode == "采购分包（物料变更）" || Utils.containsByArr(notProjectIntergration,typeCode)) {
                paramEditIndex = undefined;
                $('#purReqParams').datagrid("options").url = basePath
                    + "/purReq/getPurReqParams";
                $('#purReqParams').datagrid("load", {
                    prjmmId : row.MMID
                });
                loadRelLine(row.ID);
                if (typeCode == "采购分包" || typeCode == "采购分包（物料变更）"){
                    $('#purPackage').datagrid("options").url = basePath+ "/purReq/getPurPlan";
                    $('#purPackage').datagrid("load",{
                        budgetId : row.BUDGETID,
                        uniquePlanId : row.UNIQUEPURPLAN,
                        projectId : $("#projectId").val()});
                    $('#budgetData').datagrid("loading");
                    Utils.ajaxJson(basePath+ "/purReq/getBudget",{purReqLineId : row.ID},function(obj){
                        var data = [
                            {ATTNAME:"是否关联预算",ISCHANGE:obj.isBudget},
                            {ATTNAME:"物料编码是否变化",DESIGNVALUE:obj.planCode,VALUE:obj.reqCode},
                            {ATTNAME:"项目物料名是否变化",DESIGNVALUE:obj.planName,VALUE:obj.reqName},
                            {ATTNAME:"参数是否变化",DESIGNVALUE:obj.planParams,VALUE:obj.reqParams}
                        ];
                        $('#budgetData').datagrid("loadData",data);
                        $('#budgetData').datagrid("loaded");
                    },function(){});
                }
            }
            if (row.ID) {
                $('#uploadAttachment').linkbutton('enable');
                $("#fileList").datagrid({
                    url : basePath
                        + "/pbsCommonController/queryAttachment",
                    queryParams : {
                        targetId : row.ID,
                        targetType : 11
                    }
                });
                disableOrEnableTab("enableTab")
            }
        },
        onDblClickRow : function(index, row) {
            if(optType != 3){
                if ($(this).datagrid('getEditors', editIndex).length < 1) {
                    $(this).datagrid('beginEdit', index);
                    editIndex = index;
                }
            }
        },
        onBeforeEdit : function(index, row) {
            $.extend($.fn.validatebox.defaults.rules, {
                qty : {
                    validator : function(value) {
                        var maxQty = row.MAXQTY;
                        var remarkEditor = $("#lineTable").datagrid("getEditor",{index:index,field:'REMARK'});
//						if(value > maxQty){
//							$(remarkEditor.target).textbox("options").required = true;
//						}else{
//							$(remarkEditor.target).textbox("options").required = false;
//						}
                        //$.parser.parse($(remarkEditor.target));
                        return true;
                    },

                },
                equipNum : {
                    validator: function(value, param){
                        return value.length <= param[0];
                    },
                    message: '设备位号最多输入{0}个字符.若超长请填写在备注里！'
                }
            });
            // 选择子项树 或者有预算关联
            if (typeCode == "采购分包" || typeCode == "采购分包（物料变更）" || Utils.containsByArr(notProjectIntergration,typeCode)) {
                var prjmmNameCol = $(this).datagrid("getColumnOption", "PRJMATERIALNAME");
                var qtyCol = $(this).datagrid("getColumnOption", "QTY");
                var unitCol = $(this).datagrid("getColumnOption", "UNITID");
                prjmmNameCol.editor = {
                    type : "textbox",
                    options : {
                        prompt : "请输入名称",
                        required : true
                    }
                };
                qtyCol.editor = {
                    type : "validatebox",
                    options : {
                        validType : [ "positive_double", "qty" ],
                        required : true
                    }
                };
                /*unitCol.editor = {
                    type : "combobox",
                    options : {
                        panelHeight : "230",
                        valueField : "ID",
                        textField : "UNITNAME",
                        data : unitList,
                        required : true
                    }
                };*/
            }
            /*var mngTypeCol = $(this).datagrid("getColumnOption", "MNGTYPEID");
            if ((row.ISCOMEFROMPBS != undefined
                    && !row.ISCOMEFROMPBS ) || Utils.containsByArr(notProjectIntergration,typeCode)) {
                mngTypeCol.editor = {
                    type : "combobox",
                    options : {
                        panelHeight : "230",
                        valueField : "ID",
                        textField : "NAME",
                        data : manageTypeList,
                    }
                };
            } else {
                mngTypeCol.editor = {};
            }*/
            if (typeCode == "设计（劳务）分包") {
                var otherNameCol = $(this).datagrid("getColumnOption", "OTHERNAME");
                var otherContentCol = $(this).datagrid("getColumnOption", "OTHERCONTENT");
                var MajorCol = $(this).datagrid("getColumnOption", "MAJORID");
                otherNameCol.editor = {
                    type : "textbox",
                    options : {
                        required : true
                    }
                }
                otherContentCol.editor = {
                    type : "textbox",
                    options : {
                        required : true
                    }
                }
                MajorCol.editor = {
                    type : "combobox",
                    options : {
                        multiple : true,
                        required : true,
                        panelHeight : "230",
                        valueField : "ID",
                        textField : "MAJORNAME",
                        data : majorList,
                    }
                }
            }
            var remarkCol = $(this).datagrid("getColumnOption","REMARK");
            //如果等于采购分包
            if ((typeCode == "采购分包" || typeCode == "采购分包（物料变更）") && row.ISCOMEFROMPBS != undefined
                && !row.ISCOMEFROMPBS
                && (row.BUDGETNAME == null || row.BUDGETNAME == "")
            //|| (row.MAXQTY!=null && row.MAXQTY<row.QTY)
            ) {
                remarkCol.editor = {
                    type : "textbox",
                    options : {
                        prompt : "请输入备注",
                        required : true,
                        validType : {length:[1, 50]}
                    }
                }
            }else{
                remarkCol.editor = {
                    type : "textbox",
                    options : {
                        validType : {length:[0, 50]}
                    }
                }
            }
        },
        onAfterEdit: function(index, row, changes){
            editIndex = undefined;
            if(row.MAXQTY != null && row.MAXQTY < row.QTY && row.REMARK.length == 0){
//				$(this).datagrid('beginEdit', index);
//				editIndex = index;
            }
        }
    });
    var hideColumns;
    if (typeCode == "采购分包" || typeCode == "采购分包（物料变更）") {
        hideColumns = [ "CONSTCODE", "CONSTNAME",
            "ESTPRICE", "COSTTYPENAME",
            "PURTYPENAME", "OTHERCODE",
            "OTHERNAME", "OTHERCONTENT", "MAJORID" ];
        $("#budgetSpn").show();
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#searchAdd").click(function() {
                saveLine.click();
                if ($("#lineTable").datagrid('getEditors',
                    editIndex).length < 1) {
                    $('#materialdlg').dialog({
                        buttons : [
                            {
                                text : '关闭',
                                iconCls : 'icon-remove',
                                handler : function() {
                                    $(
                                        '#materialdlg')
                                        .dialog(
                                            "close");
                                }
                            },
                            {
                                text : '添加',
                                iconCls : 'icon-ok',
                                handler : function() {
                                    addPurReqLine();
                                }
                            } ],
                        closed : false,
                    });
                }
            });
            $(".budgetBtn").click();
        }
    } else if (typeCode == "施工分包") {
        hideColumns = [ "MATERIALNAME","DESCRIPTION",
            "PRJMATERIALNAME", "MMDESCRIPTION",
            "NODENAME","NODECODE", "BUDGETNAME", "EQUIPNUM",
            "MAXQTY", "QTY", "UNITID", "MNGTYPEID",
            "OTHERCODE", "OTHERNAME",
            "OTHERCONTENT", "MAJORID","CANCELNUM" ];
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#searchAdd").click(function() {
                $('#constructdlg').dialog({
                    title : "项目施工分包",
                    buttons : [
                        {
                            text : '关闭',
                            iconCls : 'icon-remove',
                            handler : function() {
                                $('#constructdlg')
                                    .dialog("close");
                            }
                        },
                        {
                            text : '添加',
                            iconCls : 'icon-ok',
                            handler : function() {
                                addOtherLine("#constructdList");
                            }
                        } ],
                    closed : false,
                });
            })
        }
    } else if (typeCode == "设计（专业）分包") {
        hideColumns = [ "MATERIALNAME","DESCRIPTION",
            "PRJMATERIALNAME", "MMDESCRIPTION",
            "NODENAME","NODECODE", "BUDGETNAME", "EQUIPNUM",
            "MAXQTY", "QTY", "UNITID", "MNGTYPEID",
            "CONSTCODE", "CONSTNAME", "ESTPRICE",
            "COSTTYPENAME", "PURTYPENAME",
            "OTHERCODE","CANCELNUM" ];
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#searchAdd").click(function() {
                $('#designdlg').dialog({
                    title : "设计（专业）分包",
                    buttons : [
                        {
                            text : '关闭',
                            iconCls : 'icon-remove',
                            handler : function() {
                                $(
                                    '#designdlg')
                                    .dialog(
                                        "close");
                            }
                        },
                        {
                            text : '添加',
                            iconCls : 'icon-ok',
                            handler : function() {
                                addOtherLine("#designList");
                            }
                        } ],
                    closed : false,
                });
            })
        }
    } else if (typeCode == "设计（劳务）分包") {
        hideColumns = [ "MATERIALNAME","DESCRIPTION",
            "PRJMATERIALNAME", "MMDESCRIPTION",
            "NODENAME","NODECODE", "BUDGETNAME", "EQUIPNUM",
            "MAXQTY", "QTY", "UNITID", "MNGTYPEID",
            "CONSTCODE", "CONSTNAME", "ESTPRICE",
            "COSTTYPENAME", "PURTYPENAME",
            "OTHERCODE","CANCELNUM" ];
        if (optType == 2) {
            $("#addLine").show();
            $("#deleteLine").show();
            $("#saveLine").show();
        }
    } else if (typeCode == "管理及其他分包") {
        hideColumns = [ "MATERIALNAME","DESCRIPTION",
            "PRJMATERIALNAME", "MMDESCRIPTION",
            "NODENAME","NODECODE", "BUDGETNAME", "EQUIPNUM",
            "MAXQTY", "QTY", "UNITID", "MNGTYPEID",
            "CONSTCODE", "CONSTNAME", "ESTPRICE",
            "COSTTYPENAME", "PURTYPENAME",
            "MAJORID","CANCELNUM" ];
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#searchAdd").click(function() {
                $('#designdlg').dialog({
                    title : "管理及其他分包",
                    buttons : [
                        {
                            text : '关闭',
                            iconCls : 'icon-remove',
                            handler : function() {
                                $(
                                    '#designdlg')
                                    .dialog(
                                        "close");
                            }
                        },
                        {
                            text : '添加',
                            iconCls : 'icon-ok',
                            handler : function() {
                                addOtherLine("#designList");
                            }
                        } ],
                    closed : false,
                });
            })
        }
    } else if (typeCode == "设计（劳务）分包") {
        hideColumns = [ "MATERIALNAME","DESCRIPTION",
            "PRJMATERIALNAME", "MMDESCRIPTION",
            "NODENAME","NODECODE", "BUDGETNAME", "EQUIPNUM",
            "MAXQTY", "QTY", "UNITID", "MNGTYPEID",
            "CONSTCODE", "CONSTNAME", "ESTPRICE",
            "COSTTYPENAME", "PURTYPENAME",
            "OTHERCODE","CANCELNUM" ];
        if (optType == 2) {
            $("#addLine").show();
            $("#deleteLine").show();
            $("#saveLine").show();
        }
    } else if (typeCode == "采购分包（非物资类）") {
        var handelColumns = ["MATERIALCODE","DESCRIPTION","MATERIALNAME","PRJMATERIALNAME",
            "MMDESCRIPTION","UNITID","MNGTYPEID","REMARK"];
        for (var i = 0; i < handelColumns.length; i++) {
            var col = $("#lineTable").datagrid("getColumnOption",handelColumns[i]);
            col.width = parseInt(col.width)/0.75;
        }
        hideColumns = [ "CONSTCODE", "CONSTNAME",
            "NODENAME", "NODECODE","BUDGETNAME","EQUIPNUM",
            "ESTPRICE", "COSTTYPENAME",
            "PURTYPENAME", "OTHERCODE","MAXQTY","QTY",
            "OTHERNAME", "OTHERCONTENT", "MAJORID" ];
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#searchAdd").click(function() {
                $('#purPlandlg').dialog({
                    title : "采购计划",
                    buttons : [
                        {
                            text : '关闭',
                            iconCls : 'icon-remove',
                            handler : function() {
                                $(
                                    '#purPlandlg')
                                    .dialog(
                                        "close");
                            }
                        },
                        {
                            text : '添加',
                            iconCls : 'icon-ok',
                            handler : function() {
                                addPlanEquip();
                            }
                        } ],
                    closed : false,
                });
            })
        }
    }else{
        //处理宽度
        var handelColumns = ["MATERIALCODE","MATERIALNAME","DESCRIPTION","PRJMATERIALNAME",
            "MMDESCRIPTION","QTY","UNITID","MNGTYPEID","REMARK"];
        for (var i = 0; i < handelColumns.length; i++) {
            var col = $("#lineTable").datagrid("getColumnOption",handelColumns[i]);
            col.width = parseInt(col.width)/0.74;
        }
        hideColumns = [ "CONSTCODE", "CONSTNAME",
            "NODENAME", "NODECODE","BUDGETNAME","EQUIPNUM",
            "ESTPRICE", "COSTTYPENAME",
            "PURTYPENAME", "OTHERCODE","MAXQTY",
            "OTHERNAME", "OTHERCONTENT", "MAJORID" ];
        if (optType == 2) {
            $("#searchAdd").show();
            $("#deleteLine").show();
            $("#saveLine").show();
            $("#tabs").tabs("close","子项树");
            $("#searchAdd").click(function() {
                saveLine.click();
                if ($("#lineTable").datagrid('getEditors',
                    editIndex).length < 1) {
                    $('#materialdlg').dialog({
                        buttons : [
                            {
                                text : '关闭',
                                iconCls : 'icon-remove',
                                handler : function() {
                                    $('#materialdlg').dialog("close");
                                }
                            },
                            {
                                text : '添加',
                                iconCls : 'icon-ok',
                                handler : function() {
                                    addPurReqLine();
                                }
                            } ],
                        closed : false,
                    });
                }
            });
        }
    }
    for (var i = 0; i < hideColumns.length; i++) {
        $("#lineTable").datagrid("hideColumn",hideColumns[i]);
    }

}
// 获取所有请购行物料清单明细id 然后处理复选框
function getLineListId() {
    materialIds = new Array();
    var rows = $("#lineTable").datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
        materialIds[i] = rows[i].LISTDETAILID;
    }
    var rows = $("#equipList").datagrid("getRows");
    if (rows.length > 0) {
        // 循环判断操作为新增的不能选择
        for (var i = 0; i < rows.length; i++) {
            // 让某些行不可选
            var count = 0;
            for (var j = 0; j < materialIds.length; j++) {
                if (rows[i].id == materialIds[j]) {
                    $("#equipList").prev().find("input[type='checkbox']")[i + 1].disabled = true;
                    $("#equipList").prev().find("input[type='checkbox']")[i + 1].checked = true;
                    count++;
                }
            }
            if (count == 0) {
                $("#equipList").prev().find("input[type='checkbox']")[i + 1].disabled = false;
                $("#equipList").prev().find("input[type='checkbox']")[i + 1].checked = false;
            }
        }
    }
}

// 添加采购请购行
function addPurReqLine() {
    var tab = $("#tabs").tabs("getSelected");
    var title = tab.panel('options').title;
    var data;
    var grid;
    var isComeFromPbs;
    if (title == "子项树") {
        grid = "#equipList";
        isComeFromPbs = true;
    } else if (title == "物料库") {
        grid = "#materialList";
        isComeFromPbs = false;
    }
    var rows = $(grid).datagrid("getChecked");
    if (rows.length == 0) {
        $.messager.alert("提示", "请先选择数据！");
        return;
    } else {
        var ids = "";
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].id) {
                ids += rows[i].id + ",";
            } else {
                ids += rows[i].ID + ",";
            }
        }
        data = {
            projectId : $('#projectId').val(),
            type : typeArr[$("#reqTypeId").val()],
            ids : ids,
            purReqId : $("#purReqId").val(),
            isComeFromPbs: isComeFromPbs,
            optType : 1
        };
    }
    $.messager.progress({
        interval : 100,
        text : '正在处理中'
    });
    Utils.ajaxJson(basePath + "/purReq/updatePurReqLine", data, function(obj) {
        $.messager.progress('close');
        if (obj.rs == 0) {
            $("#lineTable").datagrid('reload');
            if (grid == "#equipList") {
                saveHandelChecked(rows);
            }
            $.messager.show({
                title : '提示',
                msg : '操作成功',
                timeout : 3000,
                showType : 'slide'
            })
        } else {
            $.messager.alert("提示", "操作失败");
        }
    })
}
// 添加后处理复选框
function saveHandelChecked(rows) {
    for (var i = 0; i < rows.length; i++) {
        materialIds.push(rows[i].id);
        var index = $("#equipList").datagrid("getRowIndex", rows[i].id);
        $("#equipList").datagrid("unselectRow", index);
        $("#equipList").prev().find("input[type='checkbox']")[index + 1].disabled = true;
        $("#equipList").prev().find("input[type='checkbox']")[index + 1].checked = true;
    }
    if ($("#equipList").datagrid("getSelected") != null) {
        rows = $("#equipList").datagrid("getChecked");
        saveHandelChecked(rows);
    }
}
// 关联预算按钮
function budgetBtn() {
    saveLine.click();
    if ($("#lineTable").datagrid('getEditors',
        editIndex).length < 1){
        $("#budgetdlg").dialog({
            buttons : [ {
                text : '关闭',
                iconCls : 'icon-remove',
                handler : function() {
                    $('#budgetdlg').dialog("close");
                }
            }, {
                text : '添加关联',
                iconCls : 'icon-ok',
                handler : function() {
                    addBudget();
                }
            } ],
            closed : false,
        });
    }
}

// 添加关联
function addBudget() {
    var row = $("#lineTable").datagrid("getSelected");
    var budgetRow = $("#budgetEquipList").datagrid("getChecked");
    var data = {};
    data["purReqLineList[0].purReqLineId"] = row.ID;
    data["purReqLineList[0].mmId"] = row.MMID;
    data["purReqLineList[0].name"] = row.PRJMATERIALNAME;
    data["purReqLineList[0].equipNum"] = row.EQUIPNUM;
    data["purReqLineList[0].qty"] = row.QTY == null ? 0 : row.QTY;
    data["purReqLineList[0].unitId"] = row.UNITID;
    data["purReqLineList[0].mngTypeId"] = row.MNGTYPEID;
    data["purReqLineList[0].remark"] = row.REMARK;
    data["purReqLineList[0].projectId"] = $('#projectId').val();
    if (budgetRow.length > 1) {
        $.messager.alert("提示", "最多只能选择一条关联记录！");
        return;
    }
    if (budgetRow.length === 1) {
        var ss = checkMaterial(row.MATERIALCODE,budgetRow[0].materialCode)
        if (ss !== "") {
            $.messager.alert("提示", "预算类别位编码是："+ss+",需关联相同类别物料！(物料编码前6位为类别编码)");
            return;
        }
    }
    if (budgetRow.length === 0) {
        var budgetNode = $("#budgetNodeTree").tree("getSelected");
        if (budgetNode == null || budgetNode.noChildren !== 1) {
            $.messager.alert("提示", "请选择一条明细记录或者一个子项树最底层的PBS节点。");
            return;
        }
        if (budgetNode.noChildren != undefined) {
            data["purReqLineList[0].nodeId"] = budgetNode.id;
        } else {
            var mlId = budgetNode.parentId;
            var node = $("#budgetNodeTree").tree('find', mlId);
            data["purReqLineList[0].nodeId"] = node.id;
        }
    } else {
        data["purReqLineList[0].nodeId"] = budgetRow[0].nodeId; // 子项ID
        data["purReqLineList[0].budgetId"] = budgetRow[0].prjMmId;
    }
    data.optType = 2;
    data.type = typeArr[$("#reqTypeId").val()];
    $.messager.progress({
        interval : 100,
        text : '正在处理中'
    });
    Utils.ajaxJson(basePath + "/purReq/updatePurReqLine", data, function(obj) {
        $.messager.progress('close');
        if (obj.rs == 0) {
            $("#lineTable").datagrid('load');
            $.messager.show({
                title : '提示',
                msg : '操作成功',
                timeout : 3000,
                showType : 'slide'
            })
            $('#budgetdlg').dialog("close");
        } else {
            $.messager.alert("提示", "操作失败");
        }
    })
}

//检查请购物料和关联预算物料是否同一个类别
function checkMaterial(purReqMatCode,budgetMatCode) {
    //编码前6位相同算同一类编码
    if (purReqMatCode.substr(0, 5) === budgetMatCode.substr(0, 5)) {
        return "";
    }else {
        return budgetMatCode.substr(0, 5);
    }
}

// 其他弹出框添加请购行
function addOtherLine(grid) {
    var rows = $(grid).datagrid("getChecked");
    if (rows.length == 0) {
        $.messager.alert("提示", "请先选择数据！");
        return;
    }
    var lineRows = $("#lineTable").datagrid("getRows");
    if (lineRows.length > 0) {
        $.messager.alert("提示", "一个"
            + typeArr[$("#reqTypeId").val()]
            + "请购单只能包含一个请购行");
        return;
    }
    var data = {
        projectId : $('#projectId').val(),
        type : typeArr[$("#reqTypeId").val()],
        ids : rows[0].ID,
        purReqId : $("#purReqId").val(),
        optType : 1,
        constructPlanDetailId: rows[0].CODE
    };
    $.messager.progress({
        interval : 100,
        text : '正在处理中'
    });
    Utils.ajaxJson(basePath + "/purReq/updatePurReqLine", data, function(obj) {
        $.messager.progress('close');
        if (obj.rs == 0) {
            $("#lineTable").datagrid('load');
            $.messager.show({
                title : '提示',
                msg : '操作成功',
                timeout : 3000,
                showType : 'slide'
            })
            $('#constructdlg').dialog("close");
            $('#designdlg').dialog("close");

        } else if(obj.rs == 2){
            $.messager.alert("提示", "其他申请中已经包含该条数据！");
        }else {
            $.messager.alert("提示", "操作失败");
        }
    })
}
//采购分包（非物资类）添加
function addPlanEquip(){
    var rows = $("#planEquipList").datagrid("getChecked");
    if (rows.length == 0) {
        $.messager.alert("提示", "请先选择数据！");
        return;
    }
    var ids = "";
    for (var i = 0; i < rows.length; i++) {
        ids += rows[i].MTID + ",";
    }
    var data = {
        projectId : $('#projectId').val(),
        type : typeArr[$("#reqTypeId").val()],
        ids : ids,
        purReqId : $("#purReqId").val(),
        optType : 1,
        constructPlanDetailId: $("#planList").datagrid("getSelected").CODE
    };
    $.messager.progress({
        interval : 100,
        text : '正在处理中'
    });
    Utils.ajaxJson(basePath + "/purReq/updatePurReqLine", data, function(obj) {
        $.messager.progress('close');
        if (obj.rs == 0) {
            $("#lineTable").datagrid('load');
            $.messager.show({
                title : '提示',
                msg : '操作成功',
                timeout : 3000,
                showType : 'slide'
            })
            $('#constructdlg').dialog("close");
            $('#designdlg').dialog("close");

        } else if(obj.rs == 2){
            $.messager.alert("提示", "已有申请已经存在该条数据！");
        }else {
            $.messager.alert("提示", "操作失败");
        }
    })

}
// 加载tabs
function loadTabs(optType, typeCode) {
    $("#purReqtabs").show();
    if (typeCode == "采购分包") {
        $("#purReqtabs").tabs("close", 4);
    }
    if (typeCode != "采购分包" && typeCode != "采购分包（物料变更）"
        && !Utils.containsByArr(notProjectIntergration,typeCode)) {
        $("#purReqtabs").tabs("close", 1);
        $("#purReqtabs").tabs("close", 1);
        $("#purReqtabs").tabs("close", 1);
        $("#purReqtabs").tabs("close", 1);
    }else {
        // 参数
        $('#purReqParams').datagrid({
            singleSelect : true,
            columns : [ [
                {
                    field : 'ATTRNAME',
                    title : '属性名称',
                    width : '20%'
                },
                {
                    field : 'ATTRVALUE',
                    title : '属性值',
                    width : '30%',
                    editor : {
                        type : "validatebox",
                        options : {
                            required : true
                        }
                    }
                },
                {
                    field : 'ATTRUNITID',
                    title : '属性单位',
                    width : '30%',
                    editor : {
                        type : "combobox",
                        options : {
                            valueField : "ID",
                            textField : "UNITNAME",
                            required : true
                        }
                    },
                    formatter : function(value, row, index) {
                        if (unitListMap[value] == null
                            || unitListMap[value] == undefined) {
                            return value;
                        }
                        return unitListMap[value];
                    }
                },
                {
                    field : 'handle',
                    title : '操作',
                    width : '19%',
                    formatter : function(value, row, index) {
                        return '<button type="button" onclick="handleParams(\''
                            + row.ATTRID
                            + '\','
                            + index
                            + ');"'
                            + ' class="disabled handleParams_'
                            + row.ATTRID
                            + '  btn btn-default"><i class="icon-pencil">编辑</i></button>';
                    }
                } ]
            ],
            onLoadSuccess: function(){
                if(optType == 3 || optType == 10){
                    $("#purReqParams").datagrid("hideColumn","handle");
                }
            },
            onBeginEdit : function(index, row) {
                var unitEditor = $(this).datagrid("getEditor",
                    {
                        index : index,
                        field : "ATTRUNITID"
                    });
                if (row.ATTRUNITID != null
                    && row.ATTRUNITID != "") {
                    $(unitEditor.target).combobox("loadData",
                        unitList);
                } else {
                    $(unitEditor.target).combobox("destroy");
                }
            },
            onAfterEdit : function(rowIndex, rowData, changes) {
                paramEditIndex = undefined;
                // 面板启用
                disableOrEnableTab('enableTab');
                for ( var key in changes) {
                    if (key != "ATTRUNITID"
                        || changes["ATTRUNITID"] != "") {
                        if (unitListMap[rowData.ATTRUNITID] == undefined) {
                            rowData.ATTRUNITNAME = rowData.ATTRUNITID;
                            rowData.ATTRUNITID = "";
                        } else {
                            rowData.ATTRUNITNAME = unitListMap[rowData.ATTRUNITID];
                        }
                        saveParams(rowData);
                    }
                    break;
                }
            }
        });

        if(Utils.containsByArr(notProjectIntergration,typeCode)){
            $("#purReqtabs").tabs("close", 2);
            $("#purReqtabs").tabs("close", 2);
            $("#purReqtabs").tabs("close", 2);
        }else{
            // 采购包
            $("#purPackage").datagrid({
                toolbar:'#bd-list-info_tb',
                fitColumns : true,
                singleSelect : true,
                idField : 'ID',
                columns : [ [ {
                    field : 'CODE',
                    title : '采购包号',
                    width : '50%'
                }, {
                    field : 'NAME',
                    title : '采购包名称',
                    width : '49%'
                }, ] ],
            })
            // 预算对比
            $("#budgetData").datagrid({
                loadMsg: '正在加载中...',
                columns : [ [ {
                    field : 'ATTNAME',
                    title : '属性名',
                    width : '24%'
                }, {
                    field : 'ISCHANGE',
                    title : '是否变化',
                    width : '14%',
                    formatter: function(value,row,index){
                        if(!value){
                            value = "否";
                            if(row.DESIGNVALUE && row.VALUE && row.DESIGNVALUE != row.VALUE){
                                value = "是";
                            }
                        }
                        return value;
                    }
                }, {
                    field : 'DESIGNVALUE',
                    title : '计划值',
                    width : '29%',
                    formatter: function(value){
                        if(value){
                            return '<span title=\"'
                                + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                    }
                }, {
                    field : 'VALUE',
                    title : '请购值',
                    width : '29%',
                    formatter: function(value){
                        if(value){
                            return '<span title=\"'
                                + value
                                + '\" class=\"easyui-tooltip\">'
                                + value + '</span>';
                        }
                    }
                }, ] ],
            })
        }
    }
    // 文件列表
    $("#fileList").datagrid({
        columns : [ [
            {
                field : 'fileName',
                title : '文件名称',
                width : '70%'
            },
            {
                field : 'handle',
                title : '操作',
                width : '25%',
                formatter : function(value, row, index) {
                    if(optType ==3){
                        return '<button type="button" onclick="downAttachment(\''
                            + row.filePath
                            + '\',\''
                            + row.fileName
                            + '\',\''
                            +row.id
                            + '\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'
                    }
                    return '<button type="button" onclick="downAttachment(\''
                        + row.filePath
                        + '\',\''
                        + row.fileName
                        + '\',\''
                        +row.id
                        + '\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'
                        + '<button type="button" onclick="delAttachment(\''
                        + row.id
                        + '\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>'
                }
            }
        ]
        ],
    })
}
// 修改参数
function handleParams(attrvalueid, index) {
    if ($('.handleParams_' + attrvalueid + ' i').hasClass('icon-pencil')) {
        editParams(attrvalueid, index);
        return;
    };
    if ($('.handleParams_' + attrvalueid + ' i').hasClass('icon-save')) {
        validateParams();
    };
}

// 参数编辑
function editParams(attrvalueid, index) {
    if (editIndex != undefined) {
        $.messager.alert('提示', "请购行存在未保存的数据！");
    } else if (paramEditIndex != undefined) {
        $.messager.alert('提示', "参数存在未保存的数据！");
    } else {
        // 面板禁用
        disableOrEnableTab('disableTab');
        $('.handleParams_' + attrvalueid + ' i').removeClass('icon-pencil')
            .addClass('icon-save').html('保存');
        paramEditIndex = index;
        $('#purReqParams').datagrid('beginEdit', index);
    }
}
// 参数验证
function validateParams() {
    if (paramEditIndex != undefined) {
        if ($('.validatebox-invalid').length == 0) {
            $('#purReqParams').datagrid('endEdit', paramEditIndex);
        }
    }
}

// tab 启用和禁用
function disableOrEnableTab(flag) {
    // 面版启用
    var selectTab = $('#purReqtabs').tabs('getSelected');
    var selectTabIndex = $('#purReqtabs').tabs('getTabIndex', selectTab);
    for (var i = 0; i < $('#purReqtabs').tabs("tabs").length; i++) {
        if (selectTabIndex != i) {
            $('#purReqtabs').tabs(flag, i);
        }
    }
}
// 保存参数
function saveParams(rowData) {
    var obj = new Object();
    obj["prjAttrValueVOList[0].id"] = rowData.PROJATTRVALUEID;
    obj["prjAttrValueVOList[0].flag"] = rowData.FLAG;
    obj["prjAttrValueVOList[0].attrId"] = rowData.ATTRID;
    obj["prjAttrValueVOList[0].attrUnitId"] = rowData.ATTRUNITID;
    obj["prjAttrValueVOList[0].attrUnitName"] = rowData.ATTRUNITNAME;
    obj["prjAttrValueVOList[0].prjMmId"] = rowData.PRJMMID;
    obj["prjAttrValueVOList[0].attrValue"] = rowData.ATTRVALUE;
    $.ajax({
        url : basePath + '/structure/updatePbsNodeAttr',
        type : 'POST',
        data : obj,
        success : function(data) {
            $('#purReqParams').datagrid("acceptChanges");
            $("#lineTable").datagrid('load');
            $.messager.show({
                title : '提示',
                msg : '操作成功',
                timeout : 3000,
                showType : 'slide'
            });
        }
    });
}

// 上传附件
function attachmentUpload() {
    WebFilesUploader({
        _title : '文件上传',
        _width : 800,
        _height : 200,
        _webuploader : {
            server : '/enfi-pbs/fileUpload', // 上传到服务器的地址【"/"+项目部署名称+"/fileUpload"】
            swf : '../resources/js/fileupload/webfilesuploader/Uploader.swf',// 上传用的flash控件
            multiple : false,// 否开起同时选择多个文件能力
            // accept:{extensions:'gif,jpg,jpeg,bmp,png'},//允许文件的后缀
            // fileNumLimit:3 //允许加入上传队列的文件个数
            // TODO 1.3.0-RELEASE配置参数
            // chunkSize:1024*1024, //断点续传参数【分片的大小】
            // allowMinBreakPointResumeSize:1024*1024*10, //断点续传参数【文件大小超过此值的要进行断点续传】
            // verifyChunk:'/cpm-web/verifyChunk',
            // //断点续传参数【文件的整体Md5验证路径】【"/"+项目部署名称+"/verifyChunk"】
            // verify:'/cpm-web/verify', //断点续传参数【分片的Md5验证路径】【"/"+项目部署名称+"/verify"】
            // merger:'/cpm-web/merger' //断点续传参数【合并文件的处理路径】【"/"+项目部署名称+"/merger"】
        }
    }, function(jsons) {
        var fileIds = "";
        for (var i = 0; i < jsons.length; i++) {
            if (i != 0) {
                fileIds = fileIds + "," + jsons[i].UUID;
            } else {
                fileIds = jsons[i].UUID;
            }
        }
        var purReqLineId = "";
        var selectedRow = $('#lineTable').datagrid('getSelected');
        if (selectedRow != null) {
            purReqLineId = selectedRow.ID;
        }
        var data = {
            fileIds : fileIds,
            targetId : purReqLineId,
            targetType : 11,
            type : 1
        };
        Utils.ajaxJson(basePath + '/pbsCommonController/uploadAttachment',
            data, function(obj) {
                if(obj.status){
                    $('#fileList').datagrid('load');
                    MyMessager.slide.show("提示", obj.info);
                }else{
                    MyMessager.alert.show("提示",  obj.exception);
                }

            }, function() {
                MyMessager.alert.show("提示", "上传失败");
            });
    });
}
// 下载文件
function downAttachment(path, fileName,fileId) {
    path = encodeURI(path);
    fileName = encodeURI(fileName);
    window.location.href = basePath
        + "/pbsCommonController/downloadAttachment?path=" + path
        + "&fileName=" + fileName+"&fileId="+fileId;
}
// 删除文件
function delAttachment(attachmentId) {
    $.post(basePath + "/pbsCommonController/deleteAttachment", "ids="
        + attachmentId, function() {
        $('#fileList').datagrid('load');
        MyMessager.slide.show("提示", "删除成功!");
    }, "")
}

function commitPurReq(){
    saveLine.click();
    var proID = $("#purReqId").val();
    var subject = $("#project").textbox("getValue");
    var purType = $("#reqTypeCode").val();
    var reqStatus = $("#reqStatus").val();
    var workFlow="";
    var target = "";
    var code = "";
    var work_flow = $('#workflow').text();
    if(purType==='采购分包'){
        workFlow=work_flow.split('#')[1];
        target = "P";
    }else if(purType==='设计（劳务）分包'){
        workFlow=work_flow.split('#')[0];
        target = "D";
    }else if(purType ==='施工分包' || purType==='设计（专业）分包' || purType==='管理及其他分包'
        || purType==='采购分包（非物资类）' || purType.indexOf("研发")!==-1){//工程一体化类
        workFlow=work_flow.split('#')[2];
        target = "E";
    }else {//非工程一体化
        workFlow=work_flow.split('#')[3];
        target = "E";
    }
    if (purType==='施工分包'){
        code = "标段";
    }
    else {
        code = "合同包";
    }
    if (reqStatus == 3){
        $.messager.confirm('提示','此流程将会继续原流程提交，待办页结束此流程可发起新流程！',function(r){
            if (r){
                $.ajax({
                    url: basePath+"/workflow/continueProcess",
                    data: "code=req&id="+proID,
                    method: "post",
                    beforeSend: function() {
                        MyMessager.prog.show("请等待", "正在处理");
                    },
                    complete: function() {
                        MyMessager.prog.close();
                    },
                    success:function(data2, textStatus, jqXHR) {
                        window.close();
                    },
                    error:function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.responseText);
                    }
                });
            }
        });
        return;
    }
    $.post(basePath+"/purReq/checkCommit","purReqId="+proID,function(obj){
        if(obj.rs === 1){
            MyMessager.alert.show("提示","此请购单还未完成，请先完成！(请购数量必填，设备类请购行关联预算必选！)");
        }else{
            Utils.ajaxJsonSync(basePath+"/purReq/isPurPlanImportedWbs",{prjId:$("#projectId").val(),taskCode:code},function (obj1) {
                if (obj1 === "0"){
                    MyMessager.alert.show("提示","请先完成采购分包计划/费用控制目标或联系项目管理部王春巧")
                }else {
                    //设备材料请购、设计（劳务）请购走相应审批流，施工分包、设计（专业）分包、管理及其他分包、采购分包（非物资类）
                    // 走工程一体化流程，其余的均为直接发布。
                    // if(purType ==='施工分包' || purType==='设计（专业）分包' || purType==='管理及其他分包'
                    //     || purType==='采购分包（非物资类）' || purType==='采购分包' || purType==='设计（劳务）分包'){
                    if (1 === 1) {
                        var options = {
                            title : '审批',
                            url : basePath+"/baseInfo/auditDialog?workflow="+workFlow
                                +"&workflowUrl="+basePath+"/purReq/purReqAppr"
                                +"&paramet="+"processId="+workFlow,
                            height: 460,
                            width: 550,
                            closed: false,
                            cache: false,
                            modal: true,
                            buttons:[
                                {
                                    text:'提交审批',
                                    size:'large',
                                    handler:function(){
                                        var per = dialog.find("iframe").get(0).contentWindow.submitAudit();
                                        var allUser="";
                                        if(per.allUser!="" && per.allUser!=undefined && per.allUser!='undefined'){
                                            allUser=per.allUser+per.subject;
                                            //工程项目信息
                                            var param2 ="&projectId="+$("#projectId").val()+"&projectCode="+$("#prjNum").textbox("getValue")+"&projectName="+$("#project").textbox("getValue");
                                            //参数组装
                                            var params = allUser+param2+"&proId="+proID+"&isNeed="+per.isNeed+"&processId="+$.trim(workFlow)+"&isSelect="+per.isSelect
                                                +"&target="+target+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
                                            //发起请求，执行流程
                                            MyMessager.slide.show("提示", "数据处理中，请稍....");
                                            $.post(basePath+"/workflow/purReqAppr/"+$.trim(workFlow),"params="+params,function(result){
                                                if("success"==result){
                                                    window.opener.MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                                    dialog.dialog('destroy');
                                                    window.opener.$("#purReqTable").datagrid('reload');
                                                    window.close();
                                                }else{
                                                    MyMessager.alert.show("提示","提交失败");
                                                }
                                            });
                                        }else{
                                            MyMessager.alert.show("提示","请确认审批信息再提交！");
                                        }
                                    }
                                },{
                                    text:'关闭',
                                    size:'large',
                                    handler:function(){
                                        dialog.dialog('destroy');
                                    }
                                }]
                        };
                        var dialog = modalDialog(options);
                        if(obj.rs == 2){
                            $.messager.alert('确认对话框', '该请购单中的请购行存在可请购数量为0!');
                        }
                    }else{
                        MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                        $.post(basePath+"/purReq/commit","purReqId="+proID,function(obj){
                            if(obj.rs==0){
                                MyMessager.slide.show("提示", "发布成功，消息将在3秒后关闭。");
                                //重新加载数据
                                window.opener.$("#purReqTable").datagrid('reload');
                                window.close();
                            }else{
                                MyMessager.alert.show("提示","发布失败");
                            }
                        },"json");
                    }
                }
            });
        }
    },"json");
}
function getCount(obj){
    var count =$(obj).val().length;
    if(count >= 100){
        count = 100;
        $(obj).val($(obj).val().substr(0,100));
        $("#limit").css("color","red");
    }else{
        $("#limit").css("color","black");
    }
    $("#count").text(count);
    if(count == 0){
        $("#limit").hide();
    }else{
        $("#limit").show();
    }
}

//加载关联的请购行
function loadRelLine(purReqLineId) {
    $("#purreqlineRel").datagrid({
        url : basePath + '/purReq/getRelPurReqLine',
        queryParams : {
            purReqLineId : purReqLineId
        },
        width: '100%',
        height: '100%',
        border: true,
        toolbar: "#purreqlineRel_tb",
        idField: 'id',
        columns: [[
            {
                title: '请购单编号',
                field: 'CODE',
                width: "9%",
                halign: "center",
                align: "left"
            },
            {
                title: '请购单名称',
                field: 'NAME',
                width: "9%",
                halign: "center",
                align: "left"
            },
            {
                field : "MATERIALCODE",
                title : "物料编码",
                width : "9%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "MATERIALNAME",
                title : "物料名称",
                width : "9%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "DESCRIPTION",
                title : "规格型号",
                width : "9%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "PRJMATERIALNAME",
                title : "项目物料名称",
                width : "9%",
                editor : "text",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "MMDESCRIPTION",
                title : "项目规格型号",
                width : "9%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "NODENAME",
                title : "子项",
                width : "9%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },{
                field : "NODECODE",
                title : "子项号",
                width : "4%",
                formatter : function(value, row) {
                    if (value) {
                        return '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                }
            },
            {
                field : "BUDGETNAME",
                title : "关联预算物料",
                width : "9%",
                halign : 'left',
                align : 'left',
                formatter : function(value, row, index) {
                    var str = "";
                    if (value != null) {
                        str += '<span title=\"'
                            + value
                            + '\" class=\"easyui-tooltip\">'
                            + value + '</span>';
                    }
                    return str;
                }
            },
            {
                title: '请购数量',
                field: 'QTY',
                width: "5%",
                halign: "center",
                align: "left"
            },
            {
                title: '备注',
                field: 'REMARK',
                width: "10%",
                halign: "center",
                align: "left",
                formatter: function(value,row) {
                    if (value) {
                        return '<span title=\"'+value+'\" class=\"easyui-tooltip\">'+value+'</span>';
                    }
                }
            }
        ]]
    });
}