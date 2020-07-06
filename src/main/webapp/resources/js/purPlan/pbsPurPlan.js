var selectProject,projectNum,projectName;
var processName;
//采购包
var bdEditingIndex;
//采购包推荐供应商
var bdsEditingIndex;
//采购包包含设备
var bdcopEditingIndex;
var bdqEditingIndex;
var bdLiEditingIndex;
var basePath=$("#basePath").val();
//提供服务范围
var serviceList;
var serviceListMap = new Array();
//采购方式
var purList;
var purListMap = new Array();
//是否可以进入编辑
var isEdit =0;
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
//所包含的物料ID
var materialIds;
var projectId;
//操作列显示样式
var colSty=true;
var selectNode=new Object();
var expenseTypeList;
var expenseTypeListMap = [];
var editIndex;
var project_class;
//是否可操作页面按钮
var isEditA = false;
//类别树
var categoryTreeSetting = {
	async: {
		enable: true,
		dataType:"json" ,
		url:$("#basePath").val()+'/structure/getMaterialcategory',
		otherParam: ["page",1,'pageSize',30,'key',function(){
			return $('#category-key').searchbox('getValue');
		},'filters','PDT'],
		autoParam: ["ID"]
	},
	view: {
		dblClickExpand: false,
		showLine: true
	},
	data: {
		simpleData: {
			enable:true,
			idKey: "id",
			pIdKey: "pid",
			rootPId: ""
		},
		key:{
			name : "CATEGORYNAME",
		}
	},
	callback: {
		onClick:zTreeOnClick,
	}
};
$(function(){
	projectId = $("#projectId").val();
	$('.easyui-linkbutton').linkbutton("disable");
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
	getProjectSummary(projectId);
	//加载工程项目树
	queryProjectList();
	//初始化基础数据
	queryBaseDataTypes();
	//加载采购包明细列表
	queryBdListInfo();
	//加载采购包下的供应商/包含设备信息Tab
	queryTabInfo();

	// 初始化包含设备表
	$('#bd-subPurPlan-scope-list').datagrid({
		toolbar: "#bd-subPurPlan-scope-list_tb",
		width:'100%',
		height:'100%',
		idField: 'ID',
		singleSelect:true,
		checkOnSelect:false,
		selectOnCheck:false,
		columns:[[
            {field:'ck',title:'',width:'5%',checkbox:true},
		    {field:'PBSCODE',title:'pbscode',hidden:true},
			{field:'PMMCODE',title:'物料编码',halign:'center',width:'10%',
                formatter: function(value,row) {
                    if (row.groupId != undefined) {
                        return "附";
                    } else {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
             }},
			{field:'PRJMATERIALNAME',title:'项目物料名称',halign:'center',width:'13%'},
            {title: '参数',field: 'DCP',width: "17%",halign: "center",align: "left",
                formatter: function(value,row) {
                    if (value) {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            },
			{field:'QTY',title:'总数',halign:'center',width:'6%'},
			{field:'ICQTY',title:'该包包含数量',halign:'center',width:'9%',editor:{
				type : "validatebox",
				options : {
					validType : [ "positive_double"],
					required : true
				}
			}},
			{field:'PRICE',title:'价格',halign:'center',width:'5%',
				formatter: function (value) {
				return value == null ? value : Number(value).toFixed(2);
			}},
			{field:'NODENAME',title:'所属子项',halign:'center',width:'8%'},
            {field:'NODECODE',title:'子项号',halign:'center',width:'7%'},
			{field:'MAJORID',title:'专业',halign:'center',width:'5%',
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
                        return (row.ICQTY*row.UNITWEIGHT).toFixed(2);
                    }else{
                    	return "";
                    }
                }
			}
		]],
		onDblClickRow:function(index,row){
			if(bdcopEditingIndex==undefined){				
				if(isEdit==1){				
					$('#bd-subPurPlan-scope-list').datagrid('beginEdit',index);
				}
				bdcopEditingIndex=index;
			}else{
				$('#bd-subPurPlan-scope-list').datagrid('endEdit',bdcopEditingIndex);
				if(isEdit==1){				
					$('#bd-subPurPlan-scope-list').datagrid('beginEdit',index);
				}
				bdcopEditingIndex=index;
			}
		},
		onAfterEdit:function(rowIndex,rowData,changes){//完成行编辑时触发	
			var row=$(this).datagrid('getSelected');
			var purPlanId="";
			if(row!=null){
				purPlanId=row.PURPLANID;
			}
			if(rowData.QTY && rowData.QTY>0){
				var obj = new Object();
				obj.purPlanId=purPlanId;
				obj.totleQty=rowData.QTY;
				obj.materialId=rowData.MTID;
				obj.icQty=rowData.ICQTY;
				obj.projectID=selectProject;
				obj.planVersionId=projectPurVId;
				//修改：该包包含数量<=总数量-其他包包含数量
				//$.messager.progress({text:'数据处理中......',interval:'100'}); 
				$.ajax({
					url:basePath+'/purPlan/VerifyNumberOfEquip',
					data:obj,
					type:'POST',
					success:function(data){
						$.messager.progress('close');
						if(!data.status){
							$('#bd-subPurPlan-scope-list').datagrid('beginEdit',bdcopEditingIndex);
							bdcopEditingIndex=rowIndex;
							//$.messager.alert('提示','没有足够数量的设备，请重填！');
							$.messager.show({
	    						title : '提示',
	    						msg : '没有足够数量的设备，请重填！',
	    						timeout : 3000,
	    						showType : 'slide'
	    					});
							return false;
						}else{
							updatePurPlanToEquip(rowIndex,rowData.ID,rowData.ICQTY);
						}							
					},
					error:function (XMLHttpRequest, textStatus, errorThrown) {
						$.messager.progress('close');
					}
				});
			}else{
				updatePurPlanToEquip(rowIndex,rowData.ID,rowData.ICQTY);
			}
		},
        onSelect:function(rowIndex,rowData){
            if(bdcopEditingIndex!=undefined){
                $('#bd-subPurPlan-scope-list').datagrid('endEdit',bdcopEditingIndex);
                //bdcopEditingIndex=undefined;
            }
            //加载设备在其他采购包包含数量关系
            majorOfOtherSubcontract();
            //加载费用分配情况
            loadPriceInfo(rowData.PBSCODE,rowData.ID);
        },
		onLoadSuccess:function(data){
			materialIds = new Array();
			materialIds.splice(0,materialIds.length);//清空数组
			for (var i = 0; i < data.rows.length; i++) {
	    		materialIds[i] = data.rows[i].PBSCODE;
			}
			if(data.total>0){
				$('#bd-subPurPlan-scope-list').datagrid('clearSelections');
				$('#bd-subPurPlan-scope-list').datagrid('clearChecked');
                $('#bd-subPurPlan-scope-list').datagrid('selectRow',0);
			}			
		},
	});

    $('#packageList').datagrid({
        idField: 'ID',
		width:'98%',
        columns:[[
            {field:'PBSNODENAME',title:'子项名称',width:'10%'},
            {field:'NODECODE',title:'子项号',width:'10%'},
            {field:'MAJORNAME',title:'专业',width:'8%'},
            {field:'PRJMATERIALCODE',title:'物料编码',halign:'center',width:'20%',
                formatter: function(value,row) {
                    if (row.groupId != undefined) {
                        return "附";
                    } else {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }},
            {field:'PRJMATERIALNAME',title:'项目物料名称',halign:'center',width:'20%%'},
            {title: '参数',field: 'MMDESCRIPTION',width: "20%",halign: "center",align: "left",
                formatter: function(value,row) {
                    if (value) {
                        return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                    }
                }
            },
            {field:'NAME',title:'费用项',width:'10%'}
            ]]
	});
});

//初始化加载基础数据
function queryBaseDataTypes(){
	$.ajax({
		url:basePath+'/purPlan/queryBaseDataTypes',
		type:'POST',
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
}
//检索工程项目列表
function queryProjectList(){
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:{key:$('.project-key').searchbox('getValue')},//获取查询条件
		onClick:function(node){
			$('#bd-list-info').datagrid('clearSelections');
			//提示需要完善数据
			if($('.bdst .validatebox-invalid').length>0){
				var node = $('#projectList').tree('find', selectProject);
				$('#projectList').tree('select', node.target);
				$.messager.alert('提示',"请先完善数据！");
				return ;
			}else{
				//主动保存数据
				$('#bd-list-info').datagrid("endEdit",bdEditingIndex);
				if(node.children=='undefined'|| node.children==undefined){
					projectId = node.id;
					$("#projectId").val(node.id);
					selectProject=node.id;
					projectNum=node.pnum;
					projectName=node.text;
					projectView(projectId);
					//设置操作按钮是否可用
					// disableOrEnableBDHeaderButton("enable");
					//检索项目最新版本
					// queryProjectLastedVersionId(selectProject);
				}else{
					selectProject=undefined;
					projectNum=undefined;
					projectName=undefined;
					projectPurVId="";
					$('.status-info').text('无');
					$('.status-info').attr('bd_status',-100);
					$('.easyui-linkbutton').linkbutton("disable");
					$('#bd-list-info').datagrid('loadData',{total:0,rows:[]});
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
	isCanEdit(projectId,"采购经理");
	//加载项目信息
	getProjectSummary(projectId);
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//设置操作按钮是否可用
	disableOrEnableBDHeaderButton("enable");
	//检索项目最新版本
	queryProjectLastedVersionId(projectId);
}
//查询项目分包最新版本：直接调用了施工计划的方法
function queryProjectLastedVersionId(projectId){
	$.ajax({
		url:basePath+'/constructPlan/getProjectConstructLastedVersionInfo',
		data:{projectId:projectId,type:"P"},
		type:'POST',
		success:function(data){
			changeBDStatusInfo(data.status,data.id,1);
			//检索采购数据
			$('#bd-list-info').datagrid('reload');
		}
	});
}

//根据角色设置页面是否可编辑
function isCanEdit(prjId,roleName) {
    $.ajax({
        url:basePath+'/purPlan/isEdit',
        data:{projectId:prjId,roleName:roleName},
        type:'GET',
        success:function(data){
            isEditA = data.isEdit;
            if (!isEditA){
            	$('.showBtn').hide();
			}else {
                $('.showBtn').show();
			}
        }
    });
}
//计划状态修改
function changeBDStatusInfo(status,versionId,isNewFlag){
	projectPurVId=versionId;
	colSty=true;
    if(status==0){
		$('.status-info').text('草稿');
		$('.status-info').attr('bd_status',0);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==1){
		colSty = false;
		$('.status-info').text('审批中');
		$('.status-info').attr('bd_status',1);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==2){
		colSty = false;
		$('.status-info').text('已审批');
		$('.status-info').attr('bd_status',2);
		$('.status-info').attr('isNewFlag',isNewFlag);
	}else if(status==3){
        colSty = true;
        $('.status-info').text('已驳回');
        $('.status-info').attr('bd_status',3);
        $('.status-info').attr('isNewFlag',isNewFlag);
    }else if(status==-1){
		colSty = false;
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
function queryBdListInfo() {
	$('#bd-list-info').datagrid({
		url:basePath+'/purPlan/queryPurPlan',
		toolbar: "#bd-list-info_tb",
		width:'100%',
		height:'100%',
		idField: 'ID',
		singleSelect:true,
		showFooter: true,
		queryParams: {
			versionId:function(){
				return projectPurVId;
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
		   {field:'HANDLE',title:'操作',halign:'center',width:'3%', halign: "center",align : 'center',
			formatter: function(value,row,index){
				//大标题是已审批或者已撤销状态则编辑按钮不可用
				//var status=$('.status-info').text();
				var str = "";
				if(!colSty){
					str= '<i class="icon-lock" title="已审批" id="'+index+'"></i>';
				}else{
					str= '<i class="icon-edit bd-handle-icon handleBtn" id="'+index+'" onclick="saveBDdata(this,'+index+');"></i>';
				}
				return str;
		    }
		 },
		 {field:'CODE',title:'采购包号',halign:'center',width:'10%'},
		 {field:'NAME',title:'采购包名称',halign:'center',width:'12%',editor:{type:'validatebox',options:{validType:'text',required:true}}}
		]],
	    columns:[[				
			{field:'SERVICESCOPEID',title:'供应商提供服务范围',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME",required:true}},
				formatter:function(value,row,index){
				if(serviceListMap[value]==null||serviceListMap[value]==undefined){
					return '';
				}
				return serviceListMap[value];
			}},
			{field:'ESTPRICE',title:'价格估算（万元）',halign:'center',width:'10%',
                formatter: function(value,row,index){
                	if(value){
                		return decimalHandel(value,2);
                	}else{
                		return 0;
                	}
                }},
			{field:'PURTYPEID',title:'采购方式',halign:'center',width:'10%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME",required:true}},
				formatter:function(value,row,index){
				if(purListMap[value]==null||purListMap[value]==undefined){
					return '';
				}
				return purListMap[value];
			}},
			{field:'REASON',title:'采购方式选择理由',halign:'center',width:'16%',editor:'text'},
			{field:'TESTLEVELID',title:'检验等级',halign:'center',width:'13%',editor:{type:'combobox',options:{valueField:"ID",textField:"NAME",multiple:true,required:true}},
				formatter:function(value,row,index){
					value+="";
					var levelIds=value.split(",");
					var level="";
					for(var i in levelIds){
					 if(testLevelListMap[levelIds[i]]!=null&&testLevelListMap[levelIds[i]]!=undefined){
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
			{field:'CONFIGURE',title:'配置标准',halign:'center',width:'12%',editor:'text'},
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
			{field:'RECEIVEREQFILETIME',title:'计划接收请购文件时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:"date"}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			//{field:'CONTRACTTIME',title:'计划签订合同时间',halign:'center',width:'12%',editor:{type:'datebox'},formatter:function(value,row,index){
			{field:'CONTRACTTIME',title:'计划签订合同时间',halign:'center',width:'12%', editor:{type:'datebox',options:{required:true,validType:["endTime_c","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'EQUIPREQCONFIRMTIME',title:'计划设备提资确认时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_e","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'DELIVERYTIME',title:'计划发货时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_d","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'ARRIVALTIME',title:'计划到货时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_a","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'INSTALLTIME',title:'计划现场安装时间',halign:'center',width:'12%',editor:{type:'datebox',options:{required:true,validType:["endTime_i","date"]}},formatter:function(value,row,index){
				if(value==null||value==undefined){
					return null;
				}else{
					return Utils.dateFormat(value,'yyyy-mm-dd');
				}
			}},
			{field:'MANUCYCLE',title:'正常制造周期(天)',halign:'center',width:'12%',editor:'numberbox'},
			{field:'FOCUSONPROGRESS',title:'进度重点关注',halign:'center',width:'9%',formatter:function(value,row,index){
				//到货日期-合同签订日期>正常制造周期时，值为是，其余则为否。
				var date1 = row.ARRIVALTIME;
				var date2 = row.CONTRACTTIME;
				if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
					var manucycle = row.MANUCYCLE;
					var day = Utils.GetDateDiff(date1,date2);
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
		onBeforeEdit:function(index,row){
			$.extend($.fn.datebox.defaults.rules, {
				endTime_c :{ 
    			        validator : function(value){
                            var startDate = row.RECEIVEREQFILETIME;
                            var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
	  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
	  	  			      	var rs=d2>d1;
	  	  			      	return rs;
  	  			      	
    			        }, 
    			        message : '计划签订合同时间必须大于计划接收请购文件时间'    
    			},
    			endTime_e :{ 
			        validator : function(value){
                        var startDate = row.CONTRACTTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
  	  			      	var rs=d2>d1;
  	  			      	return rs;
	  			      	
			        }, 
			        message : '计划设备提资确认时间必须大于计划签订合同时间'    
    			},
    			endTime_d :{ 
			        validator : function(value){
                        var startDate = row.EQUIPREQCONFIRMTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
  	  			      	var rs=d2>d1;
  	  			      	return rs;
	  			      	
			        }, 
			        message : '计划发货时间必须大于计划设备提资确认时间'    
    			},
    			endTime_a :{ 
			        validator : function(value){
                        var startDate = row.DELIVERYTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
  	  			      	var rs=d2>d1;
  	  			      	return rs;
	  			      	
			        }, 
			        message : '计划到货时间必须大于计划发货时间'    
    			},
    			endTime_i :{ 
			        validator : function(value){
                        var startDate = row.ARRIVALTIME;
                        var d1 = $.fn.datebox.defaults.parser(new Date(startDate).format("yyyy-MM-dd"));
  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
  	  			      	var rs=d2>d1;
  	  			      	return rs;
	  			      	
			        }, 
			        message : '计划现场安装时间必须大于计划到货时间'    
    			}
    			
			});
			 if($('.status-info').attr('isNewFlag')!=1){
				$.messager.alert('提示','历史版本不能修改！');
				return false;
			 }else{
				 editIndex = index;
			 }
		},
		onBeginEdit:function(index){
			$('.bd-handle-icon[id="'+index+'"]').removeClass('icon-edit').addClass('icon-save');
			//采购Combox初始化
			bdEditingIndex=index;
			//服务范围
			var serviceType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "SERVICESCOPEID"});
			//检验等级
			var testType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "TESTLEVELID"});
			//采购方式
			var purType= $(this).datagrid("getEditor", {id: bdEditingIndex, field: "PURTYPEID"});
			$(serviceType.target).combobox("loadData",serviceList);
			var serviceID="";
			for ( var i in serviceList) {
				if(serviceList[i].NAME=='P'){//服务范围默认选择P
					serviceID=serviceList[i].ID;
				}
			}
			var svc = $(serviceType.target).combobox("getValue");
			if(!svc){
				$(serviceType.target).combobox("select",serviceID);
			}
			
			$(testType.target).combobox("loadData",testLevelList);
			$(purType.target).combobox("loadData",purList);
		},
		onAfterEdit:function(rowIndex, rowData, changes){		
			updatePurPlanCost();
			submmitBDdataToDB();
			editIndex = undefined;
			reloadFooter();
		},
		onSelect:function(index, row){		
			if($(this).datagrid('getEditors',index).length < 1){
				setTabsBtnStatus(false);
			}else{
				setTabsBtnStatus(true);
			}
			queryTabInfo();
		},
		onLoadSuccess:function(data){
			reloadFooter();
			/*//大标题是已审批或者已撤销状态则编辑按钮不可用
			var status=$('.status-info').text();
			if(status=='已取消' || status=='已审批'){
				$("#bd-list-info").datagrid("hideColumn", "HANDLE");
			}else{
				$("#bd-list-info").datagrid("showColumn", "HANDLE");
			}*/
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
				//$('#bd-subPurPlan-scope-list').datagrid('loadData',{total:0,rows:[]});
			}
			querySubPurPlanScope();
		}
	});
}
//更新采购计划控制价 
function updatePurPlanCost(){
	// 获取所包含设备的pbsCode
	$('#bd-list-info').datagrid("selectRow",editIndex);
	var row = $('#bd-list-info').datagrid("getSelected");
	var purPlanId = row.ID;
	Utils.ajaxJsonSync(basePath+"/purPlan/estimateCostControl",
			{projectId:selectProject,codeType:"scope_change",planId:purPlanId,type:1},
			function(data){
		var rowId = $('#bd-list-info').datagrid("getSelected").ID;
		var rowIndex = $("#bd-list-info").datagrid("getRowIndex",rowId);
				$("#bd-list-info").datagrid("updateRow", {
					index: rowIndex,
					row: {
						ESTPRICE: data.totalCost.toFixed(2)
					}
				}).datagrid("refreshRow", rowIndex);
	});
}
//搜索采购计划明细
function searchPurPlanList(){
	$('#bd-list-info').datagrid("load",{versionId: projectPurVId,type:0,
		projectId:selectProject,key:$('#search-Pur-plan').searchbox('getValue')});
}

//新增采购包明细
function addBDInfo() {
  if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
      &&$('.status-info').attr('isNewFlag')==1){
	if($('.bdst .validatebox-invalid').length>0){
		$.messager.alert('提示',"请按格式输入数据后保存！");
	}else if($('.bdst .icon-save').length>0){
		MyMessager.alert.show('提示',"请先保存编辑中数据！");
	}else{
		$('#bd-list-info').datagrid("endEdit",bdEditingIndex);
		//向数据库新增一条记录，最终是要获取到采购包ID值，这样可以在编辑状态下同时新增供应商和包含设备信息做批量保存。
		var obj = new Object();
		var date = new Date();
		obj["pbsPurPlanVOList[0].name"]=date.getUTCFullYear()+"_"+date.getHours()+"_"+date.getMilliseconds();//包名称年份_小时_毫秒
		obj["pbsPurPlanVOList[0].planVersionId"]=projectPurVId;
		obj["pbsPurPlanVOList[0].isInContract"]=true;
		if(selectProject!=undefined){
			obj.projectId=selectProject;
			$.ajax({
				url:basePath+'/purPlan/addOrUpdatePbsPurPlan',
				type:'POST',
				data:obj,
				success:function(data){
					if(data.status){
						//添加新行
						$('#bd-list-info').datagrid('appendRow',{ID:data.newID,STATUS:0});
						var rows=$('#bd-list-info').datagrid('getRows');
						var index=$('#bd-list-info').datagrid('getRowIndex',rows[rows.length-1]);
						$('#bd-list-info').datagrid('beginEdit',index);
						$('#bd-list-info').datagrid('selectRow',index);//选中当前新增行
						setTabsBtnStatus(true);
					}
				 }
			   });	
		}			
	}    
  }else{
	$.messager.alert('提示',"该版本不是最新草稿版，不能添加采购数据！");
  }
}
//点击第一列的保存按钮，保存采购包明细数据
function saveBDdata(obj,rowNum) {
	if (!isEditA){
		return false;
	}
	//提交之前检测是否存在，供应商和设备未保存的数据，先保存数据再提交
	if(bdsEditingIndex!=undefined){//供应商信息
		$('#bd-supplier-list').datagrid('endEdit',bdsEditingIndex);
	}	
	if(bdcopEditingIndex!=undefined){//包含设备信息
		$('#bd-subPurPlan-scope-list').datagrid('endEdit',bdcopEditingIndex);
		
	}
	
	
	//已审核或者草稿状态并且最新版本
	if(($('.status-info').attr('bd_status')==2||$('.status-info').attr('bd_status')==0 || $('.status-info').attr('bd_status')==3)
		&&$('.status-info').attr('isNewFlag')==1){
		//已审批，修改包状态
		if($('.status-info').attr('bd_status')==2){
			$.messager.confirm('提示','是否确认修改？',function(r){
				if (r){
						updatePlanVersionStatus();//直接调用了施工计划的方法
						if($(obj).hasClass('icon-save')){
							if($('.bdst .validatebox-invalid').length>0){
								$.messager.alert('提示',"请按格式输入数据后保存！");
							}else{
								setTabsBtnStatus(false);
								//检测是否为公开招标
								checkIsOpenPurtype(rowNum);
							}	
						}else{
							if($('.bdst .icon-save').length>0){
								$.messager.alert('提示',"请先保存编辑中数据！");
							}else{
								setTabsBtnStatus(true);
								var index=$(obj).attr('id');
								$('#bd-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
								$('#bd-list-info').datagrid("beginEdit",index);
								$('#bd-list-info').datagrid('selectRow',index);//选中
							}	
						}
					}
				}
			);
		}else{
				if($(obj).hasClass('icon-save')){
					if($('.bdst .validatebox-invalid').length>0){
						$.messager.alert('提示',"请按格式输入数据后保存！");
					}else{
						setTabsBtnStatus(false);
						//检测是否为公开招标
						checkIsOpenPurtype(rowNum);
					}	
				}else{
					if($('.bdst .icon-save').length>0){
						$.messager.alert('提示',"请先保存编辑中数据！");
					}else{
						setTabsBtnStatus(true);
						var index=$(obj).attr('id');
						$('#bd-list-info').datagrid('updateRow',{index:index,row:{STATUS:'0'}});
						$('#bd-list-info').datagrid("beginEdit",index);
						$('#bd-list-info').datagrid('selectRow',index);//选中
					}	
				}
		}
	}else{
		$.messager.alert('提示',"非最新版草稿或者已审批采购包不能进行修改！");
	}
}

//验证采购类型，若为公开招标则清除供应商信息
function checkIsOpenPurtype(rowNum) {
	var rowUpdate=$('#bd-list-info').datagrid('getChanges');
	if(rowUpdate.length >= 1){//修改数据时才判断
	    var rowData = $('#bd-list-info').datagrid('getSelected',rowNum);
		var purType= $('#bd-list-info').datagrid("getEditor", {id: bdEditingIndex, field: "PURTYPEID"});	
		var selectPur=$(purType.target).combobox("getValue");
		if(purListMap[selectPur]=="公开招标"){
			$.messager.confirm('提示','公开招标将清除该采购下拟推荐供应商列表？',function(r){
				if(r){
					$.ajax({
						    url:basePath+'/constructPlan/delConstructPlanSuppliers',//直接调用了施工分包的方法
							data:{constructPlanId:rowData.ID},//参数：采购分包ID
							type:'POST',
							success:function(data){
							if(data.status){
								$('#bd-list-info').datagrid("endEdit",bdEditingIndex);	
							}else{
								$('#bd-list-info').datagrid("beginEdit",index);
							}
						}
					});	
				}
			});
		}else{
			$('#bd-list-info').datagrid("endEdit",bdEditingIndex);	
		}
	}else{
		$('#bd-list-info').datagrid("endEdit",bdEditingIndex);	
	}
}
//采购包数据提交数据库
function submmitBDdataToDB() {
	
	var obj = new Object();
	obj.exist=false;
	var changeRows=$('#bd-list-info').datagrid("getChanges");
	for(i in changeRows){
		obj.exist=true;
		obj["pbsPurPlanVOList["+i+"].id"] = changeRows[i].ID;
		obj["pbsPurPlanVOList["+i+"].code"]=changeRows[i].CODE;//包号
		obj["pbsPurPlanVOList["+i+"].name"]=changeRows[i].NAME;//包名称
		obj["pbsPurPlanVOList["+i+"].serviceScopeId"]=changeRows[i].SERVICESCOPEID;//服务范围
		obj["pbsPurPlanVOList["+i+"].estPrice"]=changeRows[i].ESTPRICE;//估算价
		obj["pbsPurPlanVOList["+i+"].purTypeId"]=changeRows[i].PURTYPEID;//采购方式
		obj["pbsPurPlanVOList["+i+"].reason"]=changeRows[i].REASON;//采购方式选择理由
		obj["pbsPurPlanVOList["+i+"].testLevelId"]=changeRows[i].TESTLEVELID;//检验等级
		obj["pbsPurPlanVOList["+i+"].configure"]=changeRows[i].CONFIGURE;//配置标准
		obj["pbsPurPlanVOList["+i+"].receiveReqFileTime"]=changeRows[i].RECEIVEREQFILETIME;//接受请购文件日期
		obj["pbsPurPlanVOList["+i+"].contractTime"]=changeRows[i].CONTRACTTIME;//签订合同日期
		obj["pbsPurPlanVOList["+i+"].equipReqConfirmTime"]=changeRows[i].EQUIPREQCONFIRMTIME;//设备提资确认时间
		obj["pbsPurPlanVOList["+i+"].deliveryTime"]=changeRows[i].DELIVERYTIME;//发货日期
		obj["pbsPurPlanVOList["+i+"].arrivalTime"]=changeRows[i].ARRIVALTIME;//到货日期
		obj["pbsPurPlanVOList["+i+"].installTime"]=changeRows[i].INSTALLTIME;//现场安装时间
		obj["pbsPurPlanVOList["+i+"].manuCycle"]=changeRows[i].MANUCYCLE;//周期
		if(changeRows[i].ID==null||""==changeRows[i].ID){//版本号
			obj["pbsPurPlanVOList["+i+"].planVersionId"]=projectPurVId;
		}else{
			obj["pbsPurPlanVOList["+i+"].planVersionId"]=changeRows[i].PLANVERSIONID;
		}
		obj["pbsPurPlanVOList["+i+"].isInContract"]=true;
	}
	if(selectProject!=undefined){
			obj.projectId=selectProject;
			if(obj.exist){
				$.ajax({
				url:basePath+'/purPlan/addOrUpdatePbsPurPlan',
				type:'POST',
				data:obj,
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-list-info').datagrid('selectRow',bdEditingIndex);
						bdEditingIndex=undefined;
						//$('#bd-list-info').datagrid('reload');
						//$('#bd-list-info').datagrid('rejectChanges');
						setTabsBtnStatus(false);
						$.messager.show({
    						title : '提示',
    						msg : '保存成功！',
    						timeout : 3000,
    						showType : 'slide'
    					});
					}else{
						$('#bd-list-info').datagrid('reload');
						$('#bd-list-info').datagrid('beginEdit',bdEditingIndex);
						setTabsBtnStatus(true);
						$.messager.show({
    						title : '提示',
    						msg : '保存失败！',
    						timeout : 3000,
    						showType : 'slide'
    					});
					}
				}
			});
		}
	}
}
//删除采购包明细数据
function delBDInfo() {
	if($('.status-info').attr('isNewFlag')!=1|| ($('.status-info').attr('bd_status')!=0 && $('.status-info').attr('bd_status')!=3)){
		 MyMessager.alert.show('提示',"非草稿数据不能删除!");
	}else{
		var selectRows=$('#bd-list-info').datagrid('getSelections');
		if(selectRows==null||selectRows.length==0){
			MyMessager.alert.show('提示',"请选择需要删除采购包！");
		}else{
			$.messager.confirm('提示','你确定要删除该采购包信息？',function(r){
				if (r){
					var ids="";
					for(var i in selectRows){
						if(selectRows[i].ID!=null&&selectRows[i].ID!=undefined){
							ids+=selectRows[i].ID+",";
						}
					}
					pCode = selectRows.CODE;
					if(ids!=""){
						$.ajax({
							url:basePath+'/purPlan/delPurPlan',
							data:{ids:ids,code:pCode},
							type:'POST',
							beforeSend:function() {
								MyMessager.prog.show("提示","请等待","数据处理中...");
							},
							complete:function() {
								MyMessager.prog.close();
							},
							error:function(jqXHR, textStatus, errorThrown) {
								MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
							},
							success:function(data){
								if(data.status){
									for(var i in selectRows){
										var index=$('#bd-list-info').datagrid('getRowIndex',selectRows[i]);
										$('#bd-list-info').datagrid('deleteRow',index);
									}
								}
								
								$.messager.show({
									title : '提示',
									msg : data.info,
									timeout : 3000,
									showType : 'slide'
								});
								$('#bd-list-info').datagrid('reload');
								$('#bd-list-info').datagrid('rejectChanges');
								queryTabInfo();
							}
							
						});
					}else{
						var index=$('#bd-list-info').datagrid('getRowIndex',selectRows[0]);
						$('#bd-list-info').datagrid('deleteRow',index);
						queryTabInfo();
					}
				}
			});
		}
	}
	/*	
	 if($('.status-info').attr('isNewFlag')!=1||$('.status-info').attr('bd_status')==1){
		 $.messager.alert('提示',"历史版本或者审批中数据不能删除!");
	 }else{
		var selectRows=$('#bd-list-info').datagrid('getSelected');	
		//记录ID
		var ids="",pCode = "";
		if(selectRows.ID!=null&&selectRows.ID!=undefined){
			ids=selectRows.ID;
		}
		else{
			if(selectRows==null||selectRows.length==0){
				$.messager.alert('提示',"请选择需要删除采购包！");
			}
		}
	 }
	 */
}

//tabs 选中事件
function queryTabInfo() {
	//获取选中TAB
	var selectTab = $('.bdst-info-tabs').tabs('getSelected');
	var title=selectTab.panel('options').title;
		$('.bdst-info-tabs').tabs({   
		  	border:false,   
		  	onSelect:function(title){  
			if(title=='拟推荐供应商'){
			  	querySupplier();
			  	$("#priceTable").hide();
			}
			if(title=='采购包包含设备'){
				querySubPurPlanScope();
                $("#priceTable").show();
			}
		}
		});
		if(title=='拟推荐供应商'){
		    querySupplier();
            $("#priceTable").hide();
		}
		if(title=='采购包包含设备'){
			querySubPurPlanScope();
            $("#priceTable").show();
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
		// $('.s_easyui-linkbutton').linkbutton("disable");
	}else{
		$('.s_easyui-linkbutton').linkbutton("disable");
	}
	$('#bd-supplier-list').datagrid({
		url:basePath+'/constructPlan/querySupplier',
		toolbar: "#bd-supplier-list_tb",
		width:'100%',
		height:'100%',
		idField: 'ID',
		checkOnSelect:false,
	    columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
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
						return  '<input type="checkbox" class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled"  onclick="updateBdSupplierRow(this,'+index+');"/>';
					}else{
						return '<input type="checkbox"  class="check_isincontract '+row.ID+"_"+index+'" disabled="disabled" checked onclick="updateBdSupplierRow(this,'+index+');"/>';
					}
				}
			}
	    ]],
		queryParams: {
			constructPlanId:function(){
					return constructPlanId;
			},
		},
		onBeforeEdit:function(index,row){
			bdsEditingIndex=index;
			var checkClass=row.ID+"_"+index;
			$("."+checkClass).removeAttr('disabled');
			var nameCol = $(this).datagrid("getColumnOption", "NAME");
        	if(row.ISHANDINPUT==1){//手动录入
        		nameCol.editor = {
                    type: "textbox",
                    options: {
                        prompt: "请输入供应商名称",
                        required: true
                    }
                };
        	}
		},
		onAfterEdit:function(index,row){
			var checkClass=row.ID+"_"+index;
			$("."+checkClass).attr('disabled');
			submitBDSData(index);
		},
		onClickCell:function(index, field, value){
			if(field!='ISINCONTRACT'&&bdsEditingIndex!=undefined){
				$('#bd-supplier-list').datagrid('endEdit',bdsEditingIndex);
			}
		},
		onDblClickRow:function(index,row){
			bdsEditingIndex=index;
			if(isEdit==1){				
				$('#bd-supplier-list').datagrid('beginEdit',index);
			}else{
				$('#bd-supplier-list').datagrid('endEdit',index);
			}
		}
	});
}
//点击新增按钮，弹出推荐供应商dialog
function supplierDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId="";
	if(row!=null){
		constructPlanId=row.ID;
	}
	$('#supplier-dialog').dialog({
    title: '拟推荐供应商信息',
    width: 400,
	content:"<div><input class='easyui-searchbox' id='supplier-name-key' style='width:200px;height24px;' data-options='prompt:\"供应商名称\",searcher:queryBaseSupplierInfo'></input><div class='s-list' style='min-height:150px;height:300px;overflow-y:scroll;'><table id='supplier-list'></table></div>"+
			"<div class='hand-input-name'><div>手工输入供应商名称：<input class='easyui-textbox hand-into-sname first' style='width:206px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-supplier-add' onclick='handAddSupplier();'></i></span></div></div></div>",
    closed: false,
    cache: false,
    modal: true,
	buttons: [	
				{
					text:'直接添加',
					iconCls:'icon-plus-sign',
					handler:function(){
						submmitSupplierInfo("hand");
					}
				},
				{
					text:'添加',
					iconCls:'icon-ok',
					handler:function(){
						submmitSupplierInfo("sys");
					}
				},
				{
					text:'关闭',
					iconCls:'icon-remove',
					handler:function(){
						$('#supplier-dialog').dialog("close");
					}
				}],
	});
	$('#supplier-list').datagrid({
    url:basePath+'/constructPlan/queryConstructSupplier',
	selectOnCheck:false,
	checkOnSelect:false,
    columns:[[
		{field:'ck',title:'',width:'5%',checkbox:true},
		{field:'NAME',title:'供应商名字',halign:'center',width:'90%'}
    ]],
	queryParams: {
		key:function(){
				return $('#supplier-name-key').searchbox('getValue');
		},
		constructPlanId:function(){
			return constructPlanId;
		}
	},
	onLoadSuccess: function(data){
		if (data.rows.length > 0) {
            //循环判断操作为新增的不能选择
            for (var i = 0; i < data.rows.length; i++) {
               //根据EXIST让某些行不可选
                if (data.rows[i].EXIST ==1) {
                       $(".s-list input[type='checkbox']")[i + 1].disabled = true;
					   $(".s-list input[type='checkbox']")[i + 1].checked = true;
                    }
                }
            }
	}
	});
}
//供应商基础信息列表检索
function queryBaseSupplierInfo(){
	$('#supplier-list').datagrid('reload');
}
//添加手工输入供应商
function handAddSupplier(){
	$('.hand-input-name .span-icon-add').remove();
	$('.hand-input-name').append("<div>手工输入供应商名称：<input class='easyui-textbox hand-into-sname' style='width:200px;height24px;'/><span class='span-icon-add'><i class='icon-plus hand-supplier-add' onclick='handAddSupplier();'></i></span></div>");
}
//采购包添加供应商数据提交
function submmitSupplierInfo(flag){
	//获取采购包明细ID值
	var row=$('#bd-list-info').datagrid('getSelected');
	var constructPlanId=row.ID;
	var obj = new Object();
	var exist=false;
	var nameMap= new Array();
	//(1)直接添加供应商
	if(flag=="hand"){
		var snames=$('.easyui-textbox.hand-into-sname');
		for(var i=0;i<snames.length;i++){
			var name=$.trim($(snames[i]).val());
			if(name!=""&&name!=null){
				if(nameMap[name]!=null&&nameMap[name]!=undefined){
				    //重复
					exist=false;
					$.messager.alert('提示',"供应商名存在重复，请修改后添加！");
					return ;
				}else{
				   nameMap[name]=name;
				   exist=true;	
				   obj["Pbs_suppliersVOList["+i+"].constructPlanId"]=constructPlanId;
				   obj["Pbs_suppliersVOList["+i+"].name"]=name;
				   obj["Pbs_suppliersVOList["+i+"].isHandInput"]=true;
				   obj["Pbs_suppliersVOList["+i+"].isInContract"]=false;
				}
				
			}	
		}
	}
	//(2)系统提供供应商
	if(flag=="sys"){
		var checkedRows=$('#supplier-list').datagrid('getChecked');
		for(var i in checkedRows){
			if(checkedRows[i].EXIST==0){
				exist=true;	
				obj["Pbs_suppliersVOList["+i+"].constructPlanId"]=constructPlanId;
				obj["Pbs_suppliersVOList["+i+"].id"]=checkedRows[i].ID;
				obj["Pbs_suppliersVOList["+i+"].id"]=checkedRows[i].ID;
				obj["Pbs_suppliersVOList["+i+"].isHandInput"]=false;
				obj["Pbs_suppliersVOList["+i+"].isInContract"]=false;
			}
		}
	}
	//没有需要添加的数据
	if(!exist&&flag=="hand"){
		$.messager.alert('提示',"请填写供应商信息后再添加！");
	}else if(!exist&&flag=="sys"){
		$.messager.alert('提示',"请先选择供应商信息！");
	}else{ 
		$.ajax({
			url:basePath+'/constructPlan/addConstructSupplier',
			data:obj,
			type:'POST',
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			success:function(data){ 
				if(data.status){
					$('#supplier-list').datagrid('reload');
					$('#bd-supplier-list').datagrid('reload');
					$(".hand-into-sname").val("");					
					$.messager.show({
						title : '提示',
						msg : data.info,
						timeout : 3000,
						showType : 'slide'
					});
				}else{
					$.messager.alert('提示',data.info);
				}
			}
		});
	}
}
//更新标段推荐供应商信息
function updateBdSupplierRow(obj,index){
	var rows=$('#bd-supplier-list').datagrid('getRows');
	for(var i in rows){
		if($('#bd-supplier-list').datagrid('getRowIndex',rows[i])==index){
			if($(obj).is(':checked')){
				rows[i].ISINCONTRACT=1;
			}else{
				rows[i].ISINCONTRACT=0;
			}
			$('#bd-supplier-list').datagrid('updateRow',rows[i]);
			break;
		}
	}
}
//修改采购包推荐供应商数据提交
function submitBDSData(index){
	var rows=$('#bd-supplier-list').datagrid('getRows');
	for(var i in rows){
		if($('#bd-supplier-list').datagrid('getRowIndex',rows[i])==index){
			var obj = new Object();
			obj["pbs_construct_to_suppliersList[0].id"] = rows[i].ID;
			obj["pbs_construct_to_suppliersList[0].constructPlanId"]=rows[i].CONSTRUCTPLANID;
			obj["pbs_construct_to_suppliersList[0].isInContract"]=rows[i].ISINCONTRACT==1?true:false;
			obj["pbs_construct_to_suppliersList[0].isHandInput"]=rows[i].ISHANDINPUT==1?true:false;
			obj["pbs_construct_to_suppliersList[0].name"]=rows[i].NAME;
			obj["pbs_construct_to_suppliersList[0].supplierId"]=rows[i].SUPPLIERID;
			$.ajax({
			    url:basePath+'/constructPlan/updateConstructSupplier',
				type:'POST',
				data:obj,
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
						if(data.status){
								bdsEditingIndex=undefined;
								$('#bd-supplier-list').datagrid('refreshRow',index);
								$('#bd-supplier-list').datagrid('acceptChanges');
								//$.messager.alert('提示',data.info);		
						}else{
								$('#bd-supplier-list').datagrid('beginEdit',bdsEditingIndex);
								$.messager.alert('提示',data.info);
						}
						
					},
				});	
		//break;
		}
	}
}
//删除采购包推荐供应商信息
function delBDSInfo(){
		var selectedRows=$('#bd-supplier-list').datagrid('getSelections');
		var existSelect=false;
		var ids="";
		for(var i in selectedRows){
			existSelect=true;
			ids+=selectedRows[i].ID+",";
		}
		if(existSelect){
			$.ajax({
				url:basePath+'/constructPlan/delConstructSupplier',
				data:{ids:ids},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-supplier-list').datagrid('clearSelections');
						$('#bd-supplier-list').datagrid('reload');
						$.messager.show({
							title : '提示',
							msg : '删除成功！',
							timeout : 3000,
							showType : 'slide'
						});
					}else{
						$.messager.alert('提示',data.info);
					}
				}
			});
		}else{
			$.messager.alert('提示','请选择需要删除的供应商信息！');
		}
	}

//设置是否可用维护供应商、包含设备信息
function setTabsBtnStatus(flag){
	//采购包明细ID值
	 var row=$('#bd-list-info').datagrid('getSelected');
	 if(row!=null){
		 if(flag){
			 isEdit=1;
			 $('.sc_easyui-linkbutton').linkbutton("enable");
			//推荐供应商按钮控制
			 var purName=purListMap[row.PURTYPEID];//采购方式
			 if(purName=="公开招标"){
			   $('.s_easyui-linkbutton').linkbutton("disable");
			 }else{
			   $('.s_easyui-linkbutton').linkbutton("enable");
			 }
		 }else{
			 isEdit=0;
			 $('.sc_easyui-linkbutton').linkbutton("disable");
			 $('.s_easyui-linkbutton').linkbutton("disable");
		 }
	 }else{
		 isEdit=0;
		 $('.sc_easyui-linkbutton').linkbutton("disable");
		 $('.s_easyui-linkbutton').linkbutton("disable");
	 }
	 
}

//初始化采购包包含设备信息
function querySubPurPlanScope(){
	//采购包明细ID值
	 var row=$('#bd-list-info').datagrid('getSelected');
	 var purPlanId="";
	if(row!=null){
		purPlanId=row.ID;
		// $('.sc_easyui-linkbutton').linkbutton("disable");
	}else{
		$('.sc_easyui-linkbutton').linkbutton("disable");
	}
	$('#bd-subPurPlan-scope-list').datagrid({
		url:basePath+'/purPlan/queryPurPlanToEquip',
		queryParams: {
			purPlanId:function(){
					return purPlanId;
			}
		}
	});	
}
//检索该设备在其他采购包包含的数量关系
function majorOfOtherSubcontract(){	
	 var row=$('#bd-list-info').datagrid('getSelected');
	 var equipRow = $('#bd-subPurPlan-scope-list').datagrid('getSelected');
	 if (equipRow == null) return;
	$("#bd-subPurPlan-major-list").datagrid({
	    url:basePath+'/purPlan/queryMajorOfPurSubcontract',
	    width:"100%",
	    height:"100%",
	    columns:[[
			{field:'CODE',title:'采购包号',halign:'center',width:'35%'},
			{field:'NAME',title:'采购包名称',halign:'center',width:'35%'},
			{field:'INCLUDEQTY',title:'包含数量',halign:'center',width:'30%'}
	    ]],
		queryParams:{materialId:equipRow.MTID,purPlanId:row.ID,projectID:selectProject,planVersionId:projectPurVId}	
	});
}
//点击“新增”采购包包含设备信息按钮dialog
function subPurPlanToEquipDialog(){
	var row=$('#bd-list-info').datagrid('getSelected');
	if(row ==null || row.length==0){
		$.messager.alert('提示','请选择需要添加设备的采购包！');
		return;
	}
	$('#pur-subcontract-dialog').dialog({
    title: '子项-设备搜索',
    closed: false,
	buttons: [	
				{
					text:'关闭',
					iconCls:'icon-remove',
					handler:function(){
						$('#pur-subcontract-dialog').dialog("close");
						pbsNameArr.splice(0, pbsNameArr.length);//清空数组中的所有元素
					}
				},
				{
					text:'添加',
					iconCls:'icon-ok',
					handler:function(){
						addPurPlanToEquip();
					}
				}],
	});
	//加载弹出层数据
	queryMaterialTab();
}

//采购包包含设备-tab切换
function queryMaterialTab(){	
	//获取选中TAB
	var selectTab = $('#MaterialInfoTab').tabs('getSelected');
	var title=selectTab.panel('options').title;
	$('#MaterialInfoTab').tabs({   
		  border:false, 
		  selected:0,//初始化选中一个tab页
		  onSelect:function(title){  
			if(title=='项目库'){
				loadDate(selectProject,"","","");
			}
			if(title=='物料库'){
				initCategory();
				//initMaterial(); 
				initDiglog();
			}
		}
		});
		if(title=='项目库'){
			loadDate(selectProject,"","","");
		}
		if(title=='物料库'){
			initCategory();
			// initMaterial();
			initDiglog();
		}
}

//搜索子项
function searchNode(){
	var projectId = selectProject;
	var majorId = "";
	Utils.ajaxJson(basePath+"/purReq/getNodeTree",
			{projectId:projectId,majorId:majorId,type:1,key:$("#nodeKey").searchbox('getValue')},function(obj){
		$("#nodeTree").tree('loadData',obj);
	});
}
//搜索物料
function searchMld(){
	var node = $("#nodeTree").tree('getSelected');
	var nodeId = "";
	if(node != null  ){
		if(node.flag == 1){
    		nodeId = node.id;
    	}else {
    		nodeId = node.parentId;
    	}
	}
	var isShow = 1;
	if($('#isShowEP').is(':checked')){
		isShow=0;
	}
	$("#equipList").datagrid({
		url:basePath+"/purReq/getMaterialListDetails",
		queryParams:{majorId: "",nodeId:nodeId,
			pbsVersionId:pbsVersionId,key:$("#equip-key").searchbox("getValue"),type:0,
			mark:"purPlan",isShow:isShow}
	});
}
//加载弹出框数据
function loadDate(projectId,majorId,optType,typeCode){
	var nodeArr = new Array();
	pbsNameArr = new Array();
	Utils.ajaxJson(basePath+"/purReq/getNodeTree",{projectId:projectId,majorId:majorId,type:1,key:""},function(obj){
		for (var i = 0; i < obj.length; i++) {
			nodeArr[obj[i].id] = obj[i].text;
			pbsNameArr[obj[i].id]= obj[i].text;
		}
		if(obj.length > 0){
			pbsVersionId = obj[0].versionId;
		}
		$("#nodeTree").tree({
			lines: true,
	        loadFilter: treeConstructor,
	        data: obj,
	        height:500,
	        onClick: function(node){
	        		var isShow = 1;
	        		if($('#isShowEP').is(':checked')){
	        			isShow=0;
	        		}
					var isFilterP = $("#isFilterP").prop("checked");
					var isFilter = isFilterP?0:1;
	        		var nodeId;
		        	if(node.flag == 1){
		        		nodeId = node.id;
		        	}else {
		        		nodeId = node.parentId;
		        	}
		        	$("#equipList").datagrid("options").url = basePath
					+ "/purReq/getMaterialListDetails";
					$("#equipList").datagrid("load", {
						majorId :node.majorId,
						nodeId : nodeId,
						pbsVersionId : obj[0].versionId,
						type : 0,
						key : $("#equip-key").searchbox("getValue"),
						mark:"purPlan",
						isShow:isShow,
						isFilter:isFilter
					});
	        	
	        }
		});
		
	});
	
    var options = {
            fitColumns: true,
            border: true,
            idField: 'id',
            treeField: 'materialCode',
            checkOnSelect: true,
            selectOnCheck: true,
            columns: [[
                {
                	field: "ck",
                	checkbox: true
                },
                {
                	title: '物料编码',
                    field: 'materialCode',
                    width: "11%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row) {
                        if (row.groupId != undefined) {
                            return "附";
                        } else {
                            return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                        }
                    }
                },
                {
                	title: '项目物料名称',
                    field: 'prjMaterialName',
                    width: "12%",
                    halign: "center",
                    align: "left",
                    editor: "text"
                },
                {
                	title: '参数',
                    field: 'description',
                    width: "12%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row) {
                        if (value) {
                            return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                        }
                    }
                },
                {
                	title: '所属子项',
                    field: 'nodeId',
                    width: "13%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row,index) {
                    	if (value) {
                    		if(row.type == 1){
                    			value = nodeArr[value];
                    		}else if(row.type == 2){
                    			value = budgetNodeArr[value];
                    		}else {
                                value = nodeArr[value];
							}
                            return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                        }
                    }
                },
                {
                	title: '专业',
                    field: 'majorId',
                    width: "10%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row) {
                        if (value) {
                            return majorArr[value];
                        }
                    }
                },
                {
                    title: '单位',
                    field: 'unitId',
                    width: "8%",
                    halign: "center",
                    align: "left",
                    formatter: function(value) {
                    	return unitListMap[value];
                    }
                },
                {
                	title: '总数量',
                    field: 'qty',
                    width: "6%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row,index){
                    	if(value){
                    		return decimalHandel(value,2);
                    	}else{
                    		return 0;
                    	}
                    }
                },
                {
                	title: '剩余数量',
                    field: 'subQty',
                    width: "6%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row,index){
                    	if(value){
                    		return decimalHandel(value,2);
                    	}else{
                    		return 0;
                    	}
                    }
                },
                {
                	title: '是否含附属设备',
                    field: 'hasChild',
                    width: "7%",
                    halign: "center",
                    align: "left",
                    formatter: function(value,row) {
                        if (value) {
                            return "是";
                        } else if (row.groupId != null) {
                            return "否";
                        }
                    }
                },
                {
                	title: '是否进口',
                    field: 'isImport',
                    width: "6%",
                    halign: "center",
                    align: "left",
                    formatter: function(value) {
                        if (value==null||value==undefined) return value;
                        return (value==1)?"是":"否";
                    },
                },
                {title:'备注',field:'remark',width: "6%",halign: "center",align: "left"}
                ]],
                onLoadSuccess: function(data){
                	if (data.rows.length > 0 && !$(this).datagrid("options").singleSelect) {
                        //循环判断操作为新增的不能选择
                        for (var i = 0; i < data.rows.length; i++) {
                            //根据isFinanceExamine让某些行不可选
                        	 for (var j = 0; j < materialIds.length; j++) {
                        		 if (data.rows[i].pbsCode == materialIds[j]) {
                                    $("#equipList").prev().find("input[type='checkbox']")[i+1].disabled = true;
                                    $("#equipList").prev().find("input[type='checkbox']")[i+1].checked = true;
                                 }
                        	 }
                        }
                    }
                },
                onClickRow: function(index,row){
                	if (!$(this).datagrid("options").singleSelect) {
                		for (var j = 0; j < materialIds.length; j++) {
                			if(row.pbsCode == materialIds[j]){
                				$("#equipList").datagrid("unselectRow",index);
                				$("#equipList").prev().find("input[type='checkbox']")[index+1].checked = true;
                			}
                		}
                	}
                }
    	};    
	$("#equipList").datagrid($.extend(options,{singleSelect: false}));
}
//是否显示剩余数量为0的记录
function isShowRecord(obj){
	var isShow = obj.checked?0:1;
	var isFilterP = $("#isFilterP").prop("checked");
	var isFilter = isFilterP?0:1;

	var node = $("#nodeTree").tree('getSelected');
	var nodeId = "";
	var major = "";
	if(node != null  ){
		if(node.flag === 1){
    		nodeId = node.id;
    	}else {
    		nodeId = node.parentId;
    		major = node.majorId;
    	}
	}
	$("#equipList").datagrid({
		url:basePath+"/purReq/getMaterialListDetails",
		queryParams:{
			majorId: major,
			nodeId:nodeId,
			pbsVersionId:pbsVersionId,
			key:$("#equip-key").searchbox("getValue"),
			type:0,
			mark:"purPlan",
			isShow:isShow,
			isFilter:isFilter
		}
	});	
}

//是否过滤费用项不为0的物料
function isFilterPrice(obj) {
	var isFilter = obj.checked?0:1;
	var isShowEP = $("#isShowEP").prop("checked");
	var isShow = isShowEP?0:1;

	var node = $("#nodeTree").tree('getSelected');
	var nodeId = "";
	var major = "";
	if(node != null  ){
		if(node.flag === 1){
			nodeId = node.id;
		}else {
			nodeId = node.parentId;
			major = node.majorId;
		}
	}
	$("#equipList").datagrid({
		url:basePath+"/purReq/getMaterialListDetails",
		queryParams:{
			majorId: major,
			nodeId:nodeId,
			pbsVersionId:pbsVersionId,
			key:$("#equip-key").searchbox("getValue"),
			type:0,
			mark:"consPlan",
			isShow:isShow,
			isFilter:isFilter
		}
	});
}

//初始化类别输入框
function initCategory(){
	$('#category-key').searchbox({
		searcher:querycategory,
		prompt:'物料类别名称/物料编码',
	});
}
//初始化物料输入框
//function initMaterial(){
//	$('#material-key').searchbox({
//		searcher:doSearch,
//		prompt:'物料名称/物料编码/摘要',
//	});
//}
//初始化物料信息
function initDiglog(){	
	$("#materialList").datagrid({
		url:basePath+'/structure/getMaterialInfoList',
		width:"100%",
		height:"100%",
		toolbar:"#materialList_tb",
		pagination:true ,
		singleSelect:false,
		columns:[[
			{field:'ck',checkbox:true },
			{field:'MATERIALCODE',title:'物料编码',width:'20%'},
			{field:'MATERIALNAME',title:'物料名称',width:'20%'},
			{field:'MMCATEGORY',title:'物料类别',width:'20%'},
			{field:'MMDESCRIPTION',title:'参数',width:'10%',formatter: function(value){
				if(value){
                	return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
                }
			}},
			{field:'UNITNAME',title:'主单位',width:'10%'},
			{field:'MMTYPE', title:'管理类型',width:'10%'},
			{field:'REMARK',title:'备注',width:'8%'}
		]],
		queryParams: {
			key : function() {
				var mmCode = $("#mmCode").val();
				var mmName = $("#mmName").val();
				var mmAttr = $("#mmAttr").val();
				var codeAcc = $("#codeAcc")[0].checked;
				var nameAcc = $("#nameAcc")[0].checked;
				var attrAcc = $("#attrAcc")[0].checked;
				var key = mmCode+','
							+codeAcc+','
							+mmName+','
							+nameAcc+','
							+mmAttr+','
							+attrAcc
				return key;
			},
			filters: function() {
				return "PDT";
			}
		}
	});
	querycategory();
}
//物料检索
function doSearch(value){
	$("#materialList").datagrid("reload");	
}
//物料类别检索
function querycategory(){
	var treeData = $("#categoryTree");
	treeData = $.fn.zTree.init(treeData,categoryTreeSetting, null);
}
//加载更多
function categoryMore(){
    var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
	var nodes = treeObj.getNodes();
	var page =(nodes.length+30)/30;
	$.ajax({
		url:basePath+'/structure/getMaterialcategory',
		type:'POST',
		data:{page:page,pageSize:30,filters:"${filters}"},
		success:function(data){
		 	treeObj.addNodes(null,data);	
		}	
	});
}
//类别树点击检索物料
function zTreeOnClick(event,treeId,treeNode){
	var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
	var code =  treeNode.CATEGORYCODE ;
	if (treeNode.ID == selectNode.ID) {
		treeObj.cancelSelectedNode(treeNode);
		selectNode = new Object();
		code = '';
	} else {
		selectNode = treeNode;
	}
	$("#mmCode").val(code);
};
//获取选中节点
function getCheckedNodes(){
	var nodes=$("#materialList").datagrid("getChecked");
	return nodes;
}

//添加采购包包含设备信息
function addPurPlanToEquip(){
	//获取选中TAB
	var selectTab = $('#MaterialInfoTab').tabs('getSelected');
	var title=selectTab.panel('options').title;
	//采购计划
	var row=$('#bd-list-info').datagrid('getSelected');
	var PurPlanId=row.ID;
	if(title=="项目库"){
		//获取选择的设备记录
		var rows = $("#equipList").treegrid("getSelections");
		if(rows==undefined || rows =="" || rows==null||rows.length==0){
			$.messager.alert('提示','请选中需要添加的设备！');
		}else{
			var obj=new Object();
			for(var i in rows){
				obj["purPlan_to_equip["+i+"].purPlanId"]=PurPlanId;//采购包id
				obj["purPlan_to_equip["+i+"].pbsId"]=rows[i].nodeId;//子项树节点id
				obj["purPlan_to_equip["+i+"].pbsNode"]=pbsNameArr[rows[i].nodeId];//所属子项
				obj["purPlan_to_equip["+i+"].materialId"]=rows[i].id;//设备ID
				obj["purPlan_to_equip["+i+"].majorId"]=rows[i].majorId;//专业ID
                obj["purPlan_to_equip["+i+"].pbsCode"]=rows[i].pbsCode;//pbsCode
				if(null != rows[i].subQty && ""!=rows[i].subQty && rows[i].subQty>0){	//剩余数量不为0			
					obj["purPlan_to_equip["+i+"].includeQty"]=rows[i].subQty;//包含数量
				}else{
					obj["purPlan_to_equip["+i+"].includeQty"]=0;
				}
				obj["purPlan_to_equip["+i+"].description"]=rows[i].description;//参数
			}
			
			$.ajax({
				url:basePath+'/purPlan/addPurPlanToEquip',
				data:obj,
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.prog.close();
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					MyMessager.prog.close();
					if(data.status){
						$('#bd-subPurPlan-scope-list').datagrid('reload');				
						// 获取勾选的行
						var checkRow = $('#equipList').datagrid('getChecked');
						setRecordChecked(checkRow);
						$.messager.show({title : '提示',msg : '新增成功！',timeout : 3000,showType : 'slide'});
						//更新设备控制价
						updatePurPlanCost();
					}
				}
			});
		}
	}
	if(title=="物料库"){
		//获取选择的物料库记录
		var rows = $("#materialList").treegrid("getSelections");
		if(rows==undefined || rows =="" || rows==null||rows.length==0){
			$.messager.alert('提示','请选中需要添加的物料！');
		}else{
			//新增项目物料、物料清单明细
			var ids = "";
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].id) {
					ids += rows[i].id + ",";
				} else {
					ids += rows[i].ID + ",";
				}
			}
			var obj= {
				projectId : $('#projectId').val(),
				ids : ids,
				purPlanId : PurPlanId
			};
			$.ajax({
				url:basePath+'/purPlan/addPurPlanLine',
				data:obj,
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){
						$('#bd-subPurPlan-scope-list').datagrid('reload');				
						// 获取勾选的行
						//var checkRow = $('#materialList').datagrid('getChecked');
						//setRecordChecked(checkRow);
						$.messager.show({title : '提示',msg : '新增成功！',timeout : 3000,showType : 'slide'});
						//更新设备控制价
						updatePurPlanCost();
					}
				}
			});
		}
	}	
}

//数据添加成功后，将添加的记录设置为不可勾选
function setRecordChecked(checkRow){
	for (var k = 0; k < checkRow.length; k++) {
		materialIds.push(checkRow[k].id);
		// 获取索引
		var rowIndex = $('#equipList').datagrid('getRowIndex', checkRow[k]); 
		//取消行选中
		$('#equipList').datagrid('unselectRow',rowIndex);
		//$("#equipList").prev().find("tr[datagrid-row-index='"+rowIndex+"']").removeClass("datagrid-row-selected");
		//勾选
		$("#equipList").prev().find("input[type='checkbox']")[rowIndex+1].checked = true;  
		$("#equipList").prev().find("input[type='checkbox']")[rowIndex+1].disabled = true;
	}
	if($("#equipList").datagrid("getSelected") != null){
		var rows = $("#equipList").datagrid("getChecked");
		setRecordChecked(rows);
	}
}

//删除采购包包含设备信息
function delPurPlanToEquip(){
	var rows=$('#bd-subPurPlan-scope-list').datagrid('getChecked');
	if(rows==null||rows.length==0){
		$.messager.alert('提示','请选择需要删除的设备！');
	}else{		
		var ids="",pCode="";
		for(var i in rows ){
			ids+=rows[i].ID+",";
		}
		//若采购包号为空直接删除
		var purData=$('#bd-list-info').datagrid('getSelected');
		pCode = purData.Code;
		$.ajax({
			url:basePath+'/purPlan/delPurPlanToEquip',
			data:{ids:ids,code:pCode},
			type:'POST',
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.prog.close();
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			success:function(data){	
				MyMessager.prog.close();
				if(data.status){
					for(var i in rows){
						var index=$('#bd-subPurPlan-scope-list').datagrid('getRowIndex',rows[i]);
						$('#bd-subPurPlan-scope-list').datagrid('deleteRow',index);
					}					 
				}
				$('#bd-subPurPlan-scope-list').datagrid('clearSelections');
				//$.messager.alert('提示',data.info);
				materialIds.splice(0,materialIds.length);//清空数组
				var getRows=$('#bd-subPurPlan-scope-list').datagrid('getRows');
				for (var i = 0; i < getRows.length; i++) {
		    		materialIds[i] = getRows[i].MTID;
				}
				
				updatePurPlanCost();
				$.messager.show({
					title : '提示',
					msg : data.info,
					timeout : 3000,
					showType : 'slide'
				});
			}				
		});
	}		
}
//修改采购包包含设备信息
function updatePurPlanToEquip(index,id,icqty){
	var obj=new Object();
	obj.id=id;
	obj.qty=icqty;//包含数量
	$.ajax({
		url:basePath+'/purPlan/updatePurPlanToEquip',
		data:obj,
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.prog.close();
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			MyMessager.prog.close();
			if(!data.status){
				$('#bd-subPurPlan-scope-list').datagrid('beginEdit',index);
				bdcopEditingIndex=index;
				$.messager.alert('提示',data.info);
			}else{
				bdcopEditingIndex=undefined;
				$('#bd-subPurPlan-scope-list').datagrid('acceptChanges');
				$('#bd-subPurPlan-scope-list').datagrid('refreshRow',index);
				updatePurPlanCost();
			}
		}
	});
}

//复制And粘贴采购包明细数据
function copyOrPasteBDInfo(flag){
	//获取采购包明细数据
	var row=$('#bd-list-info').datagrid('getSelected');
	if(row==null||row==undefined||row.length==0){
		$.messager.alert('提示',"请先选择采购包进行复制！");
	}else if($('.status-info').attr('bd_status')!=0 && $('.status-info').attr('bd_status')!=3){
		$.messager.alert('提示',"非草稿采购包不能复制/粘贴！");
	}else{
		if(flag=='copy'){
			$('.paste_bd').attr('bdid',row.ID);
			//$.messager.alert('提示',"复制成功！");
			$.messager.show({
				title : '提示',
				msg : '复制成功！',
				timeout : 3000,
				showType : 'slide'
			});
		}else if($('.paste_bd').attr('bdid')!=null && ""!=$('.paste_bd').attr('bdid')){
			var PurPlanId=$('.paste_bd').attr('bdid');
			$.ajax({
				url:basePath+'/purPlan/pastePurPlan',
				data:{id:PurPlanId},
				type:'POST',
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
				success:function(data){
					if(data.status){//采购包名称验证重复
						$('#bd-list-info').datagrid('reload');
						//根据ID值选择一行数据
						$('#bd-list-info').datagrid('selectRecord',data.CPId);
					}
					//$.messager.alert('提示',data.info);
					$.messager.show({
						title : '提示',
						msg : '粘贴成功！',
						timeout : 3000,
						showType : 'slide'
					});
				}
			});
		}else{
			$.messager.alert('提示',"请先选择采购包进行复制！");
		}
	}
	
}


/**
 * 提交审批
 */
function submitPurPlan() {
    //判断是否存在未保存数据。
    if (typeof(editIndex) !== 'undefined'){
        MyMessager.alert.show('提示',"有分包数据尚未保存！请先保存数据。");
        return;
    }
    var data = checkPackage();
    if (data.length > 0) {
    	packageDialog(data);
	}else {
    	submitProgress();
	}
}

function submitProgress() {
//如果是已驳回继续在原流程上提交
    if ($('.status-info').attr('bd_status')==3){
        $.messager.confirm('提示','此流程将会继续原流程提交，待办页结束此流程可发起新流程！',function(r){
            if (r){
                $.ajax({
                    url: basePath+"/workflow/continueProcess",
                    data: "code=plan&id="+projectPurVId,
                    method: "post",
                    beforeSend: function() {
                        MyMessager.prog.show("请等待", "正在处理");
                    },
                    complete: function() {
                        MyMessager.prog.close();
                    },
                    success:function(data2, textStatus, jqXHR) {
                        location.reload();
                    },
                    error:function(jqXHR, textStatus, errorThrown) {
                        alert(jqXHR.responseText);
                    }
                });
            }
        });
    }else {
        //最新版草稿可以提交审批
        if($('.status-info').attr('bd_status')==0&&$('.status-info').attr('isNewFlag')==1){
            if(project_class == '研发课题'){
                $.post(basePath+"/purPlan/submitPurPlan","id="+projectPurVId,function(obj){
                    if(obj.status){
                        MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                        colSty=false;
                        //检索项目最新版本
                        queryProjectLastedVersionId(selectProject);
                        //检索采购包信息
                        //queryBdListInfo();
                        $("#bd-list-info").datagrid("reload");
                    }else{
                        $.messager.alert("提示","提交失败");
                    }
                },"json")
            }else{
                var options = {
                    title : '审批',
                    url : basePath+"/baseInfo/auditDialog?workflow="+$('#workflow').val()
                        +"&workflowUrl="+basePath+"/bpm/mgnSubProcessView"
                        +"&paramet="+"mark=P,processId="+$('#workflow').val(),
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
                                    allUser=per.allUser+"&usertask4CandidateUsers='usertask4List'"+per.subject;
                                    //工程项目信息
                                    var param2 ='&pbsVersionId='+projectPurVId+"&projectId="+selectProject+"&projectCode="+projectNum+"&projectName="+projectName;
                                    //参数组装
                                    var params = allUser+param2+"&processId="+$('#workflow').val()+"&projectPurVId="+projectPurVId+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
                                    //发起请求，执行流程，提交审批
                                    MyMessager.slide.show("提示", "数据处理中，请稍....");
                                    $.post(basePath+"/workflow/mgnSubWorkflow/"+$('#workflow').val(),"params="+params,function(result){
                                        if("success"==result){
                                            dialog.dialog('destroy');
                                            MyMessager.slide.show("提示", "提交成功，消息将在3秒后关闭。");
                                            colSty=false;
                                            //检索项目最新版本
                                            queryProjectLastedVersionId(selectProject);
                                            //检索采购包信息
                                            //queryBdListInfo();
                                            $("#bd-list-info").datagrid("reload");
                                        }else{
                                            $.messager.alert("提示","提交失败");
                                        }
                                    });
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
            }
        }else{
            $.messager.alert('提示',"该版本不是最新草稿版，不能提交审批！");
        }
    }
}

function checkPackage() {
	var result = [];
    $.ajax({
        url:basePath+'/purPlan/checkPackageState',
		data:'projectId='+selectProject+'&type=3',
        type : "post",
        dataType : "json",
		async:false,
        success:function(data) {
            result = data;
        }
    });
    return result;
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
	if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
        &&$('.status-info').attr('isNewFlag')==1){
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
		url:basePath+'/constructPlan/queryConstructPlanInstallOfPur',
		width:'100%',
		idField: 'ID',
		treeField: 'CODE',
		columns:[[
			{field:'PCODE',title:'采购包号',halign:'center',width:'30%'},
			{field:'PNAME',title:'采购包名称',halign:'center',width:'35%'},
			{field:'SERVICENAME',title:'供应商提供服务范围',halign:'center',width:'30%'},
		]],
		queryParams:{
		 	projectId:function(){
				return selectProject; 
			}
		}
	});
}
//查询施工分包成套安装
function queryConstructInfo(){
	 $('#construct-subcontract-list').datagrid({
		url:basePath+'/constructPlan/queryConstructPlanMaterial',
		width:'100%',
		idField: 'ID',
		treeField: 'MATERIALCODE',
		singleSelect:true,
		selectOnCheck:false,
		checkOnSelect:false,
		columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'PMMCODE',title:'物料编码',halign:'center',width:'10%'},
			{field:'PNAME',title:'项目物料名称',halign:'center',width:'12%'},
			{field:'MMDESCRIPTION',title:'参数',halign:'center',width:'10%'},
			{field:'PBSNAME',title:'所属子项',halign:'center',width:'10%'},
			{field:'MAJORNAME',title:'专业',halign:'center',width:'10%'},
			{field:'UNITNAME',title:'单位',halign:'center',width:'10%'},
			{field:'QTY',title:'数量',halign:'center',width:'10%'},
			{field:'PATENT',title:'是否含附属设备',halign:'center',width:'15%'},
			{field:'IMPORT',title:'是否进口',halign:'center',width:'5%'},
			{field:'REMARK',title:'备注',halign:'center',width:'5%'}
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
	if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
        &&$('.status-info').attr('isNewFlag')==1){
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
			{field:'fileName',title:'文件名',halign:'center',width:'50%'},
			{field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
				if(($('.status-info').attr('bd_status')==0 ||$('.status-info').attr('bd_status')==3)
                    &&$('.status-info').attr('isNewFlag')==1){
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'+'<button type="button" onclick="delAttachment(\''+row.id+'\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>'	

				}else{
					return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'	
				}
			}}
		]],
	    queryParams:{
			targetId:function(){
				return projectPurVId;
			},
			targetType:4,
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
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			data : {
				fileIds : fileIds,
				targetId:function(){
					return projectPurVId; 
				},
				targetType:4,
			},
			success:function(data) {
				$('#plan_file_list').datagrid('reload');
				MyMessager.slide.show("提示", data.info); 
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
				beforeSend:function() {
					MyMessager.prog.show("提示","请等待","数据处理中...");
				},
				complete:function() {
					MyMessager.prog.close();
				},
				error:function(jqXHR, textStatus, errorThrown) {
					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
				},
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
    $.messager.confirm('提示','变更后老版本将作废，新版本要重新审批!是否继续升版？',function(r){
    	if (r){
            if($('.status-info').attr('bd_status')==0||$('.status-info').attr('bd_status')==1
				|| $('.status-info').attr('bd_status')==3 || $('.status-info').attr('isNewFlag')!=1){
                $.messager.alert('提示',"已审批或者评审已拒绝的采购计划才可以进行升版！");
            }else{
                $.ajax({
                    url:basePath+'/purPlan/changePlan',
                    type:'POST',
                    data:{
                        id:projectPurVId,
                        type:4,
                    },
                    beforeSend:function() {
                        MyMessager.prog.show("提示","请等待","数据处理中...");
                    },
                    complete:function() {
                        MyMessager.prog.close();
                    },
                    error:function(jqXHR, textStatus, errorThrown) {
                        MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
                    },
                    success:function(data){
                        colSty=true;
                        queryProjectLastedVersionId(selectProject);
                        //queryBdListInfo();
                        $("#bd-list-info").datagrid("reload");
                        $.messager.show({
                            title : '提示',
                            msg : data.info,
                            timeout : 3000,
                            showType : 'slide'
                        });
                    }
                });
            }
		}else {

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
		url:basePath+'/purPlan/queryPlanVersion',
		width:'100%',
		idField: 'ID',
		singleSelect:true,
		rownumbers:true,
		columns:[[
			{field:'NAME',title:'版本名',halign: "center",align : 'left',width:'30%'},
			{field:'CODE',title:'版本编码',halign: "center",align : 'left',width:'26%'},
			{field:'STATUS',title:'版本状态',halign: "center",align : 'left',width:'20%',formatter:function(value,row,index){
				if(value==0){
				  return '草稿';
				}else if(value==1){
				  return '审批中';	
				}else if(value==2){
				  return '已审批';	
				}else if(value==3){
                    return '已驳回';
                }else if(value==-1){
				  return '已取消';	
				}
			}},
	        {
	        	title: '操作',field: 'opt',width: "23%",halign: "center",align : 'center',
	            formatter:function(value,row,index){	            	
	       	 		return "<a  class='easyui-linkbutton' onclick=findHistoryVersion('"+row.ID+"','"+row.CODE+"','"+row.ISNEW+"','"+row.STATUS+"') " +
       				"title='查看' data-options='iconCls:\"icon-list-ol\"'><span >查看</span></a>";
	            }
	        }			
		]],
	    queryParams:{projId:function(){
						return selectProject;
					}
		}
	});
}

//查看历史版本详细信息
function findHistoryVersion(rID,code,isNew,status){
	var project=$('#projectList').tree('getSelected');
	//window.location.href
	window.open(encodeURI(basePath+"/purPlan/purPlanHistoryView?planVersionCode="+code+"&isNew="+isNew+"&planVersionId="+rID+"&projectName="+project.text+"&projectId="+project.id+"&status="+status));
}

//修改采购计划版本类型：直接调用了施工计划的方法
function updatePlanVersionStatus(){
	var isNewFlag=$('.status-info').attr('isNewFlag');
	$.ajax({
		url:basePath+'/constructPlan/updateUpdatePlanVersionStatus',
		data:{id:projectPurVId,status:0},
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			changeBDStatusInfo(0,projectPurVId,isNewFlag);
		}
	});
}

//通知施工经理
function noticeConstructPlan(){
	/*$.ajax({
		url:basePath+'/purPlan/noticeConstructManager',
		data:{id:projectPurVId,projId:selectProject},
		type:'POST',
		beforeSend:function() {
			MyMessager.prog.show("提示","请等待","数据处理中...");
		},
		complete:function() {
			MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(data){
			//$.messager.alert('提示',data.info);
			$.messager.show({
				title : '提示',
				msg : data.info,
				timeout : 3000,
				showType : 'slide'
			});
		}
		
	});*/
    //判断是否存在未保存数据。
    if (typeof(editIndex) !== 'undefined'){
        MyMessager.alert.show('提示',"有分包数据尚未保存！请先保存数据。");
        return;
    }
	//最新版草稿可以发起通知
	if($('.status-info').attr('bd_status')==0&&$('.status-info').attr('isNewFlag')==1){	
		var options = {
				title : '通知',
				url : basePath+"/baseInfo/auditDialog?workflow="+$('#noticeWorkflow').val()
				+"&workflowUrl="+basePath+"/bpm/noticeProcessList"
				+"&paramet="+"mark=P,processId="+$('#noticeWorkflow').val(),
				height: 400,
				width: 450,
				closed: false,
			    cache: false,
			    modal: true,
			    buttons:[
				       {
						text:'发起通知',
						size:'large',
						handler:function(){
							var per = dialog.find("iframe").get(0).contentWindow.submitAudit();
							var allUser="";
							if(per.allUser!="" && per.allUser!=undefined && per.allUser!='undefined'){
								allUser=per.allUser+per.subject;
								//工程项目信息
								var param2 ='&pbsVersionId='+projectPurVId+"&projectId="+selectProject+"&projectCode="+projectNum+"&projectName="+projectName;
							    //参数组装
								var params = allUser+param2+"&processId="+$('#noticeWorkflow').val()+"&projectPurVId="+projectPurVId+"&initiator="+$.trim($("#userId").val())+"&initiatorName="+$.trim($("#userName").val());
								
								//console.log(params);
								
								//发起请求，执行流程，提交审批
								MyMessager.slide.show("提示", "数据处理中，请稍....");
								$.post(basePath+"/workflow/subPlanNoticeAppr/"+$('#noticeWorkflow').val(),"params="+params,function(result){
									if("success"==result){
										dialog.dialog('destroy');
										MyMessager.slide.show("提示", "发起通知成功，消息将在3秒后关闭。");
									}else{
										$.messager.alert("提示","发起通知失败");						
									}
								});
							}else{
								$.messager.alert("提示","请确认通知信息再提交！");
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
		$.messager.alert('提示',"该版本不是最新草稿版，不能发起通知！");
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
			project_class = data.PROJECT_CLASS;
		}
	});
}

//查看打包状态
function checkPackageState() {
    $('#package-dialog').dialog({
        title: '未打包费用项',
        closed:false,
        buttons: [
            {
                text: '关闭',
                iconCls: 'icon-remove',
                handler: function () {
                    $('#package-dialog').dialog("close");
                }
            }
        ]
    });
    $('#packageList').datagrid('loadData',checkPackage());
}

//保存分配费用行
function updatePriceLine() {
	var rows = $("#price-list-info").datagrid("getSelections");
	var lineRow = $("#bd-subPurPlan-scope-list").datagrid("getSelected");
	var planId = $("#bd-list-info").datagrid("getSelected").ID;
	if (lineRow == null) {
        $.messager.alert('提示',"请选择需要分配费用行的物料！");
	}else {
        if (rows == null) return;
        var obj=new Object();
        for(var i in rows){
            obj["scopeControllList["+i+"].planId"]=planId;//采购包id
            obj["scopeControllList["+i+"].planLineId"]=lineRow.ID;//计划行id
            obj["scopeControllList["+i+"].targetId"]=rows[i].id;
            obj["scopeControllList["+i+"].expenseTypeId"]=rows[i].expenseTypeId;
            obj["scopeControllList["+i+"].includeQty"]=lineRow.ICQTY;
            obj["scopeControllList["+i+"].pbsCode"]=lineRow.PBSCODE;//pbsCode
            obj["scopeControllList["+i+"].price"]=rows[i].price==null?0:rows[i].price;
            obj["scopeControllList["+i+"].planType"]=3;
        }
        MyMessager.prog.show("提示","请等待","数据处理中...");
        $.ajax({
            url:basePath+'/purPlan/updatePriceLine',
            type:'POST',
			data:obj,
            success:function(data){
                MyMessager.prog.close();
                $.messager.alert('提示',"保存成功！");
                $('#price-list-info').datagrid("reload");
                //更新物料估算价格
				var rowIndex = $("#bd-subPurPlan-scope-list").datagrid("getRowIndex",lineRow.ID);
				$("#bd-subPurPlan-scope-list").datagrid("updateRow", {
					index: rowIndex,
					row: {
						PRICE: data.toFixed(2)
					}
				}).datagrid("refreshRow", rowIndex);
            }
        });
	}
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
        },
        onClickRow: function (rowIndex, rowData) {
        	if (!rowData.isEnable) {
                $(this).datagrid('unselectRow', rowIndex);
			}
		},
        onCheckAll:function (rows) {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].isEnable) {
                    $(this).datagrid('unselectRow', i);
                    $(this).datagrid('uncheckRow', i);
                }
			}
        }
    });
}

function packageDialog(data) {
    $('#package-dialog').dialog({
        title: '以下物料或费用项还未打包，是否继续提交审批？',
        closed: false,
        buttons: [
            {
                text:'关闭',
                iconCls:'icon-remove',
                handler:function(){
                    $('#package-dialog').dialog("close");
                }
            },
            {
                text:'继续提交',
                iconCls:'icon-ok',
                handler:function(){
                    submitProgress();
                }
            }]
    });
    $('#packageList').datagrid('loadData',data);
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
