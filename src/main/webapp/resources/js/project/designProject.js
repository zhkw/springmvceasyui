var projectTypes = new Array();
var productTypes = new Array();
$(function(){
	basePath = $("#basePath").val();
	projectId = $("#projectId").val();
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
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:data,
	    onClick:function(node){
	    	if(node.children == undefined){
	    		$("#copyId").val("");
	    		projectId = node.id;
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
						$("#projectId").val(projectId);
						return;
					}
				}
			}
    		if(data.length > 0){
	    		var id = data[0].children[0].id;
	    		projectView(id);
	    	}
	    }
	});
	Utils.ajaxJson(basePath+"/project/getPrjBaseData",{},function(obj){
		var prjType = obj.prjType;
		for (var i = 0; i < prjType.length; i++) {
			projectTypes[prjType[i].ID] = prjType[i].NAME;
		}
		var proType = obj.productType;
		for (var i = 0; i < proType.length; i++) {
			productTypes[proType[i].ID] = proType[i].NAME;
		}
	});
 	var treeGridOptions = {
		width: '100%',
        height: '100%',
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
            	if(row.ISEDITABLE == 1 && row.CODE != $("#thirdGrid").attr("name")){
            		str ="<a  class='easyui-linkbutton tableBtn edit_pbs' style='display:none;margin-right:10px;'  onclick=editPbs" +
        				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
    						"title='策划子项' ><span>策划子项</span></a>"+
	            	"<a  class='easyui-linkbutton tableBtn edit_list' style='display:none;margin-right:10px;'  onclick=editPbs" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',2) " +
	            			"title='编制物料清单' ><span>编制物料清单</span></a>"+
        			"<a  class='easyui-linkbutton tableBtn edit_exp' style='display:none;margin-right:10px;'  onclick=editPbs" +
            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
	            			"title='编制价格' ><span >编制价格</span></a>";
            	}else if(row.ISEDITABLE == 1){
            		str ="<a  class='easyui-linkbutton tableBtn edit_pbs' style='display:none;margin-right:10px;'  onclick=editPbs" +
    				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
						"title='策划子项' ><span>策划子项</span></a>"+
	    			"<a  class='easyui-linkbutton tableBtn edit_exp' style='display:none;margin-right:10px;'  onclick=editPbs" +
	        			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
	            			"title='编制价格' ><span >编制价格</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == null || row.STATUS == 0)){
            		str = "<a  class='easyui-linkbutton tableBtn submit' style='display:none;margin-right:10px;' onclick=pbsVersionCheck" +
        				"('"+row.ID+"','"+row.PRICEID+"',this) " +
            				"title='发布' ><span >发布</span></a>"+
	            	"<a  class='easyui-linkbutton tableBtn view_version' style='display:none;margin-right:10px;' onclick=pbsVersionView" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
	            			"title='查看' ><span>查看</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == 1 || row.STATUS == 2) ){
            		str = 
            	"<a  class='easyui-linkbutton tableBtn view_version' onclick=pbsVersionView" +
            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
            			"title='查看' ><span>查看</span></a>"+
            	"&nbsp;&nbsp;<a  class='easyui-linkbutton tableBtn submit' style='display:none;margin-right:10px;' onclick=establishEplView" +
        		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+projectId+"') " +
        			"title='测试设备指标库' ><span>测试生成设备指标库</span></a>";
            	}
       	 		return str;
            }
        }
        ]],
        onLoadSuccess:function(data){
        	$(".btnText").css("position","relative");
        	$(".btnText").css("top","5px");
        	//$(".tableBtn").linkbutton();
        	getLimit2();
        	//$(".datagrid-toolbar").css("border","0");
        	//$(".datagrid-wrap").css("border-bottom","1px solid #ddd");
        	//$(".datagrid-body").css("border-left","1px solid #ddd");
        	//$(".datagrid-view2").css("border-right","1px solid #ddd");
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
    					$(table).treegrid("load");
    					MyMessager.slide.show("提示", "保存成功，消息将在3秒后关闭。");
    				}else{
    					$.messager.alert('提示',"操作失败");
    				}
            	},"json")
	        }
        }
	}
	$('#firstGrid').treegrid($.extend(treeGridOptions,{toolbar: '#firstGrid_tb'}));
	$('#secondGrid').treegrid($.extend(treeGridOptions,{toolbar: '#secondGrid_tb'}));
	$('#thirdGrid').treegrid($.extend(treeGridOptions,{toolbar: '#thirdGrid_tb'}));
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
	
})

//项目查看
function projectView(prjId){
	//获取项目信息
	getPrjExtendInfo(prjId);
	$("#projectId").val(prjId);
	projectId =prjId;
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//清空所有选择
	$('#firstGrid').treegrid("unselectAll");
	$('#secondGrid').treegrid("unselectAll");
	$('#thirdGrid').treegrid("unselectAll");
	$('#outEditOfferGrid').treegrid("unselectAll");
	//项目概况
	$.post(basePath+'/project/getProjectSummary','projectId='+projectId,function(obj){
		$("#projectName").html(obj.NAME);
	},'json')
	var url = basePath+'/pbsVersion/getPbsInfo';
	$('#firstGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#firstGrid').attr("name")}}); 
	$('#secondGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#secondGrid').attr("name")}}); 
	$('#thirdGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#thirdGrid').attr("name")}}); 
	getLimit(projectId,1);
}
//编辑pbs版本内容 跳转
function editPbs(pbsVersionId,rootNodeId,priceId,code,type){
	var prjId = $("#projectId").val();
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: pbsVersionId},function(obj){
		if(obj.rs == 4){
			$.messager.alert('提示',"该版本还有未完成的复制任务，请稍后再试...");
		}else{
			var rootBoo = true;
			Utils.ajaxJsonSync(basePath+"/pbsVersion/checkRootId",{rootNodeId:rootNodeId},function(obj){
				rootBoo = obj.rs;
			})
			var url = basePath+"";
			if(type == 1){ //策划子项
				url += "/pbsStructure/pbsViewOfDraft?pbsVsersionId="+pbsVersionId+"&projectId="+prjId;
			}else if(type != 1 && !rootBoo){
				$.messager.alert("提示","请先进行策划子项工作");
				return;
			}else if(type == 2){ //编制物料清单
				url += "/mmlist/materialListEditView?versionId="+pbsVersionId+"&rootNodeId="+rootNodeId+"&projectId="+prjId;
			}else if(type == 3){ //策划人工时
				url += "/manHour/manHourLayoutView?pbsVersionId="+pbsVersionId+"&projectId="+prjId;
			}else if(type == 4){ //编制价格表
				if(priceId == "null"){
					Utils.ajaxJsonSync(basePath+"/pbsVersion/createPrcieList",
							{pbsVersionId:pbsVersionId},
							function(obj){
						priceId = obj.priceId;
					});
				}
				url += "/priceList/priceEditView?pbsVersionId="+pbsVersionId+"" +
						"&rootNodeId="+rootNodeId+"&priceListId="+priceId+"&code="+code+"&projectId="+prjId;
			}
			window.location.href=url+"&modelP=3";
		}
	});
}

//提交审核
function pbsVersionCheck(pbsVersionId,priceId,obj){
	var pbsVersionTypeCode = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
	$.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
		if(obj.rs == 0){
			$("#checkDialog").dialog('close');
			MyMessager.slide.show("提示", "发布成功！");
			$("#"+pbsVersionTypeCode).treegrid("reload");
		}else{
			$.messager.alert("提示","操作失败");
		}
	},"json")
	
	//审批dialog
//	$("#checkDialog").dialog({
//		closed:false,
//	    buttons:[{
//			text:'提交审批',
//			size:'large',
//			handler:function(){
//				$.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
//					if(obj.rs == 0){
//						$("#checkDialog").dialog('close');
//						MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
//						$("#"+pbsVersionTypeCode).treegrid("reload");
//					}else{
//						$.messager.alert("提示","提交失败");
//					}
//				},"json")
//			}
//		},{
//			text:'关闭',
//			size:'large',
//			handler:function(){
//				$('#checkDialog').dialog("close");
//			}
//		}],
//	})
//	$("#checkTable").datagrid({
//		url:'#', 
//		width:451,
//		height:400,
//		 data:[{code:1,step:"部长",name:"张三"},{code:2,step:"经理",name:"李四"},{code:3,step:"总监",name:"王五"}],
//	    columns:[[    
//	        {field:'code',title:'序号',width:150,align:'center'},    
//	        {field:'step',title:'步骤',width:150,align:'center'},    
//	        {field:'name',title:'审批人',width:150,align:'center'}    
//	    ]]  
//	});
}