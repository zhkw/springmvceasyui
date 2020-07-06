var basePath=$(".basePath").attr('basePath');
var selectNode=new Object();
var editingId = undefined;
var editingIndex=undefined;
var pbsEditIndex=undefined;
var unit=new Array();
var canEdit=false;
var unitList;
var usageList;
var qtyUnitList=new Array();;
var unitListMap = new Array();
var qtyUnitListMap = new Array();
var usageListMap=new Array();
$(function(){
    $.ajax({
        url: basePath+"/structure/queryUnitAndUsage",
        method: "POST",
        dataType: "json",
        success: function(data) {
            unitList = data.unitList;
			usageList= data.usageList;
            for (var i in unitList) {
                unitListMap[unitList[i].ID] = unitList[i].UNITNAME;
				if(unitList[i].TYPEID=='年产能'
					||unitList[i].TYPEID=='TonPerYear'){
					qtyUnitList.push(unitList[i]);
					qtyUnitListMap[unitList[i].ID]=unitList[i].UNITNAME;
				}
            }
			for(var i in usageList){
				usageListMap[usageList[i].ID] = usageList[i].NAME;
			}
        }
    });
	
//PBS 节点数据加载
$('#pbsGrid').treegrid({
    url:basePath+'/structure/getPbsTree',
	toolbar: "#pbsGrid_tb",
	width:'100%',
	height:'100%',
	idField: 'ID',
    treeField: 'MATERIALCODE',
    columns:[[
		{field:'MATERIALCODE',title:'标准子项编码',width:'12%'},
		{field:'MATERIALNAME',title:'标准子项名称',width:'8%'},
		{field:'PRJMATERIALNAME',title:'子项名称',width:'10%',editor:{type:'text'}},
		{field:'NODECODE',title:'子项号',width:'10%', editor:{type:"validatebox",options:{required:false}}},
		{field:'QTY',title:'规模',width:'10%',editor:{type:"validatebox",options:{validType:'intOrFloat'}}},
		{field:'QTYUNITID',title:'规模单位',width:'5%',editor:{type:'combobox',options:{valueField:"ID",textField:"UNITNAME"}},formatter:function(value,row,index){
			if(qtyUnitListMap[value]==null||qtyUnitListMap[value]==undefined){
				return '';
			}
			return qtyUnitListMap[value];
		}},
		{field:'PRODUCTSCHEME',title:'产品方案',width:'10%',editor:{type:'text'}},
		{field:'PROCESSSCHEME',title:'工艺方案',width:'5%',editor:{type:'text'}},
		{field:'MMDESCRIPTION',title:'参数',width:'10%'},
		{field:'USAGE',title:'子项用途划分',width:'5%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME"}},formatter:function(value){
			return usageListMap[value];
		}},
		{field:'ISATTMENT',title:'是否挂载文件',width:'5%'},
		{field:'REMARK',title:'备注',width:'6%',editor:'text'}
    ]],
	queryParams: {
		pbsversionId:function(){
			return $('#pbsVsersionId').html();
		},
		projectId:function(){
			return "1";
		},
		level:function(){
			return "2";
		},
	},
	onSelect:function(row){
		if(checkPbsStructureStatus()==0){
			if(editingId!=undefined){
				if($('.validatebox-invalid').length==0){
					$('#pbsGrid').treegrid('endEdit',editingId);
				}else{
					$.messager.alert('提示',"请按格式输入数据!");
				}
			}
		}
		//获取选中TAB
		queryTabInfo();
	},
	onDblClickRow:function(row){
		if(checkPbsStructureStatus()==0){
				if(editingId!=undefined){
						if($('.validatebox-invalid').length==0){
							$('#pbsGrid').treegrid('endEdit',editingId);
							$('#pbsGrid').treegrid('beginEdit',row.ID);
						}else{
							$.messager.alert('提示',"请按格式输入数据!");
						}
				}else{
						   if(editingId != row.ID){
								editingId = row.ID
								$('#pbsGrid').treegrid('beginEdit', row.ID);
							}
			}
		}else{
			$.messager.alert('提示',"非草稿状态数据不能进行修改！");
		}
	},
	onLoadSuccess:function(row,data){
		var roots=$('#pbsGrid').treegrid('getRoots')
		if(roots.length>0&&$('#pbsGrid').treegrid('getSelected')==null){
			$('#pbsGrid').treegrid('select',roots[0].ID);
		}
		if(data.length>0){
			var row = data[0];
			//获取选中TAB
			var selectTab = $('#pbs-iteam-info').tabs('getSelected');
			var title=selectTab.panel('options').title;
			queryTabInfo(title);			
			if(row.PBSSTRUCTURESTATUS==0){
				$('#draft').linkbutton('disable');
				$('#launchExaminations').linkbutton('enable');
				$('.status-info').removeClass('status-info-2').addClass('status-info-0').html('草稿');
				canEdit=true;
			}else{
				$('#draft').linkbutton('enable');
				$('#launchExaminations').linkbutton('disable');
				$('.status-info').removeClass('status-info-0').addClass('status-info-2 ').html('审批完成');
			}
		}else{
			$('#draft').linkbutton('disable');
			$('#launchExaminations').linkbutton('disable');
		}
	},
	onBeforeEdit:function(row){
		 var col = $(this).datagrid("getColumnOption", "NODECODE");
		 var children=$(this).treegrid('getChildren',row.id);
		 if(children.length==0&&row.isleaf==true){
				$.extend(col.editor.options, {
                         type: "validatebox",
                         url: null,
                         required:true,
						 missingMessage:'叶子节点子项号必填！',
						 validate:function(value,param){
							 return false;
						 },
                         onLoadSuccess: function(){}
                         });
		}else{
			$.extend(col.editor.options, {
                         type: "validatebox",
                         url: null,
                         required:false,
                         onLoadSuccess: function(){}
                         });
		}
	},
	onBeginEdit: function(row) {
            editingId = row.id;
			pbsEditIndex=$('#pbsGrid').treegrid('getRowIndex',row);
            var unitEditor = $(this).treegrid("getEditor", {id: editingId, field: "QTYUNITID"});
			var usageEditor = $(this).treegrid("getEditor", {id: editingId, field: "USAGE"});
            $(unitEditor.target).combobox("loadData",qtyUnitList);
			$(usageEditor.target).combobox("loadData",usageList);
        },
    onEndEdit: function(row) {
            editingId = undefined;
        }
	});
});
//按钮点击切换
function changeButtonType(type){
	if(type=='enable'){
		$('#save-pbsnode').linkbutton('enable');
		$('#addPbsNode').linkbutton('enable');
		$('#delPbsNode').linkbutton('enable');
		$('#copyPbsNode').linkbutton('enable');
		$('#pastePbsNode').linkbutton('enable');
	}else{
		$('#save-pbsnode').linkbutton('disable');
		$('#addPbsNode').linkbutton('disable');
		$('#delPbsNode').linkbutton('disable');
		$('#copyPbsNode').linkbutton('disable');
		$('#pastePbsNode').linkbutton('disable');
		$('#uploadAttachment').linkbutton('disable');
	}
}
//pbs节点复制
function copyPbsNode(){
	if(checkPbsStructureStatus()==0){
		var row = $('#pbsGrid').treegrid('getSelected');
		if(row==null||row.length==0){
			$.messager.alert('提示',"未存在复制的节点数据！");
		}else{
		  MyMessager.slide.show("提示", "复制成功！"); 
		  $('#pastePbsNode').attr('copyNodeID',row.ID);
		}
	}else{
		$.messager.alert('提示',"非草稿节点数据不能进行复制粘贴！");
	}
}
//PBS节点粘贴
function pastePbsNode(copyId){
	if(checkPbsStructureStatus()==0){
		var copyNodeID=$(copyId).attr('copyNodeID');
		var row = $('#pbsGrid').treegrid('getSelected');
		var pbsversionId=$('#pbsVsersionId').html();
		if(row!=null&&copyNodeID!=null){
			var pasteNodeId=row.ID;
			$.messager.progress({text:'数据处理中......',interval:'100'}); 
			$.ajax({
				url:basePath+'/structure/copyPbsNodes',
				type:'POST',
				data:{copynodeId:copyNodeID,pbsId:pasteNodeId,pbsversionId:pbsversionId},
				success:function(data){
					$(".datagrid-row[node-id='"+pasteNodeId+"'] .tree-icon").removeClass("tree-file").addClass('tree-folder');
					$(".datagrid-row[node-id='"+pasteNodeId+"'] .tree-icon").prev().removeClass('tree-indent').addClass('tree-hit tree-expanded');
					$('#pbsGrid').treegrid('reload',pasteNodeId);
					$.messager.progress('close'); 
					MyMessager.slide.show("提示", data.info); 
				}
			});
		}else{
			$.messager.alert('提示',"未存在粘贴的节点数据！");
		}	
	}else{
		$.messager.alert('提示',"非草稿节点数据不能进行复制粘贴！");
	}
}
//批量保存
function save(){
	if($('.validatebox-invalid').length>0){
		$.messager.alert('提示',"请先按格式输入数据再操作！");
	}else{
		$('#pbsGrid').treegrid('endEdit',editingId);
		var changeRows=$('#pbsGrid').treegrid('getChanges','updated');
		var obj = new Object();
		obj.pbsversionId=$('#pbsVsersionId').html();
		obj.oper="UPDATE";
		obj.exist=false;
		var map = {};
		for(i in changeRows){
				obj.exist=true;
				obj["pbsNodeVOList[" +i+"].id"] = changeRows[i].ID;
				obj["pbsNodeVOList["+i+"].prjMmId"]=changeRows[i].PRJMMID;
				obj["pbsNodeVOList["+i+"].nodeCode"]=changeRows[i].NODECODE;
				obj["pbsNodeVOList["+i+"].qty"]=changeRows[i].QTY;
				obj["pbsNodeVOList["+i+"].qtyUnitId"]=changeRows[i].QTYUNITID;
				obj["pbsNodeVOList["+i+"].usage"]=changeRows[i].USAGE;
				obj["pbsNodeVOList["+i+"].prjMaterialName"]=changeRows[i].PRJMATERIALNAME;
				obj["pbsNodeVOList["+i+"].remark"]=changeRows[i].REMARK;
				obj["pbsNodeVOList["+i+"].productScheme"]=changeRows[i].PRODUCTSCHEME;
				obj["pbsNodeVOList["+i+"].processScheme"]=changeRows[i].PROCESSSCHEME;
				obj["pbsNodeVOList["+i+"].editStatus"]=changeRows[i].EDITSTATUS;
		}
		if(obj.exist){
				$.ajax({
				url:basePath+'/structure/handlePbsTree',
				type:'POST',
				data:obj,
				success:function(data){
					$('#pbsGrid').treegrid('acceptChanges')
					MyMessager.slide.show("提示", data.info); 
				}
			});
		}else{
			$('#pbsGrid').treegrid('endEdit',editingId);
			MyMessager.slide.show("提示","未存在需要保存的数据！"); 
		}
	}
}
//PBS节点删除
function deletePbsNode(){
	if(checkPbsStructureStatus()==0){
			var changeRows=$('#pbsGrid').treegrid('getChanges','updated');
			if(changeRows!=null&&changeRows.length>0){
				$.messager.alert('提示',"存在修改的数据未保存，请先保存后再执行该操作！");
			}else{
				var row = $('#pbsGrid').treegrid('getSelected');
				if(row==null||row.length==0){
					$.messager.alert('提示',"未存在需要删除的节点数据！");
				}else{
				 $.messager.confirm('提示','确定删除该节点及子节点？',function(r){
					if (r){
						$.messager.progress({text:'数据处理中......',interval:'100'}); 
						var obj=new Object();
						obj["pbsNodeList[0].id"] = row.ID;
						obj["pbsNodeList[0].parentId"] = row.PARENTID;
						obj.pbsversionId= $('#pbsVsersionId').html();
						obj.projectId='1',
						obj.oper='DEL';
						$.ajax({
							url:basePath+'/structure/handlePbsTree',
							type:'POST',
							data:obj,
							success:function(data){
								if(data.status){
									$('#pbsGrid').treegrid('clearSelections')
									$('#pbsGrid').treegrid('remove',row.ID);
									var children=$('#pbsGrid').treegrid('getChildren',row.PARENTID);
									if(children.length==0){
										$('#pbsGrid').treegrid('update',{
												id: row.PARENTID,
												row: {
													isleaf:true,
												}
											});
									}
									queryTabInfo();
									MyMessager.slide.show("提示", data.info); 
								}else{
									$.messager.alert('提示',data.info);
								}
								$.messager.progress('close'); 
							}
						});
					}
				});
				}
			}
	}else{
		$.messager.alert('提示',"非草稿节点数据不能删除！");
	}
}
//PBS 参数加载
function queryPbsNodeParams(){
	var selectedRow=$('#pbsGrid').treegrid('getSelected');
	if(selectedRow==null){
		$('#params').datagrid('loadData',{total:0,rows:[]});
	}else{
		$('#params').datagrid({
			url:basePath+'/structure/getPbsItemInfo',
			width:"100%",
			height:"100%",
			columns:[[
				{field:'ATTRNAME',title:'属性名称',width:'20%',formatter:function(value,row,index){
					if(row.ISNOTNULL=='1'){
						return '<span>'+value+'<span style="color:red;">*</span></span>';
					}else{
						return value;
					}
				}},
				{field:'ATTRVALUE',title:'属性值',width:'30%',editor:{type:"validatebox",options:{required:true}}},
				{field:'ATTRUNITID',title:'属性单位',width:'30%',editor:{type:"combobox",options:{valueField:"ID",textField:"UNITNAME"}},
					formatter:function(value,row,index){
						if(unitListMap[value]==null||unitListMap[value]==undefined){
							return value;
						}
						return unitListMap[value];
				}},
				{field:'handle',title:'操作',width:'19%',formatter:function(value,row,index){
						if($('.status-info.status-info-0').length>0){
							return '<button type="button" onclick="handleParamsClick(\''+row.ATTRVALUEID+'\','+index+');" class="disabled handleParams_'+row.ATTRVALUEID+'  btn btn-default"><i class="icon-pencil">编辑</i></button>';	
						}else{
							return '<button type="button" class="disabled handleParams_'+row.ATTRVALUEID+'  btn btn-default"><i class="icon-lock"></i></button>';	
						}		
				}}
			]],
			singleSelect:true,
			onBeforeEdit: function(index,row) {
					var isMust=false; 
					if(row.ISNOTNULL=='1'){
						isMust=true; 
					}
					var col = $(this).datagrid("getColumnOption", "ATTRVALUE");
					if (row.TYPE == "bool") { // bool
						$.extend(col.editor.options,{
							type: "combobox",
							panelHeight:"auto",
							valueField:"value",
							textField:"value",
							required:isMust,
							data:[{
									value:"是"
							},{
									value:"否"
							}]
							});
					}else if (row.TYPE == "enumerate") { // enum
						if (row.DRIVENATTRID) {
							var rows = $(this).datagrid("getRows");
							var drivenValue;
							for (var i in rows) {
								if (rows[i].ATTRID == row.DRIVENATTRID) {
									drivenValue = rows[i].ATTRVALUE;
									break;
								}
							}
							if (drivenValue != undefined) {
								col.editor = {
									type: "combobox",
									options: {
										url:basePath+'/mmlist/getEnumerateValues',
										queryParams:{
											attrId: row.ATTRID,
											drivenValue: drivenValue
										},
										panelHeight:"auto",
										panelMaxHeight:120,
										textField:"value",
										valueField:"value",
										required:isMust,
										formatter:function(record) {
											if (record.isDefault) {
												return record.value + "&nbsp(默认值)";
											} else {
												return record.value;
											}
										}
									}
								};
							} else {
								col.editor = {
									type: "textbox",
									options: {
										prompt: "请先填写级联属性值",
										disabled: true
									}
								}
							}
						} else {
							col.editor = {
								type:"combobox",
								options:{
									url:basePath+'/mmlist/getEnumerateValues',
									queryParams:{
										attrId: row.ATTRID
									},
									panelHeight:"auto",
									panelMaxHeight:120,
									textField:"value",
									valueField:"value",
									required:isMust,
									formatter: function(record) {
										if (record.isDefault) {
											return record.value + "&nbsp(默认值)";
										} else {
											return record.value;
										}
									}
								}
							};
						}
					} else if (row.TYPE == "date") { // 日期
						$.extend(col.editor.options,{type:"datebox",required:isMust,});
					} else if (row.TYPE == "char") { // 字符
						$.extend(col.editor.options,{
							type: "validatebox",
							required:true,
							validType: {length:[0, row.LENGTH]}
							});
					} else if (row.TYPE =="number") { // 数字
						$.extend(col.editor.options,{
							type: "validatebox",
							required:isMust,
							missingMessage:row.ATTRNAME+'必填！',
							validType: "intOrFloat"
						});
					}
				},
			onBeginEdit: function(index,row) {
				   var unitEditor = $(this).datagrid("getEditor", {index:index,field: "ATTRUNITID"});
				   if (row.ATTRUNITTYPEID != undefined) {
						$(unitEditor.target).combobox("loadData",unitList);
					} else {
						$(unitEditor.target).combobox("destroy");
					}
				},
			queryParams:{
				 prjmmid:function(){
					  if(selectedRow==null){
						  return "";
					  }else{
						  return selectedRow.PRJMMID;
					  }
				},
				type:function(){
					return "PA";
				},
				pbsversionId:function(){
					return $('#pbsVsersionId').html();
				}
			},
			onAfterEdit:function(rowIndex, rowData, changes){
				if(unitListMap[rowData.ATTRUNITID]==undefined){
					rowData.ATTRUNITNAME=rowData.ATTRUNITID;
					rowData.ATTRUNITID="";
				}else{
					rowData.ATTRUNITNAME=unitListMap[rowData.ATTRUNITID];
				}
				saveParams(rowData);
				//面板启用
				disableOrEnableTab('enableTab');
			}
			});
	}

}
//节点参数Click
function handleParamsClick(attrvalueid,index){
	if($('.handleParams_'+attrvalueid+' i').hasClass('icon-pencil')){
		if($('.status-info.status-info-2').length>0){
			$.messager.alert('提示',"审批中或者已发布数据，不能进行修改！");
		}else{
			editParams(attrvalueid,index);
		}
		return ;
	}
	if($('.handleParams_'+attrvalueid+' i').hasClass('icon-save')){
		validateParams();
		return ;
	}
}
//tab 启用和禁用
function disableOrEnableTab(flag){
	//面版启用
	var selectTab=$('#pbs-iteam-info').tabs('getSelected');
	var selectTabIndex=$('#pbs-iteam-info').tabs('getTabIndex',selectTab);
	for(var i=0;i<3;i++){
		if(selectTabIndex!=i){
				$('#pbs-iteam-info').tabs(flag,i);
		}
	}
}
//pbs节点参数编辑
function  editParams(attrvalueid,index){
	var changeRows=$('#pbsGrid').treegrid('getChanges','updated');
	if(changeRows.length>0){
		$.messager.alert('提示',"PBS节点存在未保存的数据！");
	}else if(editingIndex!=undefined){
		$.messager.alert('提示',"参数存在未保存的数据！");
	}else{
		//面板禁用
		disableOrEnableTab('disableTab');
		$('.handleParams_'+attrvalueid+' i').removeClass('icon-pencil').addClass('icon-save').html('保存');
		editingIndex = index;
		$('#params').datagrid('beginEdit',index);
	}
}
//pbs节点参数保存
function saveParams(row){
    var obj=new Object();
	if(row.FLAG=='P'){
		obj["prjAttrValueVOList[0].id"] = row.PROJATTRVALUEID;
	}
	obj["prjAttrValueVOList[0].flag"]=row.FLAG;
	obj["prjAttrValueVOList[0].attrId"]=row.ATTRID;
	obj["prjAttrValueVOList[0].attrUnitId"]=row.ATTRUNITID;
	obj["prjAttrValueVOList[0].attrUnitName"]=row.ATTRUNITNAME;
	obj["prjAttrValueVOList[0].prjMmId"]=row.PRJMMID;
	obj["prjAttrValueVOList[0].attrValue"]=row.ATTRVALUE;
	$.ajax({
		url:basePath+'/structure/updatePbsNodeAttr',
		type:'POST',
		data:obj,
		beforeSend:function() {
			MyMessager.prog.show("提示", "请等待", "处理中...");
		},
		complete:function(jqXHR, textStatus) {
			MyMessager.prog.close();
		},
		success:function(data){
			$.messager.progress('close'); 
			editingIndex=undefined;
			$('#params').datagrid("reload");
			$('.handleParams_'+row.ATTRVALUEID+' i').removeClass('icon-save').addClass('icon-pencil').html('编辑');
			MyMessager.slide.show("提示", data.info); 
		}
	});
}
//pbs节点参数验证
function validateParams(){
	if(editingIndex!=undefined){
		if($('.validatebox-invalid').length>0){
			$.messager.alert('提示',"请按格式输入数据后保存！");
		}else{
			$('#params').datagrid('endEdit',editingIndex);
		}
	}
}
//tabs 选中事件
function queryTabInfo(){
	$('#pbs-iteam-info').tabs({   
	  	border:false,   
	  	onSelect:function(title){  
			if(title=='文件列表'){
			  queryPbsAttachment();   
			}
			if(title=='参数'){
			  queryPbsNodeParams();
			}
			if(title=='参考项目'){
				queryPbsTraceProject();
			}
		}
	});
	var selectTab = $('#pbs-iteam-info').tabs('getSelected');
	var title=selectTab.panel('options').title;
	if(title=='文件列表'){
		queryPbsAttachment();   
	}
	if(title=='参数'){
		queryPbsNodeParams();
	}
	if(title=='参考项目'){
	    queryPbsTraceProject();
	}
}
//PBS参考项目加载
function queryPbsTraceProject(){
	var selectedRow=$('#pbsGrid').treegrid('getSelected');
	if(selectedRow==null){
		$('#relproject').datagrid('loadData',{total:0,rows:[]});
	}else{
		$('#relproject').datagrid({
			url:basePath+'/structure/getPbsItemInfo',
			width:"100%",
			height:"100%",
			columns:[[
				{field:'PRJMATERIALNAME',title:'参考子项名称',width:'25%'},
				{field:'PROJECTNAME',title:'参考子项所属项目名称',width:'25%'},
				{field:'PROJECTNUM',title:'项目编号',width:'25%'},
				{field:'PROJECTSTAGE',title:'阶段',width:'20%'}
			]],
			queryParams:{
				prjmmid:function(){
					if(selectedRow==null){
						return "";
					}else{
						return selectedRow.PRJMMID;
					}
				},
				type:function(){
					return "PR";
				}
			}
		}); 
	}
}
//PBS文件列表加载
function queryPbsAttachment(){
	var selectedRow=$('#pbsGrid').treegrid('getSelected');
	if(checkPbsStructureStatus()==0){
		$('#uploadAttachment').linkbutton("enable");
	}else{
		$('#uploadAttachment').linkbutton("disable");
	}
	if(selectedRow==null){
	  $('#uploadAttachment').linkbutton("disable");
	  $('#fileList').datagrid('loadData',{total:0,rows:[]});
	}else{
	  $('#fileList').datagrid({
		url:basePath+'/pbsCommonController/queryAttachment',
		toolbar:"#fileList_tb",
		width:"100%",
		height:"100%",
		columns:[[
			{field:'fileName',title:'文件名称',width:'70%'}, 
			{field:'handle',title:'操作',width:'25%',formatter:function(value,row,index){
				if(checkPbsStructureStatus()==0){
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id + '\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'+'<button type="button" onclick="delAttachment(\''+row.id+'\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>';
				}else{
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id + '\');" class="btn btn-default"><i class="icon-download"></i>下载</button>';
				}
			}}
		]],
		queryParams:{
			 targetId:function(){
				  if(selectedRow==null){
					  return "";
				  }else{
					  return selectedRow.ID;
				  }
			},
			targetType:function(){
				return 0;
			}
		}
	});
	}
}
//添加物料对话框
function materialDialog(){
	if(checkPbsStructureStatus()==0){
		if($('.validatebox-invalid').length>0){
			$.messager.alert('提示',"请先按格式输入数据再添加！");
		}else{
			$('#pbsGrid').treegrid('endEdit',editingId);
			var single=true;
			var roots=$('#pbsGrid').treegrid('getRoots');
			var href=basePath+"/pbsCommonController/buildMarerialListDiglog?filters=CON,EQ,NEQ,IM,SER,FEE";
			if(roots==null||roots.length==0){
				href=basePath+"/pbsCommonController/buildMarerialListDiglog?type=true&filters=CON,EQ,NEQ,IM,SER,FEE";
			}
			$('#materialdlg').dialog({
				buttons: [
						{
							text:'关闭',
							iconCls:'icon-remove',
							handler:function(){
								$('#materialdlg').dialog("close");
							}
						},
						{
							text:'添加',
							iconCls:'icon-ok',
							handler:function(){
								addMaterial();
							}
						}],
				closed:false,
				href:href,
				top:100
			});
		}
	}else{
		$.messager.alert('提示',"非草稿状态不能进行添加节点数据！");
	}
}
//物料添加
function addMaterial(){
	var parentId="";
	var selectedNode=$('#pbsGrid').treegrid('getSelected')
	if(selectedNode!=null){
		parentId=selectedNode.ID;
	}
	var selectTab = $('.easyui-tabs.enfi-common').tabs('getSelected');
	var title=selectTab.panel('options').title;
	if(title=='物料库'){
		var checkList=$("#materialList").datagrid("getChecked");
		if(checkList.length==0){
			MyMessager.alert.show('提示',"请先选择物料!");
		}else{
			var obj = new Object();
			for(i in checkList){
				obj["materialVOList[" + i + "].id"] = checkList[i].ID;
				obj["materialVOList["+i+"].materialCode"]=checkList[i].MATERIALCODE;
				obj["materialVOList["+i+"].materialName"]=checkList[i].MATERIALNAME;
				obj["materialVOList["+i+"].mmCategoryCode"]=checkList[i].MMCATEGORYCODE;
				obj["materialVOList["+i+"].mmCategory"]=checkList[i].MMCATEGORY;
				obj["materialVOList["+i+"].mmCategoryId"]=checkList[i].MMCATEGORYID;
				obj["materialVOList["+i+"].params"]=checkList[i].PARAMS;
				obj["materialVOList["+i+"].unitId"]=checkList[i].UNITID;
				obj["materialVOList["+i+"].unitName"]=checkList[i].UNITNAME;
				obj["materialVOList["+i+"].remark"]=checkList[i].REMARK;	
			}
			obj.pbsversionId= $('#pbsVsersionId').html();
			obj.oper="ADD";
			obj.id=parentId;
			$.ajax({
				url:basePath+'/structure/handlePbsTree',
				data:obj,
				type:"POST",
				beforeSend:function() {
					MyMessager.prog.show("提示", "请等待", "处理中...");
				},
				complete:function(jqXHR, textStatus) {
					MyMessager.prog.close();
				},
				success:function(data){
					$(".datagrid-row[node-id='"+obj.id+"'] .tree-icon").removeClass("tree-file").addClass('tree-folder');
					$(".datagrid-row[node-id='"+obj.id+"'] .tree-icon").prev().removeClass('tree-indent').addClass('tree-hit tree-expanded');
					if(parentId==""||parentId==null){
						$('#pbsGrid').treegrid('reload');
						$("#materialList").datagrid("options").singleSelect=false;
					}else{
						$('#pbsGrid').treegrid('reload',obj.id);
					}
					MyMessager.slide.show("提示", data.info); 
				}
			});
		}
	}else if(title=='模板库'){
		var checkNodes=queryCheckedPbsNodes();
		var number=0;
		if(checkNodes.exist==false){
			$.messager.alert('提示',"请先选择节点！");
		}else{
			var obj=new Object();
			for(i=0;i<checkNodes.checkFull.length;i++){
				obj["pbsNodeVOList["+i+"].id"] = checkNodes.checkFull[i].ID;
				obj["pbsNodeVOList["+i+"].parentId"]=checkNodes.checkFull[i].PARENTID;
				obj["pbsNodeVOList["+i+"].flag"]="full";
				number++;
			}
			for(i=0;i<checkNodes.checkPart.length;i++){
				obj["pbsNodeVOList["+number+"].id"] = checkNodes.checkPart[i].ID;
				obj["pbsNodeVOList["+number+"].parentId"]=checkNodes.checkPart[i].PARENTID;
				obj["pbsNodeVOList["+number+"].flag"]="part";
				number++;
			}
			obj.versionId=$('#pbsVsersionId').html();
			obj.parentId=parentId;
			$.ajax({
				url:basePath+'/structure/addPbsTemplateNodesToPbs',
				data:obj,
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示", "请等待", "处理中...");
				},
				complete:function(jqXHR, textStatus) {
					MyMessager.prog.close();
				},
				success:function(data){
					if(data.status){
						$(".datagrid-row[node-id='"+obj.parentId+"'] .tree-icon").removeClass("tree-file").addClass('tree-folder');
						$(".datagrid-row[node-id='"+obj.parentId+"'] .tree-icon").prev().removeClass('tree-indent').addClass('tree-hit tree-expanded');
						if(parentId==""||parentId==null){
							$('#pbsGrid').treegrid('reload');
						}else{
							$('#pbsGrid').treegrid('reload',obj.parentId);
						}
						MyMessager.slide.show("提示", data.info); 
					}else{
						MyMessager.alert.show('提示',data.info);
					}
				}
			});
		}
	}
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
			url : basePath+'/pbsCommonController/uploadAttachment',
			type : "POST",
			dataType : "json",
			data : {
				fileIds : fileIds,
				targetId:function(){
					  var selectedRow=$('#pbsGrid').treegrid('getSelected');
					  if(selectedRow==null){
						  return "";
					  }else{
						  return selectedRow.ID;
					  }
				},
				targetType:0,
			},
			success : function(data) {
				$('#fileList').datagrid('reload');
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
	$.messager.confirm('提示','你确定要删除该附件信息?',function(r){
		if (r){
				$.ajax({
				url:basePath+'/pbsCommonController/deleteAttachment',
				type:'POST',
				data:{ids:fileId},
				success:function(data){
					$('#fileList').datagrid('reload');
					MyMessager.slide.show("提示","数据处理成功！"); 
				}
			});
		}
	});
}
//发布子项
function launchExaminations(){
	$('#pbsGrid').treegrid('endEdit',editingId);
	var changeRows=$('#pbsGrid').treegrid('getChanges','updated');
	var obj = new Object();
	obj.pbsversionId=$('#pbsVsersionId').html();
	obj.oper="UPDATE";
	obj.exist=false;
	var map = {};
	for(i in changeRows){
		obj.exist=true;
		obj["pbsNodeVOList[" +i+"].id"] = changeRows[i].ID;
		obj["pbsNodeVOList["+i+"].prjMmId"]=changeRows[i].PRJMMID;
		obj["pbsNodeVOList["+i+"].nodeCode"]=changeRows[i].NODECODE;
		obj["pbsNodeVOList["+i+"].qty"]=changeRows[i].QTY;
		obj["pbsNodeVOList["+i+"].qtyUnitId"]=changeRows[i].QTYUNITID;
		obj["pbsNodeVOList["+i+"].usage"]=changeRows[i].USAGE;
		obj["pbsNodeVOList["+i+"].prjMaterialName"]=changeRows[i].PRJMATERIALNAME;
		obj["pbsNodeVOList["+i+"].remark"]=changeRows[i].REMARK;
		obj["pbsNodeVOList["+i+"].productScheme"]=changeRows[i].PRODUCTSCHEME;
		obj["pbsNodeVOList["+i+"].processScheme"]=changeRows[i].PROCESSSCHEME;
		obj["pbsNodeVOList["+i+"].editStatus"]=changeRows[i].EDITSTATUS;
	}
	if(obj.exist){
		$.ajax({
			url:basePath+'/structure/handlePbsTree',
			type:'POST',
			data:obj,
			beforeSend:function() {
				MyMessager.prog.show("提示", "请等待", "处理中...");
			},
			complete:function(jqXHR, textStatus) {
				MyMessager.prog.close();
			},
			success:function(data){
				$('#pbsGrid').treegrid('acceptChanges')
				$('#save-pbsnode').linkbutton('disable');
				var root=$('#pbsGrid').treegrid('getRoot')
				var flag="2";
				if($('.status-info.status-info-0').length>0){
					flag="2";
				}else if($('.status-info.status-info-2').length>0){
					flag="0";
				}else{
					flag="0";
				}
				$.ajax({
					url:basePath+'/structure/launchExaminations',
					type:'POST',
					data:{rootId:root.ID,flag:flag},
					beforeSend:function() {
						MyMessager.prog.show("提示", "请等待", "处理中...");
					},
					complete:function(jqXHR, textStatus) {
						MyMessager.prog.close();
					},
					success:function(data){						
						if(data.status){
							$('#pbsGrid').treegrid('reload');
							changePbsStructureStatus(flag);
							MyMessager.slide.show("提示", data.info); 
							//获取选中TAB
							var selectTab = $('#pbs-iteam-info').tabs('getSelected');
							var title=selectTab.panel('options').title;
							queryTabInfo(title);
						}else{
							MyMessager.alert.show('提示',data.info);
						}
					}
				});
			}
		});
	}else{
		var root=$('#pbsGrid').treegrid('getRoot')
		var flag="2";
		if($('.status-info.status-info-0').length>0){
			flag="2";
		}else if($('.status-info.status-info-2').length>0){
			flag="0";
		}else{
			flag="0";
		}
		$.ajax({
			url:basePath+'/structure/launchExaminations',
			type:'POST',
			data:{rootId:root.ID,flag:flag},
			beforeSend:function() {
				MyMessager.prog.show("提示", "请等待", "处理中...");
			},
			complete:function(jqXHR, textStatus) {
				MyMessager.prog.close();
			},
			success:function(data){
				if(data.status){
					$('#pbsGrid').treegrid('reload');
					changePbsStructureStatus(flag);
					MyMessager.slide.show("提示", data.info); 
					//获取选中TAB
					var selectTab = $('#pbs-iteam-info').tabs('getSelected');
					var title=selectTab.panel('options').title;
					queryTabInfo(title);
				}else{
					MyMessager.alert.show('提示',data.info);
				}
			}
		});
	}
}
//判断PBS发布或者草稿状态
function checkPbsStructureStatus(){
	//草稿
	if($('.status-info.status-info-0').length>0){
			return 0;
	//发布
	}else if($('.status-info.status-info-2').length>0){
			return 2;
	}else{
			return 0;
	}
}
//发布和草稿切换 0：设置为草稿，2设置为发布，其他
function changePbsStructureStatus(flag){
	//设置为草稿
	if(flag==0){
		$('.status-info').removeClass('status-info-2').addClass('status-info-0').html('草稿');
		canEdit=true;
		$('#draft').linkbutton('disable');
		$('#launchExaminations').linkbutton('enable');
	}else{
		$('.status-info').removeClass('status-info-0').addClass('status-info-2 ').html('审批完成');
		$('#draft').linkbutton('enable');
		$('#launchExaminations').linkbutton('disable');
	}	
}