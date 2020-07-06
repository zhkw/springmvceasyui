var flag = true;
var editIndex;
var basePath;
$(function(){
	basePath = $("#basePath").val();
	var projectId = $("#projectId").val();
	var stageCODE = $("#stageCODE").val();
	
 	var treeGridOptions = {
		width: '99%',
        height: '800px',
        idField:'ID',    
        treeField:'NAME',
        border:true,
        singleSelect: true,
        columns: [[
        {
        	field: "ck",
        	checkbox:true
        },
        {
        	title: '阶段名称',
            field: 'NAME',
            width: "17%",
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
            align: "left"
        },
        {
        	title: '创建时间',
            field: 'CREATETIME',
            width: "10%",
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
            width: "10%",
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
        	title: '为当前造价指标使用数据',
            field: 'CTIsInUse',
            width: "12%",
            halign: "center",
            align: "left",
            formatter:function(value,row,index){
            	var str = "";
            	if(row.ISEDITABLE == 0 && row.CTIsInUse&&row.CTIsInUse == true){
            		var str = "是";
            	}
            	return str;
            }
        },
        {
        	title: '数据来源',
            field: 'DATAFROM',
            width: "10%",
            halign: "center",
            align: "left"
        },
        {
        	title: '操作',
            field: 'opt',
            width: "30%",
            halign: "center",
            align: "left",
            formatter:function(value,row,index){
            	var str = "";
            	if(row.ISEDITABLE == 1){
            		str ="<a  class='easyui-linkbutton tableBtn'  onclick=editPbs" +
        				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
    						"title='策划子项' ><span>策划子项</span></a>&nbsp;&nbsp;"+
        			"<a  class='easyui-linkbutton tableBtn'  onclick=editPbs" +
            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',2) " +
	            			"title='编制价格' ><span >编制价格</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == null || row.STATUS == 0)){
            		str = "<a  class='easyui-linkbutton tableBtn' onclick=pbsVersionCheck" +
        				"('"+row.ID+"','"+row.PRICEID+"','"+projectId+"',this) " +
            				"title='提交审批' ><span >提交审批</span></a>&nbsp;&nbsp;"+
	            	"<a  class='easyui-linkbutton tableBtn' onclick=pbsVersionView" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"') " +
	            			"title='查看' ><span>查看</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == 1 || row.STATUS == 2) ){
            		str = "<a  class='easyui-linkbutton tableBtn' onclick=pbsVersionView('"+row.ID+"','"+row.PBSROOTNODEID+"') " +
            				"title='查看' ><span >查看</span></a>";
            	}
       	 		return str;
            }
        }
        ]],
        onLoadSuccess:function(data){
        	$(".btnText").css("position","relative");
        	$(".btnText").css("top","5px");
        	$(".tableBtn").linkbutton();
        },
        onDblClickRow : function(row){
        	editIndex = row.ID;
        	if(row.ISEDITABLE == 0){
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
    					$(table).treegrid("acceptChanges");
    					MyMessager.slide.show("提示", "保存成功，消息将在3秒后关闭。");
    				}else{
    					$.messager.alert('提示',"操作失败");
    				}
            	},"json");
	        }
        }
	};
	$('#firstGrid').treegrid($.extend(treeGridOptions,{toolbar: '#firstGrid_tb'}));
	var url = basePath+'/pbsVersion/getPbsInfo';
	$('#firstGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:stageCODE}});
	
	//点击"删除"按钮
	$(".delBtn").click(function(){		
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var row = table.treegrid('getSelected');
		if(checkDel(row)){
			var pbsVersionId = row.ID;
			delVersion(pbsVersionId,table);
		}
	});
	//点击“复制”按钮
	$(".copyBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var row = table.treegrid('getSelected');
		if(checkCopy(row)){
			var pbsVersionId = row.ID;
			$("#copyId").val(pbsVersionId);
			MyMessager.slide.show("提示", "复制成功");
		}
	});
	//点击“粘贴可编辑版”按钮
	$(".pasteEditBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var isEditable = true;
		pasteVersion(table,isEditable);
	});
	//点击“粘贴固化版”按钮
	$(".pasteNoEditBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var isEditable = false;
		pasteVersion(table,isEditable);
	});
	//点击“刷新”按钮
	$(".refreshBtn").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		table.treegrid("reload");
	});
	
	handelLayout();
	
});
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
	$(".outWrapper").css("height",c.height()+5);
}

//编辑结束
function editName(){
	$('#firstGrid').treegrid('endEdit',editIndex);
}
//项目查看
function projectView(projectId){
	//获取项目信息
	getPrjExtendInfo(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//清空所有选择
	$('#firstGrid').treegrid("unselectAll");
	//项目概况
	$.post(basePath+'/project/getProjectSummary','projectId='+projectId,function(obj){
		$(".projectName").html(obj.NAME);
		$("#projectName").val(obj.NAME);
	},'json');
	var url = basePath+'/pbsVersion/getPbsInfo';
	$('#firstGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:stageCODE}});
}
//编辑pbs版本内容 跳转
function editPbs(pbsVersionId,rootNodeId,priceId,code,type){
	var rootBoo = true;
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkRootId",{rootNodeId:rootNodeId},function(obj){
		rootBoo = obj.rs;
	});
	var prjId = $("#projectId").val();
	var url = basePath+"";
	if(type == 1){ //策划子项
		url += "/pbsStructure/pbsViewOfDraft?pbsVsersionId="+pbsVersionId+"&projectId="+prjId;
	}else if(type != 1 && !rootBoo){
		$.messager.alert("提示","请先进行策划子项工作");
		return;
	}else if(type == 2){ //编制价格表
		if(priceId == "null"){
			Utils.ajaxJsonSync(basePath+"/pbsVersion/createPrcieList",
					{pbsVersionId:pbsVersionId},
					function(obj){
				priceId = obj.priceId;
			});
		}
		url += "/priceList/priceEditView?pbsVersionId="+pbsVersionId+"" +
				"&rootNodeId="+rootNodeId+"&priceListId="+priceId+"&code="+code+"&projectId="+prjId+"&versionMgn=T";
	}
	window.location.href=url;
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
					table.treegrid("load");
					MyMessager.slide.show("提示", "删除成功，消息将在3秒后关闭。");
				}else{
					$.messager.alert('提示',"操作失败");
				}
			},"json");
		}
	});
}
//验证删除
function checkDel(row){
	return true;
	var boo = true;
	if(row == null){
		$.messager.alert('提示',"请选择要删除的固化版本【草稿】");
		boo = false;
	}else if(row.ISEDITABLE != 0||row.STATUS == 1 || row.STATUS == 2){
		$.messager.alert('提示',"只能删除的固化版本【草稿】");
		boo = false;
	}
	return boo;
}
//校验复制
function checkCopy(row){
	var boo = true;
	if(row == null || row.ISEDITABLE == undefined || row.CREATETIME == undefined){
		$.messager.alert('提示',"请选择一个具体的版本");
		return false;
	}
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: row.ID},function(obj){
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
			$.messager.alert('提示',"还未编制价格");
			boo = false;
		}
//		else if(obj.rs == 5){
//			$.messager.alert('提示',"价格表正在审批中");
//			boo = false;
//		}
	},function(){
		boo = false;
	});
	return boo;
}
//粘贴  table  表格对应jQuery对象
function pasteVersion(table,isEditable){
	//pbs版本Id
	var pbsVersionId = $("#copyId").val();
	//pbs版本code
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
						table.treegrid("load");
						MyMessager.slide.show("提示", "粘贴成功");
					}else if(obj.rs == 2){
						$.messager.alert('提示',"你想复制自己吗？");
					}else{
						$.messager.alert('提示',"粘贴失败");
					}
				},"json");
			}
		});
	}
}
//查看版本信息
function pbsVersionView(pbsVersionId,rootNodeId){
	window.location.href=basePath+"/pbsVersionU/psbVersionView?pbsVersionId="+pbsVersionId
		+"&rootNodeId="+rootNodeId;
}

//提交审批-直接审批通过-生成造价指标数据
function pbsVersionCheck(pbsVersionId,priceId,projectId,obj){
	var tableId = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
	$.messager.progress({interval:100,text:'正在处理中'});
	//审批
	$.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
		$.messager.progress('close');
		if(obj.rs == 0){
			//生成造价指标库数据
			$.post(basePath+"/project/createData","projectId="+projectId+"&typeCode=",function(data){
				if(data.rs == 0){
					//MyMessager.slide.show("提示", "操作成功！");
				}
			},"json");
			MyMessager.slide.show("提示", "审批成功！");
			$("#"+tableId).treegrid("reload");
		}else if(obj.rs == 1){
			$.messager.alert("提示","审批失败");
		};
	},"json");
}
