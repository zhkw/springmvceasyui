//项目路径
var basePath=$("#basePath").val();
//项目产品类型
var productList;
var productArr = new Array();
//阶段
var stageList;
var stageArr = new Array();
var stageArr2 = new Array();
//专业
var majorList;
var majorArr = new Array();
var majorArr2 = new Array();
//单位
var unitArr = new Array();
//规模单位
var qtyUnitList=new Array();
var qtyUnitListMap = new Array();

var dlg;
var prjmmid="";
var versionId="";
var tableDate=new Object();
$(function(){
    //加载基础数据
    baseData();
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

	//初始化表格数据
	initDataPan();
	
	//切换
	$('#tt').tabs({
	    onSelect:function(title,index){
			if(index==0){
				initDataPan();	
			}else if(index==1){
				//初始化表格数据
				initDataPanArea();	
			}else if(index==2){
				$("#subKey-attrTbl").css('display','none');
				//$("#subLevelToolbar").style.height='auto';
				selectSubkeyNature(1);
				initDataPanSubkey();
			}else if(index==3){
				$("#unit-attrTbl").css('display','none');
				//$("#unitLevelToolbar").style.height='auto';
				selectSubkeyNature(2);
				initDataPanUnit();
			}
	    }
	});
	
	//选择专业
	$('#major').combobox({
	    onChange: function(date){
	    	initDataPanUnit();
	    }
	});
	//选择费用
	$('#cost').combobox({
	    onChange: function(date){	
	    	initDataPanUnit();
	    }
	});
	
});

function baseData(){
	$.ajax({
		url : basePath+"/equipPriceLib/getEquipPriceBaseData",
		data:{},
		type:'post',
		async:false,
		beforeSend:function() {
			//MyMessager.prog.show("提示","请等待","数据加载中...");
		},
		complete:function() {
			//MyMessager.prog.close();
		},
		error:function(jqXHR, textStatus, errorThrown) {
			MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
		},
		success:function(obj){
			//产品类型
			productList = obj.productType;
			for(var i in productList){
				var product = new Object();
				product.id = productList[i].ID;
				product.text =productList[i].NAME;
				productArr.push(product);
			}		
			//专业
			// majorList = obj.major;
			// for(var i in majorList){
			// 	var major = new Object();
	 		// 	major.id = majorList[i].ID;
	 		// 	major.text = majorList[i].MAJORNAME;
	 		// 	/*if(i==0){
	 		// 		major.selected = true;
	 		// 	}else{
	 		// 		major.selected = false;
	 		// 	}*/
	 		// 	majorArr.push(major);
	 		// 	majorArr2[majorList[i].ID] = majorList[i].MAJORNAME;
			// }
			//阶段
			stageList = obj.stage;
			for ( var i in stageList) {
				var stage = new Object();
				stage.id = stageList[i].ID;
				stage.text = stageList[i].NAME;
                stageArr2[stageList[i].ID] = stageList[i].NAME;
				stageArr.push(stage);
			}
			for(var i in obj.unit){
				unitArr[obj.unit[i].ID] = obj.unit[i].UNITNAME;
			}
			
			//产品类型
			$('.productType').combobox({   
				editable:true,
				multiple:false,
				valueField: 'id',
				textField: 'text',
				panelHeight: '300',
				data: productArr
			});
			//阶段
			$(".stage").combobox({   
				editable:true,
				multiple:false,
				valueField: 'id',
				textField: 'text',
				panelHeight: '160',
				data: stageArr
			});
			
			//专业
			// $("#major").combobox({
			// 	editable:true,
			// 	valueField: 'id',
			// 	textField: 'text',
			// 	panelHeight: '300',
			// 	data: majorArr
			// });
			
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
                majorArr2[majorList[i].ID] = majorList[i].MAJORNAME;
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
}

//项目级数据初始化
function initDataPan(){	
	$("#datagrid").datagrid({
		url: basePath+"/costTarget/loadTableData",
		width: '98%',
		height:'350',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
        border:true,
        pagination:true,
        singleSelect:true,
        striped:true,
        checkOnSelect:true,
        selectOnCheck:true,
        nowarp : true,
		rownumbers:true,
		frozenColumns : [[
					{field: "PROJECTCODE",title: "项目编码",width: "6%",halign: "center",align: "left"},
					{field: "PRJ_NAME",title: "项目名称",width: "12%",halign: "center",align: "left"}    
         ]],
        columns: [[        
        {field: "PRODUCTTYPE",title: "产品类型",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
			return (row.PRODUCTTYPE).substr(0, (row.PRODUCTTYPE).length - 1);
        }},
        // {field: "PARMAS",title: "参数",width: "10%",halign: "center",align: "left"},
        {field: "QTY",title: "规模",width: "6%",halign: "center",align: "left",formatter:function (value,row,index) {
            var qtyUnit = "";
            if (row.QTYUNITID != null){
                qtyUnit = qtyUnitListMap[row.QTYUNITID];
                return row.QTY+"/"+qtyUnit
            }
            return "";
        }},
        {field: "PRODUCTSCHEME",title: "产品方案",width: "8%",halign: "center",align: "left"},
        {field: "PROCESSSCHEME",title: "工艺方案",width: "8%",halign: "center",align: "left"},
        {field: "TOTALINVESTMENT",title: "建设总投资(万)",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
     		   return parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST);
     	   } 
        },
        {field: "ALLCOST",title: "其中:工程费用(万)",width: "10%",halign: "center",align: "left"},
        {field: "OTHERCOST",title: "其中:其他费用(万)",width: "10%",halign: "center",align: "left"},
        {field: "BUDGETCOST",title: "其中:预备费用(万)",width: "10%",halign: "center",align: "left"},
        {field: "UNITINVESTMENTINDEX",title: "单位投资指标",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        	var result = (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST))/(parseFloat(row.QTY)*10000)
     		   if(row.QTY && row.QTY>0){
     			   return result;
     		   }else{
     			   return 0;
     		   }
     	   }
        },
        {field: "STAGENAME",title: "阶段",width: "10%",halign: "center",align: "left",
            formatter: function(value,row,index){
        		return stageArr2[row.STAGE_ID2];
			}
		},
        {field: "DATASOURCE",title: "数据来源",width: "8%",halign: "center",align: "left"},
        ]],
		queryParams: {               
			projName:function(){//项目名称/编码	
				var projName = $('#projName').textbox('getValue');
				if(undefined!= projName && "" !=projName){
					return projName;
				}else{
					return '';
				}
			},
			productType:function(){//产品类型
				var productType = $('#productType').combobox('getValues');
				if(undefined!= productType && "" !=productType){
					return productType;
				}else{
					return '';
				}
			},
			stage:function(){//阶段
				var stage = $('#stage').combobox('getValues');
				if(undefined!= stage && "" !=stage){
					return stage;
				}else{
					return '';
				}
			},
			productProgram:function(){//产品方案
				var productProgram =$('#productProgram').textbox('getValue');
				if(undefined!= productProgram && "" !=productProgram){
					return productProgram;
				}else{
					return '';
				}
			},
			minNum:function(){//规模
				var minNum =$('#minNum').numberbox('getValue');
				if(undefined!= minNum && "" !=minNum){
					return minNum;
				}else{
					return '';
				}
			},
			maxNum:function(){//规模
				var maxNum =$('#maxNum').numberbox('getValue');
				if(undefined!= maxNum && "" !=maxNum){
					return maxNum;
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
			costDist(pId);
		},
		onClickRow:function(index,row){
				costDist(row.ID);
		}
	});
}
function costDist(pId){
//工程费用分布
$("#costDistribution").datagrid({
	title : '工程费用分布',
	url: basePath+"/costTarget/loadCostDistributionData",
	width: '65%',
	height:'200',
	idField : "ID",
	loadMsg : '数据加载中,请稍候...',   
    border:true,
    striped:true,
    singleSelect:true,
    checkOnSelect:true,
    selectOnCheck:true,
    nowarp : true,
    columns: [[
               {field: "PBSNAME",title: "子项用途划分",width: "17%",halign: "center",align: "left"},
               {field: "ALLCOST",title: "工程费用（万）",width: "17%",halign: "center",align: "left"},
               {field: "TOTALCOST",title: "其中：建筑工程费（万）",width: "17%",halign: "center",align: "left"},
               {field: "EQUIPMENTCOST",title: "其中：设备费（万）",width: "17%",halign: "center",align: "left"},
               {field: "INSTALLCOST",title: "其中：安装工程费（万）",width: "17%",halign: "center",align: "left"},
               {field: "occupy",title: "占比(%)",width: "16%",halign: "center",align: "left",
				   formatter:function(value,row,index){
            	   if(row.ALLCOST){
	        		   var sum = 0;
	        		   var rows = $("#costDistribution").datagrid("getRows");
	        		   for (var i = 0; i < rows.length; i++) {
	        			   sum += parseFloat(rows[i].ALLCOST);
	        		   }
	        		   return (parseFloat(row.ALLCOST)/sum*100).toFixed(2);
	        	   }else{
	        		   return 0;
	        	   }
               }
               }]],
               queryParams: {  parentId:pId            
       			}
	});
}

//区域级
function initDataPanArea(){
$("#datagrAreaId").datagrid({
	url: basePath+"/costTarget/loadAreaTableData",
	width: '98%',
	height:'350',
	idField : "ID",
	loadMsg : '数据加载中,请稍候...',   
    border:true,
    pagination:true,
    singleSelect:true,
    striped:true,
    checkOnSelect:true,
    selectOnCheck:true,
    nowarp : true,
	rownumbers:true,		
	frozenColumns : [[
						{field: "PROJECTCODE",title: "项目编码",width: "6%",halign: "center",align: "left"},
						{field: "PRJ_NAME",title: "项目名称",width: "12%",halign: "center",align: "left"}    
			         ]],
    columns: [[    
    {field: "PRODUCTTYPE",title: "产品类型",width: "10%",halign: "center",align: "left",formatter:function (value,row,index) {
        return (row.PRODUCTTYPE).substr(0, (row.PRODUCTTYPE).length - 1);
    }},
    {field: "PBSNAME",title: "区域名称",width: "11%",halign: "center",align: "left"},
    {field: "QTY",title: "规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
        var qtyUnit = "";
        if (row.QTYUNITID != null){
            qtyUnit = qtyUnitListMap[row.QTYUNITID];
            return row.QTY+"/"+qtyUnit
        }
        return "";
    }},
    {field: "PRODUCTSCHEME",title: "产品方案",width: "10%",halign: "center",align: "left"},
    {field: "TOTALINVESTMENT",title: "建设总投资(万)",width: "6%",halign: "center",align: "left"},
    {field: "ALLCOST",title: "其中:工程费用(万)",width: "8%",halign: "center",align: "left"},
    {field: "OTHERCOST",title: "其中:其他费用(万)",width: "8%",halign: "center",align: "left"},
    {field: "BUDGETCOST",title: "其中:预备费用(万)",width: "8%",halign: "center",align: "left"},
    {field: "UNITINVESTMENTINDEX",title: "单位投资指标",width: "6%",halign: "center",align: "left",
        formatter: function(value,row,index){
            var result = (parseFloat(row.ALLCOST)+parseFloat(row.OTHERCOST)+parseFloat(row.BUDGETCOST))/(parseFloat(row.QTY)*10000)
            if(row.QTY && row.QTY>0){
                return Math.round((result==null?0:result)*10000)/10000;
            }else{
                return 0;
            }
        }},
    {field: "STAGENAME",title: "阶段",width: "10%",halign: "center",align: "left",
        formatter: function(value,row,index){
            return stageArr2[row.STAGE_ID2];
        }
        },
    {field: "DATASOURCE",title: "数据来源",width: "8%",halign: "center",align: "left"},
    ]],
	queryParams: {               
		projName:function(){//项目名称/编码	
			var projName = $('#projNameArea').textbox('getValue');
			if(undefined!= projName && "" !=projName){
				return projName;
			}else{
				return '';
			}
		},
		productType:function(){//产品类型
			var productType = $('#productTypeArea').combobox('getValues');
			if(undefined!= productType && "" !=productType){
				return productType;
			}else{
				return '';
			}
		},
		stage:function(){//阶段
			var stage = $('#stageArea').combobox('getValues');
			if(undefined!= stage && "" !=stage){
				return stage;
			}else{
				return '';
			}
		},
		area:function(){//区域
			var productProgram =$('#area').textbox('getValue');
			if(undefined!= productProgram && "" !=productProgram){
				return productProgram;
			}else{
				return '';
			}
		},
		productProgram:function(){//产品方案
			var productProgram =$('#productProgramArea').textbox('getValue');
			if(undefined!= productProgram && "" !=productProgram){
				return productProgram;
			}else{
				return '';
			}
		},
		minNum:function(){//规模
			var minNum =$('#minNumArea').numberbox('getValue');
			if(undefined!= minNum && "" !=minNum){
				return minNum;
			}else{
				return '';
			}
		},
		maxNum:function(){//规模
			var maxNum =$('#maxNumArea').numberbox('getValue');
			if(undefined!= maxNum && "" !=maxNum){
				return maxNum;
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
			costSubk(pId);
		},	
		onClickRow:function(index,row){
			costSubk(row.ID);
		}
});
}
function costSubk(pId){
//子项费用
$("#costSubkey").datagrid({
	title : '子项费用',
	url: basePath+"/costTarget/loadCostAreaData",
	width: '65%',
	height:'200',
	idField : "ID",
	loadMsg : '数据加载中,请稍候...',   
	border:true,
	striped:true,
	singleSelect:true,
	checkOnSelect:true,
	selectOnCheck:true,
	nowarp : true,
	columns: [[
           {field: "PBSNODECODE",title: "子项编码",width: "17%",halign: "center",align: "left"},
           {field: "PBSNAME",title: "子项名称",width: "17%",halign: "center",align: "left"},
           {field: "ALLCOST",title: "工程费用（万）",width: "17%",halign: "center",align: "left"},
           {field: "TOTALCOST",title: "其中：建筑工程费（万）",width: "17%",halign: "center",align: "left"},
           {field: "EQUIPMENTCOST",title: "其中：设备费（万）",width: "17%",halign: "center",align: "left"},
           {field: "INSTALLCOST",title: "其中：安装工程费（万）",width: "16%",halign: "center",align: "left"},
           ]],
           queryParams: {parentId:pId}
});
}




//子项级
function initDataPanSubkey(){
	
	//产品类型下拉列表选择事件
	$('#productTypeSubKey').combobox({
	    onChange: function(date){
	    	$("#datagrSubkeyId").datagrid("reload");
	    }
	});
	
	
		
	//子项级
	$("#datagrSubkeyId").datagrid({
		url: basePath+"/costTarget/loadSubkeyTableData",
		width: '98%',
		height:'350',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
	    border:true,
        pagination:true,
	    striped:true,
	    singleSelect:true,
	    checkOnSelect:true,
	    selectOnCheck:true,
	    nowarp : true,
		rownumbers:true,	
		frozenColumns : [[
							{field: "PROJECTCODE",title: "项目编码",width: "6%",halign: "center",align: "left"},
							{field: "PRJ_NAME",title: "项目名称",width: "12%",halign: "center",align: "left"}    
				         ]],
	    columns: [[
	    {field: "PRODUCTTYPE",title: "产品类型",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
            return (row.PRODUCTTYPE).substr(0, (row.PRODUCTTYPE).length - 1);
        }},
	    {field: "PRODUCTSCHEME",title: "项目-产品方案",width: "8%",halign: "center",align: "left"},
	    {field: "QTY",title: "项目-规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
	    	var qtyUnit = "";
	    	if (row.UNIT != null){
	    		qtyUnit = qtyUnitListMap[row.UNIT];
                return row.QTY+"/"+qtyUnit
			}
			return "";
        }},
	    {field: "PBSNODECODE",title: "子项编码",width: "8%",halign: "center",align: "left"},
	    {field: "PBSNAME",title: "子项名称",width: "6%",halign: "center",align: "left"},
	    // {field: "PARMAS",title: "参数",width: "6%",halign: "center",align: "left"},
	    {field: "ALLCOST",title: "工程费用（万）",width: "6%",halign: "center",align: "left"},
	    {field: "TOTALCOST",title: "其中:建筑工程费用(万)",width: "8%",halign: "center",align: "left"},
	    {field: "EQUIPMENTCOST",title: "其中:设备费用(万)",width: "8%",halign: "center",align: "left"},
	    {field: "INSTALLCOST",title: "其中:安装工程费(万)",width: "8%",halign: "center",align: "left"},
	    {field: "STAGENAME",title: "阶段",width: "6%",halign: "center",align: "left",
            formatter: function(value,row,index){
                return stageArr2[row.STAGE_ID2];
            }
            },
	    {field: "DATASOURCE",title: "数据来源",width: "6%",halign: "center",align: "left"},
	    ]],
		queryParams: {
            projName:function(){//项目名称/编码
                var projName = $('#projNameSubKey').textbox('getValue');
                if(undefined!= projName && "" !=projName){
                    return projName;
                }else{
                    return '';
                }
            },
            productType:function(){//产品类型productTypeSubKey
                var productType = $('#productTypeSubKey').combobox('getValues');
                if(undefined!= productType && "" !=productType){
                    return productType;
                }else{
                    return '';
                }
            },
            stage:function(){//阶段
                var stage = $('#stageSubKey').combobox('getValues');
                if(undefined!= stage && "" !=stage){
                    return stage;
                }else{
                    return '';
                }
            },
            subkey:function(){//子项
                var projName = $('#subkey').textbox('getValue');
                if(undefined!= projName && "" !=projName){
                    return projName;
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
			unitCost(pId);
			professionalF(pId);
		},	
		onClickRow:function(index,row){
				unitCost(row.ID);
				professionalF(row.ID);
		}
	});
	
}
//查询条件
function getQueryParam1(){
	//获取表格数据
	var $tb=$('#subkeyTable');
	var objArray=getTableData($tb);
	var condtion = {               
			projName:function(){//项目名称/编码	
				var projName = $('#projNameSubKey').textbox('getValue');
				if(undefined!= projName && "" !=projName){
					return projName;
				}else{
					return '';
				}
			},
			productType:function(){//产品类型productTypeSubKey
				var productType = $('#productTypeSubKey').combobox('getValues');
				if(undefined!= productType && "" !=productType){
					return productType;
				}else{
					return '';
				}
			},
			stage:function(){//阶段
				var stage = $('#stageSubKey').combobox('getValues');
				if(undefined!= stage && "" !=stage){
					return stage;
				}else{
					return '';
				}
			},
			subkey:function(){//子项	
				var projName = $('#subkey').textbox('getValue');
				if(undefined!= projName && "" !=projName){
					return projName;
				}else{
					return '';
				}
			},
			attrJson:JSON.stringify(objArray)
		};
	return condtion;
}

function unitCost(pbsId){
	//属性-单位造价
	$("#unitCosts").datagrid({
		title : '属性-单位造价',
		url: basePath+"/costTarget/loadUnitCostsData",
		width: '80%',
		height:'170',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		striped:true,
		singleSelect:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[
	           {field: "ATTRNAME",title: "属性",width: "25%",halign: "center",align: "left"},
	           {field: "ATTRVALUE",title: "属性值",width: "25%",halign: "center",align: "left"},
	           {field: "ATTRUNITID",title: "单位",width: "20%",halign: "center",align: "left",formatter:function(value,row,index){
	        	   if(value){
		        		return unitArr[value];
	        	   }
	        }},
	           {field: "UNITCOST",title: "单位造价",width: "29%",halign: "center",align: "left",formatter:function(value,row,index){
	        	   if(value){
	        		   return value.toFixed(2);
	        	   }
	           }},
	           ]],
	 queryParams: {parentId:pbsId}
	});
}
function professionalF(parentId){
	//各专业费用
	$("#professionalFee").datagrid({
		title : '各专业费用',
		url: basePath+"/costTarget/loadProfessionalFeeData",
		width: '80%',
		height:'170',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
		border:true,
		striped:true,
		singleSelect:true,
		checkOnSelect:true,
		selectOnCheck:true,
		nowarp : true,
		columns: [[
	           {field: "MAJORID",title: "专业",width: "20%",halign: "center",align: "left",formatter:function(value,row,index){
	        	   if(value){
	        		   return majorArr2[value];
	        	   }
	           }},
	           {field: "ALLCOST",title: "工程费用",width: "18%",halign: "center",align: "left"},
	           {field: "TOTALCOST",title: "其中：建筑工程费（万）",width: "20%",halign: "center",align: "left"},
	           {field: "EQUIPMENTCOST",title: "其中：设备费（万）",width: "20%",halign: "center",align: "left"},
	           {field: "INSTALLCOST",title: "其中：安装工程费（万）",width: "21%",halign: "center",align: "left"},
	           ]],
	           queryParams: { parentId:parentId }
	});
}
	
//单位工程级指标
function initDataPanUnit(){
    $("#subkeyInfo-datagrid").css("display","block");
    $("#untiChild-datagrid").css("display","block");
	//费用类型
	var costType = $('#cost').combobox('getValue');
	if(costType=="CON"){//建筑工程
		//专业
		var majorId = $('#major').combobox('getValue');
		var majorName = majorArr2[majorId];
		if(majorName=="井建"){
            $("#subkeyInfo-datagrid").css("display","block");
            $("#untiChild-datagrid").css("display","block");
			$('#datagrUnitId').datagrid({
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
                rownumbers:true,
                frozenColumns : [[
                    {field: "PROJECTCODE",title: "项目编码",width: "6%",halign: "center",align: "left"},
                    {field: "PRJ_NAME",title: "项目名称",width: "12%",halign: "center",align: "left"}
                ]],
				columns: [[
					       {field: "PRODUCTTYPE",title: "产品类型",width: "10%",halign: "center",align: "left",formatter:function (value,row,index) {
                               return (row.PRODUCTTYPE).substr(0, (row.PRODUCTTYPE).length - 1);
                           }},
							{field: "PRODUCTSCHEME",title: "项目-产品方案",width: "8%",halign: "center",align: "left"},
							{field: "QTY",title: "项目-规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
								var qtyUnit = "";
								if (row.UNIT != null){
									qtyUnit = qtyUnitListMap[row.UNIT];
									return row.QTY+"/"+qtyUnit
								}
								return "";
							}},
					        {field: "PBSNAME",title: "(分)子项名称",width: "10%",halign: "center",align: "left"},
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
							{field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "center",
								formatter:function (value, row, index) {
									return "<a style='color:blue;cursor:pointer;' onclick=downFile('"+row.MATERIALLISTID+"') " +
										"title='下载文件' ><span class=\"icon-download\"></span></a>";
								}},
							{field: "STAGENAME",title: "阶段",width: "10%",halign: "center",align: "left",
								formatter: function(value,row,index){
									return stageArr2[row.STAGE_ID2];
								}
							},
							{field: "DATASOURCE",title: "数据来源",width: "8%",halign: "center",align: "left"},
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
			$('#datagrUnitId').datagrid({
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
                	rownumbers:true,
					frozenColumns : [[
						{field: "PROJECTCODE",title: "项目编码",width: "6%",halign: "center",align: "left"},
						{field: "PRJ_NAME",title: "项目名称",width: "12%",halign: "center",align: "left"}
					]],
					columns: [[
								{field: "PRODUCTTYPE",title: "产品类型",width: "10%",halign: "center",align: "left",formatter:function (value,row,index) {
                                    return (row.PRODUCTTYPE).substr(0, (row.PRODUCTTYPE).length - 1);
                                }},
								{field: "PRODUCTSCHEME",title: "项目-产品方案",width: "8%",halign: "center",align: "left"},
								{field: "QTY",title: "项目-规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
									var qtyUnit = "";
									if (row.UNIT != null){
										qtyUnit = qtyUnitListMap[row.UNIT];
										return row.QTY+"/"+qtyUnit
									}
									return "";
								}},
						        {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
								{field: "FLOORSPACE",title: "占地面积(㎡)",width: "8%",halign: "center",align: "left"},
								{field: "TOTALCOST",title: "总造价(万元)",width: "8%",halign: "center",align: "left"},
								// {field: "LENGTH",title: "长度/高度(m)",width: "8%",halign: "center",align: "left"},
								{field: "CONSTRUCTSPACE",title: "面积/建筑面积(㎡)",width: "8%",halign: "center",align: "left"},
								{field: "CONSTRUCTVOLUME",title: "体积/建筑体积(m³)",width: "8%",halign: "center",align: "left"},
								{field: "UNITCOSTSPACE",title: "单位造价-面积(万元/㎡)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
									return Math.round((value==null?0:value)*10000)/10000;
								}},
								{field: "UNITCOSTVOLUME",title: "单位造价-体积(万元/m³)",width: "8%",halign: "center",align: "left",formatter:function (value, row, index) {
									return Math.round((value==null?0:value)*10000)/10000;
								}},
								{field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "8%",halign: "center",align: "left"},
								{field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "8%",halign: "center",align: "left"},
								{field: "REMARK",title: "备注",width: "6%",halign: "center",align: "left"},
								{field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "center",
									formatter:function (value, row, index) {
										return "<a style='color:blue;cursor:pointer;' onclick=downFile('"+row.MATERIALLISTID+"') " +
											"title='下载文件' ><span class=\"icon-download\"></span></a>";
								}},
								{field: "STAGENAME",title: "阶段",width: "10%",halign: "center",align: "left",
									formatter: function(value,row,index){
										return stageArr2[row.STAGE_ID2];
									}
								},
								{field: "DATASOURCE",title: "数据来源",width: "8%",halign: "center",align: "left"},
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
		$('#datagrUnitId').datagrid({
				url: basePath+"/costTarget/loadUnitTableData",
				width: '98%',
				height:'580',
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
                    {field: "PRODUCTSCHEME",title: "项目-产品方案",width: "8%",halign: "center",align: "left"},
                    {field: "QTY",title: "项目-规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
                        var qtyUnit = "";
                        if (row.UNIT != null){
                            qtyUnit = qtyUnitListMap[row.UNIT];
                            return row.QTY+"/"+qtyUnit
                        }
                        return "";
                    }},
					//{field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
					{field: "PBSNAME",title: "(分)子项名称",width: "10%",halign: "center",align: "left"},
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
                        }},
                    {field: "STAGENAME",title: "阶段",width: "10%",halign: "center",align: "left",
                        formatter: function(value,row,index){
                            return stageArr2[row.STAGE_ID2];
                        }
                    },
                    {field: "DATASOURCE",title: "数据来源",width: "8%",halign: "center",align: "left"},
				]],
				 queryParams:untiQueryParams(),
			});
	}
	if(costType=="INS"){//材料安装
        $("#subkeyInfo-datagrid").css("display","block");
        $("#untiChild-datagrid").css("display","none");
		$('#datagrUnitId').datagrid({
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
                    {field: "PRODUCTSCHEME",title: "项目-产品方案",width: "8%",halign: "center",align: "left"},
                    {field: "QTY",title: "项目-规模",width: "8%",halign: "center",align: "left",formatter:function (value,row,index) {
                        var qtyUnit = "";
                        if (row.UNIT != null){
                            qtyUnit = qtyUnitListMap[row.UNIT];
                            return row.QTY+"/"+qtyUnit
                        }
                        return "";
                    }},
					//{field: "PBSNODECODE",title: "子项编码",width: "12%",halign: "center",align: "left"},
					{field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
					//{field: "PARMAS",title: "参数",width: "6%",halign: "center",align: "left"},
					{field: "MMANDINCOST",title: "材料及材料安装费",width: "8%",halign: "center",align: "left"},
					{field: "MATERIALCOST",title: "工程材料费(万元)",width: "8%",halign: "center",align: "left"},
					{field: "MATERIALINCOST",title: "材料安装费(万元)",width: "8%",halign: "center",align: "left"},
					{field: "UICM",title: "材料安装费:工程材料费(%)",width: "8%",halign: "center",align: "left",
						formatter:function (value, row, index) {
						return value == null?0:value*100;
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
//查询条件
function untiQueryParams(){
	//var $tb=$('#unitTable');
	//var objArray=getTableData($tb);
	var condition ={ 
				major:function(){//专业
					var major = $('#major').combobox('getValues');
					if(undefined!= major && "" !=major){
						return major;
					}else{
						return '';
					}
				},
				costTypeId:function(){//费用
					var cost = $('#cost').combobox('getValues');
					if(undefined!= cost && "" !=cost){
						return cost;
					}else{
						return '';
					}
				},
				projName:function(){//项目名称/编码	
					var projName = $('#projNameUnit').textbox('getValue');
					if(undefined!= projName && "" !=projName){
						return projName;
					}else{
						return '';
					}
				},
				productType:function(){//产品类型
					var productType = $('#productTypeUnit').combobox('getValues');
					if(undefined!= productType && "" !=productType){
						return productType;
					}else{
						return '';
					}
				},
				stage:function(){//阶段
					var stage = $('#stageUnit').combobox('getValues');
					if(undefined!= stage && "" !=stage){
						return stage;
					}else{
						return '';
					}
				},
				productProgram:function(){//产品方案
					var productProgram = $('#productProgramUnit').textbox('getValue');
					if(undefined!= productProgram && "" !=productProgram){
						return productProgram;
					}else{
						return '';
					}
				},
				minNum:function(){//规模
					var minNum =$('#minNumUnit').numberbox('getValue');
					if(undefined!= minNum && "" !=minNum){
						return minNum;
					}else{
						return '';
					}
				},
				maxNum:function(){//规模
					var maxNum =$('#maxNumUnit').numberbox('getValue');
					if(undefined!= maxNum && "" !=maxNum){
						return maxNum;
					}else{
						return '';
					}
				},
				pbsName:function(){//子项
					var Unit =$('#Unit').numberbox('getValue');
					if(undefined!= Unit && "" !=Unit){
						return Unit;
					}else{
						return '';
					}
				},
				//attrJson:JSON.stringify(objArray)
			};
	return condition;
}

//单位工程级-关联子表数据
function unitEngineerChildLevelList(pId,majorName){
	if (majorName == "井建"){
        $('#subkeyInfo').datagrid({
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
            queryParams:{  id:pId,
                major:$('#major').combobox('getValue'),
                costTypeId:$('#cost').combobox('getValue')
            },onLoadSuccess:function(data){
                var pId = "0";
                if(data.total>0){
                    pId=data.rows[0].ID;
                }
                entityInfo(pId);
            },
            onClickRow:function(index,row){
                entityInfo(row.ID);
            }});
	}else {
        $('#subkeyInfo').datagrid({
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
            queryParams:{  id:pId,
                major:$('#major').combobox('getValue'),
                costTypeId:$('#cost').combobox('getValue')
            },onLoadSuccess:function(data){
                var pId = "0";
                if(data.total>0){
                    pId=data.rows[0].ID;
                }
                entityInfo(pId);
            },
            onClickRow:function(index,row){
                entityInfo(row.ID);
            }});
	}
}

function queryMaterialDetail(pId){
	$('#subkeyInfo').datagrid({
		    url:basePath+"/costTarget/subkeyInfo",
			title : '安装材料明细',
			width: '100%',
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
				{field: "MATERIALCODE",title: "物料编码",width: "14%",halign: "center",align: "left"},
				{field: "PBSNAME",title: "项目物料名称",width: "14%",halign: "center",align: "left"},
				{field: "PARMAS",title: "参数",width: "12%",halign: "center",align: "left"},
				{field: "QTY",title: "数量",width: "10%",halign: "center",align: "left"},
				{field: "UNIT",title: "单位",width: "10%",halign: "center",align: "left"},
				{field: "UNITWEIGHT",title: "单重(吨)",width: "12%",halign: "center",align: "left"},
				{field: "WEIGHT",title: "总重(吨)",width: "13%",halign: "center",align: "left"},
				{field: "MMANDINCOST",title: "材料及材料安装费",width: "14%",halign: "center",align: "left"},
				{field: "MATERIALCOST",title: "工程材料费(万元)",width: "12%",halign: "center",align: "left"},
				{field: "MATERIALINCOST",title: "材料安装费(万元)",width: "10%",halign: "center",align: "left"},
				{field: "UNITCOSTWEIGHT",title: "单位造价",width: "10%",halign: "center",align: "left",formatter:function (value, row, index) {
					var result = (row.MMANDINCOST==null?0:row.MMANDINCOST)/row.QTY;//材料及材料安装费/数量
					return result;
				}},
				{field: "UICM",title: "材料安装费:工程材料费(%)",width: "12%",halign: "center",align: "left",
					formatter:function (value, row, index) {
                    return value == null?0:value*100;
                }},
				{field: "ARTIFICIALQTY",title: "人工数量(工日)",width: "8%",halign: "center",align: "left"},
				{field: "UNITARTIFICIALCOST",title: "综合人工单价(元/工日)",width: "8%",halign: "center",align: "left"},
				{field: "VALUATIONFILE",title: "计价文件",width: "6%",halign: "center",align: "left"}
			]],
			queryParams:{  id:pId,
							major:$('#major').combobox('getValue'),
							costTypeId:$('#cost').combobox('getValue')
		    }
		}
	);
}


// function subkeyInfo(parentId){
// 	//分子项信息
// 	$("#subkeyInfo").datagrid({
// 		title : '分子项信息',
// 		url: basePath+"/costTarget/subkeyInfo",
// 		width: '98%',
// 		height:'180',
// 		idField : "ID",
// 		loadMsg : '数据加载中,请稍候...',
// 		border:true,
// 		singleSelect:true,
// 		striped:true,
// 		checkOnSelect:true,
// 		selectOnCheck:true,
// 		nowarp : true,
// 		frozenColumns : [[
// 						{field: "PBSNODECODE",title: "物料编码",width: "8%",halign: "center",align: "left"},
// 						{field: "PBSNAME",title: "分子项名称",width: "8%",halign: "center",align: "left"}
// 				         ]],
// 		columns: [[
//
// 	           {field: "PARMAS",title: "参数",width: "8%",halign: "center",align: "left"},
// 	           {field: "FLOORSPACE",title: "占地面积(m2)",width: "8%",halign: "center",align: "left"},
// 	           {field: "TOTALCOST",title: "总造价（万元）",width: "8%",halign: "center",align: "left"},
// 	           {field: "LENGTH",title: "长度（m）",width: "8%",halign: "center",align: "left"},
// 	           {field: "CONSTRUCTSPACE",title: "面积/建筑面积(m2)",width: "8%",halign: "center",align: "left"},
// 	           {field: "CONSTRUCTVOLUME",title: "体积/建筑体积(m3)",width: "8%",halign: "center",align: "left"},
// 	           {field: "UNITCOSTLENGTH",title: "单位造价-长度（万元/m）",width: "8%",halign: "center",align: "left"},
// 	           {field: "UNITCOSTSPACE",title: "单位造价-面积(万元/m2)",width: "8%",halign: "center",align: "left"},
// 	           {field: "UNITCOSTVOLUME",title: "单位造价-体积(万元/m3)",width: "8%",halign: "center",align: "left"},
// 	           {field: "valuationFile",title: "计价文件",width: "8%",halign: "center",align: "left"},
// 	           {field: "REMARK",title: "备注",width: "8%",halign: "center",align: "left"},
//
// 	           ]],
// 		 queryParams: {  parentId:parentId },
// 		 onLoadSuccess:function(data){
// 			 var pId = "0";
// 			 if(data.total>0){
// 				pId=data.rows[0].ID;
// 			 }
// 			 entityInfo(pId);
// 		 },
// 		 onClickRow:function(index,row){
// 			 entityInfo(row.ID);
// 		 }
// 	});
// }
// function entityInfo(id){
// 	//实物量信息
// 	$("#entityInfo").datagrid({
// 		title : '实物量信息',
// 		url: basePath+"/costTarget/entityInfo",
// 		width: '90%',
// 		height:'180',
// 		idField : "ID",
// 		loadMsg : '数据加载中,请稍候...',
// 		border:true,
// 		striped:true,
// 		singleSelect:true,
// 		checkOnSelect:true,
// 		selectOnCheck:true,
// 		nowarp : true,
// 		columns: [[
// 	           {field: "PRJMATERIALNAME",title: "名称",width: "30%",halign: "center",align: "left"},
// 	           {field: "QTY",title: "数量",width: "25%",halign: "center",align: "left"},
// 	           {field: "UNITID",title: "单位",width: "25%",halign: "center",align: "left",
// 	        	   formatter:function(value,row,index){
// 			        	if(value){
// 			        		return unitArr[value];
// 			        	}
// 	        	   }
// 	           },
// 	           {field: "REMARK",title: "备注",width: "25%",halign: "center",align: "left"},
// 	           ]],
// 	           queryParams: {  id:id,
// 							   major:$('#major').combobox('getValue'),
// 							   costTypeId:$('#cost').combobox('getValue')
// 		}
// 	});
// }
function entityInfo(id) {
    $('#entityInfo').datagrid({
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


function  getTableData(data){
	//获取子项属性表格数据
	var rows = data.datagrid('getRows');
	var objarr=new Array();
	for(var i=0;i<rows.length;i++){
		if(rows[i].TYPE=="number"){
			var obj=new Object();
			obj.isStrFlag="false";
			obj.attrId=rows[i].ATTRID;
			var minValue=$("#"+rows[i].ID).find('input:first').val();
			var maxValue=$("#"+rows[i].ID).find('input:first').val();
			obj.minValue=minValue==""?0:minValue;
			obj.maxValue=maxValue==""?0:maxValue;
			objarr.push(obj);
		}else{
			var obj=new Object();
			obj.isStrFlag="true";
			obj.attrId=rows[i].ATTRID;
			obj.value=$("#"+rows[i].ID).find('input').val();
			objarr.push(obj);
		}
	}
	return objarr;
}
//选择子项
function findSubkeyData(data){
	var options = {
			title:"子项查找",
			width: 1000,    
		    height: 500,    
		    closed: false,    
		    cache: false,
		    url:basePath+"/costTargetMng/buildDiglog",
			buttons: [
						{
							text:'关闭',
							iconCls:'icon-remove',
							handler:function(){
								dlg.dialog("close");
							}
						},
						{
							text:'确定',
							iconCls:'icon-ok',
							handler:function(){
								addMaterial(data);
							}
						}],
				top:50,
	};
	dlg = modalDialog(options);
	
}	
function addMaterial(data){
	var selectNode = dlg.find("iframe").get(0).contentWindow.queryCheckedPbsNodes();
		if(selectNode==null||selectNode==undefined||selectNode.children!=undefined){
			$.messager.alert('提示',"请先选择具体子节点！");
		}else{
			if(data==1){
				//$("#subLevelToolbar").style.height='148px';	
				$('#subkey').textbox("setValue",selectNode.MATERIALNAME);
				prjmmid=selectNode.PRJMMID;
				versionId=selectNode.VERSIONID;
				selectSubkeyNature(1);
				dlg.dialog("close");
				$("#subKey-attrTbl").css('display','block');				
				initDataPanSubkey();
			}else if(data==2){
				//$("#unitLevelToolbar").style.height='200px';
				$('#Unit').textbox("setValue",selectNode.MATERIALNAME);
				prjmmid=selectNode.PRJMMID;
				versionId=selectNode.VERSIONID;
				selectSubkeyNature(2);
				dlg.dialog("close");
				$("#unit-attrTbl").css('display','block');
				initDataPanUnit();
			}
		}
}
//查询并显示子项属性
function selectSubkeyNature(data){
	
	var $table;
	if(data==1){
		$table=$('#subkeyTable');
	}else if(data==2){
		$table=$('#unitTable');
	}
	$table.datagrid({    
	    url: basePath+"/structure/getPbsItemInfo", 
	    rownumbers:true,
	    columns:[[    
	        {field:'ATTRNAME',title:'属性',width:"30%",align:'center'},    
	        {field:'dataRange',title:'属性取值范围',width:"55%",align:'left',
				formatter: function(value,row,index){
					if (row.TYPE=="number"){
						return '<div id="'+row.id+'"><input type="text" size="10"></div>';
					} else{
						return '<div id="'+row.id+'"><input type="text" size="10">~<input type="text" size="10"></div>';
					}
				}
	        },    
	        {field:'ATTRUNITID',title:'单位',width:"16%",align:'center',
	        	formatter:function(value,row,index){
		        	if(value){
		        		return unitArr[value];
		        	}
	        }}    
	    ]],
	    striped:true,
	    width: '99%',
		height:'118',
	    nowrap:true,
	    queryParams:{
	    	prjmmid:prjmmid,
			pbsversionId:versionId,
			type:'PA'
	    },
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
//项目级查找
function findData(){
		initDataPan();
}
//区域级查找
function findAreaData(){
	initDataPanArea();
}	
//子项级查找
function searchSubkeyData(){
	initDataPanSubkey();
}
//单位工程级指标查找
function findUnitData(){
	initDataPanUnit();
}