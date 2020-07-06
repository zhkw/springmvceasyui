var formChange = 0;
var infoData;
var editIndex;
var projectId;
var edit_version = 0;
var limitDate;
function loadBtn(){
	$(".delBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var row = table.treegrid('getSelected');
		if(checkDel(row)){
			var pbsVersionId = row.ID;
			delVersion(pbsVersionId,table);
		}
	})
	$(".copyBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var row = table.treegrid('getSelected');
		checkCopy(row);
	})
	$(".pasteEditBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var isEditable = true;
		var typeCode = table.attr("name");
		if(checkPaste(isEditable,typeCode,projectId)){
			pasteVersion(table,isEditable);
		}
	})
	$(".pasteNoEditBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var isEditable = false;
		pasteVersion(table,isEditable);
	});
	$(".refreshBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		table.treegrid("reload");
	});
	$("#closeInfo").click(function(){
		var display = $("#projectInfoDiv").css("display");
		if(display == "block"){
			$("#closeInfo").html("展开");
			$("#projectInfoDiv").hide("500");
		}else{
			$("#projectInfoDiv").show("500");
			$("#closeInfo").html("收起");
		}
		setTimeout("handelLayout()",400);
	})
	edtiVersion(false);
}

//删除pbs版本  pbs版本id  table 表格对应jQuery对象
function delVersion(pbsVersionId,table){
	$.messager.confirm('确认对话框', '确认删除该版本吗？', function(r){
		if(r){
			$.messager.progress({
				interval:100,
				text:'正在处理中'
			});
			$.post(basePath+"/pbsVersion/deletePbsVersion","pbsVersionId="+pbsVersionId,function(obj){
				$.messager.progress('close');
				if(obj.rs == 0){
					table.treegrid("reload");
					$("#copyId").val("");
					$("#iseditable").val("");
					MyMessager.slide.show("提示", "删除成功。");
				}else{
					$.messager.alert('提示',"操作失败");
				}
			},"json");
		}
	});
}
//验证删除
function checkDel(row){
	if(row == null){
		$.messager.progress('close');
		$.messager.alert('提示',"请选择要删除的固化版本【草稿】");
		return false;
	}else if(row.ISEDITABLE != 0||row.STATUS == 1 || row.STATUS == 2){
		$.messager.progress('close');
		$.messager.alert('提示',"只能删除的固化版本【草稿】");
		return false;
	}
	var boo = false;
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: row.ID},function(obj){
		if(obj.rs == 4){
			$.messager.alert('提示',"该版本还有未完成的复制任务，请稍后再试...");
		}else{
			boo = true;
		}
	});
	return boo;
	
}
//校验复制
function checkCopy(row){
	var boo = true;
	var status = 0;
	if(row == null || row.ISEDITABLE == undefined || row.CREATETIME == undefined){
		$.messager.alert('提示',"请选择一个具体的版本");
		return false;
	}
    MyMessager.prog.show("请等待", "正在校验数据...");
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: row.ID},function(obj){
		status = obj.rs;
		if(obj.rs == 1){
			$.messager.alert('提示',"还没有编制根节点");
			boo = false;
		}else if(obj.rs == 2){
			$.messager.alert('提示',"PBS节点正在审批中");
			boo = false;
		}else if(obj.rs == 3){
			$.messager.alert('提示',"物料清单正在审批中");
			boo = false;
		}else if(obj.rs == 4){
			$.messager.alert('提示',"该版本还有未完成的任务，请稍后再试...");
			boo = false;
		}
//		else if(obj.rs == 5){
//			$.messager.alert('提示',"还未编制价格");
//			boo = false;
//		}else if(obj.rs == 6){
//			$.messager.alert('提示',"价格表正在审批中");
//			boo = false;
//		}
	},function(){
		boo = false;
	});
    MyMessager.prog.close();
	if (status == 7) {
        $.messager.confirm('提示','您复制的不是最新版本,可能导致数据丢失,是否继续?',function(r){
            if (r){
                var pbsVersionId = row.ID;
                $("#copyId").val(pbsVersionId);
                $("#iseditable").val(row.ISEDITABLE);
                MyMessager.slide.show("提示", "复制成功");
            }
        });
	}else {
        if(boo){
            var pbsVersionId = row.ID;
            $("#copyId").val(pbsVersionId);
            $("#iseditable").val(row.ISEDITABLE);
            MyMessager.slide.show("提示", "复制成功");
        }
	}
}
//校验粘贴
function checkPaste(isEditable,typeCode,projectId){
	var boo = true;
	if(isEditable && $("#iseditable").val() == 1){
		$.messager.alert('提示',"请从固化版本复制到可编辑版！");
		return false;
	}
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkPaste",
			{typeCode:typeCode,projectId:projectId,pbsVersionId:$("#copyId").val(),isEditable:isEditable},function(obj){
		if(obj.rs == 1){
			$.messager.alert('提示',"可编辑版粘贴不能为自身");
			boo = false;
		}else if(obj.rs == 2){
			$.messager.alert('提示',"目标版本有PBS节点正在审批中");
			boo = false;
		}else if(obj.rs == 3){
			$.messager.alert('提示',"目标版本有物料清单正在审批中");
			boo = false;
		}else if(obj.rs == 4){
			$.messager.alert('提示',"目标版本存在未完成的任务，请稍后再试...");
			boo = false;
		}
	},function(){
		boo = false;
	});
	return boo;
}
//粘贴  table  表格对应jQuery对象
function pasteVersion(table,isEditable){
	var pbsVersionId = $("#copyId").val();
	var typeCode = table.attr("name");
	if(pbsVersionId == null || $.trim(pbsVersionId) == ""){
		$.messager.alert('提示',"请复制一个版本！");
	}else{
		$.messager.confirm('确认对话框', '确认粘贴版本吗？', function(r){
			if (r){
				$.messager.progress({
					interval:100,
					text:'正在处理中'
				});
				MyMessager.slide.show("提示", "正在复制中，请稍后");
				$.post(basePath+"/pbsVersion/copyPbsVersion",
						"pbsVersionId="+pbsVersionId+"&typeCode="+typeCode+"&isEditable="+isEditable+"&isChecked=false",
							function(obj){
					$.messager.progress('close');
					if(obj.rs == 0){
						$("#copyId").val("");
						$("#iseditable").val("");
						MyMessager.slide.show("提示", "已提交，数据正在处理中，可在操作记录中查看信息");
						$("#checkRecord").click();
					}else if(obj.rs == 2){
						$.messager.alert('提示',"请从固化版本复制到可编辑版！");
					}else{
						$.messager.alert('提示',"粘贴失败");
					}
				},"json");
			}
		});
	}
}
//查看版本信息
function pbsVersionView(pbsVersionId,rootNodeId,projectId){
	var url = "";
	Utils.ajaxJsonSync(basePath+"/pbsVersion/setUrl",{url:window.location.href});
	$.ajax({
 		url: basePath+"/auth/getVersionViewAuth",
 		method: "get",
 		dataType: "json",
 		success: function(data) {
 			if(data.version_pbs){
 				url = "/pbsVersionU/psbVersionView";
 			}else if(data.version_list){
 				url = "/pbsVersionU/materialListView";
 			}else if(data.version_mh){
 				url = "/pbsVersionU/manhourView";
 			}else if(data.version_exp){
 				url ="/pbsVersionU/priceListrView";
 			}else{
 				$.messager.alert('提示',"没有权限！");
 				return;
 			}
 			window.location.href=basePath+url
 				+"?pbsVersionId="+pbsVersionId+"&rootNodeId="+rootNodeId+"&projectId="+projectId;
 		}
 	});
	
}
//编辑结束
function editName(){
	$('#firstGrid').treegrid('endEdit',editIndex);
	$('#secondGrid').treegrid('endEdit',editIndex);
	$('#thirdGrid').treegrid('endEdit',editIndex);
	$('#fourthGrid').treegrid('endEdit',editIndex);
	$(".tableBtn").linkbutton();
}

function handelLayout(){
	$('#projectLayout').layout();
	var c = $('#projectLayout');
	var p = c.layout('panel','center');	// get the center panel
	var oldHeight = p.panel('panel').outerHeight();
	p.panel('resize', {height:'auto'});
	var newHeight = p.panel('panel').outerHeight();
	c.layout('resize',{
		height: (c.height() + newHeight - oldHeight+15)
	});
	if(c.height() < screen.height){
		c.layout('resize',{
			height: screen.height
		});
	}
	$(".outWrapper").css("height",c.height()+5);
}
//设置扩展信息
function setPrjExtendInfo(){
	$("#projectName").val(getTpValue(infoData.PROJECTNAME));
	$("#quotation_manager").val(getTpValue(infoData.QUOTATION_MANAGER));
	$("#project_dept").val(getTpValue(infoData.PROJECT_DEPT));
	$("#project_scale").val(getTpValue(infoData.PROJECT_SCALE));
	$("#customer_name").val(getTpValue(infoData.CUSTOMER_NAME));
	$("#project_investment").val(getTpValue(decimalHandel((infoData.PROJECT_INVESTMENT/10000),4)));
	if(infoData.ID != undefined){
		var productIds = infoData.PRODUCTID;
		var arr = new Array();
		var arr2 = productIds.split(",");
		for (var i = 0; i < arr2.length; i++) {
			arr.push(arr2[i]);
		}
		$("#prjExtendInfoId").val(infoData.ID);
		$("#prjType").combobox("setValue",infoData.TYPEID);
		$("#productType").combobox("setValues",arr);
		$("#isInvitation").combobox("setValue",infoData.ISINVITATION);
		$("#startDate").datebox("setValue",infoData.STARTDATE);
		$("#invitationWay").val(infoData.INVITATIONWAY);
		$("#period").val(infoData.PERIOD);
		$("#price").val(infoData.PRICE);
		$("#scope").val(infoData.SCOPE);
		$("#intro").val(infoData.INTRO);
		$("#bidUnits").val(infoData.BIDUNITS);
		$("#bidInfo").val(infoData.BIDINFO);
	}else{
		$("#prjExtendInfoId").val("");
	}
	$("#infoFrom").form("validate");
	$("#infoFrom").form({
		onChange: function(){
			formChange = 1;
		}
	});
}
//获取扩展信息
function getPrjExtendInfo(projectId){
	Utils.ajaxJson(basePath+"/project/getExtendInfo",{projectId:projectId},function(obj){
		infoData = obj;
		prjInfoView();
		if($("#infoDialog").css("display") == "block"){
			setPrjExtendInfo();
		}
	});
}
//页面显示
function prjInfoView(){
	$(".projectName").html(infoData.PROJECTNAME);
	$(".quotation_manager").html(infoData.QUOTATION_MANAGER== null ? "&nbsp;" :infoData.QUOTATION_MANAGER);
	$(".project_dept").html(infoData.PROJECT_DEPT== null ? "&nbsp;" :infoData.PROJECT_DEPT);
	$(".project_scale").html(infoData.PROJECT_SCALE== null ? "&nbsp;" :infoData.PROJECT_SCALE);
	$(".customer_name").html(infoData.CUSTOMER_NAME== null ? "&nbsp;" :infoData.CUSTOMER_NAME);
	$(".project_investment").html(infoData.PROJECT_INVESTMENT== null ? "&nbsp;" :decimalHandel((infoData.PROJECT_INVESTMENT/10000),4));
	if(infoData.ID != undefined){
		var productIds = infoData.PRODUCTID;
		var product = "";
		var arr2 = productIds.split(",");
		for (var i = 0; i < arr2.length; i++) {
			product+=productTypes[arr2[i]] + ",";
		}
		product = product.substring(0,product.length-1);
		$(".prjExtendInfoId").html(infoData.ID);
		$(".prjType").html(projectTypes[infoData.TYPEID] == undefined ? "&nbsp;" : projectTypes[infoData.TYPEID]);
		$(".productType").html(product);
		$(".isInvitation").html(infoData.ISINVITATION == 1?"是" : "否");
		$(".startDate").html(infoData.STARTDATE == null ? "&nbsp;" : infoData.STARTDATE);
		$(".invitationWay").html(infoData.INVITATIONWAY== null ? "&nbsp;" : infoData.INVITATIONWAY);
		$(".period").html(infoData.PERIOD == null ? "&nbsp;" : infoData.PERIOD);
		$(".price").html(infoData.PRICE == null ? "&nbsp;" : infoData.PRICE);
		$(".scope").html(infoData.SCOPE == null ? "&nbsp;" : infoData.SCOPE);
		$(".intro").html(infoData.INTRO == null ? "&nbsp;" : infoData.INTRO);
		$(".bidUnits").html(infoData.BIDUNITS == null ? "&nbsp;" : infoData.BIDUNITS);
		$(".bidInfo").html(infoData.BIDINFO == null ? "&nbsp;" : infoData.BIDINFO);
	}else{
		$(".prjExtendInfoId").html("&nbsp;");
		$(".prjType").html("&nbsp;");
		$(".productType").html("&nbsp;");
		$(".isInvitation").html("&nbsp;");
		$(".startDate").html("&nbsp;");
		$(".invitationWay").html("&nbsp;");
		$(".period").html("&nbsp;");
		$(".price").html("&nbsp;");
		$(".scope").html("&nbsp;");
		$(".intro").html("&nbsp;");
		$(".bidUnits").html("&nbsp;");
		$(".bidInfo").html("&nbsp;");
	}
	
}
//版本审批
/*function checkVersionPriceL(pbsVersionId,pbsTypeCodeId,priceId,obj){
	var tableId = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
	$.post(basePath+"/pbsVersion/getTypeById","typeId="+pbsTypeCodeId,function(obj){
		var options = {
				title : obj.name+'审批',
				url : basePath+'/projectU/deptDialog',
				height: 400,
				width: 360,
				buttons : [{
					text:'直接通过审批',
					size:'large',
					handler:function(){
						var rs = dialog.find("iframe").get(0).contentWindow.testCheck(pbsVersionId,priceId);
						if(rs == 0){
							$("#"+tableId).treegrid("reload");
							dialog.dialog('destroy');
						}
					}
				},{
					text : '提交审批',
					handler : function() {
						var rs = dialog.find("iframe").get(0).contentWindow.commitCheck();
						if(rs == 0){
							$("#"+tableId).treegrid("reload");
							dialog.dialog('destroy');
						}
					}
				}]
		};
		var dialog = modalDialog(options);
	},"json");
}*/
//获取权限
function getLimit(projectId,type){
	limitDate = undefined;
	edtiVersion(false);
	$.ajax({
 		url:basePath+"/pbsCommonController/singleProjectMng?projectId="+projectId,
 		method:"post",
 		async:false
 	});
	var url = "";
	if(type == 1){
		url = basePath+"/auth/getProjectBidAuth";
	}else if(type == 2){
		url = basePath+"/auth/getProjectBudgetAuth";
	}
 	$.ajax({
 		url: url,
 		method: "post",
 		dataType: "json",
 		success: function(data) {
 			limitDate = data;
 			if(data.edit_version){
 				edtiVersion(true);
 			} else{
 				edtiVersion(false);
 			}
 		}
 	
 	});
}
//处理按钮
function getLimit2(){
	if(limitDate == undefined){
		setTimeout('getLimit2()',200);
		return;
	}
	var data = limitDate;
		edtiBtnDisplay("edit_pbs",data.edit_pbs);
		edtiBtnDisplay("submit",data.submit);
		edtiBtnDisplay("edit_exp",data.edit_exp);
		edtiBtnDisplay("edit_mh",data.edit_mh);
		edtiBtnDisplay("edit_list",data.edit_list);
		edtiBtnDisplay("view_version",data.view_version);
		edtiBtnDisplay("synBtn",data.submit);
}

//修改版本权限按钮
function edtiVersion(boo){
	if(boo){
		$("#editInfo").show();
		$(".copyBtn ").show();
		$(".copyBtn ").show();
		$(".pasteEditBtn ").show();
		$(".pasteNoEditBtn ").show();
		$(".refreshBtn ").show();
		$(".delBtn ").show();
		$(".leadBtn").show();
		edit_version = 1;
	}else {
		$("#editInfo").hide();
		$(".copyBtn ").hide();
		$(".copyBtn ").hide();
		$(".pasteEditBtn ").hide();
		$(".pasteNoEditBtn ").hide();
		$(".refreshBtn ").hide();
		$(".delBtn ").hide();
		$(".leadBtn").hide();
		edit_version = 0;
	}
}
//修改按钮是否显示    class  boolean
function edtiBtnDisplay(btnClass,boo){
	if(boo){
		$("."+btnClass).show();
		$("."+btnClass).linkbutton();
	}else{
		$("."+btnClass).hide();
	}
}


$(function(){
	$(".projectBtn").show();
})

function moveDialog(id) {
	$('#'+id).dialog('open');  
	$('#'+id).dialog("move",{top:$(document).scrollTop() + ($(window).height()-$('#'+id).dialog('options').height) * 0.5});  

}
function moveDialog2(obj) {
	obj.dialog('open');  
	obj.dialog("move",{top:$(document).scrollTop() + ($(window).height()-$('#'+id).dialog('options').height) * 0.5});  

}