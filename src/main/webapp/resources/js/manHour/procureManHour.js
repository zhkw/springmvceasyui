/**
 * 采购人工时界面js
 */
var basePath = $("#basePath").val();//项目根目录
var pbsVersionId = $("#pbsVersionId").val();//pbs版本Id
var projectId = $("#projectId").val();//项目Id
var editIndex,editIndex1,editIndex2;
var roleArray = new Array();
var prices ; //价格信息
var pricesArr = new Array(); //价格信息
var staffs ; //人员信息
var staffsArr = new Array(); //人员信息

var mngNum;
var baseNum;  //采购管理工时基数
var mngHourPrice;
var projRole;//人员岗位
var projRoleArr = new Array();
var isWork = 0;
var isTrip = 0;
var editFlag = 0;
var procureManHour = function(){
	
	/**
	 * 页面初始化
	 */
	var initPage = function() {
		//初始化基础数据
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourBaseData?tag=2","",function(obj){
			//价格
			prices = obj.price;
			for(var i in prices){
				pricesArr[prices[i].TYPE] = prices[i].PRICE;
			}
			//人员列表
			staffs = obj.person;
			for(var i in staffs){
				staffsArr[staffs[i].id] = staffs[i].text;
			}
			staffs = obj.person;
			//人员岗位
			projRole = obj.role;
			for(var i in projRole){
				projRoleArr[projRole[i].id] = projRole[i].text;
			}
			projRole = obj.role;
		});
		
		//加载总工时
		getPurSumManHour();
		
		// 加载采购工作工时数据
		loadTopDatas();
		// 加载采购出差工时数据
		loadCntDatas();
		// 加载采购管理工时数据
		loadButDatas();
	};
	
	/**
	 * 注册事件
	 */
	var regEvent = function () {
			
		// 点击"新增"
		$("#addPur").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			table.datagrid("endEdit", editIndex);
			if(table.datagrid('getEditors',editIndex).length < 1){
				table.datagrid('insertRow', {index:0,row:{
		            NAME: "",
		        }});
				table.datagrid("beginEdit", 0);
		        //给当前编辑的行赋值
				editIndex = 0;
			}else{
				$.messager.alert("提示","请先完成编辑");
			}
		});
		// 点击"删除"
		$("#deletePur").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			table.datagrid('endEdit', editIndex);
			var row = table.datagrid("getSelected");
			if(row != null){ 
				$.messager.confirm("提示","是否删除该行",function(r){
					if(r){
						var index = table.datagrid("getRowIndex",row);
						if(table.datagrid('getEditors',editIndex).length > 0 && 
								table.datagrid('getEditors',index) < 1){
							$.messager.alert("提示","请先完成编辑");
							return;
						}
						var id = row.ID;
						table.datagrid('deleteRow',index);
						if(id != undefined){
							$.post(basePath+"/manHour/deleteManHour","manHourId="+id,function(obj){
								if(obj.rs == 0){
									$.messager.show({
			    						title : '提示',
			    						msg : '删除成功！',
			    						timeout : 3000,
			    						showType : 'slide'
			    					});
									table.datagrid("acceptChanges");
									table.datagrid("load");
									// 加载采购管理工时数据
									editFlag = 1;
									Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
			    							{pbsVersionId:$("#pbsVersionId").val(),versionType:2,manHourType:2,projectId:projectId},
			    						function(obj){
			    							var pur = obj.PUR;
			    							var workMH = pur.WORKHOUR;
			    							var tripMH = pur.TRIPHOUR;
			    							baseNum = decimalHandel(workMH + tripMH,2) ;
			    							$("#procureButGrid").datagrid('reload');
			    						}
			    					);
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
		$("#copyPur").on("click", function(){
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
		$("#pastePur").on("click", function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			var id = $("#copyId").val();
			if(id.length < 1){
				$.messager.alert("提示","请先复制一条数据");
				return;
			}
			$.post(basePath+"/manHour/copyManhour","manHourId="+id,function(obj){
				if(obj.rs == 0){
					$.messager.show({
						title : '提示',
						msg : '粘贴成功！',
						timeout : 3000,
						showType : 'slide'
					});
					table.datagrid("acceptChanges");
					table.datagrid("load");
					editFlag = 1;
					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
							{pbsVersionId:$("#pbsVersionId").val(),versionType:2,manHourType:2,projectId:projectId},
						function(obj){
							var pur = obj.PUR;
							var workMH = pur.WORKHOUR;
							var tripMH = pur.TRIPHOUR;
							baseNum = decimalHandel(workMH + tripMH,2) ;
							$("#procureButGrid").datagrid('reload');
						}
					);
					// 加载采购管理工时数据
				}else{
					$.messager.alert("提示","粘贴成功！！");
				}
			},"json");
		});
		
	};

	//加载总工时
var getPurSumManHour = function (){
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourSum",
				{pbsVersionId:pbsVersionId,versionType:2,projectId:projectId},
				function(obj){
					//总工时ID
					$("#manHourSumId").val(obj.ID);
					//开启了总工作工时
					if(obj.ISWORKENABLED == 1){
						$("#openPurWorkManHour")[0].checked = true;
						$("#purWorkManHour")[0].disabled=false;
						isWork=1;
					}else{
						$("#openPurWorkManHour")[0].checked = false;
						$("#purWorkManHour")[0].disabled = true;
						isWork=0;
					}
					$("#purWorkManHour").val(obj.WORKHOUR);
					//采购工作工时单价
					$("#purWorkManHourPrice").val(pricesArr['采购工作工时']);
					//总工作工时费用
					$("#purWorkCost").val(($("#purWorkManHour").val() * $("#purWorkManHourPrice").val()/10000).toFixed(2));
					
					//开启了采购出差总工时
					if(obj.ISTRIPENABLED == 1){
						$("#openPurTripManHour")[0].checked = true;
						$("#purTripManHour")[0].disabled=false;
						isTrip=1;
						$("#handleBar").hide();
					}else{
						$("#openPurTripManHour")[0].checked = false;
						$("#purTripManHour")[0].disabled = true;
						isTrip=0;
						$("#handleBar").show();
					}
					$("#purTripManHour").val(obj.TRIPHOUR);
					$("#purTripManHourPrice").val(pricesArr["采购出差工时"]);
					$("#purTripCost").val(($("#purTripManHour").val() * $("#purTripManHourPrice").val()/10000).toFixed(2));
					//开启采购，管理工时
					mngNum = obj.MANAGEHOUR;
			});
	};
	
	
	// 采购工作工时列表数据
	var loadTopDatas = function(){
		var purWorkPrice = pricesArr['采购工作工时'];//采购工时单价
		var zjWorkPrice= pricesArr['采购专家工时'];//专家工时单价
		$("#procureTopGrid").datagrid({
			url :  basePath+"/manHour/getManHourMore",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
			pageNumber : 1,
			pageSize: 10,
			pageList:[10,20,30,40,50],
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			rownumbers:true,
			queryParams:{manHourSumId:$("#manHourSumId").val(),versionType:2,pbsVersionId:pbsVersionId,projectId:projectId},
			toolbar:'#procureTopGrid_tb',
			columns:[[    
			          {field:'PPID', title:'采购ID',hidden:true},
			          {field:'PPCODE', title:'采购包号', width : 100, align : "center"}, 
			          {field:'PPNAME',title:'采购包名称',width : 130, align : "center"},
			          {field:'ESTPRICE',title:'控制价/估算(万)',width : 120,align : "center"},
			          {field:'UPDATECOSTCONTROL',title:'修改后控制价(万)',width : 120,align : "center",
			        	  editor:{type:'numberbox',options:{min:0,precision:2}}},
			          {field:'purQty',title:'采购工时(参考)',width : 100,align : "center",
			        	  formatter: function(value,row,index){//P*80%*10000/采购工时单价。
			        		  if(row.PPID == "合计"){
			        			  return value;
			        		  }
			        		 if(row.UPDATECOSTCONTROL && purWorkPrice){
			        			var P = manHourQuotiety(row.UPDATECOSTCONTROL);
								return (P*0.8*10000/purWorkPrice).toFixed(2);
			        		 }else{
			        			return "";
			        		 }			        	    
						  }
			          },{field:'TRAVELQTY',title:'采购工时',width : 100,align : "center",editor:{ type:'validatebox',
		        		  options:
		        		  {
		        			  min:0,max:9999999999,required:true,
		        			  validType : [ "positive_double"],
		        		  }}
			          },
			          {field:'EXPERTQTY',title:'专家工时',width : 100,align : "center",editor:{ type:'validatebox',
		        		  options:
		        		  {
		        			  min:0,max:9999999999,required:true,
		        			  validType : [ "positive_double"],
		        		  }}},
			          {field:'purPrice', title:'采购工时单价',width : 110,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(row.PPID == "合计"){
			        			  return "";
			        		  }
			        		  if(purWorkPrice){
			        			  return purWorkPrice;
			        		  }else{
			        			  return "";
			        		  }
		        	      }
			          },
			          {field:'expertPrice',title:'专家工时单价', width : 110,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(row.PPID == "合计"){
			        			  return "";
			        		  }
			        		  if(zjWorkPrice){
			        			  return zjWorkPrice;
			        		  }else{
			        			  return "";
			        		  }
			        	  }
			          },
			          {field:'budgetCost',title:'预算费用(万)', width : 110,align : "center",//（采购工时*采购单价+专家工时*专家费用）/10000
				          formatter: function(value,row,index){
			        		  if(row.PPID == "合计"){
			        			  return value;
			        		  }
			        		  var qty = 0;var est = 0;
			        		  if(row.EXPERTQTY){
			        			  qty = row.EXPERTQTY;
			        		  }
			        		  if(row.ESTPRICE > 0 || row.UPDATECOSTCONTROL > 0){
		        		  		  if(row.UPDATECOSTCONTROL > 0){
		        		  			 est = row.UPDATECOSTCONTROL;
		        		  		  }else{
		        		  			 est = row.ESTPRICE;
		        		  		  }
			        		  }
		        			  var P = manHourQuotiety(est);
		        			  return ((row.TRAVELQTY*purWorkPrice+qty*pricesArr['采购专家工时'])/10000).toFixed(2);
			        		  
						  }
			          },
			          {field:'PERIOD', title:'采买周期(天)',width : 100,align : "center",editor:{type:'numberbox',options:{precision:1,required:true}}},
			          {field:'REMARK',title:'备注',align : "center",width : 180,editor:{type:'text'}}
			      ]],
					onClickRow:function(index, row){
						 $(this).datagrid('endEdit', editIndex);
					},
					onDblClickRow:function(index, row){
						if(isWork==0){							
							if($(this).datagrid('getEditors',editIndex).length < 1){
								$(this).datagrid('beginEdit', index);
								editIndex = index;
							}
						}
					},
					onAfterEdit:function(rowIndex, rowData, changes){  //行编辑完成事件
					    var inserted = $(this).datagrid('getChanges', 'inserted');  
					    var updated = $(this).datagrid('getChanges', 'updated');  
					    if (inserted.length < 1 && updated.length < 1) {  
					        //editRow = undefined;  
					        $(this).datagrid('unselectAll');  
					        return;  
					    } 
					}
		});
		
		//点击“保存采购工作人工时”
		$("#savePurManHour").click(function() {
	    		$("#procureTopGrid").datagrid('endEdit', editIndex);
	    		if($("#procureTopGrid").datagrid('getEditors',editIndex).length < 1){
	    			rows = $("#procureTopGrid").datagrid("getChanges");
	    		  	var data = new Object();
	    			data.pbsVersionId = $("#pbsVersionId").val();//版本
	    			data.manHourSumId = $("#manHourSumId").val();//总工时记录id
	    			data.isWorkEnabled = $("#openPurWorkManHour")[0].checked ? 1 : 0;//是否开启工作工时
	    			data.workHour = $("#purWorkManHour").val();//工作工时
	    			data.versionType = 2;//采购工时
	    			data.manHourType = 3;//工作
	    			for ( var i in rows) {
	    				data["manHourList[" + i + "].id"] = rows[i].ID;
	    				data["manHourList[" + i + "].packageId"] = rows[i].PACKAGEID;	//采购包Id    	
	    				data["manHourList[" + i + "].period"] = rows[i].PERIOD;	//采买周期  
	    				data["manHourList[" + i + "].updateCostControl"]=rows[i].UPDATECOSTCONTROL;
	    				data["manHourList[" + i + "].travelQty"] = rows[i].TRAVELQTY;//工作工时
	    				data["manHourList[" + i + "].expertQty"] = rows[i].EXPERTQTY;//专家工时
	    				data["manHourList[" + i + "].remark"] = rows[i].REMARK;//备注
	    			}
	    			
	    			$.ajax({
	    				url : basePath + "/manHour/saveManhour",
	    				method : "post",
	    				data : data,
	    				success : function(obj) {
	    					$.messager.show({
	    						title : '提示',
	    						msg : '保存成功！',
	    						timeout : 3000,
	    						showType : 'slide'
	    					});
	    					$("#procureTopGrid").datagrid("reload");
	    					editFlag = 1;
	    					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
	    							{pbsVersionId:$("#pbsVersionId").val(),versionType:2,manHourType:2,projectId:projectId},
	    						function(obj){
	    							var pur = obj.PUR;
	    							var workMH = pur.WORKHOUR;
	    							var tripMH = pur.TRIPHOUR;
	    							baseNum = decimalHandel(workMH + tripMH,2) ;
	    							$("#procureButGrid").datagrid('reload');
	    						}
	    					);
	    				},
	    				error : function(xhr) {
	    					$.messager.alert("错误", "操作失败");
	    				}
	    			});
	    		}else{
	    			$.messager.alert("提示","请先填写正确的数据！");
	    		}
	    });
	};
	
	//计算工时系数:控制价*货物招标-速算扣除数（数算扣除数随货物招标变化而变化）
	var manHourQuotiety=function(value){
		var P = 0;
	    if(value<=100){
		  P= value*0.012;
		}else if(value>100 && value<=500){
		  P= value*0.0088+0.32;
		}else if(value>500 && value<=1000){
		  P= value*0.006+1.72;
		}else if(value>1000 && value<=5000){
		  P= value*0.004+3.72;
		}else if(value>5000 && value<=10000){
		  P= value*0.002+13.72;
		}else if(value>10000 && value<=100000){
		  P= value*0.0004+29.72;
		}else if(value>100000){
		  P= value*0.0001+59.72;
		}
	    return P;
	};
	
	
	//采购出差工时
	var loadCntDatas = function(){
		var purTripPrice = pricesArr['采购出差工时'];
		$("#procureCntGrid").datagrid({
			url :   basePath+"/manHour/getManHourMore",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
			pageNumber : 1,
			pageSize: 10,
			pageList:[10,20,30,40,50],
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			showFooter:true,
			rownumbers:true,
			queryParams:{manHourSumId:$("#manHourSumId").val(),manHourType:1,pbsVersionId:pbsVersionId,projectId:projectId},
			toolbar:'#procureCntGrid_tb',
			columns:[[
			          //{field:'tripPerson',title:'计划派出人员',width : 130,align : "center",editor:{type:'combobox',options:{data:personArray,valueField:'id',textField:'text'}}}, 
			          {field:'VSFID',
		        	  title:'计划派出人员',
		        	  width : 100,
		        	  align : "center",
		        	  formatter:function(value,row,index){
		        		  if(row.VSFID == "合计"){
		        			  return value;
		        		  }
		        		  return staffsArr[value];
		        	  },
		        	  editor:{
		                    type: "combobox",
		                    options: {
		                        panelHeight: "230",
		                        valueField: "id",
		                        textField: "text",
		                        data:staffs
		                    }
		                }},
			          {field:'POSITION',title:'岗位',width : 180,align : "center",
		                	formatter:function(value,row,index){
				        		  return projRoleArr[value];
				        	  },
				        	  editor:{
				        		  type: "combobox",
				                    options: {
				                        panelHeight: "230",
				                        valueField: "id",
				                        textField: "text",
				                        data:projRole,
				                        required:true
				                    }
				        }},
			          {field:'HOURPRICE',title:'工时单价(元/时)',width : 120,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return "";
			        		  }
			        		  if(purTripPrice){
			        			  return purTripPrice;
			        		  }else{
			        			  return "";
			        		  }
			        	  }
			          },
			          {field:'ARRIVALTIME',title:'预计到场时间',width : 120,align : "center",
			        	  editor:{type:'datebox',options:{required:true,validType:"date"}}},
			          {field:'LEAVETIME',title:'预计离场时间',width : 120,align : "center",
			        	  editor:{type:'datebox',options:{required:true,validType:["endTime","date"]}}},
		        	  {field:'TRAVELQTYDAY',title:'预计服务或出差时长(天)',align : "center",
		        		  formatter: function(value,row,index){
				        		var date1 = row.LEAVETIME;
								var date2 = row.ARRIVALTIME;
								if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
									var day = 1+Utils.GetDateDiff(date1,date2);
									return day;
								}
								return "";
				              }
		        		  },
			          {field:'TRAVELQTY',title:'工时',width : 120,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return value;
			        		  }
			        		  var date1 = row.LEAVETIME;
							  var date2 = row.ARRIVALTIME;
							  if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
								var day =1+ Utils.GetDateDiff(date1,date2);
								if(day){
				        			  return +day*8; 
				        		  }else{
				        			  return "";
				        		  }
							  }else{
								  return "";
							  }
						}},
			          {field:'BUDGETCOST',title:'预计费用(万)',width : 120,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return value;
			        		  }
			        		  var date1 = row.LEAVETIME;
			        		  var date2 = row.ARRIVALTIME;
							  if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
									var day = 1+Utils.GetDateDiff(date1,date2);
									if(day && purTripPrice){
					        			  return ((8*day*purTripPrice)/10000).toFixed(2);
					        		  }else{
					        			  return "";
					        		  }	
								}else{
									return "";
								}			        		  								
						}},
			          {field:'REMARK',title:'备注',width : 200,align : "center",editor:'text'}
			      ]],
				onClickRow:function(index, row){
					 $(this).datagrid('endEdit', editIndex1);
				},
				onDblClickRow:function(index, row){
					if(isTrip==0){
						if($(this).datagrid('getEditors',editIndex1).length < 1){
			    			  $(this).datagrid('beginEdit', index);
			    			  editIndex1 = index;
			    		  }
					}
				},
				onBeforeEdit: function(index, row){
			    	  $.extend($.fn.datebox.defaults.rules, {
			    			endTime :{ 
			    			        validator : function(value){ 
			    			        	var table =  $(this).parents(".datagrid-view").find("#datagrid-row-r2-2-"+index);
			  		    	  			var startDate = table.find("td[field='ARRIVALTIME']").find(".textbox-value").val();
			    			    	  	var d1 = $.fn.datebox.defaults.parser(startDate);
				  	  			      	var d2 = $.fn.datebox.defaults.parser(value);
				  	  			      	var rs=d2>d1;
				  	  			      	return rs;
			  	  			      	
			    			        }, 
			    			        message : '结束时间必须大于开始时间'    
			    			},
			    	  });
			      }
		});
		
		// 点击"保存采购出差人工时"
		$("#savePurTripHour").on("click", function(){
    			$("#procureCntGrid").datagrid('endEdit', editIndex);
        		if($("#procureCntGrid").datagrid('getEditors',editIndex).length < 1){
        			var tpRows = $("#procureCntGrid").datagrid("getChanges");
        			var data = new Object();
        			data.pbsVersionId = pbsVersionId;//版本
	    			data.manHourSumId = $("#manHourSumId").val();//总工时记录id
	    			data.isTripEnabled = $("#openPurTripManHour")[0].checked ? 1 : 0;//是否开启出差工时
	    			data.tripHour = $("#purTripManHour").val();//工作工时
	    			data.versionType = 2;//采购
	    			data.manHourType = 1;//出差
	    			for ( var i in tpRows) {
	    				var day ;
	    				var date1 = tpRows[i].LEAVETIME;
		        		var date2 = tpRows[i].ARRIVALTIME;
						if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
						   day = 1+Utils.GetDateDiff(date1,date2);
						}
	    				if (tpRows[i].ID != undefined) {
	    					data["manHourList[" + i + "].id"] = tpRows[i].ID;
	    				}
	    				data["manHourList[" + i + "].staffId"] = tpRows[i].VSFID;//人员Id
	    				data["manHourList[" + i + "].projRoleId"] = tpRows[i].POSITION;//岗位Id
	    				data["manHourList[" + i + "].arrivalTime"] = tpRows[i].ARRIVALTIME;//入场时间
	    				data["manHourList[" + i + "].leaveTime"] = tpRows[i].LEAVETIME;//出场时间
	    				data["manHourList[" + i + "].travelQtyDay"] = day;//出差时长
	    				data["manHourList[" + i + "].travelQty"] = +day * 8;//工时
	    				data["manHourList[" + i + "].remark"] = tpRows[i].REMARK;//备注
	    			}
	    			$.ajax({
	    				url : basePath + "/manHour/saveManhour",
	    				method : "post",
	    				data : data,
	    				success : function(obj) {
	    					$.messager.show({
	    						title : '提示',
	    						msg : '保存成功！',
	    						timeout : 3000,
	    						showType : 'slide'
	    					});
	    					$("#procureCntGrid").datagrid("reload");
	    					editFlag = 1;
	    					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
	    							{pbsVersionId:$("#pbsVersionId").val(),versionType:2,manHourType:2,projectId:projectId},
	    						function(obj){
	    							var pur = obj.PUR;
	    							var workMH = pur.WORKHOUR;
	    							var tripMH = pur.TRIPHOUR;
	    							baseNum = decimalHandel(workMH + tripMH,2) ;
	    							$("#procureButGrid").datagrid('reload');
	    						}
	    					);
	    					
	    				},
	    				error : function(xhr) {
	    					$.messager.alert("错误", "操作失败");
	    				}
	    			});
	    		}else{
	    			$.messager.alert("提示","请先填写正确的数据！");
	    		}
		});
		
	};
	
	
	//采购管理工时
	var loadButDatas = function(){
		//采购管理工时单价
		mngHourPrice = pricesArr['采购管理工时'];
		//获取采购管理工时基数
		Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
				{pbsVersionId:$("#pbsVersionId").val(),versionType:2,manHourType:2,projectId:projectId},
			function(obj){
				var pur = obj.PUR;
				var workMH = pur.WORKHOUR;
				var tripMH = pur.TRIPHOUR;
				baseNum = decimalHandel(workMH + tripMH,2) ;
			}
		);
		
		$("#procureButGrid").datagrid({
			url : basePath+"/manHour/getManageManHour",
			pagination : false,
			singleSelect : true,
			fit : true,
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			queryParams:{pbsVersionId:pbsVersionId,versionType:2,mgnType:2,projectId:projectId},
			toolbar:'#procureBotGrid_tb',
			//data:[{id:$("#manHourSumId").val(),name:'采购管理工时',param:mngNum,baseNum:baseNum,mngHourPrice:mngHourPrice}],
			columns:[[    
			          { field:'summaryId',title:'总工时ID', hidden:'true'},
			          { field:'id',title:'管理工时ID', hidden:'true'},
			          { field:'name',title:'名称', width : 200,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(value){
			        			  return "采购管理工时-"+value;
			        		  }
			        	   }
			          }, 
			          {field:'num',title:'系数(%)',width : 180,align : "center",
			        	  editor:
			        	  {
			        		  type:'validatebox',
			        		  options:
			        		  {
			        			  min:0,max:100,required:true,
			        			  validType : [ "positive_double"],
			        		  }
			              },
			        	  formatter: function(value,row,index){
			            	  if(value){
			            		  return decimalHandel(value,2);
			            	  } else{
			            		  return 0;
			            	  }
			              }},
			          {field:'baseNum',title:'基数(采购工作工时+采购出差工时)',width : 220,align : "center",
			        		  formatter: function(value,row,index){
				        		  return baseNum;
				        	  }	  
			          },
			          {field:'unitPrice',title:'工时单价(元/时)',width : 120,align : "center"},
			          {field:'sumManHour',title:'总工时',width : 120, align : "center",//总工时=基数*系数
			        	  formatter: function(value,row,index){
			        		  var rs = 0;
			        		  if(row.num){
			        			  rs = decimalHandel(row.num* baseNum/100,2) ;
			        		  }
			        		  return rs;
			        	  }
			          },
			          {field:'cost',title:'预计费用(万)',width : 120,align : "center",//费用=总工时*工时单价/10000
			        	  formatter: function(value,row,index){
			        		  var rs = "";
			        		  if(row.num && row.unitPrice){
			        			  rs = (row.num * baseNum/100  * row.unitPrice/10000).toFixed(2);
			        		  }
			        		  return rs;
			              }
			          }
			      ]],
			      onClickRow:function(){
		    		 $(this).datagrid('endEdit', editIndex2);
		    		  
			      },
			      onDblClickRow:function(index,field,value){
			    	  if($(this).datagrid('getEditors',editIndex2).length < 1){
			    		  $(this).datagrid('beginEdit', index);
				    	  editIndex2 = index;
			    	  }
			      },
			      onEndEdit: function(index, row, changes){
			    	  updateRatio(baseNum,row.num * baseNum /100,row.num/100,index,1);
			      },
			      onLoadSuccess: function(data){
			    	  if(editFlag == 1){
			    		  var rows = $(this).datagrid('getRows');
				    	  for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							updateRatio(baseNum,row.num * baseNum /100,row.num/100,i,2);
							if(i == rows.length - 1){
								setTimeout("autoSave()",100);
							}
				    	  }
			    	  }
			      }
		});
		
		// 点击"保存采购管理人工时"
		$("#savePurManage").on("click", function(){
			$("#procureButGrid").datagrid('endEdit', editIndex2);
    		if($("#procureButGrid").datagrid('getEditors',editIndex2).length < 1){
    			var rows = $("#procureButGrid").datagrid("getChanges");
    			if(editFlag == 1){
					rows = $("#procureButGrid").datagrid("getRows");
				}
    			if(rows.length < 1){
    				return;
    			}
    			var data = new Object();
    			/*data.pbsVersionId = $("#pbsVersionId").val();
    			data.manHourSumId = $("#manHourSumId").val();
    			data.versionType = 2; //采购
    			data.manHourType = 2; //管理
    			data.manageHour =rows[0].param;//系数
    			$.messager.progress({
    				interval:100,
    				text:'正在处理中'
    			});*/
    			for(var i in rows){ 
    				data["manageManHourList[" + i + "].id"] = rows[i].id; //记录Id					
    				data["manageManHourList[" + i + "].type"] = 2;//采购管理
    				data["manageManHourList[" + i + "].summaryId"] = rows[i].summaryId;//总工时id
    				if(undefined != rows[i].num)
    					data["manageManHourList[" + i + "].quotient"] = rows[i].num;//系数值
    			}
    			
    			$.ajax({
    				url : basePath + "/manHour/saveManageManhour",
    				method : "post",
    				data : data,
    				beforeSend:function() {
    					if(editFlag == 1){
    						MyMessager.prog.show("提示","请等待","管理工时正在自动调整...");
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
    								msg : '管理工时系数已自动调整',
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
        					$("#procureButGrid").datagrid("reload");
    					}else{
    						$.messager.alert("错误", "操作失败");
    					}
    				},
    				error : function(xhr) {
    					$.messager.alert("错误", "操作失败");
    				}
    			});
    			
    			
    		}else{
    			$.messager.alert("提示","请先填写正确的数据！");
    		}
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

//是否开启采购工作工时
function ispurWorkManHour(obj){
	if(obj.checked){
		$("#purWorkManHour")[0].disabled = false;
		isWork=1;
	}else{
		$("#purWorkManHour")[0].disabled = true;
		isWork=0;
	}
}

//是否开启采购出差工时
function ispurTripManHour(obj){
	if(obj.checked){
		$("#purTripManHour")[0].disabled = false;
		isTrip=1;
		$("#handleBar").hide();
	}else{
		$("#purTripManHour")[0].disabled = true;
		isTrip=0;
		$("#handleBar").show();
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
		$("#procureButGrid").datagrid('updateRow',{
			index: index,
			row: {
				num: value/baseNum*100,
			}
		});
		if(type == 1){
			$.messager.show({
				title : '提示',
				msg : '管理工时数必须为8的倍数，系数已自动调整',
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
	$("#savePurManage").click();
}
$(function(){
	procureManHour.init();
});