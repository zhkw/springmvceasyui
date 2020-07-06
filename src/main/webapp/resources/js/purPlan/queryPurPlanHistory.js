var selectProject;
var basePath=$("#basePath").val();
//提供服务范围
var serviceList;
var serviceListMap = new Array();
//采购方式
var purList;
var purListMap = new Array();
//检验等级
var testLevelList;
var testLevelListMap = new Array();
var projectPurVId;
//专业
var majorArr = new Array();
var pbsNameArr ;
//搜索添加版本
var pbsVersionId ;
//单位
var unitListMap = new Array();

var expenseTypeList;
var expenseTypeListMap = [];
$(function(){


	$.ajax({
		url: basePath+"/getDropDownItemDisplayData",
		data: "dropDownName=ExpenseType&condition=&isNotNull=false",
		method: "post",
		dataType: "json",
		success: function(data) {
			expenseTypeList = data;
			for (var i in data) {
				expenseTypeListMap[data[i].ID] = data[i].NAME;
			}
		}
	});
	//初始化专业信息
	Utils.ajaxJsonSync(basePath+"/manHour/getMajorInfo",{},function(obj){
		for (var i = 0; i < obj.length; i++) {
 			majorArr[obj[i].ID] = obj[i].MAJORNAME;
		}
	});
	//初始化单位
	Utils.ajaxJsonSync(basePath+"/getDropDownItemDisplayData",
		{dropDownName:"MMUnitList",condition:"",isNotNull:false},
		function(data){
		for (var i in data) {
            unitListMap[data[i].ID] = data[i].UNITNAME;
        }
	});
	//初始化基础数据
	queryBaseDataTypes();
});

//初始化加载基础数据
function queryBaseDataTypes(){
	$.ajax({
		url:basePath+'/purPlan/queryBaseDataTypes',
		type:'POST',
		async: false ,
		success:function(data){
			//供应商提供服务范围
			if(data!=null&&data.serviceType!=null){
				serviceList=data.serviceType;
				for(var i in serviceList){
					serviceListMap[serviceList[i].ID]=serviceList[i].NAME;
				}
			}
			//检验等级
			if(data!=null&&data.testType!=null){
				testLevelList=data.testType;
				for(var i in testLevelList){
					testLevelListMap[testLevelList[i].ID]=testLevelList[i].NAME;
				}
			}
			//采购方式：直接调用了施工计划的方法
			if(data!=null&&data.purType!=null){
				purList=data.purType;
				for(var i in purList){
					purListMap[purList[i].ID]=purList[i].NAME;
				}
			}
			
		}
	});
	getProjectSummary();
	preparatData();
	//加载采购包明细列表
	queryBdListInfo();
	//加载采购包下的供应商/包含设备信息Tab
	queryTabInfo();
}

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
			projectPurVId=versionId;
            if(status==0){
				$('.status-info').text('草稿');
				$('.status-info').attr('bd_status',0);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==1){
				$('.status-info').text('审批中');
				$('.status-info').attr('bd_status',1);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==2){
				$('.status-info').text('已审批');
				$('.status-info').attr('bd_status',2);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else if(status==3){
                $('.status-info').text('已驳回');
                $('.status-info').attr('bd_status',3);
                $('.status-info').attr('isNewFlag',isNewFlag);
            }else if(status==-1){
				$('.status-info').text('已取消');
				$('.status-info').attr('bd_status',-1);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}else{
				$('.status-info').text('草稿');
				$('.status-info').attr('bd_status',0);
				$('.status-info').attr('isNewFlag',isNewFlag);
			}	
}
//检索采购包信息
function queryBdListInfo(){			
	$('#bd-list-info').datagrid({
	url:basePath+'/purPlan/queryPurPlan',
	toolbar:'#bd-list-info_tb',
	height:'100%',
	width:'100%',
	idField: 'ID',
	singleSelect:true,
	showFooter: true,
	queryParams: {
		versionId:function(){
				return projectPurVId;
		},
		type:function(){
			return 0;
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
		queryTabInfo();
	},
	onLoadSuccess:function(data){
		reloadFooter();
		//默认选中第一条
		if(data!=null&&data.total>0){
			//采购包列表
			$('#bd-list-info').datagrid('selectRow',0);
		}else{
			//拟推荐供应商
			$('.s_easyui-linkbutton').linkbutton('disable');
			$('#bd-supplier-list').datagrid('loadData',{total:0,rows:[]});
			//包含设备信息
			$('.sc_easyui-linkbutton').linkbutton('disable');
			$('#bd-subPurPlan-scope-list').datagrid('loadData',{total:0,rows:[]});
		}
	}});
}

//搜索采购计划明细
function searchPurPlanList(){
	$('#bd-list-info').datagrid("load",{versionId: projectPurVId,type:0,
		projectId:selectProject,key:$('#search-Pur-plan').searchbox('getValue')});
}

//计算天数差的函数
function GetDateDiff(startDate,endDate)  
{  
    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
    var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
    return  dates;    
}

//tabs 选中事件
function queryTabInfo(){
	//获取选中TAB
	var selectTab = $('.bdst-info-tabs').tabs('getSelected');
	var title=selectTab.panel('options').title;
		$('.bdst-info-tabs').tabs({   
		  border:false,   
		  onSelect:function(title){  
			if(title=='拟推荐供应商'){
			  querySupplier();
			}
			if(title=='采购包包含设备'){
				querySubPurPlanScope();
			}
		}
		});
		if(title=='拟推荐供应商'){
		    querySupplier();
		}
		if(title=='采购包包含设备'){
			querySubPurPlanScope();
		}
}

/**
 * 拟推荐供应商信息列表
 */
//初始化采购推荐供应商列表：拟推荐供应商相关信息的查询、修改、新增以及删除直接共用施工分包
function querySupplier(){
	//获取采购包明细信息
	 var row=$('#bd-list-info').datagrid('getSelected');
	 var constructPlanId="";
	 if(row!=null){
		 constructPlanId=row.ID;
	 }
	 $('#bd-supplier-list').datagrid({
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
					return constructPlanId;
			},
		}
	});
	}

//供应商基础信息列表检索
function queryBaseSupplierInfo(){
	$('#supplier-list').datagrid('reload');
}

//初始化采购包包含设备信息
function querySubPurPlanScope(){
	//采购包明细ID值
	 var row=$('#bd-list-info').datagrid('getSelected');
	 var purPlanId="";
	 if(row!=null){
		 purPlanId=row.ID;
	 }
	$('#bd-subPurPlan-scope-list').datagrid({
		url:basePath+'/purPlan/queryPurPlanToEquip',
		height:'100%',
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
			loadPriceInfo(rowData.PBSCODE,rowData.ID);
		},
		onLoadSuccess:function(data){
			if(data.total>0){
				 $('#bd-subPurPlan-scope-list').datagrid('clearSelections');
				 $('#bd-subPurPlan-scope-list').datagrid('clearChecked');
			}			
			$("#bd-subPurPlan-major-list").datagrid('loadData',{total:0,rows:[]});
		}
	});	
}
//检索该设备在其他采购包包含的数量关系
function majorOfOtherSubcontract(){
	 var row=$('#bd-list-info').datagrid('getSelected');
	 var equipRow = $('#bd-subPurPlan-scope-list').datagrid('getSelected');
	$("#bd-subPurPlan-major-list").datagrid({
    url:basePath+'/purPlan/queryMajorOfPurSubcontract',
    height:'100%',
    width:'100%',
    columns:[[
		{field:'CODE',title:'采购包号',halign:'center',width:'30%'},
		{field:'NAME',title:'采购包名称',halign:'center',width:'32%'},
		{field:'INCLUDEQTY',title:'包含数量',halign:'center',width:'25%'}
    ]],
	queryParams:{materialId:equipRow.MTID,purPlanId:row.ID}	
});
}

//设备成套安装dialog
function completeInstallDialog(){
	$('#complete-install-dialog').dialog({
    title:'供应商成套安装',
    width: '60%',
	content:'<div class="easyui-tabs bdst-info-tabs" id="completeInstallInfo">'+
				'<div title="采购计划" class="bdst-info-tab bdst-tab">'+
					'<table id="purchase-supplier-list" style="min-height:350px;"></table>'+
				'</div>'+
				'<div title="施工分包策划"  class="bdst-info-tab bdst-tab" data-options="">'+					
					'<table id="construct-subcontract-list" style="min-height:350px;"></table>'+
				'</div>'+
			'</div>',
    closed: false,
    cache: false,
    modal: true,
	buttons: [	
				{
					text:'关闭',
					iconCls:'icon-remove',
					handler:function(){
						$('#complete-install-dialog').dialog("close");
					}
				}]
	});
	if($('.status-info').attr('bd_status')==0&&$('.status-info').attr('isNewFlag')==1){
		$('.m_easyui-linkbutton').linkbutton('enable');
	}else{
		$('.m_easyui-linkbutton').linkbutton('disable');
	}
	queryCompleteInstallTab();
}
//设备供应商成套安装tab查询
function queryCompleteInstallTab(){	
	//获取选中TAB
	var selectTab = $('#completeInstallInfo').tabs('getSelected');
	var title=selectTab.panel('options').title;
	$('#completeInstallInfo').tabs({   
		  border:false, 
		  selected:1,//初始化选中一个tab页
		  onSelect:function(title){  
			if(title=='采购计划'){
				queryPurchaseInfo();
			}
			if(title=='施工分包策划'){
				queryConstructInfo();
			}
		}
		});
		if(title=='采购计划'){
			queryPurchaseInfo();
		}
		if(title=='施工分包策划'){
			queryConstructInfo();
		}
}
//查询采购计划成套安装
function queryPurchaseInfo(){
	$('#purchase-supplier-list').datagrid({
		url:basePath+'/purPlan/queryPurPlanCompleteInstal',
		height:'100%',
		width:'100%',
		idField: 'ID',
		columns:[[
			{field:'PCODE',title:'采购包号',halign:'center',width:'30%'},
			{field:'PNAME',title:'采购包名称',halign:'center',width:'35%'},
			{field:'SERVICENAME',title:'供应商提供的服务范围',halign:'center',width:'30%'}
		]],
		queryParams:{
			pbsVersionId:function(){
			 return projectPurVId;
			},
			projectId:function(){
				return selectProject;
			}
		 }
	});
}
//查询施工分包成套安装
function queryConstructInfo(){
		$('#construct-subcontract-list').datagrid({
		url:basePath+'/purPlan/queryConstructPlanMaterial',
		height:'100%',
		width:'100%',
		idField: 'ID',
		singleSelect:true,
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'PMMCODE',title:'物料编码',halign:'center',width:'10%'},
			{field:'PNAME',title:'项目物料名称',halign:'center',width:'12%'},
			{field:'MMDESCRIPTION',title:'参数',halign:'center',width:'10%'},
			{field:'PBSNAME',title:'所属子项',width:'10%'},
			{field:'MAJORNAME',title:'专业',width:'10%'},
			{field:'UNITNAME',title:'单位',width:'9%'},
			{field:'QTY',title:'数量',width:'8%'},
			{field:'PATENT',title:'是否含附属设备',width:'8%'},
			{field:'IMPORT',title:'是否进口',width:'6%'},
			{field:'REMARK',title:'备注',width:'11%'}
		]],
		 queryParams:{id:function(){
			 return "";
			},
			projectId:function(){
				return selectProject;
			}
		 },
		 onLoadSuccess:function(data){
			if(data.total>0){
				$('#construct-subcontract-list').datagrid('clearSelections');
				$('#construct-subcontract-list').datagrid('clearChecked');
			}
		}
	});
}

//手动录入供应商列表查看
function queryVsersionSupplierOfHand(){
	$('#license-dialog').dialog({
    title: '手动录入供应商列表',
    width: '55%',
	content:"<div id='version_s_hand_list' style='min-height:300px;'><table id='v_s_h_list'></table></div>",
    closed: false,
    cache: false,
    modal: true,});
	$('#v_s_h_list').datagrid({
		url:basePath+'/purPlan/querySupplierOfHand',
		height:'100%',
		height:'100%',
		columns:[[
			{field:'SNAME',title:'名称',halign:'center',width:'33%'},
			{field:'PNAME',title:'所属采购包',halign:'center',width:'33%'},
			{field:'CODE',title:'所属采购包号',halign:'center',width:'30%'},
		]],
		queryParams:{projId:function(){
						return selectProject;
					},
					id:function(){
						return '';
					}
					},
	});
}
//按钮禁用
function disableOrEnableBDHeaderButton(flag){
	if(flag==null||flag==undefined){
		flag='enable';//disable
	}
	$('.bd_head_button').linkbutton(flag);
}

/**
 * 采购包附件管理：直接使用施工计划相关方法
 */
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
	
	queryPlanFiles();
}
//附件检索
function queryPlanFiles(){
	$('#plan_file_list').datagrid({
		url:basePath+'/constructPlan/querySubcontractPlanFile',
		height:'100%',
		width:'100%',
		idField: 'ID',
		columns:[[
			{field:'FILENAME',title:'文件名',halign:'center',width:'50%'},
			{field:'HANDLE',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
			   return '<button type="button" onclick="downAttachment(\''+row.FILEPATH+'\',\''+row.FILENAME+'\',\''+row.ID+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>';	
			}}
		]],
	    queryParams:{id:function(){
						return projectPurVId;
					}
		}
	});
}

//附件下载
function downAttachment(path,fileName,fileId){
	path = encodeURI(path);
	fileName = encodeURI(fileName);
	window.location.href = basePath+"/structure/downNodeAttachment?path="+path+"&fileName="+fileName+"&fileId="+fileId; 
}

/**
 * 加载物料的费用分配情况
 */
function loadPriceInfo(pbsCode,planLineId){
	$('#price-list-info').datagrid({
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
				return planLineId
			}
		},
		toolbar:'#price-list-info_tb',
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
				width: "10%",
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
				width: "20%",
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
						var allRows = $("#price-list-info").datagrid("getRows");
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
						$("#price-list-info").datagrid("updateRow", {
							index: index,
							row: {
								price: decimalHandel(result,6)
							}
						});
						return decimalHandel(result,6);
					}
				}
			},{
				field: "totalPrice",
				title: "合价(万)",
				width: "15%",
				halign:"center",
				align:"left",
				formatter: function(value,row,index) {
					var qty = $("#bd-subPurPlan-scope-list").datagrid("getSelected").ICQTY;
					return decimalHandel((row.price * qty),6);
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
				width: "20%",
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
				// var expenseTypeId = row.expenseTypeId;
				// var base = row.base;
				// //130为设备费
				// if (expenseTypeId === '130' || base === '130') {
				// 	if (expenseTypeId === '260') {
				//         //只有epc或pc设备安装费属于采购分包
				//         if (serviceListMap[serviceScopeId] === 'EPC' || serviceListMap[serviceScopeId] === 'EPC') {
				//             $("#price-list-info").datagrid("checkRow",i);
				//         }
				// 	}else {
				//         $("#price-list-info").datagrid("checkRow",i);
				// 	}
				// }
				// // $("#price-list-info").prev().find("input[type='checkbox']")[i+1].disabled = true;
				if (row.isCheck) {
					$("#price-list-info").datagrid("checkRow",i);
				}
				if (!row.isEnable) {
					$("#price-list-info").prev().find("input[type='checkbox']")[i + 1].disabled = true;
				}
			}
		}
	});
}

//加载footer合计行
function reloadFooter() {
	var rows = $('#bd-list-info').datagrid('getRows');
	var total = 0;
	for (var i = 0; i < rows.length; i++) {
		total += parseFloat(rows[i].ESTPRICE);
	}
	$('#bd-list-info').datagrid('reloadFooter',[
		{NAME: '合计', ESTPRICE: total}
	]);
}
