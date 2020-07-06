var selectProject;
var fbEditingIndex;
var basePath=$(".basePath").attr('basePath');
var majorsList;
var majorsListMap = new Array();
var fbPlanType;
var projectConstructVId;
$(function(){
	fbPlanType=$('#base-info').attr('fbPlanType');
	if(fbPlanType==null||fbPlanType==undefined){
		fbPlanType="D";
	}
	getProjectSummary();
	queryBaseDataTypes();
	preparatData();
	queryFBListInfo();
});
//查询项目基本信息
function getProjectSummary(){
	
	$.ajax({
		url:basePath+'/project/getProjectSummary?projectId='+$('#base-info').attr("projectId"),
		type:'POST',
		success:function(data){
			//console.log(data);
			$(".project-code").text(data.NUM);
			$(".project-info").text(data.NAME);
		}
	});
}

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
//数据准备
function preparatData(){
	selectProject=$('#base-info').attr("projectId");
	projectConstructVId=$('#base-info').attr("planVersionId");
	var isNew=$("#base-info").attr("isNew");
	var status=$("#base-info").attr("status");
	var projectName=$("#base-info").attr("projectName");
	var planVersionCode=$("#base-info").attr("planVersionCode");
	//$(".project-info").text(projectName);
	$(".version-info").text(planVersionCode);
	changeBDStatusInfo(status,projectConstructVId,isNew);
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
	width:'100%',
	idField: 'ID',
	singleSelect:true,
	queryParams: {
		versionId:function(){
				return projectConstructVId;
		},
		type:function(){
			return 0;
		},
		project:function(){
				return selectProject;
		},
		key:function(){
				return $('#search-construct-plan').searchbox('getValue');
		},
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
	    onLoadSuccess:function(data){
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
//附件管理DIALOG
function manageFiles(){
	$('#file-mng-dialog').dialog({
    title:'附件管理',
    width: 800,
	content:'<div id="file_list"><table id="plan_file_list" style="min-height:250px;"></table></div>',
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
		columns:[[
			{field:'fileName',title:'文件名',width:'50%'},
			{field:'handle',title:'操作',width:'50%',formatter:function(value,row,index){
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'	;	
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
	})
}
//附件下载
function downAttachment(path,fileName,fileId){
	path = encodeURI(path);
	fileName = encodeURI(fileName);
	window.location.href = basePath+"/pbsCommonController/downloadAttachment?path="+path+"&fileName="+fileName+"&fileId="+fileId; 
}

