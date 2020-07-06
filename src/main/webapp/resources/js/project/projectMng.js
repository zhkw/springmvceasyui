var projectTypes = new Array();
var productTypes = new Array();
var selectProject,projectNum,projectName;
var basePath=$("#basePath").val();
var projectId;
$(function(){
	projectId = $("#projectId").val();
	selectProject = $("#projectId").val();
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
	    	if(node.children=='undefined'|| node.children==undefined){
	    		$("#copyId").val("");
	    		projectId = node.id;
	    		selectProject= node.id;
	    		projectNum=node.pnum;
				projectName=node.text;
	    		projectView(node.id);
	    		$("#projectId").val(node.id);
	    		projectId =node.id;
	    	}
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
	    		projectNum=data[0].children[0].pnum;
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
            	if(row.ISEDITABLE == 0 && (row.STATUS == null || row.STATUS == 0)){
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
            	if(row.ISEDITABLE != undefined){
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
        	title: '数据来源',
            field: 'DATAFROM',
            width: "12%",
            halign: "center",
            align: "left",
            hidden: true,
            formatter:function(value,row,index){
            	var str = "";
            	if(value != undefined){
            		str = "前期跟踪项目";
            	}else if(row.ISEDITABLE != undefined){
            		str = "本项目";
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
            	if(row.ISEDITABLE == 1 && row.CODE == "contract_in"){
            		str ="<a  class='easyui-linkbutton tableBtn edit_pbs' style='display:none;'  onclick=editPbs" +
        				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
    						"title='策划子项' ><span >策划子项</span></a>&nbsp;"+
	            	"<a class='easyui-linkbutton tableBtn edit_list' style='display:none;'  onclick=editPbs" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',2) " +
	            			"title='编制物料清单' ><span >编制物料清单</span></a>&nbsp;"+
	            	"<a class='easyui-linkbutton tableBtn edit_mh' style='display:none;'  onclick=editPbs" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',3) " +
	            			"title='策划人工时' ><span >策划人工时</span></a>&nbsp;"+
	            	"<a class='easyui-linkbutton tableBtn edit_exp' style='display:none;'  onclick=editPbs" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
	            			"title='编制价格' ><span >编制价格</span></a>";
            	}else if(row.ISEDITABLE == 1 && row.CODE == "scope_change"){
            		str ="<a  class='easyui-linkbutton tableBtn edit_pbs' style='display:none;'  onclick=editPbs" +
    					"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',1) " +
    						"title='策划子项' ><span >策划子项</span></a>&nbsp;";
                    //项目范围策划版根据项目类型隐藏按钮
                    var prj_class = row.PROJECT_CLASS;
                    if (prj_class == "前期跟踪" || prj_class == "工程咨询"
                        || prj_class == "工程设计" || prj_class == "工程管理"){
						str += "";
                    }else {
                    	str += "<a  class='easyui-linkbutton tableBtn edit_list' style='display:none;'  onclick=editPbs" +
                            "('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',2) " +
                            "title='编制物料清单' ><span>编制物料清单</span></a>"+
                            "<a class='easyui-linkbutton tableBtn edit_exp' style='display:none;'  onclick=editPbs" +
                            "('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
                            "title='编制价格' ><span >编制价格</span></a>"
					}
            	}else if(row.ISEDITABLE == 1 && row.CODE == "cost_control"){
            		str ="<a  class='easyui-linkbutton tableBtn edit_mh' style='display:none;'  onclick=editPbs" +
            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','',3) " +
            				"title='策划人工时' ><span >策划人工时</span></a>&nbsp;"+
        			"<a  class='easyui-linkbutton tableBtn edit_exp' style='display:none;'  onclick=editPbs" +
            			"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PRICEID+"','"+row.CODE+"',4) " +
	            			"title='编制价格' ><span >编制价格</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == null || row.STATUS == 0)){
            		str = "<a  class='easyui-linkbutton tableBtn submit' style='display:none;' onclick=pbsVersionCheck" +
            				"('"+row.ID+"','"+row.PRICEID+"','"+row.CODE+"',this) " +
            						"title='提交审批' ><span>提交审批</span></a>&nbsp;"+
	            	"<a  class='easyui-linkbutton tableBtn view_version' style='display:none;' onclick=pbsVersionView" +
	            		"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
	            			"title='查看' ><span >查看</span></a>";
            	}else if(row.CODE == "cost_control" && row.STATUS == 2){
            		str = "<a class='easyui-linkbutton tableBtn synBtn' style='display:none;'  onclick=leadWBS('"+row.ID+"') " +
	    						"title='导入WBS'><span>导入WBS</span></a>&nbsp;"+
	    			"<a class='easyui-linkbutton tableBtn synBtn' style='display:none;' onclick=synBudget('"+row.ID+"') " +
	    				"title='导入预算'></span>导入预算</span></a>&nbsp;" +
	    			/**"<a class='easyui-linkbutton tableBtn synBtn' style='display:none;' onclick=synDlv('"+projectId+"') " +
	    				"title='导入交付物'></span>导入交付物</span></a>&nbsp;" +**/
					"<a class='easyui-linkbutton tableBtn view_version' style='display:none;' onclick=pbsVersionView" +
    					"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') title='查看' ><span >查看</span></a>";
            	}else if(row.ISEDITABLE == 0 && (row.STATUS == 1 || row.STATUS == 2) ){
            		str = "<a  class='easyui-linkbutton tableBtn view_version' style='display:none;' onclick=pbsVersionView" +
            				"('"+row.ID+"','"+row.PBSROOTNODEID+"','"+row.PROJECTID+"') " +
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
    					$.messager.show({
    						title:'提示',
    						msg:'保存成功，消息将在3秒后关闭。',
    						timeout:3000,
    						showType:'slide'
    					});
    				}else{
    					$.messager.alert('提示',"操作失败");
    				}
            	},"json")
	        }
        }
	}
 	$('#firstGrid').treegrid($.extend(treeGridOptions,{toolbar: '#firstGrid_tb'}));
	$('#secondGrid').treegrid($.extend(treeGridOptions,{toolbar: '#secondGrid_tb'}));
	loadBtn();
	handelLayout();

    //查看帮助
    $("#help").on("click", function() {
        $("#helpWindow").window("open");
    });
    $("#helpWindow").window({
        title: "操作流程图",
        onClose:function() {
            $("#jscanv").css("display","none");
        }
    });
});


function leadFrom(){
	$.post(basePath+"/pbsVersion/leadByFrom","projectId="+projectId,function(obj){
		if(obj.rs==0){
			MyMessager.slide.show("提示", "操作成功，消息将在3秒后关闭。");
		}else{
			$.messager.alert("提示","操作失败，请检查1、是否存在可导入数据；2、是否已存在固化版数据；3、是否正在导入数据！");
		}
	},"json")
}

function buildContractIn(obj){
	var table = $(obj).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
	var row = table.treegrid('getSelected');
	if(row == null || row.ISEDITABLE == undefined || row.CREATETIME == undefined){
		$.messager.alert('提示',"请选择一个具体的版本");
		return false;
	}
	var pbsVersionId = row.ID;
	var typeCode = table.attr("name");
	if(pbsVersionId == null || $.trim(pbsVersionId) == ""){
		$.messager.alert('提示',"请选择一个版本！");
	}else{
		$.messager.confirm('确认对话框', '确认生成为修订内部版固化版（已审批）吗？', function(r){
			if (r){
				$.messager.progress({
					interval:100,
					text:'正在处理中'
				});
				MyMessager.slide.show("提示", "正在生成数据中，请稍后");
				$.post(basePath+"/pbsVersion/copyPbsVersion",
						"pbsVersionId="+pbsVersionId+"&typeCode=contract_in&isEditable=false&isChecked=true",
							function(obj){
					$.messager.progress('close');
					if(obj.rs == 0){
						$("#iseditable").val("");
						MyMessager.slide.show("提示", "已提交，数据正在处理中，可在操作记录中查看信息");
						$("#checkRecord").click();
					}else if(obj.rs == 2){
						$.messager.alert('提示',"请选择固化版本！");
					}else{
						$.messager.alert('提示',"生成失败");
					}
				},"json");
			}
		});
	}
}

//项目查看
function projectView(prjId){
	projectId =prjId;
	getLimit(projectId,2);
	$("#projectId").val(projectId);
	getPrjExtendInfo(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//清空所有选择
	$('#firstGrid').treegrid("unselectAll");
	$('#secondGrid').treegrid("unselectAll");
	$('#thirdGrid').treegrid("unselectAll");
	var url = basePath+'/pbsVersion/getPbsInfo';
	$('#firstGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#firstGrid').attr("name")}}); 
	$('#secondGrid').treegrid({url:url,queryParams:{projectId:projectId,versionTypeCode:$('#secondGrid').attr("name")}});
    //项目概况
    $.post(basePath+'/project/getProjectSummary','projectId='+projectId,function(obj){
        $("#projectName").html(obj.NAME);
        var prj_class = obj.PROJECT_CLASS;
        if (prj_class == "前期跟踪" || prj_class == "工程咨询"
            || prj_class == "工程设计" || prj_class == "工程管理"){
            $("#import").css("display","none");
            $("#export").css("display","none");
        }else {
            $("#import").css("display","inline-block");
            $("#export").css("display","inline-block");
		}
    },'json')
}

//编辑pbs版本内容 跳转
function editPbs(pbsVersionId,rootNodeId,priceId,code,type){
	var prjId = $("#projectId").val();
	var rootBoo = true;
	Utils.ajaxJsonSync(basePath+"/pbsVersion/checkCopy",{pbsVersionId: pbsVersionId},function(obj){
		if(obj.rs == 4){
			$.messager.alert('提示',"该版本还有未完成的复制任务，请稍后再试...");
		}else{
			Utils.ajaxJsonSync(basePath+"/pbsVersion/checkRootId",{rootNodeId:rootNodeId},function(obj){
				rootBoo = obj.rs;
			});
			var url = basePath+"";
			if(type == 1){ //策划子项
				url += "/pbsStructure/pbsViewOfDraft?pbsVsersionId="+pbsVersionId+"&projectId="+prjId+"&modelP=2";
			}else if(type != 1 && !rootBoo){
				$.messager.alert("提示","请先进行策划子项工作");
				return;
			}else if(type == 2){ //编制物料清单
				url += "/mmlist/materialListEditView?versionId="+pbsVersionId+"&rootNodeId="+rootNodeId+"&projectId="+prjId+"&modelP=2";
			}else if(type == 3){ //策划人工时
				url += "/manHour/manHourLayoutView?pbsVersionId="+pbsVersionId+"&projectId="+prjId+"&modelP=2";
			}else if(type == 4){ //编制价格表
				if(priceId == "null"){
					Utils.ajaxJsonSync(basePath+"/pbsVersion/createPrcieList",
							{pbsVersionId:pbsVersionId},
							function(obj){
						priceId = obj.priceId;
					});
				}
				if(code == "cost_control"){
					url += "/priceList/costControllView";
				}else{
					url += "/priceList/priceEditView";
				}
				url += "?pbsVersionId="+pbsVersionId+"&rootNodeId="+rootNodeId
					+"&priceListId="+priceId+"&code="+code+"&projectId="+prjId+"&modelP=2";
			}
			window.location.href=url;
		}
	});
	
}

//提交审核
function pbsVersionCheck(pbsVersionId,priceId,pbsCode,obj){
    // $.ajax({
    //     url: basePath+"/priceList/checkPackageState",
    //     data: "priceListId="+priceId,
    //     dataType: "json",
    //     success: function(data) {
    //     	if (data > 0) {
    //             $.messager.confirm("提示", "还有费用项未组包，是否继续提交审批?", function(r) {
    //                 if (r) {
    //                     commitProgress(pbsVersionId,priceId,pbsCode,obj);
    //                 }
    //             });
	// 		}
    //     }
    // });
    commitProgress(pbsVersionId,priceId,pbsCode,obj);
}

function commitProgress(pbsVersionId, priceId, pbsCode, obj) {
	if ($('#projectList').tree('getSelected') == null) {
        MyMessager.slide.show("提示", "请重新选择项目！");
	}else {
		selectProject = $('#projectList').tree('getSelected').id;
	}
    var pbsVersionTypeCode = $(obj).parents(".datagrid").find(".datagrid-f").attr("id");
    if(infoData.PROJECT_CLASS == '研发课题' || infoData.PROJECT_CLASS == "标准编制"){
        $.post(basePath+"/pbsVersion/checkPrice","pbsVersionId="+pbsVersionId+"&priceId="+priceId,function(obj){
            if(obj.rs == 0){
                $.messager.show({
                    title:'提示',
                    msg:'提交成功，消息将在3秒后关闭。',
                    timeout:3000,
                    showType:'slide'
                });
                $("#"+pbsVersionTypeCode).treegrid("reload");
            }else{
                $.messager.alert("提示","提交失败");
            }
        },"json");
    }else if(infoData.ID != undefined){
        var options = {
            title : '审批',
            url : basePath+"/baseInfo/auditDialog?workflow="+$('#workflow').val()
                +"&paramet="+"processId="+$('#workflow').val(),
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
                        //获取请求地址
                        var per = dialog.find("iframe").get(0).contentWindow.submitAudit();
                        var allUser="";
                        if(per.allUser!="" && per.allUser!=undefined && per.allUser!='undefined'){
                            allUser=per.allUser+per.subject;
                            //工程项目信息
                            var param2 ='&pbsVersionId='+pbsVersionId+"&projectId="+selectProject+"&projectCode="+projectNum
                                +"&projectName="+($.trim($("#projectName").html()))
                                +"&priceId="+priceId+"&pbsCode="+pbsCode;
                            //参数组装
                            var params = allUser+param2+"&processId="+$('#workflow').val()+"&initiator="+$.trim($("#userId").val())
                                +"&initiatorName="+$.trim($("#userName").val());
                            //发起请求，执行流程，提交审批
                            MyMessager.slide.show("提示", "数据处理中，请稍....");
                            $.post(basePath+"/workflow/start/"+$('#workflow').val(),"params="+params,function(result){
                                if("success"==result){
                                    dialog.dialog('destroy');
                                    MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                    $("#"+pbsVersionTypeCode).treegrid("reload");
                                }else{
                                    $.messager.alert("提示","提交失败");
                                }
                            });
                            //此处添加版本与计划版本的关系
                            addPbsVersionToPlanVersion(pbsVersionId);
                        }else{
                            $.messager.alert("提示","请确认审批信息再提交！");
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
        $.messager.alert("提示","请先完善项目信息！");
    }
}
function leadWBS(versionId){
	$.post(basePath+"/pbs2wbs/lead2wbs","versionId="+versionId,function(obj){
		if(obj.rs == 0){
			$.messager.show({
				title:'提示',
				msg:'操作成功，数据正在处理中。',
				timeout:3000,
				showType:'slide'
			});
		}else{
			$.messager.alert('提示',"操作失败");
		}
	},"json");
}

function synBudget(versionId) {
	$.post(basePath+"/pbs2wbs/syncBudget","versionId="+versionId,function(obj){
		if(obj.rs == 0){
			$.messager.show({
				title:'提示',
				msg:'操作成功，数据正在处理中。',
				timeout:3000,
				showType:'slide'
			});
		}else{
			$.messager.alert('提示',"操作失败");
		}
	},"json");
}

function synDlv(projectId) {
	$.post(basePath+"/pbs2wbs/syncDeliverables","projectId="+projectId,function(obj){
		if(obj.rs == 0){
			$.messager.show({
				title:'提示',
				msg:'操作成功，数据正在处理中。',
				timeout:3000,
				showType:'slide'
			});
		}else{
			$.messager.alert('提示',"操作失败");
		}
	},"json");
}

function addPbsVersionToPlanVersion(pbsVersionId) {
    $.get(basePath+"/pbsVersion/addPbsVersionToPlanVersion",
		"projectId="+projectId+"&pbsVersionId="+pbsVersionId,function(obj){
    },"json");
}




