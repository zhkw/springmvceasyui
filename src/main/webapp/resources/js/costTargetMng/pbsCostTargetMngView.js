var flag = true;
var projectTypes = new Array();
var productTypes = new Array();
//专业
var majorList;
var majorArr = new Array();
var majorArrList = new Array();
//规模单位
var qtyUnitList=new Array();
var qtyUnitListMap = new Array();
var projectId;
var stageId;//项目阶段ID
var stageName;
//项目Id，项目编码，项目名称
var selectProject="",projectNum="",projectName="";
//项目路径
var basePath = $("#basePath").val();
$(function(){
	projectId = $("#projectId").val();
	//费用cost：建筑工程、设备安装、材料安装
	$("#cost").combobox({   
		editable:true,
		valueField: 'id',
		textField: 'text',
		panelHeight: '150',
        data: [
				{id: 'CON',text: '建筑工程',selected:true},
				{id: 'EQ',text: '设备安装'},
				{id: 'INS',text: '材料安装'}
              ]
	});
    $.ajax({
        url: "/enfi-pbs/structure/queryUnitAndUsage",
        method: "POST",
        dataType: "json",
        success: function(data) {
            unitList = data.unitList;
            for (var i in unitList) {
                //unitListMap[unitList[i].ID] = unitList[i].UNITNAME;
                if(unitList[i].TYPEID=='TonPerYear'
                    ||unitList[i].TYPEID=='年产能'){
                    qtyUnitList.push(unitList[i]);
                    qtyUnitListMap[unitList[i].ID]=unitList[i].UNITNAME;
                }
            }
        }
    });
	$.ajax({
		url : basePath+"/costTarget/getMajorData",
		data:{},
		type:'post',
		async:true,
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(obj){
			majorList = obj.major;
			//专业
			majorList = obj.major;
			for(var i in majorList){
				var major = new Object();
	 			major.id = majorList[i].ID;
	 			major.text = majorList[i].MAJORNAME;
                majorArrList[majorList[i].ID] = majorList[i].MAJORNAME;
	 			majorArr.push(major);
			}
			
			//专业列表
			$("#major").combobox({   
				editable:true,
				valueField: 'id',
				textField: 'text',
				panelHeight: '300',
				data: majorArr
			});
		}
	});
	//加载工程项目树
	queryProjectList();
	//初始化基础数据
	var baseData ;
	Utils.ajaxJson(basePath+"/project/getPrjBaseData",{},function(obj){
		baseData = obj;
		var prjType = baseData.prjType;
		for (var i = 0; i < prjType.length; i++) {
			projectTypes[prjType[i].ID] = prjType[i].NAME;
		}
		var proType = baseData.productType;
		for (var i = 0; i < proType.length; i++) {
			productTypes[proType[i].ID] = proType[i].NAME;
		}
	});
	
	//默认可行性研究
	var stageCODE="index_feasibility_study";
	//默认项目级指标
	var gradeId="PJ";
	stageId = $('#feasibility_study').attr('typeId');
	stageName="可行性研究";
	$('#stage li').click(function(){
		$('#stage li').removeClass('stagehov');
		$(this).addClass('stagehov');		
		switch ($(this).val()) {
			case 1://可行性研究
				stageCODE="index_feasibility_study";
				stageName="可行性研究";
				stageId = $('#feasibility_study').attr('typeId');
				//加载数据列表
				break;
			case 2://初步设计
				stageCODE="index_concept_design";
				stageName="初步设计";
				stageId = $('#concept_design').attr('typeId');
				//加载数据列表
				break;
			case 3://施工图设计
				stageCODE="index_cons_study";
				stageName="施工图设计";
				stageId = $('#cons_design').attr('typeId');
				//加载数据列表
				break;
			case 4://投标报价
				stageCODE="index_bid";
				stageName="投标报价";
				stageId = $('#bid').attr('typeId');
				//加载数据列表
				break;
			case 5://其他
				stageCODE="index_other";
				stageName="其他";
				stageId = $('#other').attr('typeId');
				//加载数据列表
				break;
			default:
				stageCODE="index_feasibility_study";
				stageName="可行性研究";
			    stageId = $('#feasibility_study').attr('typeId');
				//加载数据列表
		}	
		loadDataGridList(stageCODE,gradeId);
	});
	
	$('#grade li').click(function(){
		$('#grade li').children().removeClass();
		$('#grade li').children().addClass('gradebtn');
		$(this).children().addClass('checkGradebtn');
		switch ($(this).val()) {
			case 1:
				//项目级指标id
				gradeId="PJ";
				//加载数据列表
				loadDataGridList(stageCODE,gradeId);
				break;
			case 2:
				//区域级指标id
				gradeId="AR";
				//加载数据列表
				loadDataGridList(stageCODE,gradeId);
				break;
			case 3:
				//子项级指标id
				gradeId="PBS";
				//加载数据列表
				loadDataGridList(stageCODE,gradeId);
				break;
			case 4:
				//单位工程级指标id
				gradeId="UN";
				//加载数据列表
				loadDataGridList(stageCODE,gradeId);
				break;
			default:
				//默认gradeIndex=1
				gradeId="PJ";
				//加载数据列表
				loadDataGridList(stageCODE,gradeId);
		}	
	});
	
	//加载数据列表
	loadDataGridList(stageCODE,gradeId);
	
	//选择专业
	$('#major').combobox({
	    onChange: function(date){
	    	//$("#unitEngLeveldg").datagrid("load", getQueryParam());
	    	$("#unitEngDataList").css("display","block");	
			loadUnitEngineerLevelList();
	    }
	});
	//选择费用
	$('#cost').combobox({
	    onChange: function(date){
	    	//$("#unitEngLeveldg").datagrid("load", getQueryParam());
	    	$("#unitEngDataList").css("display","block");	
			loadUnitEngineerLevelList();
	    }
	});
	//各阶段版本管理跳转
	$('#detail').click(function(){
		window.location.href=basePath+'/costTargetMng/versionManager?projectId='+selectProject+"&stageCODE="+stageCODE+"&stageName="+stageName;
        Utils.ajaxJsonSync(basePath+"/pbsVersion/setUrl",{url:window.location.href});
	});
});

function getQueryParam(){
	var conditions = {
			projectId:function(){//项目Id	
				return projectId;
			},
			stage:function(){//阶段
				if(undefined!= stageId && "" !=stageId){
					return stageId;
				}else{
					return '';
				}
			},
			major:function(){//专业
				var major = $('#major').combobox('getValue');
				if(undefined!= major && "" !=major){
					return major;
				}else{
					return '';
				}
			},
			costTypeId:function(){//费用
				var cost = $('#cost').combobox('getValue');
				if(undefined!= cost && "" !=cost){
					return cost;
				}else{
					return '';
				}
			}
		};		
	return conditions; 
}

//加载工程项目树
function queryProjectList(){
	$('#projectList').tree({    
	    url:basePath+'/project/getOuProjectTree',
	    queryParams:{key:$('.project-key').searchbox('getValue')},//获取查询条件
		onClick:function(node){			
			if(node.children=='undefined'|| node.children==undefined){
				projectId = node.id;
				$("#projectId").val(node.id);
				selectProject=node.id;
				projectNum=node.pnum;
				projectName=node.text;
				projectView(projectId);
                $("#projectId").val(node.id);
			}else{
				selectProject=undefined;
				projectNum=undefined;
				projectName=undefined;
			}
		},
	    onLoadSuccess:function(row,data){
    		for (var i = 0; i < data.length; i++) {
				var children = data[i].children;
				for (var j = 0; j < children.length; j++) {
					if(projectId != "" && projectId == children[j].id){
						selectProject=projectId;
						projectView(projectId);
                        $("#projectId").val(projectId);
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
    projectId =projectId;
    $.ajax({
        url:basePath+"/pbsCommonController/singleProjectMng?projectId="+projectId,
        method:"post",
        async:false
    });
	//切换项目初始化选择第一阶段和第一个指标
	$('#stage li').removeClass('stagehov');
	$('#feasibility_study').addClass('stagehov');

	$('#grade li').children().removeClass();
	$('#grade li').children().addClass('gradebtn');
	$('#firstGrade').children().addClass('checkGradebtn');
	
	var node = $('#projectList').tree('find', projectId);
	$('#projectList').tree('select', node.target);
	//加载数据列表
	loadDataGridList("index_feasibility_study","PJ");
}
//加载数据列表
function loadDataGridList(dataSrc,level){
	//console.log(projectId +"/"+ stageId);
	
	//隐藏所有的列表
	$("#projectDataList").css("display","none");
	$("#regionalDataList").css("display","none");
	$("#subkeyDataList").css("display","none");
	$("#unitEngDataList").css("display","none");
	//项目级指标
	if(level=="PJ"){
		$("#projectDataList").css("display","block");
		//项目级指标列表
		loadProjectLevelList();
	}
	//区域级指标
	if(level=="AR"){
		$("#regionalDataList").css("display","block");		
		//区域级指标父表
		loadRegionalLevelList();
	}
	//子项级指标
	if(level=="PBS"){
		$("#subkeyDataList").css("display","block");		
		loadSubkeyLevelList();
	}
	//单位工程级指标
	if(level=="UN"){
		$("#unitEngDataList").css("display","block");	
		loadUnitEngineerLevelList();
	}
}

/**
 * 项目级指标列表 - 项目整体
 */
function loadProjectLevelList(){
	$("#projLeveldg").datagrid({
		title : '项目整体',
		url: basePath+"/costTarget/loadTableData",
		width: '98%',
		height:'400px',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
        pagination:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
		       {field: "QTYUNITNAME",title: "规模单位",hidden:'true'},
	           {field: "QTY",title: "规模",width: "12%",halign: "center",align: "left",formatter:function (value,row,index) {
                   var qtyUnit = "";
                   if (row.QTYUNITID != null){
                       qtyUnit = qtyUnitListMap[row.QTYUNITID];
                       return row.QTY+"/"+qtyUnit
                   }
                   return "";
               }
	           },
	           {field: "PRODUCTSCHEME",title: "产品方案",width: "10%",halign: "center",align: "left"},
	           {field: "PROCESSSCHEME",title: "工艺方案",width: "8%",halign: "center",align: "left"},
	           {field: "TOTALINVESTMENT",title: "建设总投资(万)",width: "11%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	           			var returnData = (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST));
	        		   return Math.round(returnData*100)/100;
	        	   }
	           },
	           {field: "ALLCOST",title: "其中:工程费用(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
	        			   return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "OTHERCOST",title: "其中:其他费用(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
                           return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "BUDGETCOST",title: "其中:预备费用(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
                           return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "UNITINVESTMENTINDEX",title: "单位投资指标",width: "8%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   if(row.QTY && row.QTY>0){
						   var returnData = (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST))/(row.QTY*10000);
	        			   return returnData;
	        		   }
	        	   }
	           },
	           ]],
	      queryParams: {               
	   			projectId:function(){//项目Id	
					return projectId;
				},
				stage:function(){//阶段
					if(undefined!= stageId && "" !=stageId){
						return stageId+",mng";
					}else{
						return '';
					}
				}
			},
   		onLoadSuccess:function(data){
			var pId = "0";
			if(data.total>0){
				pId=data.rows[0].ID;
			}
			projectLevelChildList(pId);
		},
		onClickRow:function(index,row){
			projectLevelChildList(row.ID);
		}
	});	
}
//项目级指标列表 - 工程费用分布
function projectLevelChildList(parentId){
	$("#childProjLeveldg").datagrid({
		title : '工程费用分布',
		url: basePath+"/costTarget/loadCostDistributionData",
		width: '85%',
		height:'280px',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "PBSNAME",title: "子项用途划分",width: "14%",halign: "center",align: "left"},
	           {field: "ALLCOST",title: "工程费用(万)",width: "12%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
					   var returnData = parseFloat(row.TOTALCOST)+parseFloat(row.EQUIPMENTCOST)+parseFloat(row.INSTALLCOST);
	        		   return Math.round(returnData*100)/100;
	        	   }
	           },
	           {field: "TOTALCOST",title: "其中:建筑工程费(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
                           return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "EQUIPMENTCOST",title: "其中:设备费(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
                           return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "INSTALLCOST",title: "其中:安装工程费(万)",width: "12%",halign: "center",align: "left",
	        	   formatter:function(value,row,index){
	        		   if(value && value>0){
                           return Math.round(value*100)/100;
	        		   }
	        		   return "";
	        	   }
	           },
	           {field: "occupy",title: "占比(%)",width: "10%",halign: "center",align: "left",formatter:function(value,row,index){
	        	   if(row.ALLCOST){
	        		   var sum = parseFloat(0);
	        		   var rows = $("#childProjLeveldg").datagrid("getRows");
	        		   for (var i = 0; i < rows.length; i++) {
	        			   sum += parseFloat(rows[i].ALLCOST);
	        		   }
	        		   return (parseFloat(row.ALLCOST)/sum).toFixed(2)*100;
	        	   }else{
	        		   return 0;
	        	   }
	           }},
	           ]],
       queryParams: {
    	   parentId:parentId            
		}
	});
}


/**
 * 区域级指标列表
 */
function loadRegionalLevelList(){
	$("#regionalLeveldg").datagrid({
		url: basePath+"/costTarget/loadAreaTableData",
		width: '98%',
		height:'300',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
        pagination:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "PBSNAME",title: "区域名称",width: "14%",halign: "center",align: "left"},
	           {field: "QTY",title: "规模",width: "10%",halign: "center",align: "left"},
	           {field: "PRODUCTSCHEME",title: "产品方案",width: "10%",halign: "center",align: "left"},
	           {field: "TOTALINVESTMENT",title: "建设总投资(万)",width: "12%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   return (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST)).toFixed(2);
	        	   }
	           },
	           {field: "ALLCOST",title: "其中:工程费用(万)",width: "12%",halign: "center",align: "left"},
	           {field: "OTHERCOST",title: "其中:其他费用(万)",width: "12%",halign: "center",align: "left"},
	           {field: "BUDGETCOST",title: "其中:预备费用(万)",width: "12%",halign: "center",align: "left"},
	           {field: "UNITINVESTMENTINDEX",title: "单位投资指标",width: "11%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   if(row.QTY && row.QTY>0){
	        			   return (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST))/(row.QTY*10000);
	        		   }
	        	   }
	           }
	           ]],
	 	      queryParams: {               
	 	    	    projectId:function(){//项目Id	
						return projectId;
					},
					stage:function(){//阶段
						if(undefined!= stageId && "" !=stageId){
							return stageId+",mng";
						}else{
							return '';
						}
					}
				},
	   		onLoadSuccess:function(data){
				var pId = "0";
				if(data.total>0){
					pId=data.rows[0].ID;
				}
				regionalLevelChildList(pId);
			},	
			onClickRow:function(index,row){
				regionalLevelChildList(row.ID);
			}
	});
}
//区域级指标列表- 子项费用
function regionalLevelChildList(pId){
	$("#childRegionalLeveldg").datagrid({
		title : '子项费用',
		url: basePath+"/costTarget/loadCostAreaData",
		width: '85%',
		height:'360',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "PBSNODECODE",title: "子项号",width: "10%",halign: "center",align: "left"},
	           {field: "PBSNAME",title: "子项名称",width: "13%",halign: "center",align: "left"},
	           {field: "ALLCOST",title: "工程费用",width: "10%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   return (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST)).toFixed(2);
	        	   }
	           },
	           {field: "TOTALCOST",title: "其中:建筑工程费(万)",width: "12%",halign: "center",align: "left"},
	           {field: "EQUIPMENTCOST",title: "其中:设备费(万)",width: "12%",halign: "center",align: "left"},
	           {field: "INSTALLCOST",title: "其中:安装工程费(万)",width: "12%",halign: "center",align: "left"},
	           ]],
	     queryParams: {parentId:pId}
	});
}


/**
 * 子项级指标列表
 */
function loadSubkeyLevelList(){
	$("#subkeyLeveldg").datagrid({
		url: basePath+"/costTarget/loadSubkeyTableData",
		width: '98%',
		height:'560',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
        pagination:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "PBSNODECODE",title: "子项号",width: "12%",halign: "center",align: "left"},
	           {field: "PBSNAME",title: "子项名称",width: "18%",halign: "center",align: "left"},
	           {field: "ALLCOST",title: "工程费用",width: "14%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   return (parseFloat(row.TOTALCOST)+parseFloat(row.EQUIPMENTCOST)+parseFloat(row.INSTALLCOST)).toFixed(2);
	        	   }
	           },
	           {field: "TOTALCOST",title: "其中:建筑工程费(万)",width: "18%",halign: "center",align: "left"},
	           {field: "EQUIPMENTCOST",title: "其中:设备费(万)",width: "18%",halign: "center",align: "left"},
	           {field: "INSTALLCOST",title: "其中:安装工程费(万)",width: "18%",halign: "center",align: "left"}
	           ]],
       queryParams: {               
    	    projectId:function(){//项目Id	
				return projectId;
			},
			stage:function(){//阶段
				if(undefined!= stageId && "" !=stageId){
					return stageId+",mng";
				}else{
					return '';
				}
			}
		},
		onLoadSuccess:function(data){
			var pId = "0";
			if(data.total>0){
				pId=data.rows[0].ID;
			}	
			subkeyLevelPropertList(pId);
			subkeyLevelMajorList(pId);
		},	
		onClickRow:function(index,row){
			subkeyLevelPropertList(row.ID);
			subkeyLevelMajorList(row.ID);
		}
	});
}
function subkeyLevelPropertList(pId){
	$("#subkeyLevelPropertdg").datagrid({
		title : '属性-单位造价',
		url: basePath+"/costTarget/loadUnitCostsData",
		width: '98%',
		height:'200',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "ATTRNAME",title: "属性",width: "35%",halign: "center",align: "left"},
	           {field: "ATTRVALUE",title: "属性值",width: "25%",halign: "center",align: "left"},
	           {field: "UNITCOST",title: "工程费用",width: "25%",halign: "center",align: "left"},
	           ]],
	  	     queryParams: {parentId:pId}
	});
}
function subkeyLevelMajorList(pId){
	$("#subkeyLevelMajordg").datagrid({
		title : '各专业费用',
		url: basePath+"/costTarget/loadProfessionalFeeData",
		width: '98%',
		height:'360',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		singleSelect:true,
		striped:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[	           
	           {field: "MAJORID",title: "专业",width: "18%",halign: "center",align: "left",formatter:function(value,row,index){
                   if(value){
                       return majorArrList[value];
                   }
               }},
	           {field: "ALLCOST",title: "工程费用",width: "14%",halign: "center",align: "left",
	        	   formatter: function(value,row,index){
	        		   return (parseFloat(row.TOTALCOST)+parseFloat(row.EQUIPMENTCOST)+parseFloat(row.INSTALLCOST)).toFixed(2);
	        	   }
	           },
	           {field: "TOTALCOST",title: "其中:建筑工程费(万)",width: "20%",halign: "center",align: "left"},
	           {field: "EQUIPMENTCOST",title: "其中:设备费(万)",width: "20%",halign: "center",align: "left"},
	           {field: "INSTALLCOST",title: "其中:安装工程费(万)",width: "20%",halign: "center",align: "left"},
	           ]],
	  	     queryParams: {parentId:pId}
	});
}

/**
 * 单位工程级指标
 */
function loadUnitEngineerLevelList(){
	$("#subkeyInfo-datagrid").css("display","block");
    $("#untiChild-datagrid").css("display","block");
	//费用类型
	var costType = $('#cost').combobox('getValue');
	if(costType=="CON"){//建筑工程
		//专业
		var majorId = $('#major').combobox('getValue');
		var majorName = majorArrList[majorId];
		if(majorName=="井建"){
            $("#subkeyInfo-datagrid").css("display","block");
            $("#untiChild-datagrid").css("display","block");
			$('#unitEngLeveldg').datagrid({
				url: basePath+"/costTarget/loadUnitTableData",
				width: '98%',
				height:'400',
				idField:'ID',
				loadMsg : '数据加载中,请稍候...',   
				border:true,
                pagination:true,
				singleSelect:true,
				striped:true,
				checkOnSelect:true,
				selectOnCheck:true,
				nowarp : true,
				columns: [[	 
					       {field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
					       {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
				           {field: "SUPPORTTYPE",title: "支护形式",width: "6%",halign: "center",align: "left"},
				           {field: "LENGTH",title: "长度(m)",width: "8%",halign: "center",align: "left"},
				           {field: "SUPPORTTHICKNESS",title: "支护厚度(mm)",width: "8%",halign: "center",align: "left"},
				           {field: "NETFAULTSPACE",title: "净断面积(㎡)",width: "8%",halign: "center",align: "left"},
				           {field: "DRIVINGBREAKSPACE",title: "掘进断面积(㎡)",width: "8%",halign: "center",align: "left"},
				           {field: "DRIVINGCOUNT",title: "掘进量(m³)",width: "8%",halign: "center",align: "left"},
				           {field: "SUPPORTCOUNT",title: "支护量(m³)",width: "8%",halign: "center",align: "left"},
				           {field: "STEELCOUNT",title: "钢材量(t)",width: "8%",halign: "center",align: "left"},
				           {field: "TOTALCOST",title: "总造价(万元)",width: "8%",halign: "center",align: "left"},
				           {field: "UCD",title: "总造价/掘进量(元/m3)",width: "8%",halign: "center",align: "left"},
				           {field: "UCL",title: "总造价/长度(元/m)",width: "8%",halign: "center",align: "left"},
				           {field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "left"}
				           ]],
				    queryParams:untiQueryParams(),
					onLoadSuccess:function(data){
						var pId = "0";
						if(data.total>0){
							pId=data.rows[0].ID;
						}
						unitEngineerChildLevelList(pId,majorName);
					},	
					onClickRow:function(index,row){
						unitEngineerChildLevelList(row.ID,majorName);
					}
			});
		}else{
            $("#subkeyInfo-datagrid").css("display","block");
            $("#untiChild-datagrid").css("display","block");
			$('#unitEngLeveldg').datagrid({
					url: basePath+"/costTarget/loadUnitTableData",
					width: '98%',
					height:'400',
					idField:'ID', 
					loadMsg : '数据加载中,请稍候...',   
					border:true,
                	pagination:true,
					singleSelect:true,
					striped:true,
					checkOnSelect:true,
					selectOnCheck:true,
					nowarp : true,
					columns: [[	 
						       {field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
						       {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
					           // {field: "FLOORSPACE",title: "占地面积(㎡)",width: "12%",halign: "center",align: "left"},
					           {field: "TOTALCOST",title: "总造价(万元)",width: "12%",halign: "center",align: "left"},
					           // {field: "LENGTH",title: "长度/高度(m)",width: "8%",halign: "center",align: "left"},
					           {field: "CONSTRUCTSPACE",title: "面积/建筑面积(㎡)",width: "15%",halign: "center",align: "left"},
					           {field: "CONSTRUCTVOLUME",title: "体积/建筑体积(m³)",width: "15%",halign: "center",align: "left"},
                               // {field: "UNITCOSTLENGTH",title: "单位造价-长度/高度(万元/m)",width: "15%",halign: "center",align: "left",formatter:function (value, row, index) {
                               //     return Math.round((value==null?0:value)*10000)/10000;
                               // }},
					           {field: "UNITCOSTSPACE",title: "单位造价-面积(万元/㎡)",width: "15%",halign: "center",align: "left",formatter:function (value, row, index) {
                                   return Math.round((value==null?0:value)*10000)/10000;
                               }},
					           {field: "UNITCOSTVOLUME",title: "单位造价-体积(万元/m³)",width: "15%",halign: "center",align: "left",formatter:function (value, row, index) {
                                   return Math.round((value==null?0:value)*10000)/10000;
                               }},
					           {field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "10%",halign: "center",align: "left"},
					           {field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "10%",halign: "center",align: "left"},
                        		{field: "REMARK",title: "备注",width: "6%",halign: "center",align: "left"},
					           {field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "center",
								   formatter:function (value, row, index) {
                                       return "<a style='color:blue;cursor:pointer;' onclick=downFile('"+row.MATERIALLISTID+"') " +
                                           "title='下载文件' ><span class=\"icon-download\"></span></a>";
                               }}
					           ]],
					    queryParams:untiQueryParams(),
						onLoadSuccess:function(data){
							var pId = "0";
							if(data.total>0){
								pId=data.rows[0].ID;
							}
							unitEngineerChildLevelList(pId,majorName);
						},	
						onClickRow:function(index,row){
							unitEngineerChildLevelList(row.ID,majorName);
						}
				});
		}
	}
	if(costType=="EQ"){//设备安装
		$("#subkeyInfo-datagrid").css("display","none");
        $("#untiChild-datagrid").css("display","none");
		$('#unitEngLeveldg').datagrid({
				url: basePath+"/costTarget/loadUnitTableData",
				width: '98%',
				height:'400',
				idField:'ID',
				loadMsg : '数据加载中,请稍候...',   
				border:true,
            	pagination:true,
				singleSelect:true,
				striped:true,
				checkOnSelect:true,
				selectOnCheck:true,
				nowarp : true,
				columns: [[	 
					       {field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
					       {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
				           {field: "EQUIPMENTCOST",title: "设备费(万元)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
							   return Math.round((value==null?0:value)*100)/100;
                           }},
				           {field: "INSTALLCOST",title: "设备安装费(万元)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
                               return Math.round((value==null?0:value)*100)/100;
                           }},
				           {field: "WEIGHT",title: "设备重量(t)",width: "8%",halign: "center",align: "left"},
				           {field: "UNITCOSTWEIGHT",title: "单位造价-重量(元/t)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
                               return Math.round((value==null?0:value)*100)/100;
                           }},
				           {field: "UICE",title: "安装费:设备费(%)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
                               return Math.round((value==null?0:value)*100);
                           }},
				           {field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "8%",halign: "center",align: "left"},
				           {field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "8%",halign: "center",align: "left"},
				           {field: "REMARK",title: "备注",width: "6%",halign: "center",align: "left"},
                    		{field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "center",
							formatter:function (value, row, index) {
								return "<a style='color:blue;cursor:pointer;' onclick=downFile('"+row.MATERIALLISTID+"') " +
									"title='下载文件' ><span class=\"icon-download\"></span></a>";
							}}
				           ]],
				 queryParams:untiQueryParams(),
			});
	}
	if(costType=="INS"){//材料安装
        $("#subkeyInfo-datagrid").css("display","block");
        $("#untiChild-datagrid").css("display","none");
		$('#unitEngLeveldg').datagrid({
				url: basePath+"/costTarget/loadUnitTableData",
				width: '98%',
				height:'400',
				idField:'ID', 
				loadMsg : '数据加载中,请稍候...',   
				border:true,
            	pagination:true,
				singleSelect:true,
				striped:true,
				checkOnSelect:true,
				selectOnCheck:true,
				nowarp : true,
				columns: [[	 
					       {field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
					       {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
				           {field: "MMANDINCOST",title: "材料及材料安装费",width: "12%",halign: "center",align: "left"},
				           {field: "MATERIALCOST",title: "工程材料费(万元)",width: "12%",halign: "center",align: "left"},
				           {field: "MATERIALINCOST",title: "材料安装费(万元)",width: "10%",halign: "center",align: "left"},
				           {field: "UICM",title: "材料安装费:工程材料费(%)",width: "12%",halign: "center",align: "left",
                               formatter:function (value, row, index) {
                                   return value == null?0:value*100;
                               }},
				           {field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "10%",halign: "center",align: "left"},
				           {field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "12%",halign: "center",align: "left"},
				           {field: "REMARK",title: "备注",width: "6%",halign: "center",align: "left"},
							{field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "center",
							formatter:function (value, row, index) {
								return "<a style='color:blue;cursor:pointer;' onclick=downFile('"+row.MATERIALLISTID+"') " +
									"title='下载文件' ><span class=\"icon-download\"></span></a>";
							}}
				           ]],
				queryParams:untiQueryParams(),
				onLoadSuccess:function(data){
					var pId = "0";
					if(data.total>0){
						pId=data.rows[0].ID;
					}
					queryMaterialDetail(pId);
				},	
				onClickRow:function(index,row){
					queryMaterialDetail(row.ID);
				}
			});
	}
	
}
//单位工程级指标库-查询参数
function untiQueryParams(){
	var condition= {               
    	    projectId:function(){//项目Id	
				return projectId;
			},
			stage:function(){//阶段
				if(undefined!= stageId && "" !=stageId){
					return stageId+",mng";
				}else{
					return '';
				}
			},
			major:function(){//专业
				var major = $('#major').combobox('getValue');
				if(undefined!= major && "" !=major){
					return major;
				}else{
					return '';
				}
			},
			costTypeId:function(){//费用
				var cost = $('#cost').combobox('getValue');
				if(undefined!= cost && "" !=cost){
					return cost;
				}else{
					return '';
				}
			}
		};
	return condition;
}

//单位工程级-关联子表数据
function unitEngineerChildLevelList(pId,majorName){
	if (majorName == "井建"){
        $('#subkeyInfodg').datagrid({
            url:basePath+"/costTarget/subkeyInfo",
            title : '分子项信息',
            width: '98%',
            height:'230',
            idField : "ID",
            loadMsg : '数据加载中,请稍候...',
            border:true,
            singleSelect:true,
            striped:true,
            checkOnSelect:true,
            selectOnCheck:true,
            nowarp : true,
            columns: [[
                {field: "MATERIALCODE",title: "物料编码",width: "20%",halign: "center",align: "left"},
                {field: "PBSNAME",title: "分子项名称",width: "20%",halign: "center",align: "left"},
                {field: "PARMAS",title: "参数",width: "20%",halign: "center",align: "left"},
                {field: "SUPPORTTYPE",title: "支护形式",width: "10%",halign: "center",align: "left"},
                {field: "LENGTH",title: "长度(m)",width: "10%",halign: "center",align: "left"},
                {field: "SUPPORTTHICKNESS",title: "支护厚度(mm)",width: "10%",halign: "center",align: "left"},
                {field: "NETFAULTSPACE",title: "净断面积(㎡)",width: "10%",halign: "center",align: "left"},
                {field: "DRIVINGBREAKSPACE",title: "掘进断面积(㎡)",width: "10%",halign: "center",align: "left"},
                {field: "DRIVINGCOUNT",title: "掘进量(m³)",width: "10%",halign: "center",align: "left"},
                {field: "SUPPORTCOUNT",title: "支护量(m³)",width: "10%",halign: "center",align: "left"},
                {field: "STEELCOUNT",title: "钢材量(t)",width: "10%",halign: "center",align: "left"},
                {field: "TOTALCOST",title: "总造价(万元)",width: "10%",halign: "center",align: "left"},
                {field: "UCD",title: "总造价/掘进量(元/m3)",width: "10%",halign: "center",align: "left"},
                {field: "UCL",title: "总造价/长度(元/m)",width: "10%",halign: "center",align: "left"},
                {field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "left"}
            ]],
            queryParams:{   id:pId,
                major:function(){//专业
                    var major = $('#major').combobox('getValue');
                    if(undefined!= major && "" !=major){
                        return major;
                    }else{
                        return '';
                    }
                },
                costTypeId:$('#cost').combobox('getValue')
            },
            onLoadSuccess:function(data){
                var pId = "0";
                if(data.total>0){
                    pId=data.rows[0].ID;
                }
                queryEntityInfo(pId);
            },
            onClickRow:function(index,row){
                queryEntityInfo(row.ID);
            }
        });
	}else {
        $('#subkeyInfodg').datagrid({
            url:basePath+"/costTarget/subkeyInfo",
            title : '分子项信息',
            width: '98%',
            height:'230',
            idField : "ID",
            loadMsg : '数据加载中,请稍候...',
            border:true,
            singleSelect:true,
            striped:true,
            checkOnSelect:true,
            selectOnCheck:true,
            nowarp : true,
            columns: [[
                {field: "MATERIALCODE",title: "物料编码",width: "20%",halign: "center",align: "left"},
                {field: "PBSNAME",title: "分子项名称",width: "20%",halign: "center",align: "left"},
                {field: "PARMAS",title: "参数",width: "20%",halign: "center",align: "left"},
                {field: "FLOORSPACE",title: "占地面积(㎡)",width: "12%",halign: "center",align: "left"},
                {field: "TOTALCOST",title: "总造价(万元)",width: "12%",halign: "center",align: "left"},
                {field: "LENGTH",title: "长度/高度(m)",width: "12%",halign: "center",align: "left"},
                {field: "CONSTRUCTSPACE",title: "面积/建筑面积(㎡)",width: "20%",halign: "center",align: "left"},
                {field: "CONSTRUCTVOLUME",title: "体积/建筑体积(m³)",width: "20%",halign: "center",align: "left"},
                {field: "UNITCOSTLENGTH",title: "单位造价-长度/高度(万元/m)",width: "20%",halign: "center",align: "left",formatter:function (value, row, index) {
                    return Math.round((value==null?0:value)*10000)/10000;
                }},
                {field: "UNITCOSTSPACE",title: "单位造价-面积(万元/㎡)",width: "20%",halign: "center",align: "left",formatter:function (value, row, index) {
                    return Math.round((value==null?0:value)*10000)/10000;
                }},
                {field: "UNITCOSTVOLUME",title: "单位造价-体积(万元/m³)",width: "20%",halign: "center",align: "left",formatter:function (value, row, index) {
                    return Math.round((value==null?0:value)*10000)/10000;
                }},
                // {field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "20%",halign: "center",align: "left"},
                // {field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "20%",halign: "center",align: "left"},
                {field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "left"}
            ]],
            queryParams:{   id:pId,
                major:function(){//专业
                    var major = $('#major').combobox('getValue');
                    if(undefined!= major && "" !=major){
                        return major;
                    }else{
                        return '';
                    }
                },
                costTypeId:$('#cost').combobox('getValue')
            },
            onLoadSuccess:function(data){
                var pId = "0";
                if(data.total>0){
                    pId=data.rows[0].ID;
                }
                queryEntityInfo(pId);
            },
            onClickRow:function(index,row){
                queryEntityInfo(row.ID);
            }
        });
	}
}

function queryMaterialDetail(pId){
	$('#subkeyInfodg').datagrid({
		    url:basePath+"/costTarget/subkeyInfo",
			title : '安装材料明细',
			width: '98%',
			height:'250',
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',   
			border:true,
			singleSelect:true,
			striped:true,
			checkOnSelect:true,
			selectOnCheck:true,
			nowarp : true,			
			columns: [[
			       {field: "MATERIALCODE",title: "物料编码",width: "14%",halign: "center",align: "left"},
		           {field: "PBSNAME",title: "项目物料名称",width: "14%",halign: "center",align: "left"},
		           {field: "PARMAS",title: "参数",width: "12%",halign: "center",align: "left"},
		           {field: "QTY",title: "数量",width: "10%",halign: "center",align: "left"},
		           {field: "UNIT",title: "单位",width: "10%",halign: "center",align: "left"},
		           {field: "UNITWEIGHT",title: "单重(吨)",width: "12%",halign: "center",align: "left"},
		           {field: "WEIGHT",title: "总重(吨)",width: "13%",halign: "center",align: "left"},
		           {field: "MMANDINCOST",title: "材料及材料安装费",width: "20%",halign: "center",align: "left"},
		           {field: "MATERIALCOST",title: "工程材料费(万元)",width: "20%",halign: "center",align: "left"},
		           {field: "MATERIALINCOST",title: "材料安装费(万元)",width: "20%",halign: "center",align: "left"},
		           {field: "UNITCOSTWEIGHT",title: "单位造价",width: "10%",halign: "center",align: "left",formatter:function (value, row, index) {
		           	var result = (row.MMANDINCOST==null?0:row.MMANDINCOST)/row.QTY;//材料及材料安装费/数量
                       return result;
                   }},
		           {field: "UICM",title: "材料安装费:工程材料费(%)",width: "20%",halign: "center",align: "left",
                       formatter:function (value, row, index) {
                           return value == null?0:value*100;
                       }},
		           {field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "12%",halign: "center",align: "left"},
		           {field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "20%",halign: "center",align: "left"},
		           {field: "VALUATIONFILE",title: "计价文件",width: "10%",halign: "center",align: "left"}
		           ]],
			queryParams:{   id:pId,
							major:$('#major').combobox('getValue'),
							costTypeId:$('#cost').combobox('getValue')
		    }
		}
	);
}
function queryEntityInfo(id) {
    $('#childUnitEngLeveldg').datagrid({
        url:basePath+"/costTarget/entityInfo",
        title : '实物量数据',
        width: '100%',
        height:'230',
        idField : "ID",
        loadMsg : '数据加载中,请稍候...',
        border:true,
        singleSelect:true,
        striped:true,
        checkOnSelect:true,
        selectOnCheck:true,
        nowarp : true,
        columns: [[
            {field: "PRJMATERIALNAME",title: "名称",width: "20%",halign: "center",align: "left"},
            {field: "MMDESCRIPTION",title: "参数",width: "20%",halign: "center",align: "left"},
            {field: "QTY",title: "数量",width: "20%",halign: "center",align: "left"},
            {field: "UNITID",title: "单位",width: "20%",halign: "center",align: "left"},
            {field: "REMARK",title: "备注",width: "20%",halign: "center",align: "left"},
        ]],
        queryParams:{   id:id}
    });
}
function downFile(mmId) {
	if (mmId == "null"){
        MyMessager.alert.show("提示", "请选择专业！");
        return;
	}
    $("#notificationView").window({
        href: basePath+"/pbsVersionU/priceProfileView?materialListId="+mmId,
        height: 310,
        width: 610,
        zIndex: 999,
        collapsible: false,
        minimizable: false,
        maximizable: false,
        modal: true
    });
}
