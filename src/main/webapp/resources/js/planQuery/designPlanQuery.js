//检索分包信息
function queryDesBdListInfo(){
    $('#fb-list-info-des').datagrid({
        url:basePath+'/designOrOtherConstructPlan/queryDesignOrOtherSubcontract',
        toolbar:'#fb-list-info_tb-des',
        height:'100%',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        nowrap:false,
        queryParams: {
            versionId:function(){
                return versionId;
            },
            type:function(){
                return "D";
            },
            project:function(){
                return selectProject;
            },
            key:function(){
                return $('#search-construct-plan-des').searchbox('getValue');
            }
        },
        columns:[[
            {field:'CODE',title:'分包编号',halign:'center',width:'15%'},
            {field:'NAME',title:'分包名称',halign:'center',width:'15%',editor:{type:'validatebox',options:{validType:'text',required:true}}},
            {field:'CONTENT',title:'分包内容',halign:'center',width:'35%',editor:'text'},
            {field:'PRICE',title:'控制基准价(万元)',halign:'center',width:'10%'},
            {field:'REASON',title:'分包原因及必要性说明',halign:'center',width:'20%'},
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
            {field:'REMARK',title:'备注',halign:'center',width:'10%',editor:'text'}
        ]],
        onLoadSuccess:function(data){
            changeDesBDStatusInfo(status);
            $(this).datagrid("showColumn", 'MAJORID');
            if(data!=null&&data.total>0){
                $('#fb-list-info-des').datagrid('selectRow',0);
            }
        },
        onBeforeLoad:function(){
            $(this).datagrid("showColumn", 'MAJORID');
        }
    });
}
function searchDesBdListInfo() {
    $('#fb-list-info-des').datagrid("load",{versionId: versionId,type:"D",
        projectId:selectProject,key:$('#search-construct-plan-des').searchbox('getValue')});
}
//附件管理DIALOG
function manageDesFiles(){
    $('#file-mng-dialog-des').dialog({
        title:'附件管理',
        width: 800,
        content:'<div  class="bdst-button" style="margin-bottom:5px;">'+
        '</div>'+
        '<div id="file_list-des"><table id="plan_file_list-des" style="min-height:250px;"></table></div>',
        closed: false,
        cache: false,
        modal: true,
        buttons: [
            {
                text:'关闭',
                iconCls:'icon-remove',
                handler:function(){
                    $('#file-mng-dialog-des').dialog("close");
                }
            }
        ]
    });
    queryDesPlanFiles();
}
//附件检索
function queryDesPlanFiles(){
    $('#plan_file_list-des').datagrid({
        url:basePath+'/pbsCommonController/queryAttachment',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        columns:[[
            {field:'fileName',title:'文件名',halign:'center',width:'50%'},
            {field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
                    return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'	;
                }}
        ]],
        queryParams:{
            targetId:function(){
                return versionId;
            },
            targetType:function(){
                return 6;
            }
        }
    });
}
//计划状态修改
function changeDesBDStatusInfo(status){
    colSty=true;
    if(status==0){
        $('.status-info-des').text('草稿');
    }else if(status==1){
        colSty = false;
        $('.status-info-des').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>审批中</u></a>');
    }else if(status==2){
        colSty = false;
        $('.status-info-des').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>已审批</u></a>');
    }else if(status==-1){
        colSty = false;
        $('.status-info-des').text('已取消');
    }else{
        $('.status-info-des').text('草稿');
    }
}
