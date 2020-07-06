var statusData=[{"value":"1","text":"有效"},{"value":"0","text":"无效"}];
var statusDataMap=new Array();
var basePath=$(".basePath").attr('basePath');
var editIndex=undefined;
var eventFunction=undefined;
$(function(){
    statusDataMap[0]="无效";
	statusDataMap[1]="有效";
	queryPbsTemplateList();
});
//查询PBS模板列表
function queryPbsTemplateList(){
	$('#pbs_template_list').datagrid({
	    url:basePath+'/templateMng/getTemplateList',
		singleSelect:true,
		height:"100%",
		width:"100%",
		toolbar: "#pbs_template_list_tb",
		idField: 'ID',
		queryParams:{
			key:function(){
				return $('#searchTemplate_name').searchbox('getValue');
			}
		},
	    columns:[[
	        {field:'CODE',title:'模板编号',width:'10%',},
	        {field:'NAME',title:'模板名称',width:'25%',editor:{type:'validatebox',options:{validType:'text',required:true}}},
	        {field:'STATUS',title:'状态',width:'30%',editor: {type: 'combobox',options:{data: statusData, valueField: "value", textField: "text" }},formatter:function(value,row,index){
				if(statusDataMap[value]==null){
					return "";
				}else{
					return statusDataMap[value];
				}
			}},
			{field:'REMARK',title:'备注',width:'30%',editor:'text'}
	    ]],
		onBeginEdit:function(index){
			editIndex=index;
		},
		onAfterEdit:function(rowIndex,rowData,changes){
			var flag="update";
			if(rowData.ID==""||undefined==rowData.ID){
				flag="add";
			}
			submmitPbsTemplateData(flag);
			editIndex=undefined;
		},
		onLoadSuccess:function(data){
			if(eventFunction!=undefined){
				switch(eventFunction){
					case 'AutoUpdate':editPbsTemplate();break;
					case 'AutoAdd': addPbsTemplate();break;
					default:break;
				}
			}
			var selectRow=$('#pbs_template_list').datagrid("getSelected");
			//未选中，默认选中第一行
			if(editIndex!=undefined){
				$('#pbs_template_list').datagrid('selectRow',editIndex);
			}else{	
				$('#pbs_template_list').datagrid('selectRow',0);
			}
		},
		onDblClickRow:function(){
			editPbsTemplate();
		},
		onClickRow:function(){
			if(editIndex!=undefined){
				$('#pbs_template_list').datagrid('endEdit',editIndex);
			}
		}
	});
}
//数据保存
function saveData(){
	if($('.grid-data .validatebox-invalid').length>0){
		$('#pbs_template_list').datagrid('selectRow',editIndex);
		$.messager.alert('提示',"请按格式填写数据后在操作！");
	}else{
		if(editIndex==undefined){
			MyMessager.slide.show("提示","未存在需要保存的数据！"); 	
		}else{
			$('#pbs_template_list').datagrid('endEdit',editIndex);	
			$('#pbs_template_list').datagrid('selectRow',editIndex);
		}
	}
}

//模板添加
function addPbsTemplate(){
	if(editIndex==undefined){
		eventFunction=undefined;
		//直接添加，在末尾添加一行
		$('#pbs_template_list').datagrid('appendRow',{});
		var rows=$('#pbs_template_list').datagrid('getRows');
		var index=$('#pbs_template_list').datagrid('getRowIndex',rows[rows.length-1]);
		$('#pbs_template_list').datagrid('beginEdit',index);	
		$('#pbs_template_list').datagrid('selectRow',index);
		editIndex=index;
	}else{
		//先保存编辑中数据，再添加数据
		eventFunction='AutoAdd';
		$('#pbs_template_list').datagrid('endEdit',editIndex);
	}
}
//数据修改
function editPbsTemplate(){
	if(editIndex==undefined){
		eventFunction=undefined;
		//直接编辑选择行
		var selectRow=$('#pbs_template_list').datagrid("getSelected");
		var index=$('#pbs_template_list').datagrid("getRowIndex",selectRow);
		$('#pbs_template_list').datagrid('beginEdit',index);	
	}else{
		//先保存编辑中数据，再添加数据
		eventFunction='AutoUpdate';
		$('#pbs_template_list').datagrid('endEdit',editIndex);
	}
}
//数据提交
function submmitPbsTemplateData(flag){
	var obj = new Object();
	obj.exist=false;
	//flag-->add:新建保存；update:更新保存
	var changeRows=$('#pbs_template_list').datagrid("getChanges");
	for(i in changeRows){
		obj.exist=true;
		obj["pbsTemplateList[" +i+"].id"]=changeRows[i].ID;
		obj["pbsTemplateList[" +i+"].code"]=changeRows[i].CODE;
		obj["pbsTemplateList[" +i+"].name"]=changeRows[i].NAME;
		obj["pbsTemplateList[" +i+"].status"]=changeRows[i].STATUS;
		obj["pbsTemplateList[" +i+"].remark"]=changeRows[i].REMARK;
	}
	//存在数据需要提交
	if(obj.exist){
		var url=basePath+'/templateMng/addTemplate';
		if(flag=="update"){
			url=basePath+'/templateMng/updateTemplate';
		}
		$.ajax({
			url:url,
			type:'POST',
			data:obj,
			success:function(data){
				if(data.status){
					 $('#pbs_template_list').datagrid('acceptChanges')
					 $('#pbs_template_list').datagrid('reload');
					 MyMessager.slide.show("提示", data.info); 
				}else{
					 $('#pbs_template_list').datagrid('beginEdit',editIndex);
					 $('#pbs_template_list').datagrid('selectRow',editIndex);
					 $.messager.alert('提示',data.info);
				}
			}
		});
	}
}
//删除行数据
function delPbsTemplateData(){
	var selectRow=$('#pbs_template_list').datagrid("getSelected");
	if(selectRow==null){
		MyMessager.slide.show("提示","请先选中需要删除的行数据！"); 	
	}else{
		$.messager.confirm('提示','你确定要删除该模板数据?',function(r){
			if (r){
						var selectRows=$('#pbs_template_list').datagrid("getSelections");
						var ids="";
						for(i in selectRows){
							ids+=selectRows[i].ID+",";
						}
						if(ids=="undefined,"){
							$('#pbs_template_list').datagrid('acceptChanges')
							for(var i=selectRows.length-1;i>=0;i--){
								var index= $('#pbs_template_list').datagrid('getRowIndex',selectRows[i]);
								$('#pbs_template_list').datagrid('deleteRow',index);
							}	
							 editIndex=undefined;
							 eventFunction=undefined;
						}else{
						 $.ajax({
							url:basePath+'/templateMng/delTemplate',
							data:{ids:ids},
							type:'POST',
							success:function(data){
								if(data.status){
									 for(var i=selectRows.length-1;i>=0;i--){
										var index= $('#pbs_template_list').datagrid('getRowIndex',selectRows[i]);
										 $('#pbs_template_list').datagrid('deleteRow',index);
									 }
									 $('#pbs_template_list').datagrid('selectRow',0);
									 $('#pbs_template_list').datagrid('acceptChanges')
									 MyMessager.slide.show("提示", data.info); 
								}else{
									 $.messager.alert('提示',data.info);
								}
							}
						});	
						}
			}
		});
	}
}
//跳转PBS策划页面
function hrefPbsNodeView(){
	var selectRow=$('#pbs_template_list').datagrid("getSelected");
	if(selectRow==null){
		MyMessager.slide.show("提示","未选中PBS模板！"); 	
	}else if(selectRow.ID==null||selectRow.ID==undefined){
		MyMessager.slide.show("提示","请先保存PBS模板后在进行PBS结构策划"); 
	}else{
		location.href =basePath+"/pbsStructure/pbsView?pbsVsersionId="+selectRow.VERSIONID;
	}
}