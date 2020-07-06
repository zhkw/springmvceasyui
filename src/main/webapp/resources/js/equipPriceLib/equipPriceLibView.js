//项目路径
var basePath=$("#basePath").val();
//已选择的类型节点
var selectNode=new Object();
//专业
var majorArr = new Array();
var majorList = new Array();
//产品类型
var productArr = new Array();
var productList= new Array();;
$(function(){	
	
	if(null !=$("#param").val() && $("#param").val()=='find'){
		$('.priceSrc').combobox({ 
		    multiple:true,
		    valueField: 'id',    
	        textField: 'text',
	        panelHeight: '150',
	        data: [
					{id: '1',text: '订货价'},
					{id: '2',text: '恩菲报价'},
					{id: '3',text: '供应商报价'},
					{id: '4',text: '概算价'},
					{id: '5',text: '外部渠道'}
	               ]
		});
	}
	//初始化专业信息
	Utils.ajaxJsonSync(basePath+"/manHour/getMajorInfo",{},function(obj){
		//默认查询全部数据
		for (var i = 0; i < obj.length; i++) {
			var major = new Object();
 			majorArr[obj[i].ID] = obj[i].MAJORNAME;
 			major.id = obj[i].ID;
 			major.text = obj[i].MAJORNAME;
 			majorList.push(major);
		}		
	});	
	//专业信息列表
	$('#major').combobox({ 
	    multiple:true,
	    valueField: 'id',    
        textField: 'text',
        panelHeight: '300',
        data: majorList
	});
	
	//产品类型
	Utils.ajaxJsonSync(basePath+"/project/getPrjBaseData",{},function(obj){
		var productType = obj.productType;
		for(var i in productType){
			productList[productType[i].ID]=productType[i].NAME;
			var obj = new Object();
			obj.id  = productType[i].ID;			
			obj.text = productType[i].NAME;
			productArr.push(obj);
		}		 
	},"");
	$('#productType').combobox({ 
	    multiple:true,
	    valueField: 'id',    
        textField: 'text',
        panelHeight: '300',
        data: productArr
	});
	
	//物料类别树加载
	querycategory();
	//初始化表格数据
	initData();
	//获得当天0点时间
	var datetime = function(){
		var myDate = new Date();
		var year=myDate.getFullYear();
		var month= myDate.getMonth()+1;
		month =(month<10 ? "0"+month:month); 
		var day=myDate.getDate(); 
		var hour = myDate.getHours();
		var scd = myDate.getSeconds();
		var mm = myDate.getMinutes();
		var mydate = year+"-"+month+"-"+day+" "+hour+":"+mm+":"+ scd;
		return mydate;
	} ;
	//点击“新增”按钮事件
	$("#add").click(function(){
		var data = new Object();
		data.materialTypeId="";
		data["eplList[0].id"] = "";//记录Id
		data["eplList[0].priceSrc"] = 5;//价格来源：外部渠道
		data["eplList[0].exchangeRate"] = 1;//汇率
		data["eplList[0].taxRate"] =17;//税率		
		data["eplList[0].priceTime"] = datetime();//价格日期
		$.ajax({
			url : basePath + "/equipPriceLib/saveEquipPriceLib",
			method : "post",
			data : data,
			success : function(obj) {
				if(obj.status){
					window.location.href=basePath+"/equipPriceLib/editEquipPriceLib?editId="+obj.newEquipId+"&params=add";
				}else{
					$.messager.alert("错误", "操作失败");
				}
			},
			error : function(xhr) {
				$.messager.alert("错误", "操作失败");
			}
		});
		
	});
	
	//点击“修改”按钮事件
	$("#edit").click(function(){
		var rows = $("#datagrid").datagrid("getChecked");
		if(rows.length == 0){
			$.messager.alert("提示","请先选择要修改的数据");
			return;
		}else if(rows.length > 1){
			$.messager.alert("提示","只能选择一行需要修改的数据");
			return;
		}
		window.location.href = basePath+"/equipPriceLib/editEquipPriceLib?editId="+rows[0].ID+"&params=edit";
	});
	
	//点击“删除”按钮事件
	$("#del").click(function(){
		var rows = $("#datagrid").datagrid("getChecked");
		if(rows.length == 0){
			$.messager.alert("提示","请先选择要删除的数据");
			return;
		}
		var ids = "";
		for (var i = 0; i < rows.length; i++) {		
			if(i<rows.length-1){
				ids+= rows[i].ID +",";
			}else{
				ids+= rows[i].ID;
			}
			
		}
		$.messager.confirm('确认对话框', '确认删除数据吗？', function(r){
			if(r){				
				$.messager.progress({interval:100,text:'正在处理中'});				
				Utils.ajaxJson(basePath+"/equipPriceLib/deleteEquipPriceLib",
					{eplId:ids,epSrc:""},
					function(obj){
					$.messager.progress('close');
					if(obj.status == true){
						$("#datagrid").datagrid('reload');
						$("#datagrid").datagrid("uncheckAll");
						$.messager.show({title:'提示',msg:'操作成功',timeout:3000,showType:'slide'});
					}else{
						$.messager.alert("提示","操作失败");
					}
				});
			}
		});
	});
});


//设备价格库查询
function doSearch(value){
	$("#datagrid").datagrid("load");
}

//物料类别检索
function querycategory(){
	var treeData = $("#categoryTree");
	treeData = $.fn.zTree.init(treeData,categoryTreeSetting, null);
}
var categoryTreeSetting = {
	async: {
		enable: true,
		dataType:"json" ,
		url:basePath+'/structure/getMaterialcategory',
		otherParam: ["page",1,'pageSize',30,'key',function(){
			return $('#category-key').searchbox('getValue');
		}],
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
//加载更多
function categoryMore(){
	    var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
		var nodes = treeObj.getNodes();
		var page =(nodes.length+30)/30;
		var url=treeObj.setting.async.url;
		$.ajax({
			url:url,
			type:'POST',
			data:{page:page,pageSize:30},
			success:function(data){
			 treeObj.addNodes(null,data);	
			}	
		});
    }
//类别树点击检索物料
function zTreeOnClick(event,treeId,treeNode){
	var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
	if(treeNode.ID==selectNode.ID){
		treeObj.cancelSelectedNode(treeNode);
	}else{
		selectNode=treeNode;
	}
	doSearch();
};

//设备价格库
function initData(){
	$("#datagrid").datagrid({
		url: basePath+"/equipPriceLib/queryEquipPriceLibDetail",
		width: '99%',
		height:'550',
		idField : "ID",
		loadMsg : '数据加载中,请稍候...',   
        border:true,
        pagination : true,
        checkOnSelect:true,
        selectOnCheck:true,
        nowarp : true,
		rownumbers:true,		
		frozenColumns : [[
				{
					field: "ck",
					checkbox:true
				}    
		         ]],
        columns: [[
        {field: "CONTRACTNO",title: "合同编号",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		if(value){
        			return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.CSID+"','"+row.CSCODE+"',1)" +
    				" title='查看合同' ><span>"+value+"</span></a>";
    		     }
        		return "";
        	}
        		
        },
        {field: "CONTRACTNAME",title: "合同名称",width: "10%",halign: "center",align: "left"},
        {field: "PROJCODE",title: "项目编号",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		if(value){
        			return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.PROJECTID+"','"+row.PROJCODE+"',2)" +
    				" title='查看项目' ><span>"+value+"</span></a>";
        		}
        		return "";
        	}
        },
        {field: "PROJNAME",title: "项目名称",width: "10%",halign: "center",align: "left"},
        {field: "PRODUCTID",title: "产品类型",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		value+="";
				var productIds=value.split(",");
				var product="";
				for(var i in productIds){
				 if(productList[productIds[i]]!=null&&productList[productIds[i]]!=undefined){
					if(i==0){
						product+=productList[productIds[i]];
					}else{
						product+=","+productList[productIds[i]];
					}
				  }
				}	
				return product;
        	}
        },
        {field: "PRICESRC",title: "价格来源",width: "8%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		if(value==1){
        			return "订货价";
        		}else if(value==2){
        			return '恩菲报价';
        		}else if(value==3){
        			return '供应商报价';
        		}else if(value==4){
        			return '概算价';
        		}else if(value==5){
        			return '外部渠道';
        		}else{
        			return "";
        		}
        	}
        },
        {field: "PBSNAME",title: "子项名称",width: "10%",halign: "center",align: "left"},
        {field: "MAJORID",title: "专业",width: "10%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		return majorArr[value];
        	}
        },
        {field: "BMCCODE",title: "物料类别编码",width: "8%",halign: "center",align: "left"},
        {field: "BMCNAME",title: "物料类别名称",width: "10%",halign: "center",align: "left"},
        {field: "BMMCODE",title: "物料编码",width: "6%",halign: "center",align: "left"},
        {field: "PRJMATERIALNAME",title: "物料名称",width: "9%",halign: "center",align: "left"},
        {field: "MMDESCRIPTION",title: "规格型号",width: "6%",halign: "center",align: "left"},
        // {field: "QUALITY",title: "材质",width: "6%",halign: "center",align: "left"},
        {field: "UNITWEIGHT",title: "单重(吨)",width: "6%",halign: "center",align: "left"},
        {field: "SUMWEIGHT",title: "总重(吨)",width: "6%",halign: "center",align: "left"},
        {field: "UNITNAME",title: "单位",width: "6%",halign: "center",align: "left"},
        {field: "QUANTITY",title: "数量",width: "6%",halign: "center",align: "left"},
        {field: "ELECMACH",title: "电机(kw/台)",width: "6%",halign: "center",align: "left"},
        {field: "ELECMACHNUM",title: "电机总数",width: "6%",halign: "center",align: "left"},
        {field: "ISIMPORT",title: "国产/进口设备",	width: "6%",halign: "center"},
        {field: "CURRNAME",title: "币种",width: "6%",halign: "center",align: "left"},
        {field: "EXCHANGERATE",title: "汇率",width: "6%",halign: "center",align: "left"},
        {field: "UNITPRICE",title: "含税单价",width: "6%",halign: "center",align: "left"},
        {field: "TAXRATE",title: "税率",width: "6%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		if(value && value>0){        			
        			return value+"%";
        		}else{
        			return "";
        		}
        	}
        },
        {field: "SUMPRICE",title: "含税总价",width: "6%",halign: "center",align: "left"},
        {field: "SUMNOTPRICE",title: "不含税总价",width: "6%",halign: "center",align: "left"},
        {field: "SUPPCODE",title: "供应商编号",width: "6%",halign: "center",align: "left"},
        {field: "SUPPNAME",title: "供应商名称",width: "10%",halign: "center",align: "left",
        	formatter: function(value,row,index){
        		if(value){
        			return "<a style='color:blue;cursor:pointer;' onclick=findDetail('"+row.SUPPLIERID+"','"+row.SUPPCODE+"',3) " +
    				"title='查看供应商' ><span>"+value+"</span></a>";
        		}
        		return "";
        	}
        },
        {field: "PRICETIME",title: "价格日期",width: "6%",halign: "center",align: "left"},
        {field: "ISFABCOST",title: "是否含安装费",width: "6%",halign: "center"},
        {field: "STAGENAME",title: "阶段",width: "6%"},
        {field: "DEMO",title: "备注",halign: "center",align: "left"}
        ]],
        onDblClickRow:function(index,row){
        	window.location.href = basePath+"/equipPriceLib/editEquipPriceLib?editId="+row.ID+"&params=edit";
        },
		queryParams: {               
			materialTypeId:function(){//物料类型ID
				var categoryId="";
				var treeObj = $.fn.zTree.getZTreeObj("categoryTree");
				if(treeObj!=null){
					var nodes = treeObj.getSelectedNodes();
					if(nodes.length>0){
						categoryId=nodes[0].ID;
					}
				}
				return categoryId;
			},
			materialKey:function(){//物料名称/编码/规格型号
				return $('#materialName').textbox('getValue');
			},
			ProjKey:function(){//项目名称/编码	
				return $('#projName').textbox('getValue');
			},
			priceSrc:function(){//价格来源
				var priceSrc = $('.priceSrc').combobox('getValues');
				if(undefined!= priceSrc && "" !=priceSrc){
					return priceSrc;
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
			contractKey:function(){//合同名称/编号
				return $('#contractName').textbox('getValue');
			},
			supplierKey:function(){//供应商名称/编号
				return $('#supplierName').textbox('getValue');
			},
			subItemName:function(){//子项名称
				return $('#subItemName').textbox('getValue');
			},
			majorNameKey:function(){//专业
				var major = $('#major').combobox('getValues');
				if(undefined!= major && "" !=major){
					return major;
				}else{
					return '';
				}
			},
			startTime:function(){//价格日期起
				return $('#startTime').datetimebox('getValue');
			},
			endTime:function(){//价格日期止
				return $('#endTime').datetimebox('getValue');
			}
		}
	});
}
function findData(){
	$("#datagrid").datagrid("load");
}
function findDetail(id,code,type){
	if(type==1){//合同信息
		$('#contractInfo-dlg').dialog('open').dialog('center').dialog('setTitle','合同信息明细');
	}else if(type ==2){//项目信息
		$('#projInfo-dlg').dialog('open').dialog('center').dialog('setTitle','工程信息明细');
	}else if(type ==3){//供应商信息
		$('#supplierInfo-dlg').dialog('open').dialog('center').dialog('setTitle','供应商信息明细');
	}
}