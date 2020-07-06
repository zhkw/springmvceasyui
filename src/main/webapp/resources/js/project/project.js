var projectTypes = new Array();
var productTypes = new Array();
var checkData;
var bdEditingIndex;
var basePath=$("#basePath").val();
var projectId;
var personList;
var personArr = new Array();
var selectNode=new Object();
var isChecked = false;
var projectNum;
var categoryTreeSetting = {
	async: {
		enable: true,
		dataType:"json" ,
		url:basePath+'/baseInfo/getDeptTree',
		otherParam: ['key',function(){
			return $('#dept-key').searchbox('getValue');
		}],
		autoParam: ["DEPARTMENTID"]
	},
	view: {
		dblClickExpand: false,
		showLine: true
	},
	data: {
		simpleData: {
			enable:true,
			idKey: "id",
			pIdKey: "pid",
			rootPId: ""
		},
		key:{
			name : "DEPARTMENTNAME",
		}
	},
	callback: {
		onClick:zTreeOnClick,
	}
};

$(function(){
	basePath = $("#basePath").val();
	projectId = $("#projectId").val();
	var data = {key:"",type:'pbs'};
 	$("#key").searchbox({
 		height:30,
 		width:200,
        searcher: function(value) {
        	data = {key:value,type:'pbs'};
			$('#projectList').tree({queryParams:data});
        },
        prompt:"组织名称/项目名称/编码"
    });
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:data,
	    onClick:function(node){
	    	if(node.children == undefined){
	    		$("#copyId").val("");
	    		projectId = node.id;
	    		projectNum=node.pnum;
	    		projectView(node.id);
	    		$("#projectId").val(node.id);
	    	};
	    },
	    onLoadSuccess:function(row,data){
    		for (var i = 0; i < data.length; i++) {
				var children = data[i].children;
				for (var j = 0; j < children.length; j++) {
					if(projectId != "" && projectId == children[j].id){
						projectView(projectId);
						projectNum=children[j].pnum;
						$("#projectId").val(projectId);
						return;
					}
				}
			}
    		if(data.length > 0){
	    		var id = data[0].children[0].id;
	    		projectId = id;
	    		projectView(id);
	    	}
	    }
	});
	var baseData ;
	Utils.ajaxJson(basePath+"/project/getPrjBaseData",{},function(obj){
		baseData = obj;
		var prjType = baseData.prjType;
		for (var i = 0; i < prjType.length; i++) {
			projectTypes[prjType[i].ID] = prjType[i].NAME;
		}
		var proType = baseData.productType;
		for (var i = 0; i < proType.length; i++) {
			productTypes[proType[i].ID] = proType[i].NAME;
		}
	});
	Utils.ajaxJson(basePath+"/purReq/getBaseData",{names:"pbs_pbsVersionType"},function(obj){
		var data = obj.pbs_pbsVersionType;
		for (var i = 0; i < data.length; i++) {
			var name = data[i].TYPENAME;
			var sear=new RegExp('指标')
			if(sear.test(name)){
				$("#dataSpn").append("<a href='javascript:;' onclick=createIndexData('"+data[i].CODE+"')>"+data[i].TYPENAME+"</a>&nbsp;&nbsp;");
			}
		}
	});
	$("#ceshidata").click(
		function(){
			$("#dataSpn").toggle();
		}
	)
	$("#editInfo").click(function(){
		formChange = 0;
		$("#infoFrom")[0].reset();
		$("#scope").val("");
		$("#intro").val("");
		$("#bidUnits").val("");
		$("#bidInfo").val("");
		$("#infoDialog").dialog({
			title:"修改项目信息",
			modal: true,
			buttons: [
				{
					text:'关闭',
					iconCls:'icon-remove',
					handler:function(){
						$('#infoDialog').dialog("close");
					}
				},
				{
					text:'保存',
					iconCls:'icon-ok',
					handler:function(){
						if(!$("#infoFrom").form("validate") || formChange == 0){
							$('#infoDialog').dialog("close");
							return;
						}
						var arr = $("#productType").combobox("getValues");
						var pruductIds = "";
						for (var i = 0; i < arr.length; i++) {
							pruductIds += arr[i]+",";
						}
						pruductIds = pruductIds.substring(0,pruductIds.length - 1);
						var data = {
							projectId:projectId,
							id:$("#prjExtendInfoId").val(),
							typeId:$("#prjType").combobox("getValue"),
							productId:pruductIds,
							isInvitation:$("#isInvitation").combobox("getValue"),
							startDate:$("#startDate").datebox("getValue"),
							invitationWay:$("#invitationWay").val(),
							period:$("#period").val(),
							price:$("#price").val(),
							scope:$("#scope").val(),
							intro:$("#intro").val(),
							bidUnits:$("#bidUnits").val(),
							bidInfo:$("#bidInfo").val(),
						};
						Utils.ajaxJson(basePath+"/project/updatePrjExtendInfo",data,function(obj){
							formChange = 0;
							getPrjExtendInfo(projectId);
							$('#infoDialog').dialog("close");
							MyMessager.slide.show("提示", "保存成功");
						},function(){
							$.messager.alert("提示","操作失败");
						});
					}
				}],
				closed:false,
		});
		$("#prjType").combobox({
			required: true,
			height: '27',
			panelHeight: "200",
			valueField: "ID",
			textField: "NAME",
			data:baseData.prjType,
		});
		$("#productType").combobox({
			required: true,
			height: '27',
			panelHeight: "200",
			valueField: "ID",
			textField: "NAME",
			multiple: true,
			data:baseData.productType,	
		});
		$("#isInvitation").combobox({
			height: '27',
			panelHeight: "auto",
			valueField: "ID",
			textField: "NAME",
			data:[{ID:1,NAME:"是"},{ID:0,NAME:"否"}],
			value: 0,
			onLoadSuccess: function(){
				var value =$(this).combobox("getValue");
				if(value == 1){
					$("#invitationWay").validatebox({required:true});
					$("#price").validatebox({required:true});
					$("#bidUnits").validatebox({required:true});
					$("#bidInfo").validatebox({required:true});
				}else{
					$("#invitationWay").validatebox({required:false});
					$("#price").validatebox({required:false});
					$("#bidUnits").validatebox({required:false});
					$("#bidInfo").validatebox({required:false});
				}
			},
			onChange: function(newValue,oldValue){
				if(newValue == 1){
					$("#invitationWay").validatebox({required:true});
					$("#price").validatebox({required:true});
					$("#bidUnits").validatebox({required:true});
					$("#bidInfo").validatebox({required:true});
				}else{
					$("#invitationWay").validatebox({required:false});
					$("#price").validatebox({required:false});
					$("#bidUnits").validatebox({required:false});
					$("#bidInfo").validatebox({required:false});
				}
			}
		});
		$("#startDate").datebox({
			height: '26',
			prompt: "请选择日期",
		    editable: false
		});
		setPrjExtendInfo();
	});
 	var treeGridOptions = {
		width: '100%',
        height: '100%',
        idField:'ID',    
        treeField:'NAME',
        border:true,
        singleSelect: true,
        noheader:true,
        columns: [[
	        {
	        	field: "ck",
	        	checkbox:true
	        },
	        {
	        	title: '阶段名称',
	            field: 'NAME',
	            width: "25%",
	            halign: "center",
	            align: "left",
	            editor:'text'
	        },
	        {
	        	title: '状态',
	            field: 'STATUS',
	            width: "8%",
	            halign: "center",
	            align: "left",
	            formatter:function(value,row,index){
	            	var str = "";
	            	if(row.ISEDITABLE != undefined && (row.STATUS == null || row.STATUS == 0)){
	            		str = "草稿";
	            	}else if(row.ISEDITABLE == 0 && row.STATUS == 1){
	            		str = "审批中";
	            	}else if(row.ISEDITABLE == 0 && row.STATUS == 2){
	            		str = "已审批";
	            	}
	            	return str;
	            }
	        },
	        {
	        	title: '创建人',
	            field: 'CREATER',
	            width: "10%",
	            halign: "center",
	            align: "left",
	            formatter: function(value,row,index){
	            	if(row.ISEDITABLE == 0){
	            		return row.CREATNAME;
	            	}
	            }
	        },
	        {
	        	title: '创建时间',
	            field: 'CREATETIME',
	            width: "12%",
	            halign: "center",
	            align: "left",
	            formatter:function(value,row,index){
	            	var str = "";
	            	if(row.ISEDITABLE != undefined && value != null){
	            		var str = formatDatebox(new Date(value))
	            	}
	            	return str;
	            }
	        },
	        {
	        	title: '审批通过日期',
	            field: 'CHECKTIME',
	            width: "12%",
	            halign: "center",
	            align: "left",
	            formatter:function(value,row,index){
	            	var str = "";
	            	if(row.ISEDITABLE != undefined && value != null){
	            		var str = formatDatebox(new Date(value))
	            	}
	            	return str;
	            }
	        },
	        {
	        	title: '操作',
	            field: 'opt',
	            width: "32%",
	            halign: "center",
	            align: "left",
	            formatter:function(value,row,index){
	            	var str = "";
	            	var inReg = new RegExp("in"); //对内版
	            	var outReg = new RegExp("out"); //对外版
	            	if(row.ISEDITABLE == 1 && inReg.test(row.CODE)){
	            		str ="<a  class='easyui-linkbutton tableBtn edit_pbs' style='display:none;margin-right:10px;'  onclick=editPbs" +
	        				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
	    						"title='策划子项' ><span>策划子项</span></a>"+
		            	"<a  class='easyui-linkbutton tableBtn edit_list' style='display:none;margin-right:10px;' onclick=editPbs" +
		            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',2) " +
		            			"title='编制物料清单' ><span>编制物料清单</span></a>"+
		            	"<a  class='easyui-linkbutton tableBtn edit_mh' style='display:none;margin-right:10px;' onclick=editPbs" +
		            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',3) " +
		            			"title='策划人工时' ><span>策划人工时</span></a>"+
	        			"<a  class='easyui-linkbutton tableBtn  edit_exp' style='display:none;margin-right:10px;' onclick=editPbs" +
	            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
		            			"title='编制价格' ><span >编制价格</span></a>";
	            	}else if(row.ISEDITABLE == 1 && outReg.test(row.CODE)){
	            		str ="<a  class='easyui-linkbutton tableBtn  edit_exp' style='display:none;margin-right:10px;'  onclick=editPbs" +
	            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
	            				"title='编制价格' ><span >编制价格</span></a>";
	            	}else if(row.ISEDITABLE == 0 && (row.STATUS == null || row.STATUS == 0)){
	            		str = "<a  class='easyui-linkbutton tableBtn submit' style='display:none;margin-right:10px;' onclick=pbsVersionCheck" +
	        				"('"+row.ID+"','"+row.PRICEID+"','"+row.CODE+"',this) " +
	            				"title='提交审批' ><span >提交审批</span></a>"+
		            	"<a  class='easyui-linkbutton tableBtn view_version' style='display:none;' onclick=pbsVersionView" +
		            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
		            			"title='查看' ><span>查看</span></a>";
	            	}else if(row.ISEDITABLE == 0 && (row.STATUS == 1 || row.STATUS == 2) ){
	            		str = "<a  class='easyui-linkbutton tableBtn view_version' style='display:none;' " +
	            				"onclick=pbsVersionView('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
	            				"title='查看' ><span >查看</span></a>";
	            	}
	       	 		return str;
	            }
	        }
        ]],
        onLoadSuccess:function(data){
        	$(".btnText").css("position","relative");
        	$(".btnText").css("top","5px");
        	getLimit2();
        },
        onDblClickRow : function(row){
        	if(row.ISEDITABLE == 0 && edit_version != 0){
        		editIndex = row.ID;
        		$(this).treegrid('beginEdit',row.ID);
        	}
        },
        onEndEdit:function(row){
        	var rows = $(this).treegrid('getChanges');
        	if(rows.length > 0){
        		var table = this;
            	var id = row.ID;
            	var name = row.NAME;
            	$.post(basePath+"/pbsVersion/saveName","pbsVersionId="+id+"&name="+name,function(obj){
            		if(obj.rs == 0){
    					$(table).treegrid("load");
    					MyMessager.slide.show("提示", "保存成功，消息将在3秒后关闭。");
    				}else{
    					$.messager.alert('提示',"操作失败");
    				}
            	},"json")
	        }
        }
	};
	$('#firstGrid').treegrid($.extend(treeGridOptions,{toolbar: '#firstGrid_tb'}));
	$('#secondGrid').treegrid($.extend(treeGridOptions,{toolbar: '#secondGrid_tb'}));
	$('#thirdGrid').treegrid($.extend(treeGridOptions,{toolbar: '#thirdGrid_tb'}));
	$('#fourthGrid').treegrid($.extend(treeGridOptions,{toolbar: '#fourthGrid_tb'}));
	loadBtn();
	$("#checkDialog").dialog({
		title:"<h1>项目报价(内部版)提交审核<h1>",
		width: 600,    
	    height: 600,    
	    closed: true, 
	    closable: true,
	    cache: false,    
	    modal: true
	});
	handelLayout();
});

function createIndexData(typeCode){
	$.post(basePath+"/project/createData","projectId="+projectId+"&typeCode=",function(obj){
		if(obj.rs == 0){
			MyMessager.slide.show("提示", "操作成功！");
		}
	},"json");
}

//项目查看
function projectView(prjId){
	$("#projectId").val(prjId);
	projectId =prjId;
	//获取项目信息
	getPrjExtendInfo(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//清空所有选择
	$('#firstGrid').treegrid("unselectAll");
	$('#secondGrid').treegrid("unselectAll");
	$('#thirdGrid').treegrid("unselectAll");
	$('#fourthGrid').treegrid("unselectAll");
	var url = basePath+'/pbsVersion/getPbsInfo';
	$('#firstGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#firstGrid').attr("name")}}); //报价内部版
	$('#secondGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#secondGrid').attr("name")}}); //报价外部版
	$('#thirdGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#thirdGrid').attr("name")}}); //修订内部版
	$('#fourthGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#fourthGrid').attr("name")}}); //修订外部版
	getLimit(projectId,1);
}


//编辑pbs版本内容 跳转
function editPbs(pbsVersionId,rootNodeId,priceId,code,type){
	var rootBoo = true;
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: pbsVersionId},function(obj){
		if(obj.rs == 4){
			$.messager.alert('提示',"该版本还有未完成的复制任务，请稍后再试...");
		}else{
			Utils.ajaxJsonSync(basePath+"/pbsVersion/checkRootId",{rootNodeId:rootNodeId},function(obj){
				rootBoo = obj.rs;
			});
			var prjId = $("#projectId").val();
			var url = basePath+"";
			if(type == 1){ //策划子项
				url += "/pbsStructure/pbsViewOfDraft?pbsVsersionId="+pbsVersionId+"&projectId="+prjId+"&modelP=1";
			}else if(type != 1 && !rootBoo){
				$.messager.alert("提示","请先进行策划子项工作");
				return;
			}else if(type == 2){ //编制物料清单
				url += "/mmlist/materialListEditView?versionId="+pbsVersionId+"&rootNodeId="+rootNodeId+"&projectId="+prjId+"&modelP=1";
			}else if(type == 3){ //策划人工时
				url += "/manHour/manHourLayoutView?pbsVersionId="+pbsVersionId+"&projectId="+prjId+"&modelP=1";
			}else if(type == 4){ //编制价格表
				if(priceId == "null"){
					Utils.ajaxJsonSync(basePath+"/pbsVersion/createPrcieList",
							{pbsVersionId:pbsVersionId},
							function(obj){
						priceId = obj.priceId;
					});
				}
				url += "/priceList/priceEditView?pbsVersionId="+pbsVersionId+"" +
						"&rootNodeId="+rootNodeId+"&priceListId="+priceId+"&code="+code+"&projectId="+prjId+"&modelP=1";
			}
			window.location.href=url;
		}
	});
}

var isNeed=1;
var params2="";
//提交审核
function pbsVersionCheck(pbsVersionId,priceId,pbsCode,obj){	
	if(infoData.ID != undefined){
		var  falg= new RegExp('_out').test(pbsCode);
		$("#EquipmentBusiness").css("display","block");
		//由于对外报价版还没有确定审批流程。所以现在是直接审批通过，只有内部版才走审批流程
		if(falg){
			$("#EquipmentBusiness").css("display","none");
			var tableId = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
			$.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
				if(obj.rs == 0){
					MyMessager.slide.show("提示", "审批成功！");
					$("#"+tableId).treegrid("reload");
					$('#checkDialog').dialog("close");
				}else if(obj.rs == 1){
					$.messager.alert("提示","审批失败");
				};
			},"json");
			/*
			$("#checkDialog").dialog({
				title:$("#"+tableId).datagrid("options").title+"审批",
				closed:false,
			    buttons:[
			    	{
					text:'直接通过审批',
					size:'large',
					handler:function(){
						$.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
							if(obj.rs == 0){
								MyMessager.slide.show("提示", "审批成功！");
								$("#"+tableId).treegrid("reload");
								$('#checkDialog').dialog("close");
							}else if(obj.rs == 1){
								$.messager.alert("提示","审批失败");
							};
						},"json");
						
					}
				},
				{
					text:'关闭',
					size:'large',
					handler:function(){
						$('#checkDialog').dialog("close");
					}
				}],
				onClose: function(){
					isChecked = false;
				},
				onDestroy: function(){
					isChecked = false;
				}				
			});	*/	
			
		}else{ //对内报价版
			
			var tableId = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
			$("#checkDialog").dialog({
				title:$("#"+tableId).datagrid("options").title+"审批",
				closed:false,
			    buttons:[
				{
					text:'提交审批',
					size:'large',
					handler:function(){
						//获取表格所有数据
						var rows = $("#checkTable").datagrid("getRows");
						//关闭编辑
					    for (var i = 0; i < rows.length; i++) {
					        $("#checkTable").datagrid("endEdit",i);
					    }
					  //判断是否选择了审批人，并获取审批人
					    var allUser="";
						var users="";
						var radionum = document.getElementsByName("che");
						for(var i=0;i<radionum.length;i++){
							 if(radionum[i].checked){
							 isNeed = radionum[i].value
							 }
						}
					    for( var i=0;i<rows.length;i++){
						     var na=rows[i].personIds;
						     //if(rows[i].taskId=="usertask3"||rows[i].taskId=="usertask8"){
                             if(rows[i].taskId=="usertask5"){
						    	 if(isNeed==0){
						    		 continue;
						    	 }
						     }
						     if(na==""){
						    	 $.messager.alert("提示","请先选择审批人,再提交审核！");
						    	allUser="";
						    	return;
						     }				     
						     allUser+="&"+rows[i].taskId+"CandidateUsers="+na;
					    }

					    //参数组装
						var params = allUser+"&processId="+$('#projectQuotation').val()+"&isNeed="+isNeed
							+params2+"&subject="+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val())
							+"&projectName="+($.trim($(".projectName").html()))+"&pbsCode="+pbsCode;
						
						//发起请求，执行流程
						MyMessager.slide.show("提示", "数据处理中，请稍....");
						$.post(basePath+"/workflow/start1/"+$('#projectQuotation').val(),"params="+params,function(result){
							if("success"==result){
										$("#checkDialog").dialog('close');
										MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
										//重新加载数据
										$("#"+tableId).treegrid("reload");
							}else{
										$.messager.alert("提示","提交失败");
							}
						});
					}
				},{
					text:'关闭',
					size:'large',
					handler:function(){
						$('#checkDialog').dialog("close");
					}
				}],
				onClose: function(){
					isChecked = false;
				},
				onDestroy: function(){
					isChecked = false;
				}
				
			});			
			//加载表格
			loadApprovedTable(pbsVersionId,priceId);
		}
	}else{
		$.messager.alert("提示","请先完善项目信息！");
	}
}
function loadApprovedTable(pbsVersionId,priceId){
	
	Utils.ajaxJsonSync(basePath+"/baseInfo/queryPersonInfo",{},function(obj){
		personList = obj.person;
		for(var i in personList){
			personArr[personList[i].USERID] = personList[i].PERSONNAME;
		}	
	});
	var dataList;
	var msg ;
	//读取流程信息，返回结果显示到节点列表
	$.ajax({
		url:basePath+'/project/initQuotation',
		data:{processId:$("#projectQuotation").val(),
			priceId:priceId,projectId:$("#projectId").val(),
			pbsVersionId:pbsVersionId},
		type:'POST',
		beforeSend: function() {
            MyMessager.prog.show("提示","请等待","数据加载中...");
        },
        complete: function() {
            MyMessager.prog.close();
        },
		success:function(daata){	
			dataList=daata.dataList;
			 params2=daata.params2;
			 processName = daata.processName;
			initCheckTable(dataList);			 	
		},
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			MyMessager.alert.show("提示", "流程加载失败");
		}
	});
}

//var idArr = ids.split(",");
//var index = Utils.containsByArr2(idArr,id);
//var newIds = "";
//var newName = "";
//if(index != null){
//	for(var i = 0; i < idArr;i++){
//		if(i != index){
//			newIds+= idArr[i]+",";
//		}
//	}
//	newIds = newIds.substring(0,newIds.length-1);
//	for(var i = 0; i < idArr;i++){
//		newName += "<a onclick=delPersion('"+idArr[i]+"','"+newIds+"',"+index+") " +
//		"href='javascript:;'>"+personArr[index[i]]+"</a>,";
//	}
//	newName = newIds.substring(0,newName.length-1);
//	$('#checkTable').datagrid('updateRow',{
//		index: index,
//		row: {
//			personIds: newIds,
//			personNames: newName
//		}
//	});
//	$('#checkTable').datagrid("acceptChanges");
//}

//删除审批人
function delPersion(id,ids,index){
	var idIndex = ids.indexOf(id);
	if(idIndex == 0 && id != ids){
		ids =  ids.substring(id.length);
	}else if((id.length+idIndex) == ids.length){
		ids = ids.substring(0,idIndex-1);
	}else {
		ids = ids.substring(0,idIndex) + ids.substring(idIndex + id.length+1);
	}
	var levelIds=ids.split(",");
	var level="";
	for(var i in levelIds){
	 if(personArr[levelIds[i]]!=null&&personArr[levelIds[i]]!=undefined){
		level+="<a onclick=delPersion('"+levelIds[i]+"','"+ids+"',"+index+") " +
						"href='javascript:;'>"+personArr[levelIds[i]]+"</a>,";
	  }
	}	
	level = level.substring(0,level.length - 1);
	$('#checkTable').datagrid('updateRow',{
		index: index,
		row: {
			personIds: ids,
			personNames: level
		}
	});
	$('#checkTable').datagrid('acceptChanges');
}

//加载审核界面列表
function initCheckTable(dataList){
	var options = {	
		width:580,
		height:330,
		checkOnSelect: false,
		selectOnCheck: false,
		rownumbers: true,
	    columns:[[    
	        {field:'taskId',title:'节点ID',hidden:'true'}, 
	        {field:'personIds',title:'人员Id',hidden:'true',editor:{type:'text'}},
	        {field:'taskName',title:'部门',width:180,align:'left',halign:'center' },    
	        {field:'personNames',title:'审批人',width:280,align:'left',halign:'center',
	        	editor:{type:'text',options:{required:true}},
				formatter:function(value,row,index){
					value+="";
					var personids = row.personIds;
					var levelIds=personids.split(",");
					var level="";
					for(var i in levelIds){
					 if(personArr[levelIds[i]]!=null&&personArr[levelIds[i]]!=undefined){
						level+="<a onclick=delPersion('"+levelIds[i]+"','"+row.personIds+"',"+index+") " +
										"href='javascript:;'>"+personArr[levelIds[i]]+"</a>,";
					  }
					}	
					level = level.substring(0,level.length - 1);
					return level;
				}}
	    ]],onClickRow:function(index, row){
	    		 $(this).datagrid('endEdit', bdEditingIndex);
	    		 bdEditingIndex=undefined;
	      },onDblClickRow:function(index, row){
    		  if($(this).datagrid('getEditors',bdEditingIndex).length < 1){
    			  $(this).datagrid('beginEdit', index);
    			  bdEditingIndex = index;
    			  //打开选择审批人层
    			  selectCheckPerson(index);
    		  }
	      },onBeginEdit:function(index){
    		//采购Combox初始化
    		bdEditingIndex=index;
    	},onAfterEdit:function(rowIndex, rowData, changes){    		
    		bdEditingIndex=undefined;
    	},onDblClickCell: function(index,field,value){
    		$(this).datagrid('beginEdit', index);
    		bdEditingIndex = index;
    		//打开选择审批人层
			selectCheckPerson(index);
    	},
    	onLoadSuccess: function(){
    		isChecked = true;
    		moveDialog("checkDialog");
    	}
	};
	$("#checkTable").datagrid($.extend(options,{loadMsg : '数据加载中,请稍候...',singleSelect: true}));
	$('#checkTable').datagrid('loadData',dataList);
	
}
//审核人员信息
function selectCheckPerson(index){	
	$('#person-dialog').dialog({
	    title: '人员搜索',
	    width: '60%',
		content:"<div id='personInfo-dlg' style='width:100%;height:450px;'>                                "+
		"	<div class='dept-category' style='width: 30%;float: left;border-right:1px solid #ddd;padding-right: 10px;'>  "+
		"		<input id='dept-key' style='width:180px' class='easyui-searchbox '                          " +
		"        data-options='prompt:\"部门名称\",searcher:searchDept'></input>                               "+
		"		<div class='tree' style='height:430px;'>                                                    "+
		"			 <ul id='deptTree' class='ztree' style='width:100%;height:420px;overflow:auto'></ul>    "+
		"		</div>                                                                                      "+
		"	</div>                                                                                          "+
		"	<div class='person-list-info' style='width: 68%;float: right;overflow:auto;'>                     "+
		"		<input  id='person-key' style='width:200px' class='easyui-searchbox '						" +
		"       data-options='prompt:\"人员姓名\",searcher:searchPerson'></input>                              "+
		"		<div style='height:430px;'>                                                                 "+
		"			<table id='personList' class='easyui-datagrid'  style='height:100%;'></table>           "+
		"		</div>                                                                                      "+
		"	</div>                                                                                          ",    
	    closed: false,
	    cache: false,
	    modal: true,
	    onDestroy: function(){
	    	$("#checkTable").datagrid('endEdit', bdEditingIndex);
	    },
	    onClose: function(){
	    	$("#checkTable").datagrid('endEdit', bdEditingIndex);
	    },
		buttons: [	
					{
						text:'添加',
						iconCls:'icon-ok',
						handler:function(){
							addPerson(index);
						}
					},{
						text:'关闭',
						iconCls:'icon-remove',
						handler:function(){
							$('#person-dialog').dialog("close");
							isChecked = false;
							$("#checkTable").datagrid('endEdit', bdEditingIndex);
						}
					}
					]
		});
	searchDept();
	loadPersonDatas();
}

function loadPersonDatas(){	
	var options = {
        fit: true,
        fitColumns: true,
        singleSelect: false,
        border: true,
        idField: 'USERID',
        treeField: 'PERSONNAME',
        checkOnSelect: true,           
        selectOnCheck: true,
        onDestroy: function(){
        	$("#checkTable").datagrid('endEdit', bdEditingIndex);
	    },
        columns: [[
			{field: "ck",checkbox: true },    
			{field:'USERID',title:'ID',hidden:'true'},
			{field:'PERSONNAME',title:'人员姓名',width : 160,align : "center"}, 
			{field:'GENDER',title:'性别',width : 110,align : "center",
			  formatter:function(value,row,index){
				  if(value == "M"){
					  return "男";
				  }else if(value=="G"){
					  return "女";
				  }
				  return "";
			 }
			},
			{field:'DEPARTMENTNAME',title:'所属组织',width : 180,align : "center"}
      	]]
	};
	$("#personList").datagrid($.extend(options,{loadMsg : '数据加载中,请稍候...',singleSelect: false}));
}

function queryParams(){
	var condition = {
			personName:$("#person-key").val(),
			groupId:function(){
				var categoryId="";
				var treeObj = $.fn.zTree.getZTreeObj("deptTree");
				if(treeObj!=null){
					var nodes = treeObj.getSelectedNodes();
					if(nodes.length>0){
						categoryId=nodes[0].DEPARTMENTID;
					}
				}
				return categoryId;
			}
	};
	return condition;
}
function zTreeOnClick(event,treeId,treeNode){
    var treeObj = $.fn.zTree.getZTreeObj("deptTree");
	if(treeNode.DEPARTMENTID==selectNode.DEPARTMENTID){
		treeObj.cancelSelectedNode(treeNode);
	}else{
		selectNode=treeNode;
	}
	searchPerson();
}
function searchPerson(){
	$("#personList").datagrid("options").url = basePath+"/baseInfo/getPersonInfoList";
	$("#personList").datagrid("load", queryParams());
}
function searchDept(){
	var treeData = $("#deptTree");
	treeData = $.fn.zTree.init(treeData,categoryTreeSetting, null);
}

function addPerson(index){
	if(bdEditingIndex==undefined)
		bdEditingIndex = index;
	var rows = $("#personList").datagrid("getSelections");
	if(rows){
		var personId = "";
		var personName = "";
		//人员Id
		var person_id= $("#checkTable").datagrid("getEditor", {index: bdEditingIndex, field: "personIds"});
		var oldPersonId = $.trim($(person_id.target).val());
		for (var i = 0; i < rows.length; i++) {
			//判断是否选择了该人员
			if(oldPersonId.indexOf(rows[i].USERID)<0){				
				if(i<rows.length-1){
					personId +=rows[i].USERID+",";
					personName +=rows[i].PERSONNAME+",";
				}else{
					personId +=rows[i].USERID;
					personName +=rows[i].PERSONNAME;
				}
			}
		}
		if(oldPersonId!="" && oldPersonId !=undefined)
			oldPersonId = oldPersonId+",";
		$(person_id.target).val((oldPersonId+personId).replace(/,$/,""));
		//人员姓名
		var person_name= $("#checkTable").datagrid("getEditor", {index: bdEditingIndex, field: "personNames"});
		var oldPersonName = $.trim($(person_name.target).val());
		if(oldPersonName!="" && oldPersonName !=undefined)
			oldPersonName = oldPersonName+",";
		$(person_name.target).val((oldPersonName+personName).replace(/,$/,""));
		$("#checkTable").datagrid('endEdit', bdEditingIndex);
		$('#person-dialog').dialog("close");
	}else{
		$.messager.alert("提示","请选择审批人！");
	}
}

function buildData(obj){
	var type = 0;
	if(obj == 1){
		$.messager.prompt('提示信息', '请输入密码', function(r){
			if (r=='huise'){
				$.messager.confirm('确认','是否需要清空历史数据【清除数据：确定,不清除数据：取消】<br/>放弃本次操作请点击[X]',function(r){    
				    if (r){    
				    	type = 1;  
				    }
				    $.post(basePath+"/importData/createData","type="+type,function(obj){
				    	if(obj.rs == 1){
				    		buildData(2);
						}
					},"json");
				});  
			}else{
				$.messager.alert('警告','请勿随意操作');
			}
		});


		
	}else{
	    $.post(basePath+"/importData/createData","type="+type,function(obj){
	    	if(obj.rs == 1){
	    		alert('yes');
			}
		},"json");
	}
	
		
}
function leadData(type){
	$.post(basePath+"/importData/leadData","type="+type,function(obj){
		
	},"json")
}
