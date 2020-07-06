var selectProject,projectName,projectNum;
var processName;
var fbEditingIndex;
var bdEditingIndex;
var basePath=$("#basePath").val();
var majorsList;
var majorsListMap = new Array();
var fbPlanType;
var projectConstructVId;
var projectId;
//项目类型
var projectClass;
$(function(){
	projectId = $("#projectId").val();
	getProjectSummary(projectId);
	fbPlanType=$('#fbPlanType').val();
	if(fbPlanType==null||fbPlanType==undefined){
		fbPlanType="D";
	}
	disableOrEnableFBHeaderButton("disable");
	queryBaseDataTypes();
	queryProjectList();
	queryFBListInfo();
});
//检索基础类型
function queryBaseDataTypes(){
	$.ajax({
		url:basePath+'/designOrOtherConstructPlan/queryMajors',
		type:'POST',
		success:function(data){
			//专业
			majorsList=data;
			for(var i in majorsList){
				majorsListMap[majorsList[i].ID]=majorsList[i].MAJORNAME;
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
			$('#fb-list-info').datagrid('clearSelections');
			//提示需要完善数据
			if($('.bdst .validatebox-invalid').length>0){
				var node = $('#projectList').tree('find', selectProject);
				$('#projectList').tree('select', node.target);
				MyMessager.alert.show('提示',"请先完善数据！");
				return ;
			}else{
				//主动保存数据
				$('#bd-list-info').datagrid("endEdit",fbEditingIndex);
				if(node.children=='undefined'||node.children==undefined){
					projectId = node.id;
					$("#projectId").val(node.id);
					selectProject=node.id;
					projectName = node.text;
					projectNum = node.pnum;
					projectView(projectId);
					disableOrEnableFBHeaderButton("enable");
					//检索项目最新版本
					queryProjectLastedVersionId(selectProject);
				}else{
					selectProject=undefined;
					projectName = undefined;
					projectNum = undefined;
					disableOrEnableFBHeaderButton("disable");
					selectProject=undefined;
					projectConstructVId="";
					$('.status-info').text('无');
					$('.status-info').attr('fb_status',-100);
					$('#fb-list-info').datagrid('loadData',{total:0,rows:[]});
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
	//加载项目信息
	getProjectSummary(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//设置操作按钮是否可用
	disableOrEnableFBHeaderButton("enable");
	//检索项目最新版本
	queryProjectLastedVersionId(projectId);
}
//查询项目分包最新版本
function queryProjectLastedVersionId(projectId){
	$.ajax({
		url:basePath+'/constructPlan/getProjectConstructLastedVersionInfo',
		data:{projectId:projectId,type:fbPlanType},
		type:'POST',
		success:function(data){
			changeBDStatusInfo(data.status,data.id,1);
			//检索标段数据
			queryFBListInfo();
		}
	});
}
//计划状态修改
function changeBDStatusInfo(status,versionId,isNewFlag){
			projectConstructVId=versionId;
            if(status==0){
				$('.status-info').text('草稿');
				$('.status-info').attr('fb_status',0);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==1){
				$('.status-info').text('审批中');
				$('.status-info').attr('fb_status',1);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==2){
				$('.status-info').text('已审批');
				$('.status-info').attr('fb_status',2);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==-1){
				$('.status-info').text('已取消');
				$('.status-info').attr('fb_status',-1);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else{
				$('.status-info').text('草稿');
				$('.status-info').attr('fb_status',0);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}	
}
//检索分包信息
function queryFBListInfo(){
	$('#fb-list-info').datagrid({
		url:basePath+'/designOrOtherConstructPlan/queryDesignOrOtherSubcontract',
		toolbar:'#fb-list-info_tb',
		height:'75%',
		width:'100%',
		idField: 'ID',
		singleSelect:true,
        nowrap:false,
		showFooter:true,
		queryParams: {
			versionId:function(){
					return projectConstructVId;
			},
			type:function(){
				return fbPlanType;
			},
			project:function(){
					return selectProject;
			},
			key:function(){
					return $('#search-construct-plan').searchbox('getValue');
			}
		},
        frozenColumns : [[
            {field:'HANDLE',title:'操作',halign:'center',width:'3%',
                formatter: function(value,row,index){
                    //非草稿
                    if($('.status-info').attr('fb_status')!=0){
                        return '<i class="icon-lock" id="'+index+'"></i>';
                    }else{
                        return '<i class="icon-edit fb-handle-icon" id="'+index+'" onclick="saveFBdata(this);"></i>';
                    }
                }
            },
            {field:'CODE',title:'分包编号',halign:'center',width:'10%'},
            {field:'NAME',title:'分包名称',halign:'center',width:'20%',editor:{type:'validatebox',options:{validType:'text',required:true}}}
		]],
	    columns:[[
			{field:'CONTENT',title:'分包内容',halign:'center',width:'30%',editor:'text'},
			{field:'MAJORID',title:'设计专业',halign:'center',width:'15%', editor:{type:'combobox',options:{valueField:"ID",textField:"MAJORNAME",multiple:true}},formatter:function(value,row,index){
				value+="";
				var majorIds=value.split(",");
				var major="";
				for(var i in majorIds){
				 if(majorsListMap[majorIds[i]]!=null&&majorsListMap[majorIds[i]]!=undefined){
					if(i==0){
						major+=majorsListMap[majorIds[i]];
					}else{
						major+=","+majorsListMap[majorIds[i]];
					}
				  }
				}	
				return major;
			}},
            {field:'PRICE',title:'控制基准价(万元)',halign:'center',width:'10%',
				editor:{
                    type : "validatebox",
                    options : {
                        required:true,
                        validType :  [ "positive_double"]
                    }
                }},
            {field:'REASON',title:'分包原因及必要性说明',halign:'center',width:'20%',
				editor:{
                    type : "validatebox",
                    options : {
                        required:true
                    }
				}},
			{field:'REMARK',title:'备注',halign:'center',width:'13%',editor:'text'}
		]],
		onBeginEdit:function(index){
			$('.fb-handle-icon[id="'+index+'"]').removeClass('icon-pencil').addClass('icon-save');
			//标段Combox初始化
			fbEditingIndex=index;
			var majors= $(this).datagrid("getEditor", {id: fbEditingIndex, field: "MAJORID"});
			$(majors.target).combobox("loadData",majorsList);
			//$(majors.target).combobox("select",majorsList[0].ID);
		},
		onAfterEdit:function(rowIndex, rowData, changes){
			reloadFooter();
			submmitFBdataToDB();
		},
		onLoadSuccess:function(data){
			reloadFooter();
			if(fbPlanType=="O"){
				$(this).datagrid("hideColumn", 'MAJORID');
			}else{
				$(this).datagrid("showColumn", 'MAJORID');
			}
			if(data!=null&&data.total>0){
				$('#fb-list-info').datagrid('selectRow',0);
			}
		},
		onBeforeLoad:function(){
			if(fbPlanType=="O"){
				$(this).datagrid("hideColumn", 'MAJORID');
			}else{
				$(this).datagrid("showColumn", 'MAJORID');
			}
		}
	});
}
//分包数据保存
function saveFBdata(obj){
  if(($('.status-info').attr('fb_status')==2||$('.status-info').attr('fb_status')==0)&&$('.status-info').attr('isNewFlag')==1){
	  //草稿和已审批状态数据才可进行修改
	  if($('.status-info').attr('fb_status')==2){
		  $.messager.confirm('提示','是否确认修改？',function(r){
				if (r){	
					//修改分包头状态
					updatePlanVersionStatus();
					if($(obj).hasClass('icon-save')){
						if($('.fbst .validatebox-invalid').length>0){
							MyMessager.alert.show('提示',"请按格式输入数据后保存！");
						}else{
							$('#fb-list-info').datagrid("endEdit",fbEditingIndex);
						}	
					}else{
						if($('.fbst .icon-save').length>0){
							MyMessager.alert.show('提示',"请先保存编辑中数据！");
						}else{
							var index=$(obj).attr('id')
							$('#fb-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
							$('#fb-list-info').datagrid("beginEdit",index);
						}	
					}	
					}
				}
			);
	  }else{
		if($(obj).hasClass('icon-save')){
			if($('.fbst .validatebox-invalid').length>0){
				MyMessager.alert.show('提示',"请按格式输入数据后保存！");
			}else{
				$('#fb-list-info').datagrid("endEdit",fbEditingIndex);
			}	
		}else{
			if($('.fbst .icon-save').length>0){
				MyMessager.alert.show('提示',"请先保存编辑中数据！");
			}else{
				var index=$(obj).attr('id')
				$('#fb-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
				$('#fb-list-info').datagrid("beginEdit",index);
			}	
		}  
	  }
  }else{
	  MyMessager.alert.show('提示',"非最新版草稿或者已审批标段不能进行修改！");
  }
}
//版本修改
function updatePlanVersionStatus(){
	var isNewFlag=$('.status-info').attr('isNewFlag');
	$.ajax({
		url:basePath+'/constructPlan/updateUpdatePlanVersionStatus',
		data:{id:projectConstructVId,status:0},
		type:'POST',
		success:function(data){
			changeBDStatusInfo(0,projectConstructVId,isNewFlag);
		}
	});
}
//分包添加
function addFBInfo(){
	if($('.status-info').attr('fb_status')==0&&$('.status-info').attr('isNewFlag')==1){
	   if($('.fbst .validatebox-invalid').length>0){
		MyMessager.alert.show('提示',"请按格式输入数据后保存！");
	   }else{
			//保存
			$('#fb-list-info').datagrid("endEdit",fbEditingIndex);
			//添加新行
			$('#fb-list-info').datagrid('appendRow',{STATUS:0});
			var rows=$('#fb-list-info').datagrid('getRows');
			var index=$('#fb-list-info').datagrid('getRowIndex',rows[rows.length-1]);
			$('#fb-list-info').datagrid('beginEdit',index);
			$('#fb-list-info').datagrid('selectRow',index);//选中当前新增行
		}
	}else{
		MyMessager.alert.show('提示',"非草稿版数据不能添加分包信息！");
	}
	
}
//分包数据提交数据库
function submmitFBdataToDB(){
	var obj = new Object();
	obj.exist=false;
	var map = {};
	var changeRows=$('#fb-list-info').datagrid("getChanges");
	for(i in changeRows){
			obj.exist=true;
			obj["pbs_designOrOtherPlanVOList["+i+"].id"] = changeRows[i].ID;
			obj["pbs_designOrOtherPlanVOList["+i+"].code"]=changeRows[i].CODE;
			obj["pbs_designOrOtherPlanVOList["+i+"].name"]=changeRows[i].NAME;
			obj["pbs_designOrOtherPlanVOList["+i+"].majorId"]=changeRows[i].MAJORID;
			obj["pbs_designOrOtherPlanVOList["+i+"].content"]=changeRows[i].CONTENT;
        	obj["pbs_designOrOtherPlanVOList["+i+"].price"]=changeRows[i].PRICE;
        	obj["pbs_designOrOtherPlanVOList["+i+"].reason"]=changeRows[i].REASON;
			if(changeRows[i].PLANVERSIONID==null||""==changeRows[i].PLANVERSIONID){
				obj["pbs_designOrOtherPlanVOList["+i+"].planVersionId"]=projectConstructVId;
			}else{
				obj["pbs_designOrOtherPlanVOList["+i+"].planVersionId"]=changeRows[i].PLANVERSIONID;
			}
			obj["pbs_designOrOtherPlanVOList["+i+"].remark"]=changeRows[i].REMARK;
	}
	if(selectProject!=undefined){
		obj.projectId=selectProject;
		if(obj.exist){
			$.ajax({
				url:basePath+'/designOrOtherConstructPlan/addOrUpdateDesignOrOtherSubcontract',
				type:'POST',
				data:obj,
				success:function(data){
					if(data.status){
						fbEditingIndex=undefined;
						$('#fb-list-info').datagrid('acceptChanges')
						$('#fb-list-info').datagrid('reload');
						MyMessager.slide.show("提示", data.info); 
					}else{
						$('#fb-list-info').datagrid('beginEdit',fbEditingIndex);
						MyMessager.alert.show('提示',data.info);
					}
				}
			});
		}
	}
}
//删除分包数据
function delFBInfo(){
	if($('.status-info').attr('fb_status')!=0){
		MyMessager.alert.show('提示',"非草稿版数据不能删除!");
	}else{
		var selectRows=$('#fb-list-info').datagrid('getSelections');
		var ids="";
		for(var i in selectRows){
			if(selectRows[i].ID!=null&&selectRows[i].ID!=undefined){
				ids+=selectRows[i].ID+","
			}
		}
		if(ids!=""){
			$.messager.confirm('提示','你确定要删除该分包信息？',function(r){
				if (r){
					$.ajax({
						url:basePath+'/designOrOtherConstructPlan/delDesignOrOtherSubcontract',
						data:{ids:ids},
						type:'POST',
						beforeSend:function() {
							MyMessager.prog.show("提示","请等待","数据处理中...");
						},
						complete:function() {
							MyMessager.prog.close();
						},
						success:function(data){
							if(data.status){
								for(var i in selectRows){
									var index=$('#fb-list-info').datagrid('getRowIndex',selectRows[i]);
									$('#fb-list-info').datagrid('deleteRow',index);
								}
								$('#fb-list-info').datagrid('selectRow',0);
								MyMessager.slide.show("提示", data.info); 
							}else{
								MyMessager.alert.show('提示',data.info);
							}
							$('#fb-list-info').datagrid('acceptChanges')
						}
					});
				}
			});
		}else{
			if(selectRows==null||selectRows.length==0){
				MyMessager.alert.show('提示',"请选择需要删除分包信息！");
			}else{
				$.messager.confirm('提示','你确定要删除该分包信息？',function(r){
					if (r){
						var index=$('#fb-list-info').datagrid('getRowIndex',selectRows[0]);
						$('#fb-list-info').datagrid('deleteRow',index);
						$('#fb-list-info').datagrid('selectRow',0);
						MyMessager.slide.show("提示", "数据处理成功！"); 
					}
				});
			}
		}
	}
}
//按钮禁用
function disableOrEnableFBHeaderButton(flag){
	if(flag==null||flag==undefined){
		flag='enable';//disable
	}
	$('.bd_head_button').linkbutton(flag);
}
//复制And粘贴
function copyOrPasteFBInfo(flag){
 	if($('.status-info').attr('fb_status')==0&&$('.status-info').attr('isNewFlag')==1){
	var row=$('#fb-list-info').datagrid('getSelected');
	if(row==null||row==undefined||row.length==0){
		MyMessager.alert.show('提示',"请先选择标段进行复制！");
	}else{
		if(flag=='copy'){
			$('.paste_fb').attr('bdid',row.ID);
			MyMessager.slide.show("提示","复制成功！"); 
		}else if($('.paste_fb').attr('bdid')!=null&&""!=$('.paste_bd').attr('bdid')){
			var constructPlanId=$('.paste_fb').attr('bdid');
			$.ajax({
				url:basePath+'/designOrOtherConstructPlan/pasteDesignOrOtherSubcontract',
				data:{id:constructPlanId},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				success:function(data){
					if(data.status){
						$('#fb-list-info').datagrid('reload');
						MyMessager.slide.show("提示",data.info); 
					}else{
						MyMessager.alert.show('提示',data.info);
					}
				}
			});
		}else{
			MyMessager.alert.show('提示',"请先选择标段进行复制！");
		}
	} 
 }else{
	 MyMessager.alert.show('提示',"非草稿分包不能进行复制/粘贴！");
 }
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
	if($('.status-info').attr('fb_status')==0&&$('.status-info').attr('isNewFlag')==1){
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
		singleSelect:true,
		columns:[[
			{field:'fileName',title:'文件名',halign:'center',width:'50%'},
			{field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
				if($('.status-info').attr('fb_status')==0&&$('.status-info').attr('isNewFlag')==1){
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'+'<button type="button" onclick="delAttachment(\''+row.id+'\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>'	;
				}else{
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'	;
				}	
			}}
		]],
	    queryParams:{
			 targetId:function(){
				return projectConstructVId;
			},
			targetType:function(){
				if(fbPlanType=="D"){
						return 6;
				}else{
						return 7;
				}
			}
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
			data : {
				fileIds : fileIds,
				targetId:function(){
					return projectConstructVId; 
				},
				targetType:function(){
					if(fbPlanType=="D"){
						return 6;
					}else{
						return 7;
					}
				},
			},
			success:function(data) {
				$('#plan_file_list').datagrid('reload');
				MyMessager.slide.show("提示",data.info); 
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
            if($('.status-info').attr('fb_status')==0||$('.status-info').attr('fb_status')==1||$('.status-info').attr('isNewFlag')!=1){
                MyMessager.alert.show('提示',"已审批或者拒绝最新版本才可以进行升版！");
            }else{
                $.ajax({
                    url:basePath+'/designOrOtherConstructPlan/changePlan',
                    type:'POST',
                    data:{
                        id:projectConstructVId,
                        type:function(){
                            if(fbPlanType=="D"){
                                return 6;
                            }else{
                                return 7;
                            }
                        }
                    },
                    beforeSend:function() {
                        MyMessager.prog.show("提示","请等待","数据处理中...");
                    },
                    complete:function() {
                        MyMessager.prog.close();
                    },
                    success:function(data){
                        queryProjectLastedVersionId(selectProject);
                        queryFBListInfo();
                        $.messager.progress('close');
                        MyMessager.slide.show("提示",data.info);
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
		url:basePath+'/designOrOtherConstructPlan/queryPlanVersion',
		width:'100%',
		idField: 'ID',
		singleSelect:true,
		columns:[[
			{field:'NAME',title:'版本名',halign:'center',width:'30%'},
			{field:'CODE',title:'版本编码',halign:'center',width:'26%'},
	        {
	        	title: '操作',field: 'opt',width: "23%",halign: "center",align : 'center',
	            formatter:function(value,row,index){	            	
	       	 		return "<a  class='easyui-linkbutton' onclick=findHistoryVersion('"+row.ID+"','"+row.CODE+"','"+row.ISNEW+"','"+row.STATUS+"') " +
       				"title='查看' data-options='iconCls:\"icon-list-ol\"'><span >查看</span></a>";
	            }
	        }
		]],
	    queryParams:{
	    	projId:function(){
				return selectProject;
			},
			type:function(){
				return fbPlanType;
			}
		},
		/*onClickRow:function(index,rowData){
			var project=$('#projectList').tree('getSelected');
		    window.open(basePath+"/subcontractPlan/designOrOtherPlanHistoryView?fbPlanType="+fbPlanType+"&planVersionCode="+rowData.CODE+"&isNew="+rowData.ISNEW+"&planVersionId="+rowData.ID+"&projectName="+project.text+"&projectId="+project.id+"&status="+rowData.STATUS);
			//changeBDStatusInfo(rowData.STATUS,rowData.ID,rowData.ISNEW);
			//queryFBListInfo();
		}*/
	});
}


//查看历史版本详细信息
function findHistoryVersion(rID,code,isNew,status){
	var project=$('#projectList').tree('getSelected');
	//window.location.href
	window.open(encodeURI(basePath+"/subcontractPlan/designOrOtherPlanHistoryView?planVersionCode="+code+"&fbPlanType="+fbPlanType+"&isNew="+isNew+"&planVersionId="+rID+"&projectName="+project.text+"&projectId="+project.id+"&status="+status));
}

//提交审批
function submitConstructPlan(){
	var workflow = $('#workflow').val();
    //判断是否存在未保存数据。
    // if (typeof(editIndex) !== 'undefined'){
    //     MyMessager.alert.show('提示',"有分包数据尚未保存！请先保存数据。");
    //     return;
    // }
    //自动保存
    $('#fb-list-info').datagrid("endEdit",fbEditingIndex);
    if($('.fbst .validatebox-invalid').length>0){
        MyMessager.alert.show('提示',"请按格式输入数据后保存！");
    }else {
    	if (projectClass == "工程承包" || projectClass == "设备供货") {
    		workflow = "mgnSubAppr1";
		}else {
            workflow = "mgnSubAppr2";
		}
        //最新版草稿可以提交审批
        if($('.status-info').attr('fb_status')==0&&$('.status-info').attr('isNewFlag')==1){
            var options = {
                title : '审批',
                url : basePath+"/baseInfo/auditDialog?workflow="+workflow
                +"&paramet="+"processId="+workflow+",mark=O",
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
                                var param2 ='&pbsVersionId='+projectConstructVId+"&projectId="+selectProject+"&projectCode="+projectNum+"&projectName="+projectName;
                                //参数组装
                                var params = allUser+param2+"&processId="+workflow+"&projectPurVId="+projectConstructVId
                                    +"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
                                //发起请求，执行流程，提交审批
                                MyMessager.slide.show("提示", "数据处理中，请稍....");
                                $.post(basePath+"/workflow/start/"+workflow,
                                    "params="+params,
                                    function(result){
                                        if("success" === result){
                                            dialog.dialog('destroy');
                                            MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                            queryProjectLastedVersionId(selectProject);
                                            $("#fb-list-info").treegrid("reload");
                                        }else{
                                            $.messager.alert("提示","提交失败");
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
                    }
                ]
            };
            var dialog = modalDialog(options);
        }else{
            MyMessager.alert.show('提示',"非草稿版，不能提交审批！");
        }
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
			projectClass=data.PROJECT_CLASS;
		}
	});
}

//加载footer合计行
function reloadFooter() {
	var rows = $('#fb-list-info').datagrid('getRows');
	var total = 0;
	for (var i = 0; i < rows.length; i++) {
		var price = rows[i].PRICE==null?0:rows[i].PRICE;
		total += parseFloat(price);
	}
	$('#fb-list-info').datagrid('reloadFooter',[
		{NAME: '合计', PRICE: total}
	]);
}
