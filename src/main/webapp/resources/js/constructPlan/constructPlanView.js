var selectProject,projectName,projectNum;
var processName;
var bdEditingIndex;
var bdsEditingIndex;
var bdcopEditingIndex;
var bdqEditingIndex;
var bdLiEditingIndex;
var basePath=$(".basePath").attr('basePath');
var constructList;
var constructListMap = new Array();
var costList;
var costListMap = new Array();
var purList;
var projectConstructVId;
var purListMap = new Array();
var operList=new Array();
var operListMap = new Array();
var isEdit = false;
//提供服务范围
var serviceList;
var serviceListMap = new Array();
var treeData;
var pbsNodeMajorTreeSetting =new Object();
var editIndex;
var projectId;
var project_class;
$(function(){
	projectId = $("#projectId").val();
	$('.easyui-linkbutton').linkbutton("disable");
	getProjectSummary(projectId);
	queryBaseDataTypes();
	//加载工程项目树
	queryProjectList();
	queryBdListInfo();
	queryTabInfo();
  	querySupplier();
  	querySubcontractScope();
  	queryQualifications();
  	queryLicense();
});
//检索基础类型
function queryBaseDataTypes(){
	$.ajax({
		url:basePath+'/purPlan/queryBaseDataTypes',
		type:'POST',
		success:function(data){
			//供应商提供服务范围
			if(data!=null&&data.serviceType!=null){
				serviceList=data.serviceType;
				for(var i in serviceList){
					serviceListMap[serviceList[i].ID]=serviceList[i].NAME;
				}
			}		
		}
	});
	$.ajax({
		url:basePath+'/constructPlan/queryBaseDataTypes',
		type:'POST',
		success:function(data){
			//分包类型
			if(data!=null&&data.constructType!=null){
				constructList=data.constructType;
				for(var i in constructList){
					constructListMap[constructList[i].ID]=constructList[i].NAME;
				}
			}
			//计价方式
			if(data!=null&&data.costType!=null){
				costList=data.costType;
				for(var i in costList){
					costListMap[costList[i].ID]=costList[i].NAME;
				}
			}
			//采购方式
			if(data!=null&&data.purType!=null){
				purList=data.purType;
				for(var i in purList){
					purListMap[purList[i].ID]=purList[i].NAME;
				}
			}
			//逻辑运算符
			for(var i=0;i<2;i++){
				var obj=new Object();
				if(i==0){
					operListMap['and']='and';
					obj.key='and';
					obj.text='and';
				}else{
					operListMap['or']='or';
					obj.key='or';
					obj.text='or';
				}
				operList.push(obj);
			}
		}
	});
}
//检索项目列表
function queryProjectList(){
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:{key:$('.project-key').searchbox('getValue')},
		onClick:function(node){
			$('#bd-list-info').datagrid('clearSelections');
			//提示需要完善数据
			if($('.bdst .validatebox-invalid').length>0){
				var node = $('#projectList').tree('find', selectProject);
				$('#projectList').tree('select', node.target);
				MyMessager.alert.show('提示',"请先完善数据！");
				return ;
			}else{
				//主动保存数据
				$('#bd-list-info').datagrid("endEdit",bdEditingIndex);
				if(node.children=='undefined'||node.children==undefined){
					projectId = node.id;
					$("#projectId").val(node.id);
					selectProject=node.id;
					projectName = node.text;
					projectNum = node.pnum;
					projectView(projectId);
					disableOrEnableBDHeaderButton("enable");
					//检索项目最新版本
					queryProjectLastedVersionId(selectProject);
				}else{
					selectProject=undefined;
					projectName = undefined;
					projectNum = undefined;
					projectConstructVId="";
					$('.status-info').text('无');
					$('.status-info').attr('bd_status',-100);
					$('.easyui-linkbutton').linkbutton("disable");
					$('#bd-list-info').datagrid('loadData',{total:0,rows:[]})
				}
			}
		},
	    onLoadSuccess:function(row,data){
    		for (var i = 0; i < data.length; i++) {
				var children = data[i].children;
				for (var j = 0; j < children.length; j++) {
					if(projectId != "" && projectId == children[j].id){
						selectProject=projectId;
						projectView(projectId);
						return;
					}
				}
			}
    		if(data.length > 0){
	    		var id = data[0].children[0].id;
	    		projectId = id;
	    		selectProject=id;
	    		projectView(id);
	    	}
	    }
	});
}

function projectView(projectId){
	$("#projectId").val(projectId);
	isCanEdit(projectId,"本部施工经理");
	//加载项目信息
	getProjectSummary(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//设置操作按钮是否可用
	disableOrEnableBDHeaderButton("enable");
	//检索项目最新版本
	queryProjectLastedVersionId(projectId);
}

//根据角色设置页面是否可编辑
function isCanEdit(prjId,roleName) {
    $.ajax({
        url:basePath+'/purPlan/isEdit',
        data:{projectId:prjId,roleName:roleName},
        type:'GET',
        success:function(data){
            isEdit = data.isEdit;
            if (!isEdit){
                $('.showBtn').hide();
            }else {
                $('.showBtn').show();
            }
        }
    });
}
//查询项目分包最新版本
function queryProjectLastedVersionId(projectId){
	$.ajax({
		url:basePath+'/constructPlan/getProjectConstructLastedVersionInfo',
		data:{projectId:projectId,type:"C"},
		type:'POST',
		success:function(data){
			changeBDStatusInfo(data.status,data.id,1)
			//检索标段数据
			$('#bd-list-info').datagrid('reload');
		}
	});
}
//计划状态修改
function changeBDStatusInfo(status,versionId,isNewFlag){
	projectConstructVId=versionId;
    if(status==0){
		$('.status-info').text('草稿');
		$('.status-info').attr('bd_status',0);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==1){
		$('.status-info').text('审批中');
		$('.status-info').attr('bd_status',1);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==2){
		$('.status-info').text('已审批');
		$('.status-info').attr('bd_status',2);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==3){
        $('.status-info').text('已驳回');
        $('.status-info').attr('bd_status',3);
        $('.status-info').attr('isNewFlag',isNewFlag);
    }else if(status==-1){
		$('.status-info').text('已取消');
		$('.status-info').attr('bd_status',-1);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else{
		$('.status-info').text('草稿');
		$('.status-info').attr('bd_status',0);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}	
}
//检索标段信息
function queryBdListInfo(){
	$('#bd-list-info').datagrid({
		url:basePath+'/constructPlan/queryConstructPlan',
		toolbar: "#bd-list-info_tb",
		width:'100%',
		height: '100%',
		idField: 'ID',
		singleSelect:true,
		queryParams: {
			versionId:function(){
				return projectConstructVId;
			},
			type:function(){
				return 0;
			},
			projectId:function(){
				return selectProject;
			},
			key:function(){
				return $('#search-construct-plan').searchbox('getValue');
			},
		},
		frozenColumns:[[
			{field:'HANDLE',title:'操作',halign:'center',width:'3%',formatter:function(value,row,index){
				//非草稿
				if($('.status-info').attr('bd_status')!=0&&$('.status-info').attr('bd_status')!=3){
					return '<i class="icon-lock" id="'+index+'"></i>';
				}else{
					return '<i class="icon-edit bd-handle-icon" id="'+index+'" onclick="saveBDdata(this);"></i>';
				}
			}},
			{field:'CODE',title:'标段号',halign:'center',width:'10%'},
			{field:'NAME',title:'标段名称',halign:'center',width:'10%',editor:{type:'validatebox',options:{validType:'text',required:true}}},
			{field:'STATUS',title:'状态',halign:'center',width:'5%',hidden:true,formatter: function(value,row,index){
				if(value==0){
					return '草稿';
				}else if(value==1){
					return '审批中';
				}else if(value==2){
					return '已审批';
				}else if(value==3){
                    return '已驳回';
                }else if(value==-1){
					return '已取消';
				}else{
					return '草稿';
				}
				
			}}
		]],
	    columns:[[			
			{field:'CONSTRUCTTYPEID',title:'类型',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME"}},formatter:function(value,row,index){
				if(constructListMap[value]==null||constructListMap[value]==undefined){
					return '';
				}
				return constructListMap[value];
			}},
			{field:'ESTPRICE',title:'价格估算（万元）',halign:'center',width:'6%'},
			{field:'COSTTYPEID',title:'计价方式',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME",multiple:true}},formatter:function(value,row,index){
				value+="";
				var costTypeIds=value.split(",");
				var costType='';
				for(var i in costTypeIds){
				 if(costListMap[costTypeIds[i]]!=null&&costListMap[costTypeIds[i]]!=undefined){
					if(i==0){
						costType+=costListMap[costTypeIds[i]]
					}else{
						costType+=","+costListMap[costTypeIds[i]]
					}
				  }
				}		
				return costType;
			}},
			{field:'PURTYPEID',title:'采购方式',halign:'center',width:'8%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME"}},formatter:function(value,row,index){
				if(purListMap[value]==null||purListMap[value]==undefined){
					return '';
				}
				return purListMap[value];
			}},
			{field:'REMARK',title:'备注',halign:'center',width:'15%',editor:'text'},
			{field:'RECEIVEREQFILETIME',title:'计划招标工作启动时间',width:'12%',editor:{type:'datebox'},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'CONTRACTTIME',title:'计划招标文件发售时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_c","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'EQUIPREQCONFIRMTIME',title:'计划开标时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_e","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'DELIVERYTIME',title:'计划评标、定标时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_d","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'CONTRACTTIME2',title:'计划合同签订时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_co","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'ARRIVALTIME',title:'计划进场时间',halign:'center',width:'12%',editor:'text',editor:{type:'datebox',options:{required:true,validType:["endTime_a","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'INSTALLTIME',title:'计划开工时间',halign:'center',width:'12%',editor:'text',editor:{type:'datebox',options:{required:true,validType:["endTime_i","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'PROGRESSREMARK',title:'进度备注',halign:'center',width:'12%',editor:'text'}
			]],
		onBeforeEdit:function(index,row){
			$.extend($.fn.datebox.defaults.rules, {
                endTime_c :{
                    validator : function(value){
                        var startDate = row.RECEIVEREQFILETIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        return d2>d1;

                    },
                    message : '计划招标文件发售时间必须大于计划招标工作启动时间'
                },
                endTime_e :{
                    validator : function(value){
                        var startDate = row.CONTRACTTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        var rs=d2>d1;
                        return rs;

                    },
                    message : '计划开标时间必须大于计划招标文件发售时间'
                },
                endTime_d :{
                    validator : function(value){
                        var startDate = row.EQUIPREQCONFIRMTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        return d2 > d1;

                    },
                    message : '计划评标、定标时间必须大于计划开标时间'
                },
                endTime_co :{
                    validator : function(value){
                        var startDate = row.DELIVERYTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        var rs=d2>d1;
                        return rs;

                    },
                    message : '计划合同签订时间必须大于计划评标、定标时间'
                },
                endTime_a :{
                    validator : function(value){
                        var startDate = row.CONTRACTTIME2;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        var rs=d2>d1;
                        return rs;

                    },
                    message : '计划进场时间必须大于计划合同签订时间'
                },
                endTime_i :{
                    validator : function(value){
                        var startDate = row.ARRIVALTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
                        var d2 = $.fn.datebox.defaults.parser(value);
                        var rs=d2>d1;
                        return rs;

                    },
                    message : '计划开工时间必须大于计划进场时间'
                }
    			
			});
			 if($('.status-info').attr('isNewFlag')!=1){
				MyMessager.alert.show('提示','历史版本不能修改！');
				return false;
			 }else{
				 editIndex = index;
			 }
		},
		onBeginEdit:function(index){
			$('.bd-handle-icon[id="'+index+'"]').removeClass('icon-edit').addClass('icon-save');
			//标段Combox初始化
			bdEditingIndex=index;
			var constructType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "CONSTRUCTTYPEID"});
			var costType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "COSTTYPEID"});
			var purType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "PURTYPEID"});
			$(constructType.target).combobox("loadData",constructList);
			$(costType.target).combobox("loadData",costList);
			$(purType.target).combobox("loadData",purList);
			queryTabInfo();
		},
		onAfterEdit:function(rowIndex, rowData, changes){
			updatePurPlanCost();
			submmitBDdataToDB();
			editIndex = undefined;
		},
		onSelect:function(){
			queryTabInfo();
		},
		onLoadSuccess:function(data){
			//默认选中第一条
			if(data!=null&&data.total>0){
				$('#bd-list-info').datagrid('selectRow',0);
			}else{
				$('.s_easyui-linkbutton').linkbutton('disable');
				$('.sc_easyui-linkbutton').linkbutton('disable');
				$('.q_easyui-linkbutton').linkbutton('disable');
				$('.l_easyui-linkbutton').linkbutton('disable');
				$('#bd-supplier-list').datagrid('loadData',{total:0,rows:[]});
				$('#bd-subcontract-scope-list').datagrid('loadData',{total:0,rows:[]});
				$('#bd-qualifications-list').datagrid('loadData',{total:0,rows:[]});
				$('#bd-license-list').datagrid('loadData',{total:0,rows:[]});
			}
		}
	});
}
//更新采购计划控制价 
function updatePurPlanCost(){
	// 获取所包含设备的pbsCode
	$('#bd-list-info').datagrid("selectRow",editIndex);
	var row = $('#bd-list-info').datagrid("getSelected");
	var purPlanId = row.ID;
	Utils.ajaxJsonSync(basePath+"/purPlan/statistCostControl",
			{projectId:selectProject,codeType:"scope_change",planId:purPlanId,type:2},
			function(data){
		var rowId = $('#bd-list-info').datagrid("getSelected").ID;
		var rowIndex = $("#bd-list-info").datagrid("getRowIndex",rowId);
		var tr = $("#datagrid-row-r1-2-"+editIndex);
		var td = tr.find("td[field='ESTPRICE']");
		td.find("div").text(data.totleCost.toFixed(2));
		row.ESTPRICE = data.totleCost.toFixed(2);
	});
	
}
//标段数据保存
function saveBDdata(obj){
    if (!isEdit){
        return false;
    }
	if(($('.status-info').attr('bd_status')==2||$('.status-info').attr('bd_status')==0 || $('.status-info').attr('bd_status')==3)
		&&$('.status-info').attr('isNewFlag')==1){
		//已审批，修改包状态
		if($('.status-info').attr('bd_status')==2){
			$.messager.confirm('提示','是否确认修改？',function(r){
				if (r){
						updatePlanVersionStatus();
						if($(obj).hasClass('icon-save')){
							if($('.bdst .validatebox-invalid').length>0){
								MyMessager.alert.show('提示',"请按格式输入数据后保存！");
							}else{
								//检测是否为公开招标
								checkIsOpenPurtype();
							}	
						}else{
							if($('.bdst .icon-save').length>0){
								MyMessager.alert.show('提示',"请先保存编辑中数据！");
							}else{
								var index=$(obj).attr('id');
								$('#bd-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
								$('#bd-list-info').datagrid("beginEdit",index);
							}	
						}
					}
				}
			);
		}else{
				if($(obj).hasClass('icon-save')){
					if($('.bdst .validatebox-invalid').length>0){
						MyMessager.alert.show('提示',"请按格式输入数据后保存！");
					}else{
						//检测是否为公开招标
						checkIsOpenPurtype();
					}	
				}else{
					if($('.bdst .icon-save').length>0){
						MyMessager.alert.show('提示',"请先保存编辑中数据！");
					}else{
						var index=$(obj).attr('id')
						$('#bd-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
						$('#bd-list-info').datagrid("beginEdit",index);
						$('#bd-list-info').datagrid('selectRow',index);//选中编辑行
					}	
				}
		}
	}else{
		MyMessager.alert.show('提示',"非最新版草稿或者已审批标段不能进行修改！");
	}
}
//检测是否为公开招标
function checkIsOpenPurtype(){
	var row=$('#bd-list-info').datagrid("getSelected");
	var purType= $('#bd-list-info').datagrid("getEditor", {id: bdEditingIndex, field: "PURTYPEID"});	
	var selectPur=$(purType.target).combobox("getValue");
	if(purListMap[selectPur]=="公开招标"){
		$.messager.confirm('提示','公开招标将清除该标段下拟推荐供应商列表？',function(r){
			if(r){
				$.ajax({
						url:basePath+'/constructPlan/delConstructPlanSuppliers',
						data:{constructPlanId:row.ID},
						type:'POST',
						success:function(data){
						if(data.status){
							$('#bd-list-info').datagrid("endEdit",bdEditingIndex);	
						}else{
							$('#bd-list-info').datagrid("beginEdit",index);
						}
					}
				});	
			}
		});
	}else{
		$('#bd-list-info').datagrid("endEdit",bdEditingIndex);	
	}
}
//标段添加
function addBDInfo(){
	if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
		&&$('.status-info').attr('isNewFlag')==1){
		if($('.bdst .validatebox-invalid').length>0){
			MyMessager.alert.show('提示',"请按格式输入数据后保存！");
		}else if($('.bdst .icon-save').length>0){
			MyMessager.alert.show('提示',"请先保存编辑中数据！");
		}else{
			//保存
			$('#bd-list-info').datagrid("endEdit",bdEditingIndex);
			//向数据库新增一条记录，最终是要获取到采购包ID值，这样可以在编辑状态下同时新增供应商和包含设备信息做批量保存。
			var obj = new Object();
			var date = new Date();
			obj["pbsConstructPlanVOList[0].name"]=date.getUTCFullYear()+"_"+date.getHours()+"_"+date.getMilliseconds();//包名称年份_小时_毫秒
			obj["pbsConstructPlanVOList[0].planVersionId"]=projectConstructVId;
			obj["pbsConstructPlanVOList[0].isInContract"]=true;
			if(selectProject!=undefined){
				obj.projectId=selectProject;
				$.ajax({
					url:basePath+'/constructPlan/addOrUpdatePbsConstructPlan',
					type:'POST',
					data:obj,
					success:function(data){
						if(data.status){
							//添加新行
							$('#bd-list-info').datagrid('appendRow',{ID:data.newIds[0],STATUS:0});
							var rows=$('#bd-list-info').datagrid('getRows');
							var index=$('#bd-list-info').datagrid('getRowIndex',rows[rows.length-1]);
							$('#bd-list-info').datagrid('beginEdit',index);
							$('#bd-list-info').datagrid('selectRow',index);//选中当前新增行
						}
					}
				});	
			}
		}    
	}else{
	MyMessager.alert.show('提示',"非草稿版数据，不能添加标段数据！");
	}
}
//标段数据提交数据库
function submmitBDdataToDB(){
	var obj = new Object();
	obj.exist=false;
	var map = {};
	var changeRows=$('#bd-list-info').datagrid("getChanges");
	for(i in changeRows){
		obj.exist=true;
		obj["pbsConstructPlanVOList[" +i+"].id"] = changeRows[i].ID;
		obj["pbsConstructPlanVOList["+i+"].code"]=changeRows[i].CODE;
		obj["pbsConstructPlanVOList["+i+"].name"]=changeRows[i].NAME;
		obj["pbsConstructPlanVOList["+i+"].constructTypeId"]=changeRows[i].CONSTRUCTTYPEID;
		obj["pbsConstructPlanVOList["+i+"].estPrice"]=changeRows[i].ESTPRICE;
		obj["pbsConstructPlanVOList["+i+"].costTypeId"]=changeRows[i].COSTTYPEID;
		obj["pbsConstructPlanVOList["+i+"].purTypeId"]=changeRows[i].PURTYPEID;
		obj["pbsConstructPlanVOList["+i+"].remark"]=changeRows[i].REMARK;
		obj["pbsConstructPlanVOList["+i+"].receiveReqFileTime"]=changeRows[i].RECEIVEREQFILETIME;
		
		obj["pbsConstructPlanVOList["+i+"].contractTime"]=changeRows[i].CONTRACTTIME;
		obj["pbsConstructPlanVOList["+i+"].equipReqConfirmTime"]=changeRows[i].EQUIPREQCONFIRMTIME;
		obj["pbsConstructPlanVOList["+i+"].deliveryTime"]=changeRows[i].DELIVERYTIME;
		
		obj["pbsConstructPlanVOList["+i+"].contractTime2"]=changeRows[i].CONTRACTTIME2;
		obj["pbsConstructPlanVOList["+i+"].arrivalTime"]=changeRows[i].ARRIVALTIME;
		obj["pbsConstructPlanVOList["+i+"].installTime"]=changeRows[i].INSTALLTIME;
		obj["pbsConstructPlanVOList["+i+"].progressRemark"]=changeRows[i].PROGRESSREMARK;
		if(changeRows[i].ID==null||""==changeRows[i].ID){
			obj["pbsConstructPlanVOList["+i+"].planVersionId"]=projectConstructVId;
		}else{
			obj["pbsConstructPlanVOList["+i+"].planVersionId"]=changeRows[i].PLANVERSIONID;
		}
		obj["pbsConstructPlanVOList["+i+"].isInContract"]=true;
	}
	if(selectProject!=undefined){
		obj.projectId=selectProject;
		if(obj.exist){
			$.ajax({
				url:basePath+'/constructPlan/addOrUpdatePbsConstructPlan',
				type:'POST',
				data:obj,
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-list-info').datagrid('selectRow',bdEditingIndex);
						bdEditingIndex=undefined;
						$('#bd-list-info').datagrid('acceptChanges')
						querySupplier();
						MyMessager.slide.show("提示", data.info); 
					}else{
						$('#bd-list-info').datagrid('acceptChanges')
						$('#bd-list-info').datagrid('beginEdit',bdEditingIndex);
						MyMessager.alert.show('提示',data.info);
					}
					
				}
			});
		}
	}
}
//删除标段数据
function delBDInfo(){
	if($('.status-info').attr('isNewFlag')!=1||($('.status-info').attr('bd_status')!=0 && $('.status-info').attr('bd_status')!=3)){
		 MyMessager.alert.show('提示',"非草稿数据不能删除!");
	}else{
		var selectRows=$('#bd-list-info').datagrid('getSelections');
		if(selectRows==null||selectRows.length==0){
			MyMessager.alert.show('提示',"请选择需要删除标段！");
		}else{
			$.messager.confirm('提示','你确定要删除该标段信息？',function(r){
				if (r){
					var ids="";
					for(var i in selectRows){
						if(selectRows[i].ID!=null&&selectRows[i].ID!=undefined){
							ids+=selectRows[i].ID+",";
						}
					}
					if(ids!=""){
						$.ajax({
							url:basePath+'/constructPlan/delConstructPlan',
							data:{ids:ids},
							type:'POST',
							beforeSend:function() {
								MyMessager.prog.show("提示","请等待","数据处理中...");
							},
							complete:function() {
								MyMessager.prog.close();
							},
							error:function(jqXHR, textStatus, errorThrown) {
								MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
							},
							success:function(data){
								if(data.status){
									for(var i=selectRows.length-1;i>=0;i--){
										var index=$('#bd-list-info').datagrid('getRowIndex',selectRows[i]);
										$('#bd-list-info').datagrid('deleteRow',index);
									}
									$('#bd-list-info').datagrid('selectRow',0);
									MyMessager.slide.show("提示", data.info); 
								}else{
									MyMessager.alert.show('提示',data.info);
								}
								$('#bd-list-info').datagrid('reload');
								$('#bd-list-info').datagrid('rejectChanges');
								queryTabInfo();
							}
						});
					}else{
						var index=$('#bd-list-info').datagrid('getRowIndex',selectRows[0]);
						$('#bd-list-info').datagrid('deleteRow',index);
						queryTabInfo();
					}
				}
			});
		}
	}
}
//tabs 选中事件
function queryTabInfo(){
	//获取选中TAB
	var selectTab = $('.bdst-info-tabs').tabs('getSelected');
	var title=selectTab.panel('options').title;
	$('.bdst-info-tabs').tabs({   
		border:false,   
		onSelect:function(title){  
			if(title=='拟推荐供应商'){
			  querySupplier();
			}
			if(title=='分包范围'){
			  querySubcontractScope();
			}
			if(title=='资质要求'){
			  queryQualifications();
			}
			if(title=='许可要求'){
			  queryLicense();
			}
		}
	});
	if(title=='拟推荐供应商'){
	  	querySupplier();
	}
	if(title=='分包范围'){
	  	querySubcontractScope();
	}
	if(title=='资质要求'){
	  	queryQualifications();
	}
	if(title=='许可要求'){
	  	queryLicense();
	}
}
//初始化标段推荐供应商列表
function querySupplier(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	var bd_status=0;
	if(row!=null){
		constructPlanId=row.ID;
		var purName=purListMap[row.PURTYPEID];
		bd_status=row.STATUS;
		var index=$('#bd-list-info').datagrid('getRowIndex',row);
		if(purName!="公开招标"&&row.STATUS==0&&$('.bd-handle-icon[id="'+index+'"].icon-save').length>0){
			$('.s_easyui-linkbutton').linkbutton("enable");
		}else{
			$('.s_easyui-linkbutton').linkbutton("disable"); 
		}
	}else{
		$('.s_easyui-linkbutton').linkbutton("disable");
	}
 	$('#bd-supplier-list').datagrid({
		url:basePath+'/constructPlan/querySupplier',
		toolbar: '#bd-supplier-list_tb',
		width:'100%',
		height:'100%',
		idField: 'ID',
		singleSelect:true,
		selectOnCheck:false,
		checkOnSelect:false,
	    columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'NAME',title:'拟推荐供应商',halign:'center',width:'45%'},
			{field:'ISHANDINPUT',title:'是否手动录入',halign:'center',width:'30%',formatter: function(value,row,index){
				if(value==0){
					return '否';
				}else{
					return '是';
				}
			}},
			{field:'ISINCONTRACT',title:'是否合同承包约定',halign:'center',width:'20%',formatter: function(value,row,index){
				if(value==0){
					return  '<input type="checkbox" class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled"  onclick="updateBdSupplierRow(this,'+index+');"/>';
				}else{
					return '<input type="checkbox"  class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled" checked onclick="updateBdSupplierRow(this,'+index+');"/>';
				}
			}}
	    ]],
		queryParams: {
			constructPlanId:function(){
					return constructPlanId;
			},
		},
		onBeforeEdit:function(index,row){
			bdsEditingIndex=index;
			var checkClass=row.ID+"_"+index;
			$("."+checkClass).removeAttr('disabled');
		},
		onAfterEdit:function(index,row){
			var checkClass=row.ID+"_"+index;
			$("."+checkClass).attr('disabled');
			submitBDSData(index);
		},
		onClickCell:function(index, field, value){
			if(field!='ISINCONTRACT'&&bdsEditingIndex!=undefined){
				$('#bd-supplier-list').datagrid('endEdit',bdsEditingIndex);
			}
		},
		onDblClickRow:function(index,row){
			if($('.s_easyui-linkbutton.l-btn-disabled').length>0){
				return false;
			}else{
				$('#bd-supplier-list').datagrid('beginEdit',index);
			}
		},
		onLoadSuccess:function(data){
			if(data.total>0){
				 $('#bd-supplier-list').datagrid('clearSelections');
				 $('#bd-supplier-list').datagrid('clearChecked');
			}
		}
	});
}
//更新标段推荐供应商信息
function updateBdSupplierRow(obj,index){
	var rows=$('#bd-supplier-list').datagrid('getRows');
	for(var i in rows){
		if($('#bd-supplier-list').datagrid('getRowIndex',rows[i])==index){
			if($(obj).is(':checked')){
				rows[i].ISINCONTRACT=1;
			}else{
				rows[i].ISINCONTRACT=0;
			}
			$('#bd-supplier-list').datagrid('updateRow',rows[i]);
			break;
		}
	}
}
//修改标段推荐供应商数据提交
function submitBDSData(index){
	var rows=$('#bd-supplier-list').datagrid('getRows');
	for(var i in rows){
		if($('#bd-supplier-list').datagrid('getRowIndex',rows[i])==index){
			var obj = new Object();
			obj["pbs_construct_to_suppliersList[0].id"] = rows[i].ID;
			obj["pbs_construct_to_suppliersList[0].constructPlanId"]=rows[i].CONSTRUCTPLANID;
			obj["pbs_construct_to_suppliersList[0].isInContract"]=rows[i].ISINCONTRACT==1?true:false;
			obj["pbs_construct_to_suppliersList[0].isHandInput"]=rows[i].ISHANDINPUT==1?true:false;
			obj["pbs_construct_to_suppliersList[0].name"]=rows[i].NAME;
			obj["pbs_construct_to_suppliersList[0].supplierId"]=rows[i].SUPPLIERID;
			$.ajax({
			    url:basePath+'/constructPlan/updateConstructSupplier',
				type:'POST',
				data:obj,
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						bdsEditingIndex=undefined;
						MyMessager.slide.show("提示",data.info); 		
					}else{
						$('#bd-supplier-list').datagrid('beginEdit',bdsEditingIndex);
						MyMessager.alert.show('提示',data.info);
					}
					$('#bd-supplier-list').datagrid('refreshRow',index);
					$('#bd-supplier-list').datagrid('acceptChanges')
				}
			});	
		}
	}
}
//删除推荐施工标段供应商信息
function delBDSInfo(){
	var selectedRows=$('#bd-supplier-list').datagrid('getChecked');
	var existSelect=false;
	var ids="";
	for(var i in selectedRows){
		existSelect=true;
		ids+=selectedRows[i].ID+","
	}
	if(existSelect){
		$.messager.confirm('提示','你确定要删除该供应商信息？',function(r){
			if (r){
				$.ajax({
					url:basePath+'/constructPlan/delConstructSupplier',
					data:{ids:ids},
					type:'POST',
					beforeSend:function() {
						MyMessager.prog.show("提示","请等待","数据处理中...");
					},
					complete:function() {
						MyMessager.prog.close();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
					},
					success:function(data){
						if(data.status){
							for(var i=selectedRows.length-1;i>=0;i--){
								var index=$('#bd-supplier-list').datagrid('getRowIndex',selectedRows[i]);
								$('#bd-supplier-list').datagrid('deleteRow',index);
							}
							$('#bd-supplier-list').datagrid('clearSelections');
						}
						MyMessager.slide.show("提示",data.info); 
					}
				});
		 	}
		});
	}else{
		MyMessager.alert.show('提示','请选择需要删除的供应商信息！');
	}
}
//初始化分包范围
function querySubcontractScope(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	var bd_status=0;
	if(row!=null){
		constructPlanId=row.ID;
		bd_status=row.STATUS;
		var index=$('#bd-list-info').datagrid('getRowIndex',row);
		if(row.STATUS==0&&$('.bd-handle-icon[id="'+index+'"].icon-save').length>0){
			$('.sc_easyui-linkbutton').linkbutton("enable");
		}else{
			$('.sc_easyui-linkbutton').linkbutton("disable");
		} 
	} else{
		$('.sc_easyui-linkbutton').linkbutton("disable");
	}
	$('#bd-subcontract-scope-list').datagrid({
		url:basePath+'/constructPlan/queryConstructSubcontractScope',
		toolbar:'#bd-subcontract-scope-list_tb',
		width:'100%',
		height:'100%',
		idField: 'ID',
		treeField: 'MATERIALCODE',
		singleSelect:true,
		columns:[[
		    {field:'PBSCODE',title:'pbscode',hidden:true},
			{field:'CODE',title:'子项编码',halign:'center',width:'30%'},
			{field:'PRJMATERIALNAME',title:'子项',halign:'center',width:'25%'},
			{field:'MAJORNAME',title:'专业',halign:'center',width:'20%'},
			{field:'DESCRIPTION',title:'说明',halign:'center',width:'20%',editor:'text'}
		]],
		queryParams: {
			constructPlanId:function(){
					return constructPlanId;
			}
		},
		onDblClickRow:function(index,row){
		  if($('.sc_easyui-linkbutton.l-btn-disabled').length>0){
			  return false;
		  }else{
			if(bdcopEditingIndex==undefined){
				$('#bd-subcontract-scope-list').datagrid('beginEdit',index);
				bdcopEditingIndex=index;
			}else{
				$('#bd-subcontract-scope-list').datagrid('endEdit',bdcopEditingIndex);
				$('#bd-subcontract-scope-list').datagrid('beginEdit',index);
				bdcopEditingIndex=index;
			}    
		  }
		},
		onAfterEdit:function(rowIndex,rowData,changes){
			updateSubcontractScope(rowIndex,rowData.ID,rowData.DESCRIPTION);
		},
		onClickRow:function(rowIndex,rowData){
			if(bdcopEditingIndex!=undefined){
				$('#bd-subcontract-scope-list').datagrid('endEdit',bdcopEditingIndex);
				bdcopEditingIndex=undefined;
			}
			majorOfOtherSubcontract("bd-subcontract-major-list");
		},
		onLoadSuccess:function(data){
			if(data.total>0){
				 $('#bd-subcontract-scope-list').datagrid('clearSelections');
				 $('#bd-subcontract-scope-list').datagrid('clearChecked');
			}
		}
	});	
}
//资质要求
function queryQualifications(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	var bd_status=0;
	if(row!=null){
		constructPlanId=row.ID;
		bd_status=row.STATUS;
		var index=$('#bd-list-info').datagrid('getRowIndex',row);
		if(row.STATUS==0&&$('.bd-handle-icon[id="'+index+'"].icon-save').length>0){
			$('.q_easyui-linkbutton').linkbutton("enable");
		}else{
			$('.q_easyui-linkbutton').linkbutton("disable");
		}
	}else{
		$('.q_easyui-linkbutton').linkbutton("disable");
	}
	$('#bd-qualifications-list').datagrid({
		url:basePath+'/constructPlan/queryConstructQualifications',
		toolbar:'#bd-qualifications-list_tb',
		height:'100%',
		width:'100%',
		idField: 'ID',
		treeField: 'MATERIALCODE',
		singleSelect:true,
		selectOnCheck:false,
		checkOnSelect:false,
		columns:[[
		    {field:'ck',title:'',checkbox:true},
			{field:'NAME',title:'资质要求名称',halign:'center',width:'25%'},
			{field:'TYPES',title:'资质分类',halign:'center',width:'25%'},
			{field:'LEVELS',title:'资质级别',halign:'center',width:'20%'},
			{field:'OPERATOR',title:'逻辑运算符',halign:'center',width:'15%',editor:{type:'combobox',options:{valueField:"key",textField:"text"}},formatter:function(value){
				if(operListMap[value]==null||operListMap[value]==undefined){
					return '';
				}
				return operListMap[value];
			}},
			{field:'REMARK',title:'备注',halign:'center',width:'10%'}
		]],
		queryParams: {
			constructPlanId:function(){
					return constructPlanId;
			}
		},
		onDblClickRow:function(rowIndex,rowData){
		    if($('.q_easyui-linkbutton.l-btn-disabled').length>0){
				return false;
		    }else{
				if(bdqEditingIndex!=undefined){
					$('#bd-qualifications-list').datagrid('endEdit',bdqEditingIndex);
				}
				$('#bd-qualifications-list').datagrid('beginEdit',rowIndex);
				bdqEditingIndex=rowIndex; 
		    }
		},
		onClickRow:function(rowIndex,rowData){
			if(bdqEditingIndex!=undefined){
				$('#bd-qualifications-list').datagrid('endEdit',bdqEditingIndex);
			}
			bdqEditingIndex=undefined;
		},
		onBeginEdit:function(index){
			var oper= $(this).datagrid("getEditor", {id: index, field: "OPERATOR"});
			$(oper.target).combobox("loadData",operList);
		},
		onAfterEdit:function(rowIndex,rowData,changes){
			updateQueryQualificationsInfo(rowIndex,rowData.ID,rowData.OPERATOR);
		},
		onLoadSuccess:function(data){
			if(data.total>0){
				$('#bd-qualifications-list').datagrid('clearSelections');
				$('#bd-qualifications-list').datagrid('clearChecked');
			}
		}
	});
}
//更新施工资质要求
function updateQueryQualificationsInfo(rowIndex,id,operator){
	$.ajax({
		url:basePath+'/constructPlan/updateConstructQualifications',
		data:{id:id,operator:operator},
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			if(!data.status){
			  $('#bd-qualifications-list').datagrid('beginEdit',rowIndex);	
			  MyMessager.alert.show('提示',data.info);
			}else{
				bdqEditingIndex=undefined;
			}
		}
	});
}
//删除施工资质要求
function delQueryQualificationsInfo(){
	var rows=$('#bd-qualifications-list').datagrid('getChecked');	
	if(rows!=null&&rows!=undefined&&rows.length==0){
		MyMessager.alert.show('提示','请选择需要删除的资质信息！');
	}else{
		$.messager.confirm('提示','你确定要删除该资质要求信息？',function(r){
			if (r){
				var ids="";
				for(var i in rows){
					ids+=rows[i].ID+",";
				}
				$.ajax({
					url:basePath+'/constructPlan/delConstructQualifications',
					data:{ids:ids},
					type:'POST',
					beforeSend:function() {
						MyMessager.prog.show("提示","请等待","数据处理中...");
					},
					complete:function() {
						MyMessager.prog.close();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
					},
					success:function(data){
						if(data.status){
							var copyRows=new Array();
							for(var i in rows){
								copyRows.push(rows[i]);
							}
							for(var i = copyRows.length - 1; i >= 0; i--){
								var index = $('#bd-qualifications-list').datagrid('getRowIndex',copyRows[i]);
								$('#bd-qualifications-list').datagrid('deleteRow',index); 
							}	
							MyMessager.slide.show("提示", data.info);
						}else{
							MyMessager.alert.show('提示',"供应商名存在重复，请修改后添加！");
						}
					}
				});
			}
		});
	}
}
//供应商dialog
function supplierDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	if(row!=null){
		constructPlanId=row.ID;
	}
	$('#supplier-dialog').dialog({
	    title: '供应商查询',
	    width: 400,
		content:"<div><input class='easyui-searchbox' id='supplier-name-key' style='width:200px;height24px;' data-options='prompt:\"供应商名称\",searcher:queryBaseSupplierInfo'></input><div class='s-list' style='min-height:150px;height:300px;overflow-y:scroll;'><table id='supplier-list'></table></div>"+
				"<div class='hand-input-name'><div>手工输入供应商名称：<input class='easyui-textbox hand-into-sname first' style='width:206px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-supplier-add' onclick='handAddSupplier();'></i></span></div></div></div>",
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'直接添加',
				iconCls:'icon-plus-sign',
				handler:function(){
					submmitSupplierInfo("hand");
				}
			},
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#supplier-dialog').dialog("close");
				}
			},
			{
				text:'添加',
				iconCls:'icon-ok',
				handler:function(){
					submmitSupplierInfo("sys")
				}
			}
		]
	});
	$('#supplier-list').datagrid({
	    url:basePath+'/constructPlan/queryConstructSupplier',
		selectOnCheck:false,
		checkOnSelect:false,
	    columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'NAME',title:'供应商名字',halign:'center',width:'90%'}
	    ]],
		queryParams: {
			key:function(){
					return $('#supplier-name-key').searchbox('getValue');
			},
			constructPlanId:function(){
				return constructPlanId;
			}
		},
		onLoadSuccess: function(data){
			if (data.rows.length > 0) {
	            //循环判断操作为新增的不能选择
	            for (var i = 0; i < data.rows.length; i++) {
	               //根据EXIST让某些行不可选
	                if (data.rows[i].EXIST ==1) {
	                   	$(".s-list input[type='checkbox']")[i + 1].disabled = true;
					   	$(".s-list input[type='checkbox']")[i + 1].checked = true;
	                }
	            }
	        }
		}
	});
}
//供应商基础信息列表检索
function queryBaseSupplierInfo(){
	$('#supplier-list').datagrid('reload');
}
//添加手工输入供应商
function handAddSupplier(){
	$('.hand-input-name .span-icon-add').remove();
	$('.hand-input-name').append("<div>手工输入供应商名称：<input class='easyui-textbox hand-into-sname' style='width:200px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-supplier-add' onclick='handAddSupplier();'></i></span></div>");
}
//标段添加供应商数据提交
function submmitSupplierInfo(flag){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId=row.ID;
	var obj = new Object();
	var exist=false;
	var nameMap= new Array();
	//(1)直接添加供应商
	if(flag=="hand"){
		var snames=$('.easyui-textbox.hand-into-sname');
		for(var i=0;i<snames.length;i++){
			var name=$.trim($(snames[i]).val());
			if(name!=""&&name!=null){
				if(nameMap[name]!=null&&nameMap[name]!=undefined){
				    //重复
					exist=false;
					MyMessager.alert.show('提示',"供应商名存在重复，请修改后添加！");
					return ;
				}else{
					nameMap[name]=name;
					exist=true;	
					obj["Pbs_suppliersVOList["+i+"].constructPlanId"]=constructPlanId;
					obj["Pbs_suppliersVOList["+i+"].name"]=name;
					obj["Pbs_suppliersVOList["+i+"].isHandInput"]=true;
					obj["Pbs_suppliersVOList["+i+"].isInContract"]=false;
				}
			}	
		}
	}
	//(2)系统提供供应商
	if(flag=="sys"){
		var checkedRows=$('#supplier-list').datagrid('getChecked');
		for(var i in checkedRows){
			if(checkedRows[i].EXIST==0){
				exist=true;	
				obj["Pbs_suppliersVOList["+i+"].constructPlanId"]=constructPlanId;
				obj["Pbs_suppliersVOList["+i+"].id"]=checkedRows[i].ID;
				obj["Pbs_suppliersVOList["+i+"].id"]=checkedRows[i].ID;
				obj["Pbs_suppliersVOList["+i+"].isHandInput"]=false;
				obj["Pbs_suppliersVOList["+i+"].isInContract"]=false;
			}
		}
	}
	//没有需要添加的数据
	if(!exist&&flag=="hand"){
		MyMessager.alert.show('提示',"请填写供应商信息后再添加！");
	}else if(!exist&&flag=="sys"){
		MyMessager.alert.show('提示',"请先选择供应商信息！");
	}else{
		$.ajax({
			url:basePath+'/constructPlan/addConstructSupplier',
			data:obj,
			type:'POST',
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			success:function(data){
				if(data.status){
					$('#supplier-list').datagrid('reload');
					$('#bd-supplier-list').datagrid('reload');
					MyMessager.slide.show("提示", data.info); 
				}else{
					MyMessager.alert.show('提示',data.info);
				}
			}
		});
	}
}
//施工分包范围dialog
function subcontractDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId=row.ID;
	$('#construct-subcontract-dialog').dialog({
	    title: '子项-专业查询',
	    width: 400,
		content:"<div><input class='easyui-searchbox' id='pbsOrMajor_name' style='width:200px;height24px;' data-options='prompt:\"子项-专业搜索\",searcher:queryPbsAndNode' /><div style='min-height:150px;'><ul id='pbs-node-tree' class='ztree'></ul></div><div id='other_major_pbs' style='min-height:100px;display:none'>该专业在其他标段中的分包内容：<table id='all_major-subcontract-info'></table></div></div>",
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#construct-subcontract-dialog').dialog("close");
				}
			},
			{
				text:'添加',
				iconCls:'icon-ok',
				handler:function(){
					addSubcontractScope();
				}
			}
		]
	});
	treeData = $("#pbs-node-tree");
	pbsNodeMajorTreeSetting = {
		async: {
			enable: true,
			dataType:"json" ,
			url:basePath+'/constructPlan/queryConstructNodeAndMajor',
			otherParam: {projectId:selectProject,constructPlanId:constructPlanId},
			dataFilter:function(treeId, parentNode, childNodes){
				var rNodes=new Array();
				var nodeMap=new Object();
				if (childNodes) {
					for(var i =0; i < childNodes.length; i++) {
						if(childNodes[i].flag==1){
							childNodes[i].nocheck=true;
						}
						childNodes[i].open=true;
						nodeMap[childNodes[i].id]=childNodes[i].id;
						var key=$('#pbsOrMajor_name').searchbox('getValue');
						if(""!=$.trim(key)){
							if(childNodes[i].text.indexOf(key)!=-1){
								rNodes.push(childNodes[i]); 
							}
						}else{
							rNodes.push(childNodes[i]); 
						}
					}
				}
				return rNodes;
			}
		},
		check : {
			enable :true,
			},
		view: {
			dblClickExpand: false,
			showLine: true
		},
		data: {
			simpleData: {
				enable:true,
				idKey: "id",
				pIdKey: "parentId",
				rootPId: ""
			},
			key:{
				name : "text",
			}
		},
		callback: {
			onAsyncSuccess:function(){
				var treeObj = $.fn.zTree.getZTreeObj("pbs-node-tree");
				var nodes = treeObj.getCheckedNodes(true);
				for (var i=0,l=nodes.length; i < l; i++) {
					treeObj.setChkDisabled(nodes[i], true);
				}
				treeObj.expandAll(true);
			},
			onClick:function(){
				$('#other_major_pbs').css('display','block');
				majorOfOtherSubcontract("all_major-subcontract-info");
			}
		}
	}
	$.fn.zTree.init(treeData,pbsNodeMajorTreeSetting, null);
}
//PbsNodeAndMajor条件检索
function queryPbsAndNode(){
	$.fn.zTree.init(treeData,pbsNodeMajorTreeSetting, null);
}
//检索该专业在其他标段的分包内容
function majorOfOtherSubcontract(id){
	var obj=new Object();
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	if(id!='all_major-subcontract-info'){
		var scoperow=$('#bd-subcontract-scope-list').datagrid('getSelected');
		if(scoperow!=null){
			obj.majorId=scoperow.MAJORID;
			obj.pbsNodeId=scoperow.PBSID;
		}
		constructPlanId=row.ID;
	}else{
		var treeObj = $.fn.zTree.getZTreeObj("pbs-node-tree");
		var nodes = treeObj.getSelectedNodes();
		obj.majorId=nodes[0].majorId;
		obj.pbsNodeId=nodes[0].parentId; 
	}
	obj.constructPlanId=constructPlanId;
	obj.versionId=row.PLANVERSIONID;
	$("#"+id).datagrid({
	    url:basePath+'/constructPlan/queryMajorOfConstructSubcontract',
	    toolbar:'#'+id+'_tb',
	    height:'100%',
	    width:'100%',
	    columns:[[
			{field:'CODE',title:'标段号',halign:'center',width:'32%'},
			{field:'NAME',title:'标段名称',halign:'center',width:'32%'},
			{field:'REMARK',title:'分包说明',halign:'center',width:'30%'}
	    ]],
		queryParams:{majorId:obj.majorId,constructPlanId:obj.constructPlanId,versionId:obj.versionId,pbsNodeId:obj.pbsNodeId},
	});
}
//添加施工标段分包范围
function addSubcontractScope(){
	var treeObj = $.fn.zTree.getZTreeObj("pbs-node-tree");
	var nodes = treeObj.getCheckedNodes(true);
	if(nodes==null||nodes.length==0){
		MyMessager.alert.show('提示','请选中需要添加的专业！');
	}else{
		var row=$('#bd-list-info').datagrid('getSelected');
		var constructPlanId=row.ID;
		var obj=new Object();
		for(var i in nodes){
			obj["pbs_construct_to_scopeList["+i+"].constructPlanId"]=constructPlanId;
			obj["pbs_construct_to_scopeList["+i+"].pbsId"]=nodes[i].parentId;
			obj["pbs_construct_to_scopeList["+i+"].majorId"]=nodes[i].majorId;
		}
		$.ajax({
			url:basePath+'/constructPlan/addConstructSubcontractScope',
			data:obj,
			type:'POST',
			success:function(data){
				if(data.status){
					$('#bd-subcontract-scope-list').datagrid('reload');
					for(var i in nodes){
						treeObj.setChkDisabled(nodes[i], true);
					}
					
					updatePurPlanCost();
					
					MyMessager.slide.show("提示", data.info); 
				}else{
					MyMessager.alert.show('提示',data.info);
				}
			}
		});
	}
}
//删除施工分包范围
function delSubcontractScope(){
	var rows=$('#bd-subcontract-scope-list').datagrid('getSelections');
	if(rows==null||rows.length==0){
		MyMessager.alert.show('提示','请选择需要删除的施工分包范围信息！');
	}else{
	    $.messager.confirm('提示','你确定要删除该施工分包范围信息？',function(r){
			if (r){
				var ids="";
				for(var i in rows ){
					ids+=rows[i].ID+",";
				}
				$.ajax({
					url:basePath+'/constructPlan/delConstructSubcontractScope',
					data:{ids:ids},
					type:'POST',
					beforeSend:function() {
						MyMessager.prog.show("提示","请等待","数据处理中...");
					},
					complete:function() {
						MyMessager.prog.close();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
					},
					success:function(data){
						if(data.status){
							for(var i in rows){
								var index=$('#bd-subcontract-scope-list').datagrid('getRowIndex',rows[i]);
								$('#bd-subcontract-scope-list').datagrid('deleteRow',index);
							}
							updatePurPlanCost();
							
							MyMessager.slide.show("提示", data.info); 
						}else{
							MyMessager.alert.show('提示',data.info);
						}
					}
				});	
			}
		});
	}
}
//修改施工分包范围
function updateSubcontractScope(index,id,description){
	var obj=new Object();
	obj.id=id;
	obj.description=description;
	obj.subcontractPlanDes="";
	$.ajax({
		url:basePath+'/constructPlan/updateConstructSubcontractScope',
		data:obj,
		type:'POST',
		success:function(data){
			if(!data.status){
				$('#bd-subcontract-scope-list').datagrid('beginEdit',index);
				bdcopEditingIndex=index;
				MyMessager.alert.show('提示',data.info);
			}
		}
	});
}
//资质dialog
function qualificationsDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId=row.ID;
	$('#qualifications-dialog').dialog({
	    title: '资质查询',
	    width: 600,
		content:"<div><input class='easyui-searchbox'  id='qualificationKey' style='width:200px;height24px;' data-options='prompt:\"名称/分类/级别\",searcher:queryBaseQualificationsInfo'></input><div class='q_list' style='min-height:150px;height:300px;overflow-y:scroll;'><table id='qualifications-list'></table></div></div>",
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#qualifications-dialog').dialog("close");
				}
			},
			{
				text:'添加',
				iconCls:'icon-ok',
				handler:function(){
					addQualificationsInfo();
				}
			}
		]
	});
	$('#qualifications-list').datagrid({
		url:basePath+'/constructPlan/queryBaseQualifications',
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'TYPES',title:'分类',halign:'center',width:'25%'},
			{field:'NAME',title:'名称',halign:'center',width:'35%'},
			{field:'LEVELS',title:'级别',halign:'center',width:'10%'},
			{field:'REMARK',title:'备注',halign:'center',width:'20%'}
		]],
		queryParams: {
			key:function(){
				return $('#qualificationKey').searchbox('getValue');
			},
			constructPlanId:function(){
		        return constructPlanId;
		    }
		},
		onLoadSuccess: function(data){
			if (data.rows.length > 0) {
				//循环判断操作为新增的不能选择
				for (var i = 0; i < data.rows.length; i++) {
				   //根据EXIST让某些行不可选
					if (data.rows[i].EXIST ==1) {
					   	$(".q_list input[type='checkbox']")[i + 1].disabled = true;
					   	$(".q_list input[type='checkbox']")[i + 1].checked = true;
					}
				}
			}
		}
	});
}
//查询资质要求基础信息
function queryBaseQualificationsInfo(){
	$('#qualifications-list').datagrid('reload');
}
//添加资质要求信息
function addQualificationsInfo(){
	var rows=$('#qualifications-list').datagrid('getChecked');
	if(rows==null||rows==undefined){
		MyMessager.alert.show('提示','请选择需要添加的资质信息！');
	}else{
		var row=$('#bd-list-info').datagrid('getSelected');
		var constructPlanId=row.ID;
		var ids="";
		var exist=false;
		for(var i in rows ){
			if(rows[i].EXIST==0){
				exist=true;
				ids+=rows[i].ID+",";
			}
		}
		if(exist){
	 		$.ajax({
				url:basePath+'/constructPlan/addConstructQualifications',
				data:{ids:ids,constructPlanId:constructPlanId},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-qualifications-list').datagrid('reload');
						$('#qualifications-list').datagrid('reload');
						MyMessager.slide.show("提示", data.info); 
					}else{
						MyMessager.alert.show('提示',data.info);
					}
				}
			}); 	
		}else{
			MyMessager.alert.show('提示',"请选择需要添加的资质信息！");
		}
	}
}
//许可要求列表查询
function queryLicense(){
  	var row=$('#bd-list-info').datagrid('getSelected');
  	var constructPlanId="";
  	var bd_status=0
  	if(row!=null){
	  	constructPlanId=row.ID;
	  	bd_status=row.STATUS;
	  	var index=$('#bd-list-info').datagrid('getRowIndex',row);
	  	if(row.STATUS==0&&$('.bd-handle-icon[id="'+index+'"].icon-save').length>0){
		 	$('.l_easyui-linkbutton').linkbutton("enable");
	  	}else{
		   	$('.l_easyui-linkbutton').linkbutton("disable");
	  	}
  	}else{
	  	$('.l_easyui-linkbutton').linkbutton("disable");
  	}
  	$('#bd-license-list').datagrid({
		url:basePath+'/constructPlan/queryConstructLicensing',
		toolbar:'#bd-license-list_tb',
		height:'100%',
		width:'100%',
		idField: 'ID',
		treeField: 'MATERIALCODE',
		singleSelect:true,
		selectOnCheck:false,
		checkOnSelect:false,
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'NAME',title:'许可要求名称',halign:'center',width:'40%'},
			{field:'ISHANDINPUT',title:'是否为手动录入',halign:'center',width:'10%',formatter:function(value,row,index){
				if(value==1){
					return '是';
				}else{
					return '否';
				}
			}},
			{field:'OPERATOR',title:'逻辑运算符',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"key",textField:"text"}},formatter:function(value){
				if(operListMap[value]==null||operListMap[value]==undefined){
					return '';
				}
				return operListMap[value];
			}},
			{field:'REMARK',title:'备注',halign:'center',width:'35%'}
		]],
		queryParams:{constructPlanId:function(){
			return constructPlanId;
		}},
		onDblClickRow:function(index,row){
		  	if($('.l_easyui-linkbutton.l-btn-disabled').length>0){
			  	return false;
		  	}else{
				if(bdLiEditingIndex!=undefined){
					$('#bd-license-list').datagrid('endEdit',bdLiEditingIndex);
				}
				$('#bd-license-list').datagrid('beginEdit',index);
				bdLiEditingIndex=index;	  
		  	}
		},
		onClickRow:function(index,row){
			if(bdLiEditingIndex!=undefined){
				$('#bd-license-list').datagrid('endEdit',bdLiEditingIndex);
				bdLiEditingIndex=undefined;	
			}
		},
		onBeginEdit:function(index){
			var oper= $(this).datagrid("getEditor", {id: index, field: "OPERATOR"});
			$(oper.target).combobox("loadData",operList);
		},
		onAfterEdit:function(rowIndex,rowData,changes){
			updateLicenseInfo(rowIndex,rowData);
		},
		onLoadSuccess:function(data){
			if(data.total>0){
			 	$('#bd-license-list').datagrid('clearSelections');
			  	$('#bd-license-list').datagrid('clearChecked');
			}
		}
	});
}
//删除许可信息
function delLicenseInfo(){
	var rows=$('#bd-license-list').datagrid('getChecked');	
	if(rows!=null&&rows!=undefined&&rows.length==0){
		 MyMessager.alert.show('提示','请选择需要删除的许可标段信息！');
	}else{
		$.messager.confirm('提示','你确定要删除该许可要求信息？',function(r){
			if (r){
				var ids="";
				for(var i in rows){
					ids+=rows[i].ID+",";
				}
				$.ajax({
					url:basePath+'/constructPlan/delConstructLicensing',
					data:{ids:ids},
					type:'POST',
					beforeSend:function() {
						MyMessager.prog.show("提示","请等待","数据处理中...");
					},
					complete:function() {
						MyMessager.prog.close();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
					},
					success:function(data){
						if(data.status){
							var copyRows=new Array();
							for(var i in rows){
								copyRows.push(rows[i]);
							}
							for(var i = copyRows.length - 1; i >= 0; i--){
								var index =$('#bd-license-list').datagrid('getRowIndex',copyRows[i]);
								$('#bd-license-list').datagrid('deleteRow',index); 
							} 
							MyMessager.slide.show("提示", data.info); 
						}else{
							MyMessager.alert.show('提示',data.info);
						} 
					}
				});
			}
		});
	}
}
//更新许可要求信息
function updateLicenseInfo(index,rowData){
	var row=$('#bd-list-info').datagrid('getSelected');
    var constructPlanId=row.ID;
	var obj=new Object();
	obj["pbs_construct_to_licensList["+0+"].constructPlanId"]=constructPlanId;
	obj["pbs_construct_to_licensList["+0+"].id"]=rowData.ID;
	obj["pbs_construct_to_licensList["+0+"].licenseId"]=rowData.LICENSEID;
	obj["pbs_construct_to_licensList["+0+"].isHandInput"]=rowData.ISHANDINPUT==1?true:false;
	obj["pbs_construct_to_licensList["+0+"].operator"]=rowData.OPERATOR;
	obj["pbs_construct_to_licensList["+0+"].name"]=rowData.NAME;
	$.ajax({
		url:basePath+'/constructPlan/updateConstructLicensing',
		data:obj,
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			if(!data.status){
				$('#bd-license-list').datagrid('beginEdit',index);
				MyMessager.alert.show('提示',data.info);
			}else{
				$('#bd-license-list').datagrid('endEdit',index);
			}
		}
	});
}
//许可要求dialog
function licenseDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
    var constructPlanId=row.ID;
	$('#license-dialog').dialog({
	    title: '许可要求查询',
	    width: 600,
		content:"<div><input id='license_name' class='easyui-searchbox' style='width:200px;height24px;' data-options='prompt:\"名称/分类/级别/类别\",searcher:queryLicenseInfo'></input><div id='l_list' style='min-height:150px;height:300px;overflow-y:scroll;'><table id='license-list'></table></div>"+
				"<div class='hand-input-license'><div>手工输入许可要求名称：<input class='easyui-textbox hand-into-licensename' style='width:206px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-license-add' onclick='handAddLicense();'></i></span></div></div></div>",
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'直接添加',
				iconCls:'icon-plus-sign',
				handler:function(){
					 submitLicenseInfo('hand');
				}
			},
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#license-dialog').dialog("close");
				}
			},
			{
				text:'添加',
				iconCls:'icon-ok',
				handler:function(){
					submitLicenseInfo('sys');
				}
			}
		]
	});
	$('#license-list').datagrid({
	    url:basePath+'/constructPlan/queryBaseLicensing',
	    columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'NAME',title:'名称',halign:'center',width:'40%'},
			{field:'TYPES',title:'类别',halign:'center',width:'20%'},
			{field:'LEVELS',title:'级别',halign:'center',width:'20%'},
			{field:'REMARK',title:'备注',halign:'center',width:'15%'}
	    ]],
		queryParams:{
			constructPlanId:function(){
				return constructPlanId;
			},
			key:function(){
				return $('#license_name').searchbox('getValue');
			}
		},
		onLoadSuccess: function(data){
			if (data.rows.length > 0) {
				//循环判断操作为新增的不能选择
				for (var i = 0; i < data.rows.length; i++) {
				   //根据EXIST让某些行不可选
					if (data.rows[i].EXIST ==1) {
					   $("#l_list input[type='checkbox']")[i + 1].disabled = true;
					   $("#l_list input[type='checkbox']")[i + 1].checked = true;
					}
				}
			}
		}	
	});
}
//查询许可要求信息
function queryLicenseInfo(){
	$('#license-list').datagrid('reload');
}
//添加手工输入许可要求
function handAddLicense(){
	$('.hand-input-license .span-icon-add').remove();
	$('.hand-input-license').append("<div>手工输入许可要求名称：<input class='easyui-textbox  hand-into-licensename' style='width:200px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-supplier-add' onclick='handAddLicense();'></i></span></div>");
}
//许可要求数据提交
function submitLicenseInfo(flag){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId=row.ID;
	var obj = new Object();
	obj.constructPlanId=constructPlanId;	
	var exist=false;
	var nameMap= new Array();
	//(1)直接添加
	if(flag=="hand"){
		var slicensenames=$('.easyui-textbox.hand-into-licensename');
		for(var i=0;i<slicensenames.length;i++){
			var name=$.trim($(slicensenames[i]).val());
			if(name!=""&&name!=null){
				if(nameMap[name]!=null&&nameMap[name]!=undefined){
				    //重复
					exist=false;
					MyMessager.alert.show('提示',"许可要求名存在重复，请修改后添加！");
					return ;
				}else{
				   	nameMap[name]=name;
				   	exist=true;	
				   	obj["pbs_licenseList["+i+"].name"]=name;
				   	obj["pbs_licenseList["+i+"].isHandInput"]=true;
				}
			}	
		}
	}
	//(2)系统许可
	if(flag=="sys"){
		var checkedRows=$('#license-list').datagrid('getChecked');
		for(var i in checkedRows){
			if(checkedRows[i].EXIST==0){
				exist=true;	
				obj["pbs_licenseList["+i+"].id"]=checkedRows[i].ID;
				obj["pbs_licenseList["+i+"].name"]=checkedRows[i].NAME;
				obj["pbs_licenseList["+i+"].isHandInput"]=false;
			}
		}
	}
	//没有需要添加的数据
	if(!exist&&flag=="hand"){
		MyMessager.alert.show('提示',"请填写许可信息后再添加！");
	}else if(!exist&&flag=="sys"){
		MyMessager.alert.show('提示',"请先选择许可要求信息！");
	}else{
		$.messager.progress({text:'数据处理中......',interval:'100'}); 
		$.ajax({
			url:basePath+'/constructPlan/addConstructLicensing',
			data:obj,
			type:'POST',
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			success:function(data){
				if(data.status){
					$('#license-list').datagrid('reload');
					$('#bd-license-list').datagrid('reload');
					MyMessager.slide.show("提示", data.info); 
				}else{
					MyMessager.alert.show('提示',data.info);
				}
			}
		});
	}
}
//复制And粘贴
function copyOrPasteBDInfo(flag){
	var row=$('#bd-list-info').datagrid('getSelected');
	if(row==null||row==undefined||row.length==0){
		MyMessager.alert.show('提示',"请先选择标段进行复制！");
	}else if($('.status-info').attr('bd_status')!=0 && $('.status-info').attr('bd_status')!=3){
		MyMessager.alert.show('提示',"非草稿标段不能复制/粘贴！");
	}else{
		if(flag=='copy'){
			$('.paste_bd').attr('bdid',row.ID);
			MyMessager.slide.show('提示',"复制成功！");
		}else if($('.paste_bd').attr('bdid')!=null&&""!=$('.paste_bd').attr('bdid')){
			var constructPlanId=$('.paste_bd').attr('bdid');
			$.ajax({
				url:basePath+'/constructPlan/pasteConstructPlan',
				data:{id:constructPlanId},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-list-info').datagrid('reload');
						MyMessager.slide.show("提示", data.info); 
					}else{
						MyMessager.alert.show('提示',data.info);
					}
					$.messager.progress('close');
				}
			});
		}else{
			MyMessager.alert.show('提示',"请先选择标段进行复制！");
		}
	}
}
//设备成套安装dialog
function completeInstallDialog(){
	$('#complete-install-dialog').dialog({
	    title:'供应商成套安装',
	    width: 800,
		content:'<div class="easyui-tabs bdst-info-tabs" id="completeInstallInfo">'+
					'<div title="采购计划" class="bdst-info-tab bdst-tab">'+
						'<table id="purchase-supplier-list" style="min-height:250px;"></table>'+
					'</div>'+
					'<div title="施工分包策划"  class="bdst-info-tab bdst-tab" data-options="">'+
						'<div  class="bdst-button" style="margin-bottom:5px;">'+
								'<a class="easyui-linkbutton m_easyui-linkbutton" style="margin-right:5px;" data-options="iconCls:\'icon-plus\'"  onclick="majorAndPbsnodeDialog();">添加</a>'+ 
								'<a class="easyui-linkbutton m_easyui-linkbutton" data-options="iconCls:\'icon-trash\'" onclick="delMaterialOfConstruct();">删除</a>'+
						'</div>'+
						'<table id="construct-subcontract-list" style="min-height:250px;"></table>'+
					'</div>'+
				'</div>',
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#complete-install-dialog').dialog("close");
				}
			}
		]
	});
	if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
		&&$('.status-info').attr('isNewFlag')==1){
		$('.m_easyui-linkbutton').linkbutton('enable');
	}else{
		$('.m_easyui-linkbutton').linkbutton('disable');
	}
	queryCompleteInstallTab();
}
//设备供应商成套安装tab查询
function queryCompleteInstallTab(){
	//获取选中TAB
	var selectTab = $('#completeInstallInfo').tabs('getSelected');
	var title=selectTab.panel('options').title;
	$('#completeInstallInfo').tabs({
	  	border:false,   
	  	onSelect:function(title) {  
			if(title=='采购计划'){
			  queryPurchaseInfo();
			}
			if(title=='施工分包策划'){
			  queryConstructInfo();
			}
		}
	});
	if(title=='采购计划'){
	  queryPurchaseInfo();
	}
	if(title=='施工分包策划'){
	  queryConstructInfo();
	}
}
//查询采购计划成套安装
function queryPurchaseInfo(){
	$('#purchase-supplier-list').datagrid({
		url:basePath+'/constructPlan/queryConstructPlanInstallOfPur',
		width:'100%',
		idField: 'ID',
		treeField: 'CODE',
		columns:[[
			{field:'PCODE',title:'采购包号',halign:'center',width:'30%'},
			{field:'PNAME',title:'采购包名称',halign:'center',width:'35%'},
			{field:'SERVICENAME',title:'供应商提供服务范围',halign:'center',width:'30%'},
		]],
		queryParams:{
		 	projectId:function(){
				return selectProject; 
			}
		}
	});
}
//查询施工分包成套安装
function queryConstructInfo(){
	$('#construct-subcontract-list').datagrid({
		url:basePath+'/constructPlan/queryConstructPlanMaterial',
		width:'100%',
		idField: 'ID',
		treeField: 'MATERIALCODE',
		singleSelect:true,
		selectOnCheck:false,
		checkOnSelect:false,
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'PMMCODE',title:'物料编码',halign:'center',width:'10%'},
			{field:'PNAME',title:'项目物料名称',halign:'center',width:'12%'},
			{field:'MMDESCRIPTION',title:'参数',halign:'center',width:'10%'},
			{field:'PBSNAME',title:'所属子项',halign:'center',width:'10%'},
			{field:'MAJORNAME',title:'专业',halign:'center',width:'10%'},
			{field:'UNITNAME',title:'单位',halign:'center',width:'10%'},
			{field:'QTY',title:'数量',halign:'center',width:'10%'},
			{field:'PATENT',title:'是否含附属设备',halign:'center',width:'15%'},
			{field:'IMPORT',title:'是否进口',halign:'center',width:'5%'},
			{field:'REMARK',title:'备注',halign:'center',width:'5%'}
		]],
	 	queryParams:{
	 		id:function(){
			 	return projectConstructVId;
			},
			projectId:function(){
				return selectProject;
			}
		},
		onLoadSuccess:function(data){
			if(data.total>0){
				$('#construct-subcontract-list').datagrid('clearSelections');
				$('#construct-subcontract-list').datagrid('clearChecked');
			}
		}
	});
}
//成套设备-专业-子项-物料信息检索dialog
function majorAndPbsnodeDialog(){
	$('#major-pbsnode-info').dialog({
	    title:'搜索',
	    width: 1200,
		content:'<div><div style="height:430px;float:left;width:30%;overflow-y:scroll;"><ul id="major-pbsnode-tree" class="ztree"></ul></div>'+
					  '<div style="float:right" class="pbsnode-material">'+
					   ' <input class="easyui-searchbox" id="majorAndNodeName" style="width:200px;height24px;" data-options="prompt:\'物料编码/物料名称/参数\',searcher:queryMaterial,"></input>'+
					   ' <div id="cm_list" style="overflow-y:scroll;max-height:400px;overflow-x:hidden;margin-top:5px;"><table id="pbsnode-material-list" style="min-height:400px;"></table></div>'+
					 ' </div>'+
				'</div>',
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#major-pbsnode-info').dialog("close");
				}
			},
			{
				text:'添加',
				iconCls:'icon-plus',
				handler:function(){
					addMaterialOfConstruct();
				}
			}
		]
	});
	queryPbsnodeTree();
}
//子项专业树检索
function queryPbsnodeTree(){
var treeData = $("#major-pbsnode-tree");
var MajorpPbsNodeTreeSetting = {
	async: {
		enable: true,
		dataType:"json" ,
		url:basePath+'/constructPlan/queryConstructNodeAndMajor',
		otherParam: {projectId:selectProject,constructPlanId:""},
	},
	check : {
		enable :false,
		},
	view: {
		dblClickExpand: false,
		showLine: true
	},
	data: {
		simpleData: {
			enable:true,
			idKey: "id",
			pIdKey: "parentId",
			rootPId: ""
		},
		key:{
			name : "text",
		}
	},
	callback: {
		onAsyncSuccess:function(event, treeId, treeNode, msg){
			var treeObj = $.fn.zTree.getZTreeObj("major-pbsnode-tree");
			treeObj.expandAll(true);
			queryMaterial();
		},
		onClick:queryMaterial,
	},
	}
	treeData = $.fn.zTree.init(treeData,MajorpPbsNodeTreeSetting, null);
}
//子项专业物料检索
function queryMaterial(){
	var treeObj = $.fn.zTree.getZTreeObj("major-pbsnode-tree");
	var nodes = treeObj.getSelectedNodes();
	var majorId="";
	var pbsNodeId="";
	if(nodes.length!=0){
		if(nodes[0].flag==0){
			majorId=nodes[0].majorId;
			pbsNodeId=nodes[0].parentId;
		}else{
			majorId="";
			pbsNodeId=nodes[0].id;
		}
	}
	$('#pbsnode-material-list').datagrid({
		url:basePath+'/constructPlan/queryMajorOrPbsMaterial',
		width:'100%',
		idField: 'ID',
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'PMMCODE',title:'物料编码',halign:'center',width:'10%'},
			{field:'PNAME',title:'项目物料名称',halign:'center',width:'12%'},
			{field:'MMDESCRIPTION',title:'参数',halign:'center',width:'10%'},
			{field:'PBSNAME',title:'所属子项',halign:'center',width:'10%'},
			{field:'MAJORNAME',title:'专业',halign:'center',width:'10%'},
			{field:'UNITNAME',title:'单位',halign:'center',width:'10%'},
			{field:'QTY',title:'数量',halign:'center',width:'10%'},
			{field:'PATENT',title:'是否含附属设备',halign:'center',width:'15%'},
			{field:'IMPORT',title:'是否进口',halign:'center',width:'5%'},
			{field:'REMARK',title:'备注',halign:'center',width:'5%'}
		]],
	    queryParams:{
	    	projectId:function(){
				return selectProject;
			},
			pbsNodeId:function(){
				return pbsNodeId;
			},
			majorId:function(){
				return majorId;
			},
			key:function(){
				return $('#majorAndNodeName').searchbox('getValue');
			}
		},
		onLoadSuccess: function(data){
			if (data.rows.length > 0) {
				//循环判断操作为新增的不能选择
				for (var i = 0; i < data.rows.length; i++) {
				   //根据EXIST让某些行不可选
					if (data.rows[i].EXIST ==1) {
					   $("#cm_list input[type='checkbox']")[i + 1].disabled = true;
					   $("#cm_list input[type='checkbox']")[i + 1].checked = true;
					}
				}
			}
		}
	});
}
//删除施工成套设备物料
function delMaterialOfConstruct(){
	var checkedRows=$('#construct-subcontract-list').datagrid('getChecked');
	if(checkedRows!=null&&checkedRows.length>0){
		$.messager.confirm('提示','你确定要删除该施工成套设备安装？',function(r){
			if (r){
				var ids="";
				for(var i in checkedRows){
					ids+=checkedRows[i].ID+",";
				}
				$.ajax({
					url:basePath+'/constructPlan/delConstructSubcontractMaterial',
					data:{ids:ids},
					type:'POST',
					beforeSend:function() {
						MyMessager.prog.show("提示","请等待","数据处理中...");
					},
					complete:function() {
						MyMessager.prog.close();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
					},
					success:function(data){
						if(data.status){
							for(var i = checkedRows.length - 1; i >= 0; i--){
								var index =$('#construct-subcontract-list').datagrid('getRowIndex',checkedRows[i]);
								$('#construct-subcontract-list').datagrid('deleteRow',index); 
							} 
							MyMessager.slide.show("提示", data.info); 
						}else{
							MyMessager.alert.show('提示',data.info);	
						}
					}
				});
			}
		});
	}else{
		MyMessager.alert.show('提示',"请先选择需要删除的设备物料！");	
	}
}
//添加施工成套设备安装
function addMaterialOfConstruct(){
	var checkedRows=$('#pbsnode-material-list').datagrid('getChecked');
	if(checkedRows!=null&&checkedRows.length>0){
		var exist=false;
		var materialDetailIds="";
		for(var i in checkedRows){
			if(checkedRows[i].EXIST==0){
				exist=true;
				materialDetailIds+=checkedRows[i].ID+",";
			}
		}
		if(exist){
			$.ajax({
				url:basePath+'/constructPlan/addConstructSubcontractMaterial',
				data:{materialDetailIds:materialDetailIds,versionId:projectConstructVId},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#construct-subcontract-list').datagrid("reload");
						$('#pbsnode-material-list').datagrid("reload");		
						MyMessager.slide.show("提示", data.info); 						
					}else{
						MyMessager.alert.show('提示',data.info);
					}
				}
			});
		}else{
			MyMessager.alert.show('提示',"请先选择设备物料！");	
		}
	}else{
		MyMessager.alert.show('提示',"请先选择设备物料！");
	}
}
//手动录入供应商列表查看
function queryVsersionSupplierOfHand(){
	$('#license-dialog').dialog({
	    title: '手动录入供应商列表',
	    width: 600,
		content:"<div id='version_s_hand_list' style='min-height:150px;'><table id='v_s_h_list'></table></div>",
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#license-dialog').dialog("close");
				}
			}
		]
	});
	$('#v_s_h_list').datagrid({
		url:basePath+'/constructPlan/querySupplierOfHand',
		columns:[[
			{field:'SNAME',title:'名称',halign:'center',width:'33%'},
			{field:'PNAME',title:'所属标段',halign:'center',width:'33%'},
			{field:'CODE',title:'所属标段号',halign:'center',width:'33%'},
		]],
		queryParams:{
			projId:function(){
				return selectProject;
			},
			id:function(){
				return '';
			}
		}
	});
}
//按钮禁用
function disableOrEnableBDHeaderButton(flag){
	if(flag==null||flag==undefined){
		flag='enable';//disable
	}
	$('.bd_head_button').linkbutton(flag);
}
//附件管理DIALOG
function manageFiles(){
	$('#file-mng-dialog').dialog({
	    title:'附件管理',
	    width: 800,
		content:'<div  class="bdst-button" style="margin-bottom:5px;">'+
							'<a class="easyui-linkbutton f_easyui_linkbutton" data-options="iconCls:\'icon-cloud-upload\'" onclick="attachmentUpload();">上传</a>'+
				'</div>'+
				'<div id="file_list"><table id="plan_file_list" style="min-height:250px;"></table></div>',
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#file-mng-dialog').dialog("close");
				}
			}
		]
	});
	if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
		&&$('.status-info').attr('isNewFlag')==1){
		$(".f_easyui_linkbutton").linkbutton("enable");
	}else{
		$(".f_easyui_linkbutton").linkbutton("disable");
	}
	queryPlanFiles();
}
//附件检索
function queryPlanFiles(){
	$('#plan_file_list').datagrid({
		url:basePath+'/pbsCommonController/queryAttachment',
		width:'100%',
		idField: 'ID',
		columns:[[
			{field:'fileName',title:'文件名',halign:'center',width:'50%'},
			{field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
				if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
					&&$('.status-info').attr('isNewFlag')==1){
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'+'<button type="button" onclick="delAttachment(\''+row.id+'\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>'	

				}else{
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'	
				}
			}}
		]],
	    queryParams:{
			targetId:function(){
				return projectConstructVId;
			},
			targetType:5,
		}
	});
}
//附件上传
function attachmentUpload(){
	WebFilesUploader({ 
		_title:'文件上传',
		_width:800,
		_height:200,
		_webuploader:{ 
			server:'/enfi-pbs/fileUpload', //上传到服务器的地址【"/"+项目部署名称+"/fileUpload"】			
			swf:'../resources/js/fileupload/webfilesuploader/Uploader.swf',//上传用的flash控件
			multiple:false,//否开起同时选择多个文件能力
			//accept:{extensions:'gif,jpg,jpeg,bmp,png'},//允许文件的后缀
			//fileNumLimit:3 //允许加入上传队列的文件个数
			//TODO 1.3.0-RELEASE配置参数
			//chunkSize:1024*1024,                       //断点续传参数【分片的大小】
			//allowMinBreakPointResumeSize:1024*1024*10, //断点续传参数【文件大小超过此值的要进行断点续传】
			//verifyChunk:'/cpm-web/verifyChunk',        //断点续传参数【文件的整体Md5验证路径】【"/"+项目部署名称+"/verifyChunk"】
			//verify:'/cpm-web/verify',                  //断点续传参数【分片的Md5验证路径】【"/"+项目部署名称+"/verify"】
			//merger:'/cpm-web/merger'                   //断点续传参数【合并文件的处理路径】【"/"+项目部署名称+"/merger"】
		} 
	}, 
	function(jsons){
		var fileIds="";
		for(var i=0;i<jsons.length;i++){
			if(i!=0){
			  fileIds=fileIds+","+jsons[i].UUID
			}else{
			  fileIds =jsons[i].UUID;	
			}
		}
		$.ajax({
			url:basePath+'/pbsCommonController/uploadAttachment',
			type : "POST",
			dataType : "json",
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			data : {
				fileIds : fileIds,
				targetId:function(){
					return projectConstructVId; 
				},
				targetType:5,
			},
			success:function(data) {
				$('#plan_file_list').datagrid('reload');
				MyMessager.slide.show("提示", data.info); 
			}
		});
		
	});
}
//附件下载
function downAttachment(path,fileName,fileId){
	path = encodeURI(path);
	fileName = encodeURI(fileName);
	window.location.href = basePath+"/pbsCommonController/downloadAttachment?path="+path+"&fileName="+fileName+"&fileId="+fileId; 
}
//附件删除
function delAttachment(fileId){
	$.messager.confirm('提示','你确定要删除该附件信息？',function(r){
		if (r){
			$.ajax({
				url:basePath+'/pbsCommonController/deleteAttachment',
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				data:{ids:fileId},
				success:function(data){
					$('#plan_file_list').datagrid('reload');
					MyMessager.slide.show("提示","数据处理成功！"); 
				}
			});
		}
	});
}
//版本变更
function changePlanVersion(){
    $.messager.confirm('提示','变更后老版本将作废，新版本要重新审批!是否继续升版？',function(r) {
        if (r) {
            if($('.status-info').attr('bd_status')==0||$('.status-info').attr('bd_status')==1
               || $('.status-info').attr('bd_status')==3||$('.status-info').attr('isNewFlag')!=1){
                MyMessager.alert.show('提示',"已审批或者拒绝最新版本才可以进行升版！");
            }else{
                $.ajax({
                    url:basePath+'/constructPlan/changePlan',
                    type:'POST',
                    data:{
                        id:projectConstructVId,
                        type:5
                    },
                    beforeSend:function() {
                        MyMessager.prog.show("提示","请等待","数据处理中...");
                    },
                    complete:function() {
                        MyMessager.prog.close();
                    },
                    success:function(data){
                        queryProjectLastedVersionId(selectProject);
                        //queryBdListInfo();
                        $("#bd-list-info").datagrid("reload");
                        MyMessager.slide.show("提示", data.info);
                    }
                });
            }
        }
    });
}
//历史版本查看
function projectHistoryVersion(){
	$('#version_dialog').dialog({
	    title:'历史版本查看',
	    width: 800,
		content:'<div id="version_list"><table id="history_version_list" style="min-height:250px;"></table></div>',
	    closed: false,
	    cache: false,
	    modal: true,
		buttons: [	
			{
				text:'关闭',
				iconCls:'icon-remove',
				handler:function(){
					$('#version_dialog').dialog("close");
				}
			}
		]
	});
	$('#history_version_list').datagrid({
		url:basePath+'/constructPlan/queryPlanVersion',
		width:'100%',
		idField: 'ID',
		singleSelect:true,
		columns:[[
			{field:'NAME',title:'版本名',halign:'center',width:'30%'},
			{field:'CODE',title:'版本编码',halign:'center',width:'26%'},
			{field:'STATUS',title:'版本状态',halign:'center',width:'20%',formatter:function(value,row,index){
				if(value==0){
				  return '草稿';
				}else if(value==1){
				  return '审批中';	
				}else if(value==2){
				  return '已审批';	
				}else if(value==3){
                    return '已驳回';
                }else if(value==-1){
				  return '已取消';	
				}
			}},
	        {
	        	title: '操作',field: 'opt',width: "23%",halign: "center",align : 'center',
	            formatter:function(value,row,index){	            	
	       	 		return "<a  class='easyui-linkbutton' onclick=findHistoryVersion('"+row.ID+"','"+row.CODE+"','"+row.ISNEW+"','"+row.STATUS+"') " +
       				"title='查看' data-options='iconCls:\"icon-list-ol\"'><span >查看</span></a>";
	            }
	        }
		]],
	    queryParams:{projId:function(){
						return selectProject;
					}
		},
		/*onClickRow:function(index,rowData){
			var project=$('#projectList').tree('getSelected');
			window.open(basePath+"/subcontractPlan/constructPlanHistoryView?planVersionCode="+rowData.CODE+"&isNew="+rowData.ISNEW+"&planVersionId="+rowData.ID+"&projectName="+project.text+"&projectId="+project.id+"&status="+rowData.STATUS);
			//changeBDStatusInfo(rowData.STATUS,rowData.ID,rowData.ISNEW);
			//queryBdListInfo();
		}*/
	});
}

//查看历史版本详细信息
function findHistoryVersion(rID,code,isNew,status){
	var project=$('#projectList').tree('getSelected');
	//window.location.href
	window.open(encodeURI(basePath+"/subcontractPlan/constructPlanHistoryView?planVersionCode="+code+"&isNew="+isNew+"&planVersionId="+rID+"&projectName="+project.text+"&projectId="+project.id+"&status="+status));
}


//提交审批
function submitConstructPlan(){
    if (typeof(editIndex) !== 'undefined'){
        MyMessager.alert.show('提示',"有分包数据尚未保存！请先保存数据。");
        return;
    }
    //如果是已驳回继续在原流程上提交
    if ($('.status-info').attr('bd_status')==3){
        $.messager.confirm('提示','此流程将会继续原流程提交，待办页结束此流程可发起新流程！',function(r){
        	if (r){
                $.ajax({
                    url: basePath+"/workflow/continueProcess",
                    data: "code=plan&id="+projectConstructVId,
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
                        alert(xhr.responseText);
                    }
                });
			}
		});
	}else {
        //最新版草稿可以提交审批
        if($('.status-info').attr('bd_status')==0&&$('.status-info').attr('isNewFlag')==1){
            if(project_class == '研发课题'){
                $.post(basePath+"/constructPlan/submitConstructPlan","id="+projectConstructVId,function(obj){
                    if(obj.status){
                        MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                        queryProjectLastedVersionId(selectProject);
                        $("#bd-list-info").datagrid("reload");
                    }else{
                        MyMessager.alert.show("提示","提交失败");
                    }
                },"json")
            }else{
                var options = {
                    title : '审批',
                    url : basePath+"/baseInfo/auditDialog?workflow="+$('#workflow').val()
                    +"&workflowUrl="+basePath+"/bpm/mgnSubProcessView"
                    +"&paramet="+"processId="+$('#workflow').val()+",mark=C",
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
                                    allUser=per.allUser+"&usertask4CandidateUsers='usertask4List'"+per.subject;
                                    //工程项目信息
                                    var param2 ='&pbsVersionId='+projectConstructVId+"&projectId="+selectProject+"&projectCode="+projectNum+"&projectName="+projectName;
                                    //参数组装
                                    var params = allUser+param2+"&processId="+$('#workflow').val()+"&projectPurVId="+projectConstructVId
                                        +"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
                                    //发起请求，执行流程
                                    MyMessager.slide.show("提示", "数据处理中，请稍....");
                                    $.post(basePath+"/workflow/mgnSubWorkflow/"+$('#workflow').val(),"params="+params,function(result){
                                        if("success"==result){
                                            dialog.dialog('destroy');
                                            MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                            queryProjectLastedVersionId(selectProject);
                                            $("#bd-list-info").datagrid("reload");
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
            }
        }else{
            MyMessager.alert.show('提示',"非新草稿版数据，不能提交审批！");
        }
	}
}
//版本修改
function updatePlanVersionStatus(){
	var isNewFlag=$('.status-info').attr('isNewFlag');
	$.ajax({
		url:basePath+'/constructPlan/updateUpdatePlanVersionStatus',
		data:{id:projectConstructVId,status:0},
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			changeBDStatusInfo(0,projectConstructVId,isNewFlag);
		}
	});
}
//通知采购经理
function noticeConstructPlan(){
	/*$.ajax({
		url:basePath+'/constructPlan/noticeConstructPlan',
		data:{id:projectConstructVId,projId:selectProject},
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			MyMessager.slide.show("提示", data.info); 
		}
	});*/
	//判断是否存在未保存数据。
    if (typeof(editIndex) !== 'undefined'){
        MyMessager.alert.show('提示',"有分包数据尚未保存！请先保存数据。");
        return;
    }
	//最新版草稿可以提交审批
	if($('.status-info').attr('bd_status')==0&&$('.status-info').attr('isNewFlag')==1){	
		var options = {
				title : '通知',
				url : basePath+"/baseInfo/auditDialog?workflow="+$('#noticeWorkflow').val()
				+"&workflowUrl="+basePath+"/bpm/noticeProcessList"
				+"&paramet="+"mark=C,processId="+$('#noticeWorkflow').val(),
				height: 400,
				width: 450,
				closed: false,
			    cache: false,
			    modal: true,
			    buttons:[
				       {
						text:'发起通知',
						size:'large',
						handler:function(){
							var per = dialog.find("iframe").get(0).contentWindow.submitAudit();
							var allUser="";
							if(per.allUser!="" && per.allUser!=undefined && per.allUser!='undefined'){
								allUser=per.allUser+per.subject;
								//工程项目信息
								var param2 ='&pbsVersionId='+projectConstructVId+"&projectId="+selectProject+"&projectCode="+projectNum+"&projectName="+projectName;
							    //参数组装
								var params = allUser+param2+"&processId="+$('#noticeWorkflow').val()+"&projectPurVId="+projectConstructVId+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
								//发起请求，执行流程，提交审批
								MyMessager.slide.show("提示", "数据处理中，请稍....");
								$.post(basePath+"/workflow/subPlanNoticeAppr/"+$('#noticeWorkflow').val(),"params="+params,function(result){
									if("success"==result){
										dialog.dialog('destroy');
										MyMessager.slide.show("提示", "发起通知成功，消息将在3秒后关闭。");
									}else{
										$.messager.alert("提示","发起通知失败");						
									}
								});
							}else{
								$.messager.alert("提示","请确认通知信息再提交！");
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
		
	}else{
		$.messager.alert('提示',"该版本不是最新草稿版，不能发起通知！");
	}
}

//查询项目基本信息
function getProjectSummary(projectId){
	if(projectId==undefined || projectId ==""){
		projectId = $("#projectId").val();
	}
	$.ajax({
		url:basePath+'/project/getProjectSummary?projectId='+projectId,
		type:'POST',
		success:function(data){
			//console.log(data);
			selectProject=data.ID;
			projectNum=data.NUM;
			projectName=data.NAME;
			project_class = data.PROJECT_CLASS;
		}
	});
}

