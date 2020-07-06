var bdEditingIndex,projectName,projectNum;
var proID="";
var subject="";
var projectId ="";
var basePath=$("#basePath").val();
// 单位
var unitList;
var unitListMap = new Array();
// 管理类型
var manageTypeList;
var manageTypeListMap = new Array();
var notProjectIntergration = ["固定资产","办公用品","劳保用品","修理维护",
    "公司经营其他","计算机及相关硬件","专业应用软件",
    "信息化技术服务","研发货物","研发工程","研发服务"];
var typeCode = "采购分包";
$(function(){

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
	basePath = $("#basePath").val();
	projectId = $("#projectId").val();
	var ouId = $("#ouId").val();
	var data = {key:""};
 	$("#key").searchbox({
 		height:30,
 		width:200,
        searcher: function(value) {
        	data = {key:value};
			$('#projectList').tree({queryParams:data});
        },
        prompt:"组织名称/项目名称/编码"
    });
 	//采购类型
	var typeData = new Array();
 	Utils.ajaxJsonSync(basePath+'/purReq/getAllPurReqType',"",function(obj){
 		for (var i = 0; i < obj.length; i++) {
 			typeData[obj[i].ID] = obj[i].NAME;
		}
 	});
 	$("#purReqTable").datagrid({
		url:basePath+"/purReq/getPurReqDetail",
 		toolbar: '#purReqTable_tb',
		width: '100%',
        height: '500',
        pagination : true,
        pageNumber : 1,
		pageSize: 10,
		pageList:[10,20,30,40,50],
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
        border:false,
        singleSelect: true,
        checkOnSelect:true,
        selectOnCheck:true,
        queryParams:{type:1},
        columns: [[
        {
        	field: "ck",
        	checkbox:true
        },
        {
        	field: "CODE",
        	title: "请购单编号",
        	halign:"center",
        	width: "13%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ value
				+ '\" class=\"easyui-tooltip\">'
				+ value + '</span>';
        	}
        },
        {
        	field: "NAME",
        	title: "请购单名称",
        	halign:"center",
    		width: "10%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ value
				+ '\" class=\"easyui-tooltip\">'
				+ value + '</span>';
        	}
        },
			{
                field: "CREATNAME",
                title: "创建人",
                halign:"center",
                width: "5%",
                formatter: function(value,row,index){
                    return '<span title=\"'
                        + value
                        + '\" class=\"easyui-tooltip\">'
                        + value + '</span>';
                }
            },
            {
                field: "STATUS",
                title: "状态",
                halign:"center",
                width: "5%",
                formatter: function(value,row,index){
                    var str = "";
                    if(value == 0){
                        str = "草稿";
                    }else if(value == 1){
                        str="审批中";
                    }else if(value == 2){
                        str="已审批";
                    }
                    return str;
                }
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
                width : "8%"
                // editor : "text",
                // formatter : function(value, row) {
                //     if (value) {
                //         return '<span title=\"'
                //             + value
                //             + '\" class=\"easyui-tooltip\">'
                //             + value + '</span>';
                //     }
                // }
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
                field : "MAXQTY",
                title : "可请购数量",
                width : "5%",
                formatter: function(value,row,index){
                    if(value){
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
            },{
                field : "REMARK",
                title : "备注",
                width : "15%",
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
            },
            {
                field : "EQUIPNUM",
                title : "设备位号",
                width : "10%",
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
            },
        {
        	field: "PRJNAME",
        	title: "项目名称",
        	halign:"center",
        	width: "12%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ value
				+ '\" class=\"easyui-tooltip\">'
				+ value + '</span>';
        	}
        },
        {
        	field: "DEPTNAME",
        	title: "部门",
        	halign:"center",
        	width: "12%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ value
				+ '\" class=\"easyui-tooltip\">'
				+ value + '</span>';
        	}
        },
        {
        	field: "MAJORNAME",
        	title: "专业",
        	halign:"center",
        	width: "5%",
        	formatter: function(value,row,index){
        		if(value){
        			return '<span title=\"'
    				+ value
    				+ '\" class=\"easyui-tooltip\">'
    				+ value + '</span>';
        		}
        	}
        },
        {
        	field: "CREATETIME",
        	title: "创建时间",
        	halign:"center",
        	width: "10%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ formatDatebox(value)
				+ '\" class=\"easyui-tooltip\">'
				+ formatDatebox(value) + '</span>';
        	}
        },
        {
        	field: "IMPORT",
        	title: "其他",
        	halign:"center",
        	width: "5%",
        	formatter: function(value,row,index){
        		if(row.STATUS == 2 && value == 3){
        			return "已导入";
        		}else if(row.STATUS == 2 && value == 1){
        			return "导入失败";
        		}else if(row.STATUS == 2 && value == 2){
        			return "导入中";
        		}else if(row.STATUS == 2 && value == null){
        			return "未导入";
        		}
        	}
        }
//       
        ]],
		queryParams: {
            key: function(){
                var purCode = $("#purCode").val();
                var purName = $("#purName").val();
                var prjName = $("#prjName").val();
                var creater = $("#creater").val();
                var dep = $("#dep").val();
                var major = $("#major").val();
                var matCode = $("#matCode").val();
                var matName = $("#matName").val();
                var pbsCode = $("#pbsCode").val();
                var pbsName = $("#pbsName").val();
                var key = purCode+','
                    +purName+','
                    +prjName+','
                    +creater+','
                    +dep+','
                    +major+','
                    +matCode+','
                    +matName+','
                    +pbsCode+','
                    +pbsName+',query';
                return key;
            }
        },
       onClickRow: function(index,row){
			//文件
           $("#fileList").datagrid({
               url : basePath
               + "/pbsCommonController/queryAttachment",
               queryParams : {
                   targetId : row.ID,
                   targetType : 11
               }
           });
           //所属采购计划包
           $('#purPackage').datagrid("options").url = basePath+ "/purReq/getPurPlan";
           $('#purPackage').datagrid("load",{
               budgetId : row.BUDGETID,
               uniquePurPlan : row.UNIQUEPURPLAN,
               projectId : row.PRJID});
       }
	});
    $("#exportDetail").on("click", function() {
        var purCode = $("#purCode").val();
        var purName = $("#purName").val();
        var prjName = $("#prjName").val();
        var creater = $("#creater").val();
        var dep = $("#dep").val();
        var major = $("#major").val();
        var matCode = $("#matCode").val();
        var matName = $("#matName").val();
        var pbsCode = $("#pbsCode").val();
        var pbsName = $("#pbsName").val();
        var key = purCode+','
            +purName+','
            +prjName+','
            +creater+','
            +dep+','
            +major+','
            +matCode+','
            +matName+','
            +pbsCode+','
            +pbsName+',export';
        //下载
        window.location.href=basePath+'/export/exportPurReqDetails?key='+key;
        MyMessager.slide.show("提示","请等待","报表正在生成中...");
    });
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
                    return '<button type="button" onclick="downAttachment(\''
                        + row.filePath
                        + '\',\''
                        + row.fileName
                        + '\',\''
                        +row.id
                        + '\');" class="btn btn-default"><i class="icon-download"></i>下载</button>';
                }
            }
        ]
        ]
    });

    // 采购包
    $("#purPackage").datagrid({
        columns : [ [ {
            field : 'CODE',
            title : '采购包号',
            width : '50%'
        }, {
            field : 'NAME',
            title : '采购包名称',
            width : '49%'
        } ] ]
    });
 	//项目
 	var projectArr = new Array();
	$("#purReqKey").searchbox({
 		width:256,
 		height:26,
        searcher: function(value) {
        	var param = {key:value,type:1};
        	var node = $('#projectList').tree("getSelected");
        	if(node != null && node.children == undefined){
        		param.projectId = node.id;
        	}
        	$("#purReqTable").datagrid("unselectAll");
        	$("#purReqTable").datagrid({
	    		queryParams:param
	    	});
        },
        prompt:"类型/部门/专业/项目名称/项目号/创建人"
    });
//	var dataArr = new Array();
    //搜索
    $("#searchMm").click(function(){
        $("#purReqTable").datagrid("reload");
    });

	$("#edit").click(function(){
		var rows = $("#purReqTable").datagrid("getChecked");
		var optType = 4;
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要查看的数据");
			return;
		}
		if(rows[0].STATUS == 2){
    		optType = 5;
		}
		window.open(basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+rows[0].ID);
//		window.location.href = basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+rows[0].ID;
	})
	$('#purReqLayout').layout();
    //审批历史
    $("#historyGrid").datagrid({
        height:"98%",
        width:"98%",
        idField:"id",
        columns:[[
            {
                field:"nodeName",
                title:"节点",
                width:"25%"
            },{
                field:"approver",
                title:"审批人",
                width:"10%"
            },{
                field: "operationTime",
                title: "处理时间",
                width: "25%",
                formatter: function(value) {
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return formatDatebox(new Date(value));
                    }
                }
            },{
                field: "operation",
                title: "处理结果",
                width: "15%",
                formatter: function(value) {
                    if (value==null||value=="") {
                        return "未处理";
                    } else if (1==value||"1"==value) {
                        return "批准";
                    } else {
                        return "驳回";
                    }
                }
            },{
                field:"comment",
                title:"评论",
                width:"25%",
                formatter: function (value) {
                    if(value){
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            }
        ]]
    });
});


function findDetail(rowId){
    $('#contractInfo-dlg').dialog('open').dialog('center').dialog('setTitle','审批流转节点信息');
    $.ajax({
        url:basePath+"/workflow/getProcessIdByVariableValue",
        type:'GET',
        data:{id:rowId},
        success:function(data) {
            getWorkflowHistory(data);
        }
    });
}
function getWorkflowHistory(processId) {
	var nowDate = new Date();
    $.ajax({
        url: basePath+"/workflow/getWorkflowHistory?date="+nowDate.getSeconds(),
        data: "processInstanceId="+processId,
        method: "get",
        success: function(recordData, textStatus, xhr) {
            $("#historyGrid").datagrid("loadData", recordData);
        }
    });
}
