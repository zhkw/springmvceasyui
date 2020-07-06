
/**
 * 设计人工时界面js
 */
var basePath = $("#basePath").val();//项目根目录
var pbsVersionId = $("#pbsVersionId").val();//pbs版本Id
var editId = "";
var editIndex;
//wbs节点
var wbsNodes;
var wbsArray = new Array();
var wbsTypeArr = new Array();
var wbsBoo = false;
var wbsName ;
var taskNodes;
//pbs节点
var pbsNodes;
var pbsArray=new Array();
var gridColumns=new Array();
var showMajorList="";
var mngNum; //系数
var tripNum;
var baseNum;  //设计工时基数
var tripHourPrice;
var mngHourPrice;
var colArray = new Array();
var isWork=0;
var prices ; //价格信息
var projectId=$("#projectId").val();
var pricesArr = new Array(); //价格信息
var editFlag = 0;
var designManHour = function(){
	
	/**
	 * 页面初始化
	 */
	var initPage = function() {	
		//初始化基础数据
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourBaseData?tag=1",
				"pbsVersionId="+pbsVersionId+"&versionType=1",
				function(obj){
			//单价
			prices = obj.price;
			for(var i in prices){
				pricesArr[prices[i].TYPE] = prices[i].PRICE;
			}
			//wbs
			wbsNodes = obj.wbs;
			for(var i in wbsNodes){
				wbsArray[wbsNodes[i].id] = wbsNodes[i].text;
				wbsTypeArr[wbsNodes[i].id] = wbsNodes[i].nodeType;
			}
			wbsNodes = obj.wbs;
			//pbs
			pbsNodes = obj.pbs;
			for(var i in pbsNodes){
				pbsArray[pbsNodes[i].id] = pbsNodes[i].text;
			}
			pbsNodes = obj.pbs;
		});

		$.ajax({
			url:basePath+"/manHour/getTaskNodesOfProject",
			data:"projectId="+projectId,
			method:"get",
			dataType:"json",
			success:function(data) {
				taskNodes = data;
			}
		});

		//总工时
		getDesignSumManHour();
				
		//隐藏列
		$("#checkMajor").html("");
		$("#checkMajor").css("display","none");
		gridColumns.push({field:'SUMMARYID',title:'总工时id',hidden:'true'}); 
		
		//动态添加表列
		Utils.ajaxJsonSync(basePath+"/manHour/getMajorInfo",
				"majorType=1",
				function(obj){
				if(null!=obj && obj!=undefined && obj!="" && obj.length>0){
					for (var i = 0; i < obj.length; i++) {
						gridColumns.push({ field:obj[i].ID,title:obj[i].MAJORNAME,width:'5%',
							halign :'center',align:'left',hidden:'true',
							editor:{ type:'validatebox',
				        		  options:
				        		  {
				        			  min:0,max:9999999999,
				        			  validType : [ "positive_double"],
				        		  }},
							formatter:function(value,row,index){
								if(row.PBSNODEID == "合计" || row.PBSNODEID == "专业占总工时比例"){
				        			if(value==0 || value=="0%"){
				        				check = 0;
				        				return "";
				        			}else{				        				
				        				return '<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>';
				        			}
				        		 }
								if(value){
									return '<span title=\"' + decimalHandel(value,2) + '\" class=\"easyui-tooltip\">' + decimalHandel(value,2) + '</span>';
								}else{									
									return "";
								}
							}
						});
						
						showMajorList +="<label style='margin-right:12px;'>" +
								"<input type='checkbox' class='checkbox_input' " +
								"  id='"+obj[i].ID+"' name='"+obj[i].MAJORNAME+"' value='"+obj[i].ID+"'>" +
								"<span style='margin-left:-2px;'>"+obj[i].MAJORNAME+"</span>" +
								"</label>";
						
						var colObj = new Object();
						colObj.id = obj[i].ID;
						colObj.isCheck = 0;
						colArray.push(colObj);
					}
					
					gridColumns.push({ field:'cost',title:'小计',width:'15%',halign :'center',align:'left',
						formatter:function(value,row,index){
							if(row.PBSNODEID == "合计"){
			        		    return '<span title=\"' + decimalHandel(value,2) + '\" class=\"easyui-tooltip\">' + decimalHandel(value,2) + '</span>';
			        		 }
							if(row.PBSNODEID == "专业占总工时比例"){
								return "100%";
							}
							var rs = 0;
							for (var j = 0; j <colArray.length ; j++) {
		    					if(colArray[j].isCheck==1){
		    						var qtyFiled = colArray[j].id;
		    						if(row[qtyFiled]){
		    							rs+=parseInt(row[qtyFiled]);
		    						}
		    					}
							}
							if(rs == 0 && value){
								rs = decimalHandel(value,2);
							}else{
								rs = decimalHandel(rs,2);
							}
							return '<span title=\"' + rs + '\" class=\"easyui-tooltip\">' + rs + '</span>';
					   }
					});
				}
		},"");		
		var checkMajorBtn = "<div style='display:none;' id='isCheckAll'>全选</div>" +
		"<a class='iconBtn' title='全选/取消' id='checkAllBtn' style='width:65px;margin-left:8px;border-radius:5px;'><span class='btnDesc'>全选/取消</span></a>" +
		"<a class='iconBtn' title='反选' id='invertBtn' style='width:40px;margin-left:5px;border-radius:5px;'><span class='btnDesc'>反选</span></a>" +
		"<a class='iconBtn' title='确定' id='okBtn' style='width:40px;margin-left:5px;border-radius:5px;'><span class='btnDesc'>确定</span></a>";
		$("#checkMajor").html(showMajorList+checkMajorBtn);
		//工作工时
		loadDatas();
		//管理、出差工时
		loadChildDatas();
		
	};

	

	// 加载页面列表数据
	var loadDatas = function(){
		$("#designParentGrid").datagrid({
			url :  basePath+"/manHour/getManhour",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
//			pageNumber : 1,
//			pageSize: 15,
//			pageList:[15,20,30,40,50],
			showFooter:true,
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			rownumbers:true,
			toolbar:'#designParentGrid_tb',
			queryParams:{manHourSumId:$("#manHourSumId").val(),versionType:1},
			frozenColumns : [[
              	{field:'WBSNODEID',title:'WBS(一级)',width :'13%',halign :'center',align:'left',
					formatter:function(value,row,index){
					if(value){
						return '<span title=\"' + wbsArray[value] + '\" class=\"easyui-tooltip\">' + wbsArray[value] + '</span>';
					}else{
						return "";
					}
					
		  		  	},
			  	  	editor:{
		              	type: "combobox",
		              	options: {
		                  	valueField: "id",
		                  	textField: "text",
		                  	panelHeight:"auto",
		                  	data:wbsNodes,
		                  	required:true,
		                  	editable: false,
		                  	required:true,
		                  	onLoadSuccess: function(data){
			                	 
		                  	},
		                  	onChange: function(newValue, oldValue){
		                	  	if(wbsBoo){
		                		  	for (var i = 0; i < wbsNodes.length; i++) {
										if(wbsNodes[i].id == newValue){
											wbsBoo = false;
											var ed = $('#designParentGrid').datagrid('getEditor', {index:editIndex,field:'PBSNODEID'});
											if(ed != null){
												$(ed.target).combo('setValue', '');
											}
											$("#designParentGrid").datagrid("endEdit",editIndex);
											$("#designParentGrid").datagrid("beginEdit",editIndex);
											break;
										}
			                	  	}
		                	  	}
		                  	},
		                  	onShowPanel: function(){
		                	  	wbsBoo = true;
		                  	}
		              	}
			     }},
			     {field:'PBSNODEID',title:'子项',width : '15%',halign :'center',align:'left',
					formatter:function(value,row,index){
						if(value == "合计" || value == "专业占总工时比例"){
							return value;
						}else if(value){
							if(pbsArray[value] != undefined){
								return '<span title=\"' + pbsArray[value] + '\" class=\"easyui-tooltip\">' + pbsArray[value] + '</span>';
							}else if(row.PBSNODENAME){
								return '<span title=\"' + row.PBSNODENAME + '\" class=\"easyui-tooltip\">' + row.PBSNODENAME + '</span>';
							}
						}	
			  		  
		  		  	},editor:"text"
		     	}
          	]],
			columns:[
			          gridColumns
			        ],
			onLoadSuccess:function(data) {
				//获取页脚行
				var footer = $(this).datagrid('getFooterRows');
				if(data.total>0 && footer[0].cost !="" && footer[0].cost>0){
					if(footer != null && footer.length>1){
						var footerRow = footer[0];
						for (var j = 0; j <colArray.length ; j++) {
							var qtyFiled = colArray[j].id;
							if(footerRow[qtyFiled]>0){
								//隐藏该列
								$("#designParentGrid").datagrid("showColumn", qtyFiled);
								/*var dg = $('#designParentGrid');//table表id
								var col = dg.datagrid('getColumnOption',qtyFiled);//获得该列属性
								col.width = document.body.clientWidth*0.12;//调整该列宽度
								col.halign = 'center';
								col.align = 'left';
								dg.datagrid();*/
								//修改该列对应数组的属性
								colArray[j].isCheck=1;
								//专业列表帅选组属性修改
								$("#"+qtyFiled+"").prop("checked",true);
							}
						}
					}
				}				
			},
	        onClickRow:function(rowIndex, rowData){	
        		 $(this).datagrid('endEdit', editIndex);
        		 if($("#designParentGrid").datagrid('getEditors',editIndex).length < 1){
        			 editIndex = undefined;
        		 }
	        },
		    onDblClickRow:function(index,field,value){
		    	if(isWork==0){		    	
		    		if($(this).datagrid('getEditors',editIndex).length < 1){
		    			$(this).datagrid('beginEdit', index);
		    			editIndex = index;
		    		}
		    	}
		    },
		    onBeforeEdit: function(index,row){
		    	var pbsColum = $(this).datagrid("getColumnOption", 'PBSNODEID');
		    	var wbsId =  row.WBSNODEID;
		    	var nodeType = wbsTypeArr[wbsId];
		    	if( nodeType == '专业'){
		    		var list = new Array();
					for (var i in taskNodes) {
						if (taskNodes[i].parentId==wbsId) {
							list.push(taskNodes[i]);
						}
					}
		    		pbsColum.editor = {
						type : "combotree",
						options : {
							editable: false,
							loadFilter: treeConstructor,
							panelHeight: "auto",
							panelMaxHeight: 256,
							panelMaxWidth: 256,
							data: list,
							value: row.PBSNODEID,
							onSelect: function(record){
								wbsName = record.text;
								row.PBSNODENAME = record.text;
							}
							/*value:row.PBSNODEID,
							url : basePath+"/manHour/getTaskNode?taskId="+wbsId,
							onSelect: function(record){
								wbsName = record.text;
							}*/
						}
					};
		    	}else if(nodeType == '子项'){
		    		pbsColum.editor = {
				 		type: "combotreegrid",
		              	options: {
							url:basePath+'/structure/getPbsTree',
							panelWidth:512,
							panelHeight:"auto",
							panelMaxHeight:300,
							idField: 'ID',
							treeField: 'PRJMATERIALNAME',
							singleSelect: true,
							editable: false,
			                columns: [[								                 	        
	                 			{field:'MATERIALCODE',title:'标准子项编码',width:'20%'},
	                 			{field:'MATERIALNAME',title:'标准子项名称',width:'20%'},
	                 			{field:'PRJMATERIALNAME',title:'子项名称',width:'35%'},
	                 			{field:'NODECODE',title:'子项号',width:'20%'}
	                 	    ]],
	                		queryParams: {
	                			pbsversionId:function(){
	                				return pbsVersionId;
	                			},
	                			projectId:function(){
	                				return "1";
	                			},
	                			level:function(){
	                				return "2";
	                			}
	                		},
		                	onBeforeSelect:function(row){
	                			if(!row.isleaf){
	                				if(row.state=='close'){
	                					$(this).treegrid('expand',row.ID);
	                				}							                				
	                				return false;
	                			}
	                		},
	                		onLoadSuccess:function(){
	                			$(this).treegrid("expandAll");
		                	}
			            }	
		    		}
		    	}else{
	
		    		pbsColum.editor = {}
		    	}
		    },
		    onAfterEdit: function(index, row, changes){
		    	var rows = $("#designParentGrid").datagrid("getRows");
		    	for(var i = 0;i < rows.length;i++){
		    		if(i != index){
		    			if(row.WBSNODEID == rows[i].WBSNODEID && row.PBSNODEID == rows[i].PBSNODEID){
			    			$.messager.alert('提示','wbs节点和子项联合不能重复！');
			    			editIndex = index;
			    			$("#designParentGrid").datagrid('beginEdit', index);
			    			break;
			    		}
		    		}		    		
		    	}
		    }
			/*onAfterEdit:function(rowIndex, rowData, changes){  //行编辑完成事件
				var inserted = $(this).datagrid('getChanges', 'inserted');  
	            var updated = $(this).datagrid('getChanges', 'updated');  
	            if (inserted.length < 1 && updated.length < 1) { 
	                editRow = undefined;  
	                $(this).datagrid('unselectAll');  
	                return;  
	            }  
	  
	            var tag = '';  
	            if (inserted.length > 0) {  
	            	tag = 'add';  
	            }  
	            if (updated.length > 0) {  
	            	tag = 'update';  
	            }
			    //验证wbsId和pbsId组合项是否唯一
				var wbsId = rowData.WBSNODEID;
				var pbsId = rowData.PBSNODEID;
				$.messager.progress({
					interval:100,
					text:'正在验证中'
				});
				//判断是否在
				var data={wbsNodeId:wbsId,pbsNodeId:pbsId,tag:tag};
				$.ajax({
    				url : basePath + "/manHour/validateDesignManhour",
    				method : "post",
    				data : data,
    				success : function(obj) {
    					$.messager.progress('close');
    					if(obj.rs == 0){    						
    						//$("#designParentGrid").datagrid('endEdit', rowIndex);
    					}else{
    						$.messager.alert("错误", "该WEB结点和子项已被占用，请重选！");
    						$("#designParentGrid").datagrid('beginEdit', rowIndex);
    						editIndex = rowIndex;
    					}
    					
    				},
    				error : function(xhr) {
    					$.messager.alert("错误", "操作失败");
    				}
    			});				
			}*/
		});
		$("#designKey").searchbox({
	 		width:200,
	 		height:26,
	        searcher: function(value) {
	        	var param = {manHourSumId:$("#manHourSumId").val(),versionType:1,key:value};
	        	$("#designParentGrid").datagrid("unselectAll");
	        	$("#designParentGrid").datagrid({
		    		queryParams:param
		    	});
	        },
	        prompt:"WBS一级/子项名称/子项号"
	    });
		
		// 点击"保存设计工作工时"
		$("#saveDgnManHour").on("click", function(){
			$("#designParentGrid").datagrid('endEdit', editIndex);
    		if($("#designParentGrid").datagrid('getEditors',editIndex).length < 1){
    			var rows = $("#designParentGrid").datagrid("getChanges");
    			
    			var data = new Object();
    			data.pbsVersionId = $("#pbsVersionId").val();
    			data.projectId = projectId;
    			data.manHourSumId = $("#manHourSumId").val();
    			data.isWorkEnabled = $("#isWorkManHour")[0].checked ? 1 : 0;
    			data.workHour = $("#designSumHour").val();
    			data.versionType = 1; //设计
    			data.manHourType = 3; //工作
    			for(var i in rows){    	
    				//数据唯一性验证，不唯一提示并处于编辑状态
    				var rowIndex = $('#designParentGrid').datagrid('getRowIndex', rows[i]);
    				if (rows[i].ID != undefined) {
    					data["dgnManHourList[" + i + "].id"] = rows[i].ID;    					
    				} 
    				data["dgnManHourList[" + i + "].rowIndex"] = rowIndex;//记录行索引
    				data["dgnManHourList[" + i + "].summaryId"] = rows[i].SUMMARYID;//总工时id
    				var wbsId = rows[i].WBSNODEID ;
    				var nodeType = wbsTypeArr[wbsId];
    				var comeFrom = 1;
    		    	if(nodeType  == '子项'){
    		    		comeFrom = 0;
    		    	}
    				data["dgnManHourList[" + i + "].wbsNodeId"] = rows[i].WBSNODEID;//wbs结点
    				if(rows[i].PBSNODEID == null || rows[i].PBSNODEID == ""){
    					$.messager.alert("提示", "子项必填");
    					return;
    				}
    				data["dgnManHourList[" + i + "].pbsNodeId"] = rows[i].PBSNODEID;//pbs结点
    				data["dgnManHourList[" + i + "].comeFrom"] = comeFrom;
    				
    				//专业  
    				for (var j = 0; j <colArray.length ; j++) {
    					if(colArray[j].isCheck==1){
    						var qtyFiled = colArray[j].id;    						
    						data["dgnManHourList[" + i + "].majorInfoList["+j+"].majorId"]= colArray[j].id;//专业id
        					data["dgnManHourList[" + i + "].majorInfoList["+j+"].qty"]= rows[i][qtyFiled];//专业工时
    					}
					}
    			}
    			$.messager.progress({
					interval:100,
					text:'正在处理中'
				});
    			
    			$.ajax({
    				url : basePath + "/manHour/saveDesignManhour",
    				method : "post",
    				data : data,
    				success : function(obj) {
    					$.messager.progress('close');
    					if(obj.error!=""){
    						$.messager.show({
        						title : '提示',
        						msg : '数据验证未成功！',
        						timeout : 3000,
        						showType : 'slide'
        					});
    						var rowIndexs= obj.error.split(',');
    						for (var i = 0; i < rowIndexs.length; i++) {
								var rowIndex = rowIndexs[i];
								$("#designParentGrid").datagrid('beginEdit', rowIndex);
							}
    					}else if(obj.rs == 0){
    						$.messager.show({
        						title : '提示',
        						msg : '保存成功！',
        						timeout : 3000,
        						showType : 'slide'
        					});
        					$("#designParentGrid").datagrid("acceptChanges");
        					$("#designParentGrid").datagrid("load");
        					getDesignSumManHour();
        					editFlag = 1;
        					$("#designChildGrid").datagrid("reload");
    					}else{
    						$.messager.alert("错误", "操作失败");
    					}
    					
    				},
    				error : function(xhr) {
    					$.messager.progress('close');
    					$.messager.alert("错误", "操作失败");
    				}
    			});
    		}
		});
	};
	
	
	
	/**
	 * 注册事件
	 */
	var regEvent = function () {	
		// 点击"新增"
		$("#addDesign").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			table.datagrid("endEdit", editIndex);
			if(table.datagrid('getEditors',editIndex).length > 0){
				return;
			}
			table.datagrid('insertRow', {index:0,row:{
	            NAME: "",
	        }});
			table.datagrid("beginEdit", 0);
	        //给当前编辑的行赋值
			editIndex = 0;
		});
		// 点击"删除"
		$("#deleteDesign").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			var row = table.datagrid("getSelected");
			var index = table.datagrid("getRowIndex",row);
			if(row.ID == ""){
				table.datagrid('deleteRow',index);
				table.datagrid('acceptChanges');
				$.messager.show({
					title : '提示',
					msg : '删除成功！',
					timeout : 3000,
					showType : 'slide'
				});
				return;
			}
			table.datagrid('endEdit', editIndex);
			if(row != null){ 
				$.messager.confirm("提示","是否删除该行",function(r){
					if(r){
						if(table.datagrid('getEditors',editIndex).length > 0 && 
								table.datagrid('getEditors',index) < 1){
							$.messager.alert("提示","请先完成编辑");
							return;
						}
						var rowId = row.ID;
						table.datagrid('deleteRow',index);
						if(rowId != undefined){							
							$.post(basePath+"/manHour/deleteDesignManHour",
									"designId="+rowId,
									function(obj){
								if(obj.rs == 0){
									$.messager.show({
			    						title : '提示',
			    						msg : '删除成功！',
			    						timeout : 3000,
			    						showType : 'slide'
			    					});
									table.datagrid("reload");
									editFlag = 1;
									$("#designChildGrid").datagrid("reload");
								}else{
									$.messager.alert("提示","删除失败！");
								}
							},"json");
						}
					}
				});
			}else{
				$.messager.alert("提示","请选择一行数据");
			}
		});
		// 点击"复制"
		$("#copyDesign").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			var row = table.datagrid("getSelected");
			if(row != null){
				var index = table.datagrid("getRowIndex",row);
				if(table.datagrid('getEditors',editIndex).length > 0 && 
						table.datagrid('getEditors',index) < 1){
					$.messager.alert("提示","请先完成编辑");
					return;
				}
				if(table.datagrid('getChanges').length > 0){
					$.messager.alert("提示","请先保存数据");
					return;
				}
				if(row.ID == undefined){
					$.messager.alert("提示","数据有误，请刷新页面后重试。");
					return;
				}
				$("#copyId").val(row.ID);
				$("#summaryId").val(row.SUMMARYID);
				$("#wbsId").val(row.WBSNODEID);
				$("#pbsId").val(row.PBSNODEID);
				$.messager.show({
					title : '提示',
					msg : '复制成功！',
					timeout : 3000,
					showType : 'slide'
				});
			}else{
				$.messager.alert("提示","请选择一行数据");
			}
		});
		// 点击"粘贴"
		$("#pasteDesign").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			var copyId = $("#copyId").val();
			if(copyId.length < 1){
				$.messager.alert("提示","请先复制一条数据");
				return;
			}
			//根据id选中该行数据
			$("#designParentGrid").datagrid("selectRecord",copyId);
			//获取选中的行数据
			var rowData=$("#designParentGrid").datagrid("getSelected");
			if(rowData){
				var rowData2 = $.extend({}, rowData); ;
				rowData2.ID = "";
				//插入一行新数据				
				$("#designParentGrid").datagrid('insertRow',{index: 0,row:rowData2});
				//$("#designParentGrid").datagrid('acceptChanges');
				//去掉新增行的ID值
				//$('#designParentGrid').datagrid('updateRow',{index: 0,row:rowData});
				//验证wbsId和pbsId组合项是否唯一
				var wbsId = rowData.WBSNODEID;
				var pbsId = rowData.PBSNODEID;
				//判断是否在
				var data={wbsNodeId:wbsId,pbsNodeId:pbsId,tag:'add'};
				
				$("#copyId").val("");//清空
				$.ajax({
    				url : basePath + "/manHour/validateDesignManhour",
    				method : "post",
    				data : data,
    				beforeSend:function() {
    					MyMessager.prog.show("提示","请等待","数据处理中...");
    				},
    				complete:function() {
    					MyMessager.prog.close();
    				},
    				error:function(jqXHR, textStatus, errorThrown) {
    					MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
    				},
    				success : function(obj) {
    					MyMessager.prog.close();
    					if(obj.rs == 0){    						
    						$("#designParentGrid").datagrid('endEdit', 0);
    					}else{
    						$("#designParentGrid").datagrid('beginEdit', 0);
    						$("#designParentGrid").datagrid('selectRow', 0);
    						editIndex = 0;
    						MyMessager.slide.show("错误", "该WEB结点和子项已被占用，请重选！");
    					}
    					
    				},
    				error : function(xhr) {
    					$.messager.alert("错误", "操作失败");
    				}
    			});		
			}else{
				$.messager.alert("提示","请先复制一条数据");
				return;
			}
		});
		
		// 点击"显示/隐藏专业"
		$("#show_hide").on("click", function(){
			var title = $.trim($("#btnTitle").html());
			if(title=="显示专业"){
				$("#checkMajor").css("display","block");
				$("#btnTitle").html("隐藏专业");
			}
			if(title=="隐藏专业"){
				$("#checkMajor").css("display","none");
				$("#btnTitle").html("显示专业");
			}
		});
		
		var checkbox=document.getElementById('checkMajor');//获取div
		var checked=checkbox.getElementsByTagName('input');//获取div下的checkbox
		//确定选中显示列
		$("#okBtn").on("click", function(){
			//获取选中的项
			for(var i=0;i<checked.length;i++){
				var obj = checked[i];
				isShowGridColumn(obj);
		      }	
			$("#checkMajor").css("display","none");
			$("#btnTitle").html("显示专业");
			//$("#designParentGrid").datagrid('load');
		});

		//全选、不选
		$("#checkAllBtn").on("click", function(){
			var title = $.trim($("#isCheckAll").html());			
			for(var i=0;i<checked.length;i++){
				if(title=='全选'){
					checked[i].checked=true;
				}
				if(title=='不选'){
					checked[i].checked=false;
				}
			}
			if(title=='全选'){
				$("#isCheckAll").html("不选");
			}
			if(title=='不选'){
				$("#isCheckAll").html("全选");
			}
			//$("#designParentGrid").datagrid('load');
		});
		//反选
		$("#invertBtn").on("click", function(){			
			for(var i=0;i<checked.length;i++){
		        if(checked[i].checked==true){
		           checked[i].checked=false;
		         }else{
			      checked[i].checked=true;
			     }
		      }			
			//$("#designParentGrid").datagrid('load');
		});

        // 点击"生成施工图设计数据"
        $("#buildConstruction").on("click", function(){
        	if ($.inArray('施工图设计',wbsArray) != -1){
                getPbsLeafNode(pbsVersionId,$.inArray('施工图设计',wbsArray));
			}else {
                $.messager.alert("错误", "该项目不能自动生成");
                return;
			}
		})

        // 点击"生成详细设计数据"
        $("#buildDetail").on("click", function(){
            if ($.inArray('详细设计',wbsArray) != -1){
                getPbsLeafNode(pbsVersionId,$.inArray('详细设计',wbsArray));
            }else {
                $.messager.alert("错误", "该项目不能自动生成");
                return;
			}

        })
	};

	function getPbsLeafNode(pbsVersionId,oo) {
        $.ajax({
            url : basePath + "/manHour/getPbsLeafNode?versionId="+pbsVersionId,
            method : "get",
            beforeSend:function() {
                MyMessager.prog.show("提示","请等待","数据处理中...");
            },
            complete:function() {
                MyMessager.prog.close();
            },
            success : function(obj) {
                for(var j in obj){
                    var rows = $("#designParentGrid").datagrid("getRows");
                    if (rows.length !== 0){
                    	var isSame = false;
                        for(var i = 0;i < rows.length;i++){
                            if(oo == rows[i].WBSNODEID && obj[j] == rows[i].PBSNODEID) {
                                isSame = true;
                            }
                        }
                        if (!isSame){
                            //新插入一行
                            $("#designParentGrid").datagrid('insertRow',{index: 0,row:{
                                WBSNODEID:oo,
                                PBSNODEID:obj[j]
                            }});
						}
					}else {
                        //新插入一行
                        $("#designParentGrid").datagrid('insertRow',{index: 0,row:{
                            WBSNODEID:oo,
                            PBSNODEID:obj[j]
                        }});
					}
                }
            },
            error : function(xhr) {
                $.messager.alert("错误", "操作失败");
            }
        });
    }
	//设计出差和设计管理工时系数
	var loadChildDatas = function(){
		
		//设计管理工时单价
		mngHourPrice = pricesArr['设计管理工时'];
		//设计出差工时单价
		tripHourPrice = pricesArr['设计出差工时'];
		//获取基数：设计工作工时
		//Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",getDesignManageHour
		/*var designMgnHour ;
		Utils.ajaxJsonSync(basePath+"/manHour/getDesignManageHour",
				{pbsVersionId:pbsVersionId,versionType:1},
			function(obj){
				var design = obj.DESIGN;
				var workMH = design.WORKHOUR;
				var tripMH = design.TRIPHOUR;
				var mngMH = design.MANAGEHOUR;
				baseNum = workMH.toFixed(2);
				designMgnHour=obj.DESIGNMGNHOUR;
			}
		);*/
		
		$("#designChildGrid").datagrid({
			url : basePath+"/manHour/getManageManHour",
			pagination : false,
			singleSelect : true,
			fit : true,
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			queryParams:{pbsVersionId:pbsVersionId,versionType:1,mgnType:1,projectId:projectId},
			toolbar:'#designChildGrid_tb',
			/*data:[{id:$("#manHourSumId").val(),name:'设计管理人工时',num:mngNum,baseNum:baseNum,unitPrice:mngHourPrice}
			      ,{id:$("#manHourSumId").val(),name:'设计出差人工时',num:tripNum,baseNum:baseNum,unitPrice:tripHourPrice}],*/
	        columns:[
			         [  
			          { field:'summaryId',title:'总工时ID', hidden:'true'},
			          { field:'id',title:'管理工时ID', hidden:'true'},
			          { field:'name',title:'名称', width : 200,align : "center", 
			        	  formatter: function(value,row,index){
			        		  if(value && value!="设计出差人工时" && value!="设计管理工时"){
			        			  return "设计管理工时-"+value;
			        		  }
			        		  return value;
			        	  }
			          }, 
			          { field:'num' ,title:'系数(%)',width : 180,align : "center"
			        	  ,editor:
			        	  {
			        		  type:'validatebox',
			        		  options:
			        		  {
			        			  min:0,max:100,required:true,
			        			  validType : [ "positive_double"],
			        		  }
			              },formatter: function(value,row,index){
			            	  if(value){
			            		  return decimalHandel(value,2);
			            	  } else{
			            		  return 0;
			            	  }
			              }
			          },
			          { field:'baseNum',title:'基数(设计工作时)',width : 120, align : "center",
			        	  formatter: function(value,row,index){
			        		  return decimalHandel(row.baseNum,2);
			        	  }
			          },
			          { field:'unitPrice',title:'工时单价',width : 120,align : "center"},
			          {field:'sumManHour',title:'总工时',width : 120,align : "center",
			        	  formatter: function(value,row,index){
			        		  var rs = 0;
			        		  if(row.num && row.unitPrice && row.baseNum){
			        			  return decimalHandel(row.num*row.baseNum/100,2);
			        		  }
			        		  return rs;
						 }
			          },
			          {field:'cost',title:'费用(万)',width : 120,align : "center",
			        	  formatter: function(value,row,index){
			        		  var rs = 0.00;
			        		  if(row.num && row.unitPrice  && row.baseNum){
			        			  rs = (row.num * row.baseNum/100  * row.unitPrice/10000).toFixed(2);
			        		  }
			        		  return rs;
			              }
			          }
			       ]
			    ],
			      onClickRow:function(){
		    		 $(this).datagrid('endEdit', editIndex);
		    		  
			      },
			      onDblClickRow:function(index,field,value){			    	  
			    	  if($(this).datagrid('getEditors',editIndex).length < 1){
			    		  $(this).datagrid('beginEdit', index);
				    	  editIndex = index;
			    	  }			    	  
			      },
			      onEndEdit: function(index, row, changes){
			    	  updateRatio(row.baseNum,row.num * row.baseNum /100,row.num/100,index,1);
			      },
			      onLoadSuccess: function(data){
			    	  if(editFlag == 1){
			    		  var rows = $(this).datagrid('getRows');
				    	  for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							updateRatio(row.baseNum,row.num * row.baseNum /100,row.num/100,i,2);
							if(i == rows.length - 1){
								setTimeout("autoSave()",100);
							}
				    	  }
			    	  }
			      }
		});
		
		// 点击"保存设计出差、设计施工管理系数"
		$("#saveDsg_Trip").on("click", function(){
			$("#designChildGrid").datagrid('endEdit', editIndex);
    		if($("#designChildGrid").datagrid('getEditors',editIndex).length < 1){
    			var rows = $("#designChildGrid").datagrid("getChanges");
				if(editFlag == 1){
					rows = $("#designChildGrid").datagrid("getRows");
				}
    			if(rows.length < 1){
    				return;
    			}
    			var data = new Object();
    			for(var i in rows){ 
    				data["manageManHourList[" + i + "].id"] = rows[i].id; //记录Id					
    				data["manageManHourList[" + i + "].type"] = 1;//设计管理
    				data["manageManHourList[" + i + "].summaryId"] = rows[i].summaryId;//总工时id
    				if(undefined != rows[i].num){
    					data["manageManHourList[" + i + "].quotient"] = rows[i].num;//系数值
    					data["manageManHourList[" + i + "].value"] = rows[i].num*rows[i].baseNum;//值
    				}
    			}
    			
    			$.ajax({
    				url : basePath + "/manHour/saveManageManhour",
    				method : "post",
    				data : data,
    				beforeSend:function() {
    					if(editFlag == 1){
    						MyMessager.prog.show("提示","请等待","出差、管理工时正在自动调整...");
    					}else{
    						MyMessager.prog.show("提示","请等待","数据处理中...");
    					}
    				},
    				complete:function() {
    					MyMessager.prog.close();
    				},
    				error:function(jqXHR, textStatus, errorThrown) {
						MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
    				},
    				success : function(obj) {
    					if(obj.rs == 1){
    						if(editFlag == 1){
    							editFlag = 0;
    							$.messager.show({
    								title : '提示',
    								msg : '出差、管理工时系数已自动调整',
    								timeout : 2000,
    								showType : 'fade',
    								style:{  
    						            right:'',  
    						            bottom:''  
    						        } 
    							})
    						}else{
    							$.messager.show({
            						title : '提示',
            						msg : '保存成功！',
            						timeout : 3000,
            						showType : 'slide'
            					});
    						}
        					$("#designChildGrid").datagrid("reload");
        					
    					}else{
    						$.messager.alert("错误", "数据保存失败");
    					}
    				}
    			});
    		}else{
    			$.messager.alert("提示","请先填写正确的数据！");
    		}
		});
	};
	
	//加载总工时
	var getDesignSumManHour = function(){
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourSum",
				{pbsVersionId:pbsVersionId,versionType:1},
				function(obj){
					$("#manHourSumId").val(obj.ID);
					if(obj.ISWORKENABLED == 1){
						$("#isWorkManHour")[0].checked = true;
						$("#designSumHour")[0].disabled=false;
						isWork=1;
						$("#handleBar").hide();
						//isEnable(false);
					}else{
						$("#isWorkManHour")[0].checked = false;
						$("#designSumHour")[0].disabled = true;
						isWork=0;
						$("#handleBar").show();
						//isEnable(true);
					}
					$("#designSumHour").val(obj.WORKHOUR);
					//设计工作工时单价
					$("#designSumHourPrice").val(pricesArr['设计工作工时']);
					//总工作工时费用
					$("#designSumPrice").val(($("#designSumHour").val() * $("#designSumHourPrice").val()/10000).toFixed(2));
					//开启设计，管理工时
					mngNum = obj.MANAGEHOUR;
					tripNum = obj.TRIPHOUR;
					$("#validate").val(obj.validate);
			});
	};
	
	
	return {
		
		init : function(){
			// 页面初始化
			initPage();
			// 页面事件注册
			regEvent();
		}
	};
	
}();

/**
 * 是否显示专业到表格列上
 * @param obj 当前对象
 */
function isShowGridColumn(obj){
	var colId = $(obj).val();
	var isCheck = 1;
	if(obj.checked){
		$("#designParentGrid").datagrid("showColumn", colId);	
		/*var dg = $('#designParentGrid');//table表id
		var col = dg.datagrid('getColumnOption',colId);//获得该列属性
		col.width = document.body.clientWidth*0.12;//调整该列宽度
		col.halign = 'center';
		col.align = 'left';
		dg.datagrid();*/
	}else{
		$("#designParentGrid").datagrid("hideColumn", colId);
		isCheck = 0;
	}	
	
	for (var i = 0; i < colArray.length; i++) {
		if(colArray[i].id==colId)
			colArray[i].isCheck = isCheck;
	}
	//$("#designParentGrid").datagrid("reload");
}



//是否开启设计工作工时
function isWorkManHour(obj){
	if(obj.checked){
		$("#designSumHour")[0].disabled = false;
		isWork=1;
		$("#handleBar").hide();
		$("#checkMajor").css("display","none");
	}else{
		$("#designSumHour")[0].disabled = true;
		isWork=0;
		$("#handleBar").show();
	}
}

/**
 * 按钮是否可用
 */
function isEnable(flag){
	if(flag){
		$('#addDesign').linkbutton('enable');
		$('#deleteDesign').linkbutton('enable');
		$('#copyDesign').linkbutton('enable');
		$('#pasteDesign').linkbutton('enable');
		$('#show_hide').linkbutton('enable');
	}else{
		$('#addDesign').linkbutton('disable');
		$('#deleteDesign').linkbutton('disable');
		$('#copyDesign').linkbutton('disable');
		$('#pasteDesign').linkbutton('disable');
		$('#show_hide').linkbutton('disable');
	}
}
function updateRatio(baseNum,value,ratio,index,type){
	var temp = value % 8;
	if(temp != 0){
		if((8-temp)/8 < 0.5){
			value = value + (8-temp);
		}else{
			value = value - temp;
			if(value == 0){
				value = 8;
			}
		}
		$("#designChildGrid").datagrid('updateRow',{
			index: index,
			row: {
				num: value/baseNum*100,
			}
		});
		if(type == 1){
			$.messager.show({
				title : '提示',
				msg : '出差、管理工时数必须为8的倍数，系数已自动调整',
				timeout : 2000,
				showType : 'fade',
				style:{  
		            right:'',  
		            bottom:''  
		        } 
			})
		}
	}
}
function autoSave(){
	$("#saveDsg_Trip").click();
}

$(function(){
	designManHour.init();
});