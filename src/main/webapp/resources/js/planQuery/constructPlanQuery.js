//检索标段信息
function queryConsBdListInfo(){
    $('#bd-list-info-cons').datagrid({
        url:basePath+'/constructPlan/queryConstructPlan',
        toolbar:'#bd-list-info_tb-cons',
        height:'100%',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        showFooter: true,
        queryParams: {
            versionId:function(){
                return versionId;
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
        columns:[[
            {field:'CODE',title:'标段号',halign:'center',width:'10%'},
            {field:'NAME',title:'标段名称',halign:'center',width:'10%',editor:{type:'validatebox',options:{validType:'text',required:true}}},
            {field:'CONSTRUCTTYPEID',title:'类型',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME"}},formatter:function(value,row,index){
                    if(constructListMap[value]==null||constructListMap[value]==undefined){
                        return '';
                    }
                    return constructListMap[value];
                }},
            {field:'ESTPRICE',title:'价格估算（万元）',halign:'center',width:'10%',editor:{type:"validatebox",options:{validType:'intOrFloat'}}},
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
            {field:'PURTYPEID',title:'采购方式',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME"}},formatter:function(value,row,index){
                    if(purListMap[value]==null||purListMap[value]==undefined){
                        return '';
                    }
                    return purListMap[value];
                }},
            {field:'REMARK',title:'备注',halign:'center',width:'10%',editor:'text'},
            {field:'RECEIVEREQFILETIME',title:'计划招标工作启动时间',halign:'center',width:'10%',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'CREATETIME',title:'计划招标文件发售时间',halign:'center',width:'10%',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'EQUIPREQCONFIRMTIME',title:'计划开标时间',halign:'center',width:'10%',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'DELIVERYTIME',title:'计划评标、定标时间',halign:'center',width:'10%',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'CONTRACTTIME2',title:'计划合同签订时间',halign:'center',width:'10%',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'ARRIVALTIME',title:'计划进场时间',halign:'center',width:'10%',editor:'text',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'INSTALLTIME',title:'计划开工时间',halign:'center',width:'10%',editor:'text',editor:{type:'datebox'},formatter:function(value,row,index){
                    if(value==null||value==undefined){
                        return null;
                    }else{
                        return Utils.dateFormat(value,'yyyy-mm-dd');
                    }
                }},
            {field:'PROGRESSREMARK',title:'进度备注',halign:'center',width:'10%',editor:'text'}
        ]],
        onSelect:function(){
            queryConsTabInfo();
        },
        onLoadSuccess:function(data){
            reloadFooter();
            changeBDStatusInfo_cons(status);
            //默认选中第一条
            if(data!=null&&data.total>0){
                $('#bd-list-info-cons').datagrid('selectRow',0);
            }else{
                // $('.s_easyui-linkbutton').linkbutton('disable');
                // $('.sc_easyui-linkbutton').linkbutton('disable');
                // $('.q_easyui-linkbutton').linkbutton('disable');
                // $('.l_easyui-linkbutton').linkbutton('disable');
                $('#bd-supplier-list-cons').datagrid('loadData',{total:0,rows:[]});
                $('#bd-subcontract-scope-list-cons').datagrid('loadData',{total:0,rows:[]});
                $('#bd-qualifications-list-cons').datagrid('loadData',{total:0,rows:[]});
                $('#bd-license-list-cons').datagrid('loadData',{total:0,rows:[]});
            }
        }
    });
}
function searchConsPlanList() {
    $('#bd-list-info-cons').datagrid("load",{versionId: versionId,type:0,
        projectId:selectProject,key:$('#search-construct-plan').searchbox('getValue')});
}

//附件管理DIALOG
function manageConsFiles(){
    $('#file-mng-dialog-cons').dialog({
        title:'附件管理',
        width: 800,
        content:'<div id="file_list_cons"><table id="plan_file_list-cons" style="min-height:250px;"></table></div>',
        closed: false,
        cache: false,
        modal: true,
        buttons: [
            {
                text:'关闭',
                iconCls:'icon-remove',
                handler:function(){
                    $('#file-mng-dialog-cons').dialog("close");
                }
            }
        ]
    });

    queryConsPlanFiles();
}
//附件检索
function queryConsPlanFiles(){
    $('#plan_file_list-cons').datagrid({
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
            targetType:5
        }
    });
}
//计划状态修改
function changeBDStatusInfo_cons(status){
    colSty=true;
    if(status==0){
        $('.status-info-cons').text('草稿');
    }else if(status==1){
        colSty = false;
        $('.status-info-cons').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>审批中</u></a>');
    }else if(status==2){
        colSty = false;
        $('.status-info-cons').html('<a style=\'color:blue;cursor:pointer;\' onclick=findDetail()><u>已审批</u></a>');
    }else if(status==-1){
        colSty = false;
        $('.status-info-cons').text('已取消');
    }else{
        $('.status-info-cons').text('草稿');
    }
}

//tabs 选中事件
function queryConsTabInfo(){
    //获取选中TAB
    var selectTab = $('.bdst-info-tabs-cons').tabs('getSelected');
    var title=selectTab.panel('options').title;
    $('.bdst-info-tabs-cons').tabs({
        border:false,
        onSelect:function(title){
            if(title=='拟推荐供应商'){
                queryConsSupplier();
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
        queryConsSupplier();
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
function queryConsSupplier(){
    var row=$('#bd-list-info-cons').datagrid('getSelected');
    var constructPlanId_cons="";
    if(row!=null){
        constructPlanId_cons=row.ID;
    }
    $('#bd-supplier-list-cons').datagrid({
        url:basePath+'/constructPlan/querySupplier',
        height:'100%',
        width:'100%',
        idField: 'ID',
        singleSelect:true,
        selectOnCheck:false,
        checkOnSelect:false,
        columns:[[
            {field:'NAME',title:'拟推荐供应商',halign:'center',width:'45%'},
            {field:'ISHANDINPUT',title:'是否手动录入',halign:'center',width:'30%',formatter:function(value,row,index){
                    if(value==0){
                        return '否';
                    }else{
                        return '是';
                    }
                }},
            {field:'ISINCONTRACT',title:'是否合同承包约定',halign:'center',width:'20%',formatter:function(value,row,index){
                    if(value==0){
                        return  '<input type="checkbox" class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled"  onclick="updateBdSupplierRow(this,'+index+');"/>';
                    }else{
                        return '<input type="checkbox"  class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled" checked onclick="updateBdSupplierRow(this,'+index+');"/>';
                    }
                }}
        ]],
        queryParams: {
            constructPlanId:function(){
                return constructPlanId_cons;
            }
        }
    });
}
//初始化分包范围
function querySubcontractScope(){
    var row=$('#bd-list-info-cons').datagrid('getSelected');
    var constructPlanId="";
    if(row!=null){
        constructPlanId=row.ID;
    }
    $('#bd-subcontract-scope-list-cons').datagrid({
        url:basePath+'/constructPlan/queryConstructSubcontractScope',
        height:'100%',
        width:'100%',
        idField: 'ID',
        treeField: 'MATERIALCODE',
        singleSelect:true,
        selectOnCheck:false,
        checkOnSelect:false,
        columns:[[
            {field:'PBSCODE',title:'pbscode',hidden:true},
            {field:'PMMCODE',title:'物料编码',halign:'center',width:'10%',
                formatter: function(value,row) {
                    if (row.groupId != undefined) {
                        return "附";
                    } else {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }},
            {field:'PRJMATERIALNAME',title:'项目物料名称',halign:'center',width:'10%'},
            {title: '参数',field: 'DCP',width: "10%",halign: "center",align: "left",
                formatter: function(value,row) {
                    if (value) {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            },
            {field:'ICQTY',title:'该包包含数量',halign:'center',width:'10%'},
            {field:'QTY',title:'总数',halign:'center',width:'10%'},
            {
                field:'UNITWORKS',
                title:'单位工程类别',
                halign:'center',
                width:'10%',
                formatter: function(value) {
                    return worksMap[value];
                }
            },
            {
                field:'SUBWORKS',
                title:'分部工程类别',
                halign:'center',
                width:'10%',
                formatter: function(value) {
                    return worksMap[value];
                }
            },
            {field:'NODENAME',title:'所属子项',halign:'center',width:'10%'},
            {field:'MAJORID',title:'专业',halign:'center',width:'5%',
                formatter: function(value,row) {
                    if (value) {
                        return majorArr[value];
                    }
                }},
            {field:'UNITID',title:'单位',halign:'center',width:'5%',
                formatter: function(value) {
                    return unitListMap[value];
                }},
            {field:'UNITWEIGHT',title:'单重(吨)',halign:'center',width:'5%'},
            {field:'TOTLEWEIGHT',title:'总重(吨)',halign:'center',width:'5%',
                formatter: function(value,row) {
                    if (row.ICQTY && row.UNITWEIGHT) {
                        return (row.ICQTY*row.UNITWEIGHT).toFixed(2);
                    }else{
                        return "";
                    }
                }
            }
        ]],
        queryParams: {
            constructPlanId:function(){
                return constructPlanId;
            }
        },
        onClickRow:function(rowIndex,rowData){
            // majorOfOtherSubcontract_cons("bd-subcontract-major-list-cons");
            loadPriceInfo(rowData.PBSCODE,rowData.ID);
        },
        onLoadSuccess:function(data){
            if(data.total>0){
                $('#bd-subcontract-scope-list-cons').datagrid('clearSelections');
                $('#bd-subcontract-scope-list-cons').datagrid('clearChecked');
            }
            $('#bd-subcontract-major-list-cons').datagrid('loadData',{total:0,rows:[]})
        }
    });
}

//资质要求
function queryQualifications(){
    var row=$('#bd-list-info-cons').datagrid('getSelected');
    var constructPlanId="";
    if(row!=null){
        constructPlanId=row.ID;
    }
    $('#bd-qualifications-list-cons').datagrid({
        url:basePath+'/constructPlan/queryConstructQualifications',
        height:'100%',
        width:'100%',
        idField: 'ID',
        treeField: 'MATERIALCODE',
        singleSelect:true,
        selectOnCheck:false,
        checkOnSelect:false,
        columns:[[
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
        onLoadSuccess:function(data){
            if(data.total>0){
                $('#bd-qualifications-list-cons').datagrid('clearSelections');
                $('#bd-qualifications-list-cons').datagrid('clearChecked');
            }
        }
    });
}
//许可要求列表查询
function queryLicense(){
    var row=$('#bd-list-info-cons').datagrid('getSelected');
    var constructPlanId="";
    if(row!=null){
        constructPlanId=row.ID;
    }
    $('#bd-license-list-cons').datagrid({
        url:basePath+'/constructPlan/queryConstructLicensing',
        height:'100%',
        width:'100%',
        idField: 'ID',
        treeField: 'MATERIALCODE',
        singleSelect:true,
        selectOnCheck:false,
        checkOnSelect:false,
        columns:[[
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
            {field:'REMARK',title:'备注',halign:'center',width:'30%'}
        ]],
        queryParams:{constructPlanId:function(){
                return constructPlanId;
            }},
        onLoadSuccess:function(data){
            if(data.total>0){
                $('#bd-license-list-cons').datagrid('clearSelections');
                $('#bd-license-list-cons').datagrid('clearChecked');
            }
        }
    });
}

/**
 * 加载物料的费用分配情况
 */
function loadPriceInfo(pbsCode,planLineId){
    $('#price-list-info2').datagrid({
        url: basePath + '/purPlan/getMaterialPriceLine',
        queryParams: {
            pbsCode: function () {
                return pbsCode;
            },
            type: function () {
                return 2;
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
                        var allRows = $("#price-list-info2").datagrid("getRows");
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
                        $("#price-list-info2").datagrid("updateRow", {
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
                    $("#price-list-info2").datagrid("checkRow",i);
                }
                if (!row.isEnable) {
                    $("#price-list-info2").prev().find("input[type='checkbox']")[i + 1].disabled = true;
                }
            }
        }
    });
}

//加载footer合计行
function reloadFooter() {
    var rows = $('#bd-list-info-cons').datagrid('getRows');
    var total = 0;
    for (var i = 0; i < rows.length; i++) {
        total += parseFloat(rows[i].ESTPRICE);
    }
    $('#bd-list-info-cons').datagrid('reloadFooter',[
        {NAME: '合计', ESTPRICE: total}
    ]);
}
