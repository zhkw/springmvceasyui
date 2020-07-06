var bdEditingIndex,projectName,projectNum;
var proID="";
var subject="";
var projectId ="";
var basePath=$("#basePath").val();

$(function(){
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
		url:basePath+"/purReq/getPurReq",
 		toolbar: '#purReqTable_tb',
		width: '100%',
        height: '550',
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
    		width: "13%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ value
				+ '\" class=\"easyui-tooltip\">'
				+ value + '</span>';
        	}
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
        	field: "TYPEID",
        	title: "采购类型",
        	halign:"center",
        	width: "10%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ typeData[value]
				+ '\" class=\"easyui-tooltip\">'
				+ typeData[value] + '</span>';
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
        	width: "10%",
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
        	field: "CREATNAME",
        	title: "创建人",
        	halign:"center",
        	width: "8%",
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
                    return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.ID+"')" +
                        " title='点击查看审批节点信息' ><u>审批中</u></a>";
        		}else if(value == 2){
                    return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.ID+"')" +
                        " title='点击查看审批节点信息' ><u>已审批</u></a>";
        		}
        		return str;
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
//        onClickRow: function(index,row){
//    		$("#edit").linkbutton("options").text = '<i class="icon-list-ol"></i>&nbsp;查看';
//        	$("#edit").linkbutton();
//        },
        onDblClickRow: function(index, row){
        	var optType = 4;
        	if(row.STATUS == 2){
        		optType = 5;
    		}
        	window.open(basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+row.ID);
        }
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
	
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:data,
	    onClick:function(node){
	    	var projectId;
	    	var ouId;
	    	if(node.children=='undefined'|| node.children == undefined ){
	    		ouId = "";
	    		projectName = node.text;
	    		projectNum = node.pnum;
	    		projectId = node.id;
	    		$("#ouId").val(ouId);
	    		$("#projectId").val(node.id);
	    		$("#purReqTable").datagrid("unselectAll");
		    	Utils.ajaxJson(basePath+'/project/setPrj',
		    			{projectId:projectId,ouId:ouId});
		    	$("#purReqTable").datagrid({
		    		queryParams:{projectId:node.id,type:1}
		    	});
	    	}
	    },
	    onLoadSuccess:function(row,data){
	    	for (var i = 0; i < data.length; i++) {
	    		var projects = data[i].children;
				for (var j = 0; j < projects.length; j++) {
					projectArr[projects[j].id] = projects[j].pname; 
				}
			};
			$("#purReqTable").datagrid("options").url = basePath+"/purReq/getPurReq";
			if(ouId != null && ouId.length != 0 && ouId != "N"){
				var node = $('#projectList').tree('find', ouId);
				projectName = node.text;
	    		projectNum = node.pnum;
				$('#projectList').tree('select', node.target);
				$("#purReqTable").datagrid({
		    		queryParams:{projectId:node.id,type:1}
		    	});
			}else if(projectId != null && projectId.length != 0 && projectId != "N"){
				var node = $('#projectList').tree('find', projectId);
				projectName = node.text;
	    		projectNum = node.pnum;
				$('#projectList').tree('select', node.target);
				$("#purReqTable").datagrid("options").url = basePath+"/purReq/getPurReq";
				$("#purReqTable").datagrid({
		    		queryParams:{projectId:node.id,type:1}
		    	});
			}
	    }
	    
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
