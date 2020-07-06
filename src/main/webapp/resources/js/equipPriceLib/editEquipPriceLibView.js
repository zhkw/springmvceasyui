//项目路径
var basePath=$("#basePath").val();
//项目产品类型
var productList;
var productArr = new Array();
//专业
var majorList;
var majorArr = new Array();
//单位
var unitList;
var unitArr = new Array();
//阶段
var stageList;
var stageArr = new Array();
//币种
var currencyList;
var currencyArr = new Array();
var selectNode=new Object();
var editIndex;
var paramEditIndex;
//类别树
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
//pbs节点树
var pbsTreeSetting = {
	async: {
		enable: true,
		dataType:"json" ,
		url:basePath+"/structure/getPbsTree",
		otherParam: ['projectId',1,'level',1,'pbsversionId',function(){
			var selectRow=$('#pbstemplateList').datagrid("getSelected");
			if(selectRow!=null){
				return selectRow.VERSIONID;//pbs版本Id
			}else{
				return "";
			}	
		}],
		autoParam: ["id"]
	},
	/*check: {//复选框
		enable: true,
		autoCheckTrigger: true,
		chkboxType: { "Y": "s", "N": "s" }
	},*/
	view: {
		dblClickExpand: false,
		showLine: true
	},
	data: {
		simpleData: {
			enable:true,
			idKey: "ID",
			pIdKey: "PARENTID",
			rootPId: ""
		},
		key:{
			name : "PRJMATERIALNAME",
		}
	},
	callback: {
		beforeAsync:function(){
			$.messager.progress({text:'数据加载中......',interval:'100'}); 
		},
		onAsyncSuccess: function(){
		 var treeObj = $.fn.zTree.getZTreeObj("enfi-pbs-Tree");
		 var nodes = treeObj.getNodes();   
		 if(nodes.length>0){
		   treeObj.expandNode(nodes[0], true);
		 }else{
			$("#enfi-pbs-Tree").html("该模板未编辑PBS结构");
		}
		 $.messager.progress('close');
		}
	}
};
$(function(){	
	//初始化手动新增价格库的基础信息：产品类型、专业、单位、币种、阶段等信息
	Utils.ajaxJsonSync(basePath+"/equipPriceLib/getEquipPriceBaseData",{},function(obj){
		//产品类型
		productList = obj.productType;
		for(var i in productList){
			productArr[productList[i].ID] = productList[i].NAME;
		}		
		//专业
		majorList = obj.major;
		for(var i in majorList){
			var major = new Object();
 			major.id = majorList[i].ID;
 			major.text = majorList[i].MAJORNAME;
 			majorArr.push(major);
		}
		//单位
		unitList = obj.unit;
		for(var i in unitList){
			var unit = new Object();
			unit.id = unitList[i].ID;
			unit.text = unitList[i].UNITNAME;
			unitArr.push(unit);
		}
		//币种
		currencyList = obj.currency;
		for(var i in currencyList){
			var currency = new Object();
			currency.id = currencyList[i].ID;
			currency.text = currencyList[i].NAME;
			if(currencyList[i].NAME=='人民币'){//默认值
				currency.selected=true;
			}
			currencyArr.push(currency);
		}
		//阶段
		stageList = obj.stage;
		for ( var i in stageList) {
			var stage = new Object();
			stage.id = stageList[i].ID;
			stage.text = stageList[i].NAME;
			stageArr.push(stage);
		}
	},"");
	//专业信息列表
	$('#major_E').combobox({   
	    editable:true,
	    //multiple:true,
	    valueField: 'id',
		textField: 'text',
        panelHeight: '300',
        data: majorArr
	});
	//单位
	$("#unit_E").combobox({   
	    editable:true,
	    valueField: 'id',
		textField: 'text',
        panelHeight: '300',
        data: unitArr
	});
	//币种
	$("#currency_E").combobox({   
	    editable:true,
	    valueField: 'id',
		textField: 'text',
        panelHeight: '180',
        data: currencyArr
	});
	//阶段
	$("#stage_E").combobox({   
	    editable:true,
	    valueField: 'id',
		textField: 'text',
        panelHeight: '180',
        data: stageArr
	});		
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
	$('#bzmaterName_E').validatebox({required: true});
    $('#materName_E').validatebox({required: true});
	if($('#flags').val()=="add"){//新增
		//设置日期初始值
		$('#priceDate_E').datetimebox('setValue',datetime());
		$('#exchangeRate_E').numberbox('setValue','1');
		$('#rate_E').numberbox('setValue','17');
		initMaterialAttr("",0);
	}else{//修改
		value=""+$("#procType_E").val();
		var productIds=value.split(",");
		var product="";
		for(var i in productIds){
		 if(productArr[productIds[i]]!=null&&productArr[productIds[i]]!=undefined){
			if(i==0){
				product+=productArr[productIds[i]];
			}else{
				product+=","+productArr[productIds[i]];
			}
		  }
		}
		if($("#isHand").val()==1){//手动输入允许修改名称
			$("[name=isHand]:checkbox").prop("checked", true);
			$("#supplierName_E").removeAttr("readonly");
		}
		$("#procType_E").val(product);
		initMaterialAttr($("#mmId_E").val(),1);
	}
	
	$('#materName_E').blur(function(){
		if($('#materName_E').val()==""){
			$('#materName_E').validatebox({required: true});
		}
	});
	
	//自动计算“总重=数量*单重”
	$("#number_E").next("span").children().first().blur(function(){
		if($("#number_E").numberbox("getValue")!=""){
			if($("#unitWeight_E").numberbox("getValue")!=""){
				$("#sumWeight_E").numberbox("setValue",$("#number_E").numberbox("getValue")*$("#unitWeight_E").numberbox("getValue"));
			}
			if($("#unitPrice_E").numberbox("getValue")!=""){
				$("#sumPrice_E").numberbox("setValue",$("#number_E").numberbox("getValue")*$("#unitPrice_E").numberbox("getValue"));
				if($("#rate_E").numberbox("getValue")!=""){
					var rate = $("#rate_E").numberbox("getValue");
					rate = rate.replace(/%/g, "");
					var reteNum = +rate/100;
					$("#notRate_E").numberbox("setValue",$("#unitPrice_E").numberbox("getValue")*$("#number_E").numberbox("getValue")/(1+reteNum));
				}
			}
			
		}
	});
	//“单重”文本框失去焦点事件
	$("#unitWeight_E").next("span").children().first().blur(function(){
		if($("#unitWeight_E").numberbox("getValue")!="" && $("#number_E").numberbox("getValue")!=""){
			$("#sumWeight_E").numberbox("setValue",$("#unitWeight_E").numberbox("getValue")*$("#number_E").numberbox("getValue"));
		}
	});
	//“含税单价”文本框失去焦点事件。自动计算“含税总价=数量*含税单价”
	$("#unitPrice_E").next("span").children().first().blur(function(){
		if($("#unitPrice_E").numberbox("getValue")!="" && $("#number_E").numberbox("getValue")!=""){
			$("#sumPrice_E").numberbox("setValue",$("#unitPrice_E").numberbox("getValue")*$("#number_E").numberbox("getValue"));
			if($("#rate_E").numberbox("getValue")!=""){
				var rate = $("#rate_E").numberbox("getValue");
				rate = rate.replace(/%/g, "");
				var reteNum = +rate/100;
				$("#notRate_E").numberbox("setValue",$("#unitPrice_E").numberbox("getValue")*$("#number_E").numberbox("getValue")/(1+reteNum));
			}
		}
	});
	//“税率”文本框失去焦点事件。自动计算“不含税总价=数量*含税单价/（1+税率）”
	$("#rate_E").next("span").children().first().blur(function(){
		if($("#rate_E").numberbox("getValue")!="" && $("#number_E").numberbox("getValue")!="" && $("#unitPrice_E").numberbox("getValue")!=""){
			var rate = $("#rate_E").numberbox("getValue");
			rate = rate.replace(/%/g, "");
			var reteNum = +rate/100;
			$("#notRate_E").numberbox("setValue",$("#unitPrice_E").numberbox("getValue")*$("#number_E").numberbox("getValue")/(1+reteNum));
		}
	});
	//点击“保存”按钮事件
	$("#save").click(function(){
		var flag = formValidate();
		if(flag){
			var data = new Object();
			data.materialTypeId="";
			data["eplList[0].id"] = $("#editId").val();//记录Id
			data["eplList[0].projectId"] = $("#projId_E").val();//项目ID
			data["eplList[0].priceSrc"] = 5;//价格来源：外部渠道
			data["eplList[0].pbsNodeId"] = $("#pbsId_E").val();//子项名称
			data["eplList[0].majorId"] = $("#major_E").combobox("getValue");//专业
			data["eplList[0].mmId"] = $("#mmId_E").val();//标准物料id
			data["eplList[0].prjMmId"] = $("#prjMMId").val();//项目物料名称Id
			data["eplList[0].prjMmName"] = $("#materName_E").val();//项目物料名称
			//data["eplList[0].description"] = $("#descript_E").val();//扩展描述
			data["eplList[0].unitId"] = $("#unit_E").combobox("getValue");//单位ID
			data["eplList[0].quantity"] = $("#number_E").val();//数量
			data["eplList[0].unitWeight"] = $("#unitWeight_E").val();//单重
			data["eplList[0].sumWeight"] = $("#sumWeight_E").val();//总重
			data["eplList[0].elecMach"] = $("#power_E").val();//电机
			data["eplList[0].elecMachNum"] = $("#sumPower_E").val();//电机台数
			data["eplList[0].currencyId"] = $("#currency_E").combobox("getValue");//币种
			data["eplList[0].exchangeRate"] = $("#exchangeRate_E").val();//汇率
			data["eplList[0].unitPrice"] = $("#unitPrice_E").val();//含税单价
			data["eplList[0].taxRate"] =$("#rate_E").val();//税率
			data["eplList[0].sumPrice"] = $("#sumPrice_E").val();//含税总价
			data["eplList[0].sumNotPrice"] = $("#notRate_E").val();//不含税总价
			data["eplList[0].isFabCost"] = $("#isInstall_E").combobox("getValue");//是否含安装费
			data["eplList[0].isImport"] = $("#isImport_E").combobox("getValue");//国产/进口设备
			data["eplList[0].priceTime"] = $("#priceDate_E").datetimebox("getValue");//价格日期
			data["eplList[0].supplierId"] = $("#supplierId_E").val();//供应商
			data["eplList[0].supplierName"] = $("#supplierName_E").val();//供应商
			data["eplList[0].demo"] = $("#demo_E").val();//备注			
			data["eplList[0].stageId"] = $("#stage_E").combobox("getValue");//阶段			
			data["eplList[0].isHand"] =$("#isHand").val();
			$.messager.progress({interval:100,text:'正在处理中'});
			$.ajax({
				url : basePath + "/equipPriceLib/saveEquipPriceLib",
				method : "post",
				data : data,
				success : function(obj) {
					$.messager.progress('close');
					if(obj.status == true){
						$.messager.show({title : '提示',msg : '保存成功！',timeout : 3000,showType : 'slide'});					
					}else{
						$.messager.alert("错误", "操作失败");
					}
				},
				error : function(xhr) {
					$.messager.alert("错误", "操作失败");
				}
			});
					
		}
	});
	//点击“继续新增”按钮事件
	$("#add").click(function(){		
		var data = new Object();
		$("#editId").val("");
		data.materialTypeId="";
		//data["eplList[0].id"] = $("#editId").val();//记录Id
		data["eplList[0].priceSrc"] = 5;//价格来源：外部渠道
		data["eplList[0].exchangeRate"] = "1";//汇率
		data["eplList[0].taxRate"] ="17";//税率
		data["eplList[0].isFabCost"] = "0";//是否含安装费
		data["eplList[0].isImport"] = "0";//国产/进口设备
		data["eplList[0].priceTime"] = datetime();//价格日期
		$.ajax({
			url : basePath + "/equipPriceLib/saveEquipPriceLib",
			method : "post",
			data : data,
			success : function(obj) {
				if(obj.status == true){	
					//表单重置
					$("#equipPriceForm").form('clear');
					initMaterialAttr("",0);
					$('#bzmaterName_E').validatebox({required: true});
				    $('#materName_E').validatebox({required: true});	    
					$("#editId").val(obj.newEquipId);//记录Id
					$("#price_E").combobox("setValue","5");//价格来源		
					$('#priceDate_E').datetimebox('setValue',datetime());//设置日期初始值
					$("#currency_E").combobox("setValue","CNY");//币种
					$("#isInstall_E").combobox("setValue","0");//是否含安装费
					$("#isImport_E").combobox("setValue","1");//国产/进口设备
					$('#exchangeRate_E').numberbox('setValue','1');
					$('#rate_E').numberbox('setValue','17');
				}else{
					$.messager.alert("错误", "操作失败");
				}
			},
			error : function(xhr) {
				$.messager.alert("错误", "操作失败");
			}
		});
	});
	//点击“返回”按钮事件
	$("#ret").click(function(){
		window.location.href=basePath+"/equipPriceLib/equipPriceLibView?param=mng";
	});
});

//点击“查询工程项目信息”按钮
function queryProjInfo(){
	$('#projInfo-dlg').dialog('open').dialog('center').dialog('setTitle','项目信息搜索');
	searchProjInfo();
}
function searchProjInfo(){	
	$('#projList-dg').datagrid({    
	    url:basePath+"/equipPriceLib/queryProjectInfo",
		idField:'ID',
		loadMsg:'数据加载中...',
		singleSelect:true,
		queryParams:{key:$("#projInfo-key").searchbox("getValue")},
	    columns:[[    
	        {field:'ck',title:'',width:'5%',checkbox:true},
	        {field:'PROJCODE',title:'项目编码',width:'18%'},    
	        {field:'PROJNAME',title:'项目名称',width:'22%'},    
	        {field:'PRODUCTID',title:'产品类型',width:'36%',
	        	formatter:function(value,row,index){
					value+="";
					var pdIds=value.split(",");
					var pdName="";
					for(var i in pdIds){
					 if(productArr[pdIds[i]]!=null&&productArr[pdIds[i]]!=undefined){
						if(i==0){
							pdName+=productArr[pdIds[i]];
						}else{
							pdName+=","+productArr[pdIds[i]];
						}
					  }
					}	
					return pdName;
			    }
	        }
	    ]],
		onLoadSuccess:function(data){			
			var projId = $("#projId_E").val();
			if(null!=projId && ""!=projId){
				var rowIndex = $('#projList-dg').datagrid('getRowIndex',projId);
				$('#projList-dg').datagrid('checkRow',rowIndex);
			}else{
				$('#projList-dg').datagrid('clearChecked');//取消勾选的所有行
			}
		}
	});
}
function saveProjInfo(){
	var row = $('#projList-dg').datagrid('getSelected');
	if(row){
		$("#projId_E").val(row.ID);
		$("#projName_E").val(row.PROJNAME);
		$("#projCode_E").val(row.PROJCODE);
		if(row.PRODUCTID){
			var pdIds=(row.PRODUCTID).split(",");
			var pdName="";
			for(var i in pdIds){
			 if(productArr[pdIds[i]]!=null&&productArr[pdIds[i]]!=undefined){
				if(i==0){
					pdName+=productArr[pdIds[i]];
				}else{
					pdName+=","+productArr[pdIds[i]];
				}
			  }
			}
			$("#procType_E").val(pdName);
		}
		//关闭弹出层
		$('#projInfo-dlg').dialog('close');
	}else{
		$.messager.alert('提示','请选择项目信息！','info');
	}
}

//点击“查询子项信息”按钮
function querySubItemInfo(){
   $('#subItemInfo-dlg').dialog('open').dialog('center').dialog('setTitle','子项信息搜索');
   initPbstemplateKey();
   initPbstemplateList();   
}
//初始化PBS模板输入框
function initPbstemplateKey(){
	$('#pbstemplate-key').searchbox({
		searcher:doSearchPbsTemplate,
		prompt:'模板名称/模板编码',
	});
}
//初始化模板信息
function initPbstemplateList(){
	$('#pbstemplateList').datagrid({
    url:basePath+'/templateMng/getTemplateList',
	singleSelect:true,
	idField: 'ID',
	queryParams:{
		key:function(){
			return $('#pbstemplate-key').searchbox('getValue');
		}
	},
    columns:[[
        {field:'CODE',title:'模板编号',width:'35%',},
        {field:'NAME',title:'模板名称',width:'35%',},
		{field:'REMARK',title:'备注',width:'30%',editor:'text'}
    ]],
	onLoadSuccess:function(data){
		$('#pbstemplateList').datagrid('selectRow',0);
	},
	onSelect:function(){
		queryPbsNodeData();
	 },
	});
}
//模板检索
function doSearchPbsTemplate(){
	$("#pbstemplateList").datagrid("reload");	
}
//pbs树数据检索
function queryPbsNodeData(){
	var treeData = $("#enfi-pbs-Tree");
	treeData = $.fn.zTree.init(treeData,pbsTreeSetting, null);
}
//获取选中的PBS节点
function queryCheckedPbsNodes(){
	var checkNodes=new Object();
	var fullNodes=new Array();
	var partNodes=new Array();
	var treeObj = $.fn.zTree.getZTreeObj("enfi-pbs-Tree");
    var checkFull = $(".ztree.pbsTree .checkbox_true_full");
	var checkPart = $(".ztree.pbsTree .checkbox_true_part");	
	for(var i=0;i<checkFull.length;i++){
		var checkId=$(checkFull[i]).closest('li').attr('id');
		var node = treeObj.getNodeByTId(checkId);
		fullNodes.push(node);
	}
	for(var i=0;i<checkPart.length;i++){
		var checkId=$(checkPart[i]).closest('li').attr('id');
		var node = treeObj.getNodeByTId(checkId);
		partNodes.push(node);
	}
	if(fullNodes.length==0&&partNodes.length==0){
		checkNodes["exist"]=false;
	}else{
		checkNodes["exist"]=true;
		checkNodes["checkFull"]=fullNodes;
		checkNodes["checkPart"]=partNodes;
	}
	return checkNodes;
}
function saveSubItemInfo(){
	var row = $('#pbstemplateList').datagrid('getSelected');
	if(row){
		var treeObj = $.fn.zTree.getZTreeObj("enfi-pbs-Tree");
		var treeNode = treeObj.getSelectedNodes();
		if(treeNode.length>0){	
			/*
			//是否为父节点
			var isParent = treeNode[0].isParent;
			if(isParent){
				$.messager.alert('提示','请选择叶子节点信息！','info');
				return;
			}*/
			//pbs节点Id var pbsId = treeNode[0].ID;
			//项目物料ID
			var prjMmId = treeNode[0].PRJMMID;
			//项目物料名称
			var prjMmName = treeNode[0].PRJMATERIALNAME;
			$("#pbsId_E").val(prjMmId);
			$("#pbsName_E").val(prjMmName);
			$('#subItemInfo-dlg').dialog('close');
		}else{
			$.messager.alert('提示','请选择子项信息！','info');
		}
	}else{
		$.messager.alert('提示','请选择模版下的子项信息！','info');
	}
}

//点击“查询标准物料”按钮
function queryStandItemInfo(){
$('#standItemInfo-dlg').dialog('open').dialog('center').dialog('setTitle','标准物料信息搜索');	
  initCategory();
  initDiglog();
}
//初始化类别输入框
function initCategory(){
	$('#category-key').searchbox({
		searcher:querycategory,
		prompt:'物料类别名称/物料编码',
	});
}
//初始化物料信息
function initDiglog(){
	$("#materialList").datagrid({
	url:basePath+'/structure/getMaterialInfoList',
	pagination:true ,
	singleSelect:true,
	columns:[[
				{field:'ck',checkbox:true },
				{field:'MATERIALCODE',title:'物料编码',width:'20%'},
				{field:'MATERIALNAME',title:'物料名称',width:'20%'},
				{field:'MMCATEGORY',title:'物料类别',width:'20%'},
				{field:'MMDESCRIPTION',title:'参数',width:'20%'},
				{field:'UNITNAME',title:'主单位',width:'10%'},
				{field:'REMARK',title:'备注'}
			]],
	queryParams: {
				key:function(){
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
	}});
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
function saveStandItemInfo(){
	var row = $('#materialList').datagrid('getSelected');
	if(row){ 	    
		$("#mmId_E").val(row.ID);//基础物料Id
		$("#bzmaterName_E").val(row.MATERIALCODE+"_"+row.MATERIALNAME);//标准物料编码_名称
		$("#materTypeName_E").val(row.MMCATEGORY);//物料类别
		$("#materTypeCode_E").val(row.MMCATEGORYCODE);//物料类别编码
		$("#quality_E").val(row.MMCZ);//材质
		if($("#flags").val()=="add"){//新增
			$("#materName_E").val(row.MATERIALNAME);//物料名称，默认为标准物料名称			
		}		
		$('#bzmaterName_E').validatebox({required: false});
	    $('#materName_E').validatebox({required: false});
	    
		//关闭弹出层
		$('#standItemInfo-dlg').dialog('close');
		
		//新增项目物料
	    var mmInfo = {
	    		prjMmId: $.trim($("#prjMMId").val()),//项目物料Id
	    	    unitId:$.trim(row.UNITID),//单位Id
	    	    mmId : $.trim(row.ID),//基础物料Id
	    	    mmCode :$.trim(row.MATERIALCODE),//物料code
	    	    mmName : $.trim(row.MATERIALNAME),
	    	    prjMmName:$.trim($("#materName_E").val())
	    };	    
	    Utils.ajaxJsonForm(basePath + "/equipPriceLib/saveEplPrjMaterial", {
	    	mmInfo : mmInfo
		}, function(result) {
			$("#prjMMId").val(result.newPrjMMId);//项目物料Id
			//加载物料属性
			initMaterialAttr(row.ID,1);
		});
	  	
	}else{
		$.messager.alert('提示','请选择标准物料信息！','info');
	}
}

function initMaterialAttr(mmId,flag){
    var	prjMmId="";
	if(flag==1){
		prjMmId = $("#prjMMId").val();
	}
	$('#datagridParams').datagrid({
		url:basePath+ "/equipPriceLib/queryProjMmInfoAttr",
		queryParams:{mmId:mmId,prjMmId:prjMmId},
		rownumbers:true,
		singleSelect : true,
		columns : [ [
				{
					field : 'ATTRNAME',
					title : '属性名称',
					width : '20%'
				},
				{
					field : 'ATTRVALUE',
					title : '属性值',
					width : '30%',
					editor : {
						type : "validatebox",
						options : {
							required : true
						}
					}
				},
				{
					field : 'ATTRUNITID',
					title : '属性单位',
					width : '30%',
					editor : {
						type : "combobox",
						options : {
							valueField : "ID",
							textField : "UNITNAME",
							required : true
						}
					},
					formatter : function(value, row, index) {
						if (unitArr[value] == null
								|| unitArr[value] == undefined) {
							return value;
						}
						return unitArr[value];
					}
				},
				{
					field : 'handle',
					title : '操作',
					width : '19%',
					formatter : function(value, row, index) {
						return '<button type="button" onclick="handleParams(\''
								+ row.ATTRID
								+ '\','
								+ index
								+ ');"'
								+ ' class="disabled handleParams_'
								+ row.ATTRID
								+ '  btn btn-default"><i class="icon-pencil">编辑</i></button>';
					}
				} ] ],
		onBeginEdit : function(index, row) {
			var unitEditor = $(this).datagrid("getEditor",
					{
						index : index,
						field : "ATTRUNITID"
					});
			if (row.ATTRUNITID != null
					&& row.ATTRUNITID != "") {
				$(unitEditor.target).combobox("loadData",unitList);
			} else {
				$(unitEditor.target).combobox("destroy");
			}
		},
		onAfterEdit : function(rowIndex, rowData, changes) {
			paramEditIndex = undefined;
			for ( var key in changes) {
				if (key != "ATTRUNITID"
						|| changes["ATTRUNITID"] != "") {
					if (unitArr[rowData.ATTRUNITID] == undefined) {
						rowData.ATTRUNITNAME = rowData.ATTRUNITID;
						rowData.ATTRUNITID = "";
					} else {
						rowData.ATTRUNITNAME = unitArr[rowData.ATTRUNITID];
					}
					saveParams(rowData);
				}
				break;
			}
		}
	});
}
//修改参数
function handleParams(attrvalueid, index) {
	if ($('.handleParams_' + attrvalueid + ' i').hasClass('icon-pencil')) {
		editParams(attrvalueid, index);
		return;
	};
	if ($('.handleParams_' + attrvalueid + ' i').hasClass('icon-save')) {
		validateParams();
	};
}

// 参数编辑
function editParams(attrvalueid, index) {
	if (paramEditIndex != undefined) {
		$.messager.alert('提示', "参数存在未保存的数据！");
	} else {		
		$('.handleParams_' + attrvalueid + ' i').removeClass('icon-pencil')
				.addClass('icon-save').html('保存');
		paramEditIndex = index;
		$('#datagridParams').datagrid('beginEdit', index);
	}
}
// 参数验证
function validateParams() {
	if (paramEditIndex != undefined) {
		//if ($('.validatebox-invalid').length == 0) {
			$('#datagridParams').datagrid('endEdit', paramEditIndex);
		//}
	}
}

// 保存参数
function saveParams(rowData) {	
	var mmInfoAttr = {
			aId:(null==rowData.MMID || ""==rowData.MMID)?$.trim(rowData.ID):"",
			attrId:$.trim(rowData.ATTRID),
			prjMmId:$.trim($("#prjMMId").val()) ,
			attrUnitName:$.trim(rowData.ATTRUNITNAME),
			attrUnitId:$.trim(rowData.ATTRUNITID),
			attrValue:$.trim(rowData.ATTRVALUE)
	};
	Utils.ajaxJsonForm(basePath + "/equipPriceLib/saveEplPrjMmAttr", {
		mmInfoAttr : mmInfoAttr
	}, function(result) {
		$('#datagridParams').datagrid("acceptChanges");
		$.messager.show({
			title : '提示',
			msg : '操作成功',
			timeout : 3000,
			showType : 'slide'
		});
	});
}
//点击“查询供应商”按钮
function querySupplierInfo(){
$('#supplierInfo-dlg').dialog('open').dialog('center').dialog('setTitle','供应商信息搜索');	
	//$('#equipPriceForm').form('clear');
	searchSupplierInfo();
}
function searchSupplierInfo(){
	$('#supplierList-dg').datagrid({
	    url:basePath+'/constructPlan/queryConstructSupplier',
	    loadMsg:'数据加载中...',
		singleSelect:true,
	    columns:[[
			{field:'ck',title:'',width:'5%',checkbox:true},
			{field:'NAME',title:'供应商名字',width:'82%'}
	    ]],
		queryParams: {
			key:function(){
					return $('#supplier-key').searchbox('getValue');
			},
			constructPlanId:function(){
				return "";
			}
		}
	});
}
function saveSupplierInfo(flag){
	var obj = new Object();
	obj["epl_to_sup[0].id"]=$("#supplierId_E").val();
	obj["epl_to_sup[0].equipId"]=$("#editId").val();//设备指标库Id
	if(flag=='sys'){//搜索到的供应商
		var row = $('#supplierList-dg').datagrid('getSelected');
		if(row){
			$("#supplierName_E").attr("readonly","readonly");		
			$("[name=isHand]:checkbox").removeProp("checked");
			$("#isHand").val(0);
			$("#supplierName_E").val(row.NAME);
		    obj["epl_to_sup[0].supplierName"]=row.NAME;
		    obj["epl_to_sup[0].isHandInput"]="0";
		    obj["epl_to_sup[0].supplierId"]=row.ID;
		}else{
			$.messager.alert('提示','请选择供应商信息！','info');
		}
	}else if(flag=='hand'){//手动添加供应商
		var supplierName_H = $("#supplierName_H").val();
		if(supplierName_H==""){
			$.messager.alert('提示','请输入供应商名称！','info');
		}else{			
			$("[name=isHand]:checkbox").prop("checked", true);
			$("#supplierName_E").removeAttr("readonly");	
			$("#isHand").val(1);
			$("#supplierName_E").val(supplierName_H);	
		    obj["epl_to_sup[0].supplierName"]=supplierName_H;
		    obj["epl_to_sup[0].isHandInput"]="1";
		    obj["epl_to_sup[0].supplierId"]="";					
		}
	}
	
	//执行数据保存
	$.ajax({
		url : basePath + "/equipPriceLib/savesupplier",
		method : "post",
		data : obj,
		success : function(obj) {
			if(obj.status == true){
				$("#supplierId_E").val(obj.newId);			
				//关闭弹出层
				$('#supplierInfo-dlg').dialog('close');	
			}else{
				$.messager.alert("错误", "操作失败");
			}
		},
		error : function(xhr) {
			$.messager.alert("错误", "操作失败");
		}
	});	
	
}


/**
 * 表单提交之前执行验证
 */
function formValidate(){
	//标准物料名称、编码
	if($("#bzmaterName_E").val()==""){
		$.messager.alert('提示','请选择标准物料名称、编码！','info');
		return false;
	}
	//物料名称
	if($("#materName_E").val()==""){
		$.messager.alert('提示','请输入物料名称！','info');
		return false;
	}
	//扩展描述
	if(1==2){
		$.messager.alert('提示','请输入扩展描述！','info');
		return false;
	}
	//币种
	var currency_E = $("#currency_E").combobox("getValue");
	if(currency_E==""){
		$.messager.alert('提示','请选择币种！','info');
		return false;
	}
	//汇率
	var exchangeRate_E = $("#exchangeRate_E").numberbox("getValue");
	if(exchangeRate_E==""){
		$.messager.alert('提示','请输入汇率！','info');
		return false;
	}
	//税率
	var rate_E = $("#rate_E").numberbox("getValue");
	if(rate_E==""){
		$.messager.alert('提示','请输入税率！','info');
		return false;
	}
	//检验自动计算值
	
	return true;
}

