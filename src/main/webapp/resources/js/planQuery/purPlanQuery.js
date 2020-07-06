//检索采购包信息
function queryPurBdListInfo(){
    $('#bd-list-info-pur').datagrid({
        url:basePath+'/purPlan/queryPurPlan',
        toolbar:'#bd-list-info_tb-pur',
        height:'100%',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        queryParams: {
            versionId:function(){
                return versionId;
            },
            type:function(){
                return 3;
            },
            projectId:function(){
                return selectProject;
            },
            key:function(){
                return $('#search-Pur-plan').searchbox('getValue');
            }
        },
        frozenColumns : [[
            {field:'CODE',title:'采购包号',halign:'center',width:'11%'},
            {field:'NAME',title:'采购包名称',halign:'center',width:'12%'}
        ]],
        columns:[[
            {field:'SERVICESCOPEID',title:'供应商提供服务范围',halign:'center',width:'10%',formatter:function(value,row,index){
                    if(serviceListMap[value]==null||serviceListMap[value]==undefined){
                        return '';
                    }
                    return serviceListMap[value];
                }},
            {field:'ESTPRICE',title:'价格估算（万元）',halign:'center',width:'11%',editor:{type:"validatebox",options:{validType:'intOrFloat'}}},
            {field:'PURTYPEID',title:'采购方式',halign:'center',width:'13%',formatter:function(value,row,index){
                    if(purListMap[value]==null||purListMap[value]==undefined){
                        return '';
                    }
                    return purListMap[value];
                }},
            {field:'REASON',title:'采购方式选择理由',halign:'center',width:'16%',editor:'text'},
            {field:'TESTLEVELID',title:'检验等级',halign:'center',width:'15%',formatter:function(value,row,index){
                    value+="";
                    var levelIds=value.split(",");
                    var level="";
                    for(var i in levelIds){
                        if(testLevelListMap[levelIds[i]]!=null && testLevelListMap[levelIds[i]]!=undefined){
                            if(i==0){
                                level+=testLevelListMap[levelIds[i]];
                            }else{
                                level+=","+testLevelListMap[levelIds[i]];
                            }
                        }
                    }
                    return level;
                }
            },
            {field:'CONFIGURE',title:'配置标准',halign:'center',width:'13%',editor:'text'},
            {field:'HTZQ',title:'合同制造周期',halign:'center',width:'12%'
                ,formatter:function(value,row,index){
                    //计划发货时间 - 合同签订时间
                    if(row.DELIVERYTIME && row.CONTRACTTIME){
                        var day = Utils.GetDateDiff(row.DELIVERYTIME,row.CONTRACTTIME);
                        return day;
                    }
                    return "";
                }
            },
            {field:'RECEIVEREQFILETIME',title:'计划接收请购文件时间',width:'12%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'CONTRACTTIME',title:'计划签订合同时间',halign:'center',width:'12%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'EQUIPREQCONFIRMTIME',title:'计划设备提资确认时间',halign:'center',width:'12%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'DELIVERYTIME',title:'计划发货时间',halign:'center',width:'12%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'ARRIVALTIME',title:'计划到货时间',halign:'center',width:'6%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'INSTALLTIME',title:'计划现场安装时间',halign:'center',width:'12%',formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'MANUCYCLE',title:'计划正常制造周期(天)',halign:'center',width:'12%'},
            {field:'FOCUS',title:'进度重点关注',halign:'center',width:'9%',formatter:function(value,row,index){
                    //到货日期-合同签订日期>正常制造周期时，值为是，其余则为否。
                    var date1 = row.ARRIVALTIME;
                    var date2 = row.CONTRACTTIME;
                    if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
                        var arrivaltime = Utils.dateFormat(date1,'yyyy-mm-dd');
                        var contracttime = Utils.dateFormat(date2,'yyyy-mm-dd');
                        var manucycle = row.MANUCYCLE;
                        var day = GetDateDiff(arrivaltime,contracttime);
                        if(day<manucycle){
                            return "是";
                        }else{
                            return "否";
                        }
                    }else{
                        return "否";
                    }
                }}
        ]],
        onSelect:function(){
            queryPurTabInfo();
        },
        onLoadSuccess:function(data){
            changeBDStatusInfo(status);
            //默认选中第一条
            if(data!=null&&data.total>0){
                //采购包列表
                $('#bd-list-info-pur').datagrid('selectRow',0);
            }else{
                //拟推荐供应商
                // $('.s_easyui-linkbutton').linkbutton('disable');
                $('#bd-supplier-list-pur').datagrid('loadData',{total:0,rows:[]});
                //包含设备信息
                // $('.sc_easyui-linkbutton').linkbutton('disable');
                $('#bd-subPurPlan-scope-list-pur').datagrid('loadData',{total:0,rows:[]});
            }
        }});
}
function searchPurPlanList() {
    $('#bd-list-info-pur').datagrid("load",{versionId: versionId,type:3,
        projectId:selectProject,key:$('#search-Pur-plan').searchbox('getValue')});
}
/**
 * 采购包附件管理：直接使用施工计划相关方法
 */
//附件管理DIALOG
function managePurFiles(){
    $('#file-mng-dialog-pur').dialog({
        title:'附件管理',
        width: 800,
        content:'<div id="file_list_pur"><table id="plan_file_list-pur" style="min-height:250px;"></table></div>',
        closed: false,
        cache: false,
        modal: true,
        buttons: [
            {
                text:'关闭',
                iconCls:'icon-remove',
                handler:function(){
                    $('#file-mng-dialog-pur').dialog("close");
                }
            }
        ]
    });

    queryPurPlanFiles();
}
//附件检索
function queryPurPlanFiles(){
    $('#plan_file_list-pur').datagrid({
        url:basePath+'/pbsCommonController/queryAttachment',
        width:'100%',
        idField: 'ID',
        columns:[[
            {field:'fileName',title:'文件名',halign:'center',width:'50%'},
            {field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
                    return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'
                }}
        ]],
        queryParams:{
            targetId:function(){
                return versionId;
            },
            targetType:4
        }
    });
}

//附件下载
function downAttachment(path,fileName,fileId){
    path = encodeURI(path);
    fileName = encodeURI(fileName);
    window.location.href = basePath+"/structure/downNodeAttachment?path="+path+"&fileName="+fileName+"&fileId="+fileId;
}

//计划状态修改
function changeBDStatusInfo(status){
    colSty=true;
    if(status==0){
        $('.status-info-pur').text('草稿');
    }else if(status==1){
        colSty = false;
        $('.status-info-pur').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>审批中</u></a>');
    }else if(status==2){
        colSty = false;
        $('.status-info-pur').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>已审批</u></a>');
    }else if(status==-1){
        colSty = false;
        $('.status-info-pur').text('已取消');
    }else{
        $('.status-info-pur').text('草稿');
    }
}

//tabs 选中事件
function queryPurTabInfo(){
    //获取选中TAB
    var selectTab = $('.bdst-info-tabs-pur').tabs('getSelected');
    var title=selectTab.panel('options').title;
    $('.bdst-info-tabs-pur').tabs({
        border:false,
        onSelect:function(title){
            if(title=='拟推荐供应商'){
                queryPurSupplier();
            }
            if(title=='采购包包含设备'){
                querySubPurPlanScope();
            }
        }
    });
    if(title=='拟推荐供应商'){
        queryPurSupplier();
    }
    if(title=='采购包包含设备'){
        querySubPurPlanScope();
    }
}
/**
 * 拟推荐供应商信息列表
 */
//初始化采购推荐供应商列表：拟推荐供应商相关信息的查询、修改、新增以及删除直接共用施工分包
function queryPurSupplier(){
    //获取采购包明细信息
    var row=$('#bd-list-info-pur').datagrid('getSelected');
    var constructPlanId_pur="";
    if(row!=null){
        constructPlanId_pur=row.ID;
    }
    $('#bd-supplier-list-pur').datagrid({
        url:basePath+'/constructPlan/querySupplier',
        height:'100%',
        width:'100%',
        idField: 'ID',
        checkOnSelect:false,
        columns:[[
            {field:'NAME',title:'拟推荐供应商',halign:'center',width:'45%'},
            {field:'ISHANDINPUT',title:'是否手动录入',halign:'center',width:'30%',
                formatter:function(value,row,index){
                    if(value==0){
                        return '否';
                    }else{
                        return '是';
                    }
                }
            },
            {field:'ISINCONTRACT',title:'是否合同承包约定',halign:'center',width:'20%',
                formatter:function(value,row,index){
                    if(value==0){
                        return '否';
                    }else{
                        return '是';
                    }
                }
            }
        ]],
        queryParams: {
            constructPlanId:function(){
                return constructPlanId_pur;
            }
        }
    });
}
//初始化采购包包含设备信息
function querySubPurPlanScope(){
    //采购包明细ID值
    var row=$('#bd-list-info-pur').datagrid('getSelected');
    var purPlanId="";
    if(row!=null){
        purPlanId=row.ID;
    }
    $('#bd-subPurPlan-scope-list-pur').datagrid({
        url:basePath+'/purPlan/queryPurPlanToEquip',
        height:'95%',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        columns:[[
            {field:'MTID',title:'物料ID',hidden:'true'},
            {field:'PMMCODE',title:'物料编码',halign:'center',width:'10%',
                formatter: function(value,row) {
                    if (row.groupId != undefined) {
                        return "附";
                    } else {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }},
            {field:'PRJMATERIALNAME',title:'项目物料名称',halign:'center',width:'13%'},
            {title: '参数',field: 'DCP',width: "14%",halign: "center",align: "left",
                formatter: function(value,row) {
                    if (value) {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            },
            {field:'ICQTY',title:'该包包含数量',halign:'center',width:'9%'},
            {field:'QTY',title:'总数',halign:'center',width:'8%'},
            {field:'NODENAME',title:'所属子项',halign:'center',width:'13%'},
            {field:'MAJORID',title:'专业',halign:'center',width:'10%',
                formatter: function(value,row) {
                    if (value) {
                        return majorArr[value];
                    }
                }},
            {field:'UNITID',title:'单位',halign:'center',width:'6%',
                formatter: function(value) {
                    return unitListMap[value];
                }},
            {field:'UNITWEIGHT',title:'单重(吨)',halign:'center',width:'7%'},
            {field:'TOTLEWEIGHT',title:'总重(吨)',halign:'center',width:'7%',
                formatter: function(value,row) {
                    if (row.ICQTY && row.UNITWEIGHT) {
                        return row.ICQTY*row.UNITWEIGHT;
                    }else{
                        return "";
                    }
                }
            }
        ]],
        queryParams: {
            purPlanId:function(){
                return purPlanId;
            }
        },
        onClickRow:function(rowIndex,rowData){
            //加载设备在其他采购包包含数量关系
            majorOfOtherSubcontract();
            loadPriceInfo1(rowData.PBSCODE,rowData.ID);
        },
        onLoadSuccess:function(data){
            if(data.total>0){
                $('#bd-subPurPlan-scope-list-pur').datagrid('clearSelections');
                $('#bd-subPurPlan-scope-list-pur').datagrid('clearChecked');
            }
            $("#bd-subPurPlan-major-list-pur").datagrid('loadData',{total:0,rows:[]});
        }
    });
}
//检索该设备在其他采购包包含的数量关系
function majorOfOtherSubcontract(){
    var row=$('#bd-list-info-pur').datagrid('getSelected');
    var equipRow = $('#bd-subPurPlan-scope-list-pur').datagrid('getSelected');
    $("#bd-subPurPlan-major-list-pur").datagrid({
        url:basePath+'/purPlan/queryMajorOfPurSubcontract',
        height:'95%',
        width:'100%',
        columns:[[
            {field:'CODE',title:'采购包号',halign:'center',width:'30%'},
            {field:'NAME',title:'采购包名称',halign:'center',width:'32%'},
            {field:'INCLUDEQTY',title:'包含数量',halign:'center',width:'25%'}
        ]],
        queryParams:{materialId:equipRow.MTID,purPlanId:row.ID}
    });
}

/**
 * 加载物料的费用分配情况
 */
function loadPriceInfo1(pbsCode,planLineId){
    $('#price-list-info1').datagrid({
        url: basePath + '/purPlan/getMaterialPriceLine',
        queryParams: {
            pbsCode: function () {
                return pbsCode;
            },
            type: function () {
                return 1;
            },
            projectId: function () {
                return selectProject;
            },
            planLineId:function () {
                return planLineId;
            }
        },
        height: "100%",
        width: "100%",
        border: false,
        //idField: 'id',
        columns:[[
            {
                field:'ck',
                title:"包含的费用",
                width: "5%",
                checkbox:true
            },{
                field: "expenseTypeId",
                title: "费用名称",
                width: "10%",
                halign:"center",
                align:"left",
                formatter: function(value) {
                    return expenseTypeListMap[value];
                }
            },{
                field: "ratio",
                title: "费率(%)",
                width: "5%",
                halign:"center",
                align:"left"
            },{
                field: "isComputed",
                title: "根据费率计算价格",
                width: "10%",
                halign:"center",
                align:"left",
                formatter: function(value) {
                    return (value===true||value===1)?"是":"否";
                }
            },{
                field: "price",
                title: "单价(万)",
                width: "15%",
                halign:"center",
                align:"left",
                formatter: function(value,row,index) {
                    var base, ratio1, ratio2, ratio3;
                    if (row.base===undefined) {
                        return value;
                    } else {
                        if (row.isComputed===false) {
                            return value;
                        }
                        var token = row.base.split(",");
                        var allRows = $("#price-list-info1").datagrid("getRows");
                        var result;
                        if (token.length===1) {
                            for (var j in allRows) {
                                if (allRows[j].expenseTypeId===token[0]) {
                                    result = allRows[j].price * row.ratio / 100;
                                }
                            }
                        } else if (token.length===2) {
                            for (var i in token) {
                                for (var j in allRows) {
                                    if (allRows[j].expenseTypeId===token[0]) {
                                        base = allRows[j].price;
                                    } else if (allRows[j].expenseTypeId===token[1]) {
                                        ratio1 = allRows[j].ratio / 100;
                                    }
                                }
                            }
                            result = base * (1 + ratio1) * (row.ratio / (100 - row.ratio));
                        } else if (token.length==3) {
                            for (var i in token) {
                                for (var j in allRows) {
                                    if (allRows[j].expenseTypeId==token[0]) {
                                        base = allRows[j].price;
                                    } else if (allRows[j].expenseTypeId==token[1]) {
                                        ratio1 = allRows[j].ratio / 100;
                                    } else if (allRows[j].expenseTypeId==token[2]) {
                                        ratio2 = allRows[j].ratio / (100 - allRows[j].ratio);
                                    }
                                }
                            }
                            result = base * (1 + ratio1 + ratio2 + ratio1*ratio2) * row.ratio / 100;
                        } else if (token.length==4) {
                            for (var i in token) {
                                for (var j in allRows) {
                                    if (allRows[j].expenseTypeId==token[0]) {
                                        base = allRows[j].price;
                                    } else if (allRows[j].expenseTypeId==token[1]) {
                                        ratio1 = allRows[j].ratio / 100;
                                    } else if (allRows[j].expenseTypeId==token[2]) {
                                        ratio2 = allRows[j].ratio / (100 - allRows[j].ratio);
                                    } else if (allRows[j].expenseTypeId==token[3]) {
                                        ratio3 = allRows[j].ratio / 100;
                                    }
                                }
                            }
                            result = base * (1 + ratio1 + ratio2 + ratio3 + ratio1*ratio2 + ratio1*ratio3 + ratio2*ratio3 + ratio1*ratio2*ratio3) * row.ratio / 100;
                        }
                        $("#price-list-info1").datagrid("updateRow", {
                            index: index,
                            row: {
                                price: decimalHandel(result,6)
                            }
                        });
                        return decimalHandel(result,6);
                    }
                }
            },{
                field:"eQty",
                title: "有效数量",
                width: "5%",
                halign:"center",
                align:"left"
            },{
                field: "totalPrice",
                title: "合价(万)",
                width: "15%",
                halign:"center",
                align:"left",
                formatter: function(value,row,index) {
                    return decimalHandel((row.price * row.eQty),6);
                }
            },{
                field: "base",
                title: "计算基数",
                width: "10%",
                halign:"center",
                align:"left",
                formatter: function(value) {
                    if (value!="" && value!=undefined) {
                        var token = value.split(",");
                        var result = "";
                        for (var i=0; i<token.length; i++) {
                            result += expenseTypeListMap[token[i]];
                            if (i<token.length-1) {
                                result += "+";
                            }
                        }
                        return result;
                    }
                }
            },{
                field: "remark",
                title: "备注",
                width: "25%",
                halign:"center",
                align:"left",
                formatter: function(value,row,index) {
                    if (!row.isEnable) {
                        return '<a style="color: red;">费用已完全分配，不可选</a>';
                    }
                }
            }
        ]],
        onLoadSuccess: function(data){
            var rows = data.rows;
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.isCheck) {
                    $("#price-list-info1").datagrid("checkRow",i);
                }
                if (!row.isEnable) {
                    $("#price-list-info1").prev().find("input[type='checkbox']")[i + 1].disabled = true;
                }
            }
        }
    });
}
