var bdEditingIndex,projectName,projectNum;
var proID="";
var subject="";
var projectId ="";
var basePath=$("#basePath").val();
var projectClass;

$(function(){
	$(".loadBtn").show();
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
 	//项目
 	var projectArr = new Array();
	
	//采购类型
	var typeData = new Array();
 	Utils.ajaxJson(basePath+'/purReq/getAllPurReqType',"",function(obj){
 		for (var i = 0; i < obj.length; i++) {
 			typeData[obj[i].ID] = obj[i].NAME;
		}
 	});
 	//专业
	var majorArr = new Array();
 	Utils.ajaxJson(basePath+'/purReq/getBaseData',{names:"pbs_view_MajorInformation"},function(obj){
 		obj = obj.pbs_view_MajorInformation;
 		for (var i = 0; i < obj.length; i++) {
 			majorArr[obj[i].ID] = obj[i].MAJORNAME;
		}
 	});
 	//项目信息
    Utils.ajaxJson(basePath+'/project/getProjectSummary',{projectId:projectId},function(obj){
        projectClass = obj.PROJECT_CLASS;
    });
 	//部门
 	var deptArr = new Array();
 	Utils.ajaxJsonSync(basePath+'/purReq/getAlldept',"",function(obj){
 		for (var i = 0; i < obj.length; i++) {
 			deptArr[obj[i].ID] = obj[i].DEPARTMENTNAME;
		}
 	});
 	$("#purReqTable").datagrid({
		toolbar: '#purReqTable_tb',
		width: '100%',
        height: '680',
//        pagination : true,
//        pageNumber : 1,
//		pageSize: 10,
//		pageList:[10,20,30,40,50],
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
        border:false,
        singleSelect: true,
        checkOnSelect:true,
        selectOnCheck:true,
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
        	field: "TYPENAME",
        	title: "采购类型",
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
        	field: "DEPARTMENTID",
        	title: "部门",
        	halign:"center",
        	width: "12%",
        	formatter: function(value,row,index){
        		return '<span title=\"'
				+ deptArr[value]
				+ '\" class=\"easyui-tooltip\">'
				+ deptArr[value] + '</span>';
        	}
        },
        {
        	field: "MAJORID",
        	title: "专业",
        	halign:"center",
        	width: "10%",
        	formatter: function(value,row,index){
        		if(value){
        			return '<span title=\"'
    				+ majorArr[value]
    				+ '\" class=\"easyui-tooltip\">'
    				+ majorArr[value] + '</span>';
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
        	width: "6%",
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
        		}else if(value==3){
                    return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.ID+"')" +
                        " title='点击查看审批节点信息' ><u>已驳回</u></a>";
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
        onClickRow: function(index,row){
        	if(row.STATUS != 0&&row.STATUS != 3){
        		$("#edit").linkbutton("options").text = '<i class="icon-list-ol"></i>&nbsp;查看';
        	}else{
        		$("#edit").linkbutton("options").text = '<i class="icon-edit"></i>&nbsp;修改';
        	}
        	$("#edit").linkbutton();
        },
        onDblClickRow: function(index, row){
        	var optType = 2;
        	if(row.STATUS == 1){
        		optType = 4;
    		}else if(row.STATUS == 2){
        		optType = 5;
    		}
        	window.open(basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+row.ID);
        }
	});
 	
	$("#purReqKey").searchbox({
 		width:256,
 		height:26,
        searcher: function(value) {
        	var param = {key:value};
        	var node = $('#projectList').tree("getSelected");
        	if(node != null && node.children == undefined){
        		param.projectId = node.id;
        	}
        	$("#purReqTable").datagrid("unselectAll");
        	$("#purReqTable").datagrid({
	    		queryParams:param
	    	});
        },
        prompt:"类型/部门/专业"
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
		    		queryParams:{projectId:node.id}
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
		    		queryParams:{projectId:node.id}
		    	});
			}else if(projectId != null && projectId.length != 0 && projectId != "N"){
				var node = $('#projectList').tree('find', projectId);
				projectName = node.text;
	    		projectNum = node.pnum;
				$('#projectList').tree('select', node.target);
				$("#purReqTable").datagrid("options").url = basePath+"/purReq/getPurReq";
				$("#purReqTable").datagrid({
		    		queryParams:{projectId:node.id}
		    	});
			}
	    }
	    
	});
	$("#add").click(function(){
		var url = basePath+"/purReqU/newPurReq?optType=1&projectId=";
		var node = $('#projectList').tree("getSelected");
    	if(node != null && node.children == undefined){
    		url+=node.id;
    	}else{
    		url+=" ";
    	}
    	window.open(url);
	})
	
	$("#edit").click(function(){
		var rows = $("#purReqTable").datagrid("getChecked");
		var optType = 2;
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要修改的数据");
			return;
		}else if(rows.length > 1){
			MyMessager.alert.show("提示","只能选择一行需要修改的数据");
			return;
		}
		if(rows[0].STATUS == 1){
			optType = 4;
		}else if(rows[0].STATUS == 2){
			optType = 5;
		}
		window.open(basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+rows[0].ID);
//		window.location.href = basePath+"/purReqU/newPurReq?optType="+optType+"&purReqId="+rows[0].ID;
	})
	
	$("#del").click(function(){
		var rows = $("#purReqTable").datagrid("getChecked");
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要删除的数据");
			return;
		}
		var ids = "";
		for (var i = 0; i < rows.length; i++) {
			if(rows[i].STATUS != 0){
				MyMessager.alert.show("提示","只能删除【草稿】状态的请购单。");
				return;
			}
			ids+= "'"+rows[i].ID +"',";
		}
		$.messager.confirm('确认对话框', '确认删除数据吗？', function(r){
			if(r){
				
				$.messager.progress({
					interval:100,
					text:'正在处理中'
				});
				Utils.ajaxJson(basePath+"/purReq/delPurReq",{ids:ids},function(obj){
					$.messager.progress('close');
					if(obj.rs == 0){
						$("#purReqTable").datagrid('reload');
						$("#purReqTable").datagrid("uncheckAll");
						MyMessager.slide.show("提示", "操作成功");
					}else{
						MyMessager.alert.show("提示","操作失败");
					}
				})
			}
		});
	})
	$("#commit").click(function(){
		var purType="";
		var workFlow="";
		var target = "";
		var code = "";
		var work_flow = $('#workflow').text();
		var rows = $("#purReqTable").datagrid("getChecked");
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要提交审批的数据");
			return;
		}
		for (var i = 0; i < rows.length; i++) {
			if(rows[i].STATUS != 0&&rows[i].STATUS != 3){
				MyMessager.alert.show("提示","只能提交【草稿】状态的请购单。");
				return;
			}
			proID=rows[i].ID;
			subject=projectArr[rows[i].PRJID];
			purType = typeData[rows[i].TYPEID];
		}
		if(purType==='采购分包'){
			target = "P";
		}else if(purType==='设计（劳务）分包'){
			target = "D";
		}else if(purType ==='施工分包' || purType==='设计（专业）分包' || purType==='管理及其他分包'
         	|| purType==='采购分包（非物资类）' || purType.indexOf("研发")!==-1){//工程一体化类//研发类也走这个流程
			target = "E";
		}else {//非工程一体化
            target = "E";
		}
		workFlow = convertWorkflow(purType);
		if (purType==='施工分包'){
			code = "标段";
		}
		else {
			code = "合同包";
		}
		if (rows[0].STATUS == 3){
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
                            location.reload();
                        },
                        error:function(jqXHR, textStatus, errorThrown) {
                            alert(jqXHR.responseText);
                        }
                    });
                }
            });
            return;
		}
		MyMessager.prog.show("提示","数据校验中...");
        $.post(basePath+"/purReq/checkCommit","purReqId="+rows[0].ID,function(obj){
            if(obj.rs === 1){
                MyMessager.prog.close();
                MyMessager.alert.show("提示","此请购单还未完成，请先完成！(请购数量必填，设备类请购行关联预算必选！)");
            }else if(obj.rs === 2){
                MyMessager.prog.close();
                $.messager.alert('确认对话框', '该请购单中的请购行存在可请购数量为0!');
            } else if(obj.rs === 3){
                MyMessager.prog.close();
                $.messager.alert("提示","物料变更必须填写说明！");
			} else{
                Utils.ajaxJsonSync(basePath+"/purReq/isPurPlanImportedWbs",{prjId:projectId,taskCode:code},function (obj1) {
                    MyMessager.prog.close();
                    if (obj1 === "0"){
                        MyMessager.alert.show("提示","请先完成采购分包计划/费用控制目标或联系项目管理部王春巧")
                    }else {
                        //设备材料请购、设计（劳务）请购走相应审批流，
						// 施工分包、设计（专业）分包、管理及其他分包、采购分包（非物资类）走工程一体化流程，
						// 其余的均为直接发布。
                        // if(purType ==='施工分包' || purType==='设计（专业）分包' || purType==='管理及其他分包'
						// 	|| purType==='采购分包（非物资类）' || purType==='采购分包' || purType==='设计（劳务）分包'){
                        if(1===1){
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
                                            //console.log(per);
                                            var allUser="";
                                            if(per.allUser!="" && per.allUser!=undefined && per.allUser!='undefined'){
                                                allUser=per.allUser+per.subject;
                                                //工程项目信息
                                                var param2 ="&projectId="+projectId+"&projectCode="+projectNum+"&projectName="+projectName;
                                                //参数组装
                                                var params = allUser+param2+"&proId="+proID+"&isNeed="+per.isNeed+"&processId="+$.trim(workFlow)+"&isSelect="+per.isSelect
													+"&target="+target+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
                                                //发起请求，执行流程
                                                MyMessager.slide.show("提示", "数据处理中，请稍....");
                                                $.post(basePath+"/workflow/start/"+$.trim(workFlow),"params="+params,function(result){
                                                    if("success"==result){
                                                        dialog.dialog('destroy');
                                                        MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                                        //重新加载数据
                                                        $("#purReqTable").datagrid('reload');
                                                        $("#purReqTable").datagrid("uncheckAll");

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
                            window.close();
                        }else{
                            MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                            $.post(basePath+"/purReq/commit","purReqId="+rows[0].ID,function(obj){
                                if(obj.rs==0){
                                    MyMessager.slide.show("提示", "发布成功，消息将在3秒后关闭。");
                                    //重新加载数据
                                    $("#purReqTable").datagrid('reload');
                                    $("#purReqTable").datagrid("uncheckAll");
                                }else{
                                    MyMessager.alert.show("提示","发布失败");
                                }
                            },"json");
                            //重新加载数据
                            $("#purReqTable").datagrid('reload');
                            $("#purReqTable").datagrid("uncheckAll");
                        }
                    }
                });
            }
        },"json");
	});
	
	$("#reset").click(function(){
		var rows = $("#purReqTable").datagrid("getChecked");
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要重置的数据");
			return;
		}
		$.post(basePath+"/purReq/reset","purReqId="+rows[0].ID,function(obj){
			if(obj.rs == 0){
				$("#purReqTable").datagrid('reload');
				$("#purReqTable").datagrid("uncheckAll");
				MyMessager.slide.show("提示", "操作成功");
			}else{
				MyMessager.alert.show("提示","操作失败");
			}
		},"json")
	})
	
	$("#lead").click(function(){
		var rows = $("#purReqTable").datagrid("getChecked");
		if(rows.length == 0){
			MyMessager.alert.show("提示","请先选择要导入的数据");
			return;
		}
		if(rows[0].STATUS != 2){
			MyMessager.alert.show("提示","只能导入已审批的数据");
			return;
		}
		Utils.ajaxJson(basePath+"/pbs2wbs/syncRequisition",{purReqId:rows[0].ID},function(obj){
			$("#purReqTable").datagrid('reload');
			$("#purReqTable").datagrid("uncheckAll");
			if(obj.rs == 0){
				MyMessager.slide.show("提示", "操作成功");
			}else{
				MyMessager.alert.show("提示","操作失败");
			}
		},function(){
			$("#purReqTable").datagrid('reload');
			$("#purReqTable").datagrid("uncheckAll");
			MyMessager.alert.show("提示","操作失败");
		});
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

function convertWorkflow(key) {
	var workflow = "purReqAppr";
	if (key === "采购分包" || key === "采购分包（物料变更）") {
		workflow = "purreq_engine_device";
	}else if (key === "设计（劳务）分包" || key === "设计（专业）分包") {
		workflow = "purreq_engine_design";
	}else if (key === "管理及其他分包") {
		if (projectClass === "设备供货" || projectClass === "工程承包") {
			workflow = "purreq_engine_manage1";
		}else {
            workflow = "purreq_engine_manage2";
		}
	}else if (key === "施工分包" || key === "采购分包（非物资类）") {
        workflow = "purreq_engine";
	}else if (key.indexOf("研发") != -1) {
        workflow = "purreq_service";
	}else {
		workflow = "purreq_nonengine";
	}
	return workflow;
}