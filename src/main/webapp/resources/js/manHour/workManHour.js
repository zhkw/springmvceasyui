/**
 * 施工人工时界面js
 */
var basePath = $("#basePath").val();//项目根目录
var pbsVersionId =  $("#pbsVersionId").val();//pbs版本Id
var projectId = $("#projectId").val();//项目Id
var editIndex;
var manHourPrice ="";
var constructPrice ;
var roleArray = new Array();
var mngNum;
var baseNum;  //管理工时基数
var mngHourPrice;
var projRole;//人员岗位
var projRoleArr = new Array();
var isWork =0;
var isTrip =0;
var prices ; //价格信息
var pricesArr = new Array(); //价格信息
var staffs ; //人员信息
var staffsArr = new Array(); //人员信息
var editFlag = 0;
var workManHour = function(){
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
		getSumManHour();	
		// 加载施工工作
		loadWorsDatas();
		//加载施工出差
		loadTripDatas();
		//加载施工管理
		loadMngDatas();
		
		
	};
	
	//加载总工时
	var getSumManHour = function (){
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourSum",
				{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
				function(obj){
					$("#manHourSumId").val(obj.ID);
					//工作
					if(obj.ISWORKENABLED == 1){
						$("#isWorkSum")[0].checked = true;
						$("#contWorkManHour")[0].disabled=false;
						isWork=1;
					}else{
						$("#isWorkSum")[0].checked = false;
						$("#contWorkManHour")[0].disabled = true;
						isWork=0;
					}
					$("#contWorkManHour").val(obj.WORKHOUR);
					$("#contWorkPrice").val(pricesArr["施工工作工时"]);
					$("#contWorkPriceSum").val(($("#contWorkManHour").val() * $("#contWorkPrice").val()/10000).toFixed(2));
					
					//出差
					if(obj.ISTRIPENABLED == 1){
						$("#isTripSum")[0].checked = true;
						$("#contTripManHour")[0].disabled=false;
						isTrip = 1;
						$("#handleBar").hide();
					}else{
						$("#isTripSum")[0].checked = false;
						$("#contTripManHour")[0].disabled = true;
						isTrip = 0;
						$("#handleBar").show();
					}
					$("#contTripManHour").val(obj.TRIPHOUR);
					$("#contTripPrice").val(pricesArr["施工出差工时"]);
					$("#contTrippriceSum").val(($("#contTripManHour").val() * $("#contTripPrice").val()/10000).toFixed(2));
					
					//管理
					mngNum = obj.MANAGEHOUR;
			});
	};

	// 施工工作工时
	var loadWorsDatas = function(){
		constructPrice = pricesArr["施工工作工时"];
		$("#conWorkGrid").datagrid({
			url :  basePath+"/manHour/getManHourMore",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
			pageNumber : 1,
			pageSize: 10,
			pageList:[10,20,30,40,50],
			showFooter:true,
			idField : "id",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			rownumbers:true,
			queryParams:{manHourSumId:$("#manHourSumId").val(),versionType:3,pbsVersionId:pbsVersionId,projectId:projectId},
			toolbar:'#conWorkGrid_tb',
			columns:[[    
			          {field:'CPID',title:'标段ID',hidden:'true'},
			          {field:'CPCODE',title:'标段号',width : 100,align : "center"}, 
			          {field:'CPNAME',title:'标段名称',width : 180,align : "center"},
			          {field:'ESTPRICE',title:'控制价/估算(万)',width : 120,align : "center"},
			          {field:'UPDATECOSTCONTROL',title:'修改后控制价(万)',width : 120,align : "center",
			        	  editor:{type:'numberbox',options:{min:0,precision:2}}},
			          {field:'workQty',title:'施工工时(参考)',width : 120,align : "center",
			        	  formatter: function(value,row,index){//P*80%*10000/采购工时单价。
			        		  if(row.CPID == "合计"){
			        			  return value;
			        		  }
			        		  if(row.UPDATECOSTCONTROL && constructPrice){
			        			  var P = manHourQuotiety(row.UPDATECOSTCONTROL);
			        			  return (P*0.8*10000/constructPrice).toFixed(2);
			        		  }else{
			        			  return 0.0;
			        		  }
			        		
						  }
			          },
			          {field:'TRAVELQTY',title:'施工工时',width : 120,align : "center",
			        	  editor:{ type:'validatebox',
			        		  options:
			        		  {
			        			  min:0,max:9999999999,required:true,
			        			  validType : [ "positive_double"],
			        		  }}
			          },
			          {field:'EXPERTQTY',title:'专家工时',width : 120,align : "center",
			        	  editor:{ type:'validatebox',
			        		  options:
			        		  {
			        			  min:0,max:9999999999,required:true,
			        			  validType : [ "positive_double"],
			        		  }},},
			          {field:'constructPrice',title:'施工工时单价',width : 120,align : "center",
			        	  formatter:function(value,row,index){
			        		  if(row.CPID == "合计"){
			        			  return "";
			        		  }
			        		  return constructPrice;
			          }},
			          {field:'expertPrice',title:'专家工时单价',width : 120,align : "center",
			        	  formatter:function(value,row,index){
			        		  if(row.CPID == "合计"){
			        			  return "";
			        		  }
			        		  return pricesArr['施工专家工时'];
			          }},
			          {field:'budgetCost',title:'预算费用(万)', width : 120,align : "center",//（施工工时*施工单价+专家工时*专家工时单价）/10000
			        	  formatter: function(value,row,index){
			        		  if(row.CPID == "合计"){
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
		        			  return ((row.TRAVELQTY*constructPrice+qty*pricesArr['施工专家工时'])/10000).toFixed(2);
			        		  
						  }
			          },
			          {field:'PERIOD',title:'招标周期(天)',width : 120,align : "center", editor:{type:'numberbox',options:{required:true}}},
			          {field:'REMARK',title:'备注',align : "center",width : 180,editor:"text"}
		      ]],
		      onClickRow:function(){
	    		 $(this).datagrid('endEdit', editIndex);
	    		  
		      },
		      onDblClickRow:function(index,field,value){
		    	  if(isWork==0){		    		  
		    		  if($(this).datagrid('getEditors',editIndex).length < 1){
		    			  $(this).datagrid('beginEdit', index);
		    			  editIndex = index;
		    		  }
		    	  }
		      },
		      onLoadSuccess:function(data){
				if(data.total==0){
					//新增成功
					$('#procureTopGrid').datagrid('load');
				}
			}
		});
		
		//保存施工工作工时
		$("#saveConWork").click(function(){
    		$("#conWorkGrid").datagrid('endEdit', editIndex);
    		if($("#conWorkGrid").datagrid('getEditors',editIndex).length < 1){
    			var rows = $("#conWorkGrid").datagrid("getChanges");
    			var data = new Object();
    			data.pbsVersionId = pbsVersionId;
    			data.manHourSumId = $("#manHourSumId").val();
    			data.isWorkEnabled = $("#isWorkSum")[0].checked ? 1 : 0;
    			data.workHour = $("#contWorkManHour").val();
    			data.versionType = 3; //施工
    			data.manHourType = 3; //工作
    			for(var i in rows){
					data["manHourList[" + i + "].id"] = rows[i].ID;
    				data["manHourList[" + i + "].period"] = rows[i].PERIOD;
    				data["manHourList[" + i + "].expertQty"] = rows[i].EXPERTQTY;
    				data["manHourList[" + i + "].travelQty"] = rows[i].TRAVELQTY;//工作工时
    				data["manHourList[" + i + "].updateCostControl"]=rows[i].UPDATECOSTCONTROL;
    				data["manHourList[" + i + "].remark"] = rows[i].REMARK;
    			}
    			$.messager.progress({
					interval:100,
					text:'正在处理中'
				});
    			
    			$.ajax({
    				url : basePath + "/manHour/saveManhour",
    				method : "post",
    				data : data,
    				success : function(obj) {
    					$.messager.progress('close');
    					if(obj.rs == 0){
	    					$.messager.show({
	    						title : '提示',
	    						msg : '保存成功！',
	    						timeout : 3000,
	    						showType : 'slide'
	    					});
	    					$("#conWorkGrid").datagrid("acceptChanges");
	    					$("#conWorkGrid").datagrid("load");
	    					editFlag = 1;
	    					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
	    							{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
	    						function(obj){
	    							var cons = obj.CONST;
	    							var workMH = cons.WORKHOUR;
	    							var tripMH = cons.TRIPHOUR;
	    							baseNum = decimalHandel(workMH + tripMH,2);
	    							$("#conMngGrid").datagrid("reload");
	    						}
	    					);
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
	
	var manHourQuotiety=function(value){
		var P=0;
		if(value<=100){
			  P= value*0.008;
		  }else if(value>100 && value<=500){
			  P= value*0.0056+0.24;
		  }else if(value>500 && value<=1000){
			  P= value*0.0044+0.84;
		  }else if(value>1000 && value<=5000){
			  P= value*0.0028+2.44;
		  }else if(value>5000 && value<=10000){
			  P= value*0.0016+8.44;
		  }else if(value>10000 && value<=100000){
			  P= value*0.0004+20.44;
		  }else if(value>100000){
			  P= value*0.0001+50.44;
		  }
		return P;
	};
	
	//施工出差工时
	var loadTripDatas = function(){
		var tripPrice = pricesArr["施工出差工时"];
		var arrivalTime = 1;
		var leaveTime;
		
		$("#conTripGrid").datagrid({
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
			toolbar:'#conTripGrid_tb',
			columns:[[    
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
			          {field:'TRIPPRICE',title:'工时单价(元/时)',width : 120,align : "center",formatter:function(value,row,index){
			        	  if(row.VSFID == "合计"){
		        			  return "";
		        		  }
			        	  return tripPrice;
			          }},
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
							}else{
								return "";
							}							
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
								var day = 1+Utils.GetDateDiff(date1,date2);
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
									if(day && tripPrice){
					        			  return ((8*day*tripPrice)/10000).toFixed(2);
					        		  }else{
					        			  return "";
					        		  }	
								}else{
									return "";
								}
									
						}},
			          {field:'REMARK',title:'备注',align : "center",width:200,editor:'text'}
		      ]],
		      onClickRow:function(){
	    		 $(this).datagrid('endEdit', editIndex);
	    		  
		      },
		      onDblClickRow:function(index,field,value){
		    	  if(isTrip==0){		    		  
		    		  if($(this).datagrid('getEditors',editIndex).length < 1){
		    			  $(this).datagrid('beginEdit', index);
		    			  editIndex = index;
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
		      },
				
		});
		
		//保存出差工时
		$("#saveConTrip").click(function(){
    		$("#conTripGrid").datagrid('endEdit', editIndex);
    		if($("#conTripGrid").datagrid('getEditors',editIndex).length < 1){
    			var rows = $("#conTripGrid").datagrid("getChanges");
    			var data = new Object();
    			data.pbsVersionId = pbsVersionId;
    			data.manHourSumId = $("#manHourSumId").val();
    			data.isTripEnabled = $("#isTripSum")[0].checked ? 1 : 0;
    			data.tripHour = $("#contTripManHour").val();
    			data.versionType = 3; //施工
    			data.manHourType = 1; //出差
    			for(var i in rows){
    				var day ;
    				var date1 = rows[i].LEAVETIME;
	        		var date2 = rows[i].ARRIVALTIME;
					if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
					   day = 1+Utils.GetDateDiff(date1,date2);
					}
    				if (rows[i].ID != undefined) {
    					data["manHourList[" + i + "].id"] = rows[i].ID;
    				}
    				data["manHourList[" + i + "].staffId"] = rows[i].VSFID;
    				data["manHourList[" + i + "].projRoleId"] = rows[i].POSITION;//岗位Id
    				data["manHourList[" + i + "].arrivalTime"] = rows[i].ARRIVALTIME;
    				data["manHourList[" + i + "].leaveTime"] = rows[i].LEAVETIME;
    				data["manHourList[" + i + "].travelQtyDay"] = day;
    				data["manHourList[" + i + "].travelQty"] = +day * 8;
    				data["manHourList[" + i + "].ratio"] = rows[i].RATIO;
    				data["manHourList[" + i + "].remark"] = rows[i].REMARK;
    			}
    			$.ajax({
    				url : basePath + "/manHour/saveManhour",
    				method : "post",
    				data : data,
    				beforeSend: function() {
    		            MyMessager.prog.show("提示","请等待","数据处理中...");
    		        },
    		        complete: function() {
    		            MyMessager.prog.close();
    		        },
    				success : function(obj) {
    					if(obj.rs == 0){
    						$.messager.show({
        						title : '提示',
        						msg : '保存成功！',
        						timeout : 3000,
        						showType : 'slide'
        					});
        					$("#conTripGrid").datagrid("acceptChanges");
        					$("#conTripGrid").datagrid("load");
        					editFlag = 1;
        					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
        							{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
        						function(obj){
        							var cons = obj.CONST;
        							var workMH = cons.WORKHOUR;
        							var tripMH = cons.TRIPHOUR;
        							baseNum = decimalHandel(workMH + tripMH,2);
        							$("#conMngGrid").datagrid("reload");
        						}
        					);
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
		
		//增加
		$("#addConstruct").click(function(){
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
		//删除
		$("#deleteConstruct").click(function(){
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
							$.messager.progress({
								interval:100,
								text:'正在处理中'
							});
							$.post(basePath+"/manHour/deleteManHour","manHourId="+id,function(obj){
								$.messager.progress('close');
								if(obj.rs == 0){
									$.messager.show({
			    						title : '提示',
			    						msg : '删除成功！',
			    						timeout : 3000,
			    						showType : 'slide'
			    					});
									table.datagrid("acceptChanges");
									table.datagrid("load");
									editFlag = 1;
									Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
											{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
										function(obj){
											var cons = obj.CONST;
											var workMH = cons.WORKHOUR;
											var tripMH = cons.TRIPHOUR;
											baseNum = decimalHandel(workMH + tripMH,2);
											$("#conMngGrid").datagrid("reload");
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
		//复制
		$("#copyConstruct").click(function(){
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
		//粘贴
		$("#pasteConstruct").click(function(){
			var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
			var id = $("#copyId").val();
			if(id.length < 1){
				$.messager.alert("提示","请先复制一条数据");
				return;
			}
			$.messager.progress({
				interval:100,
				text:'正在处理中'
			});
			$.post(basePath+"/manHour/copyManhour","manHourId="+id,function(obj){
				$.messager.progress('close');
				if(obj.rs == 0){
					$.messager.show({
						title : '提示',
						msg : '粘贴成功！',
						timeout : 3000,
						showType : 'slide'
					});
					table.datagrid("acceptChanges");
					table.datagrid("load");
					//获取施工管理工时基数
					editFlag = 1;
					Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
							{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
						function(obj){
							var cons = obj.CONST;
							var workMH = cons.WORKHOUR;
							var tripMH = cons.TRIPHOUR;
							baseNum = decimalHandel(workMH + tripMH,2);
							$("#conMngGrid").datagrid("reload");
						}
					);
				}else{
					$.messager.alert("提示","粘贴成功！！");
				}
			},"json");
		});
	};
	
	
	//施工管理工时
	var loadMngDatas = function(){
		mngHourPrice = pricesArr['施工管理工时'];
		//获取施工管理工时基数
		Utils.ajaxJsonSync(basePath+"/manHour/getSumManHour",
				{pbsVersionId:pbsVersionId,versionType:3,projectId:projectId},
			function(obj){
				var cons = obj.CONST;
				var workMH = cons.WORKHOUR;
				var tripMH = cons.TRIPHOUR;
				baseNum = decimalHandel(workMH + tripMH,2);
			}
		);
		
		
		$("#conMngGrid").datagrid({
			url : basePath+"/manHour/getManageManHour",
			pagination : false,
			singleSelect : true,
			fit : true,
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			queryParams:{pbsVersionId:pbsVersionId,versionType:3,mgnType:3,projectId:projectId},
			toolbar:'#conMngGrid_tb',
			//data:[{id:$("#manHourSumId").val(),name:'施工管理人工时',num:mngNum,baseNum:baseNum,mngHourPrice:mngHourPrice}],
			columns:[[    
			          { field:'summaryId',title:'总工时ID', hidden:'true'},
			          { field:'id',title:'管理工时ID', hidden:'true'},
			          { field:'name',title:'名称', width : 200,align : "center",
			        	  formatter: function(value,row,index){
			        		  if(value){
			        			  return "施工管理工时-"+value;
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
			          {field:'baseNum',title:'基数(施工工作工时+施工出差工时)',width : 220,align : "center",
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
			        			  rs = (row.num * baseNum/ 100 * row.unitPrice/10000).toFixed(2);
			        		  }
			        		  return rs;
			              }
			          }
			      ]],
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
		
		
		//保存管理工时
		$("#saveConMng").click(function(){
    		$("#conMngGrid").datagrid('endEdit', editIndex);
    		if($("#conMngGrid").datagrid('getEditors',editIndex).length < 1){
    			var rows = $("#conMngGrid").datagrid("getChanges");
    			if(editFlag == 1){
					rows = $("#conMngGrid").datagrid("getRows");
				}
    			if(rows.length < 1){
    				return;
    			}
    			var data = new Object();
    			/*data.pbsVersionId = pbsVersionId;
    			data.manHourSumId = $("#manHourSumId").val();
    			data.versionType = 3; //施工
    			data.manHourType = 2; //管理
    			data.manageHour =rows[0].num;
    			$.messager.progress({
    				interval:100,
    				text:'正在处理中'
    			});*/
    			for(var i in rows){ 
    				data["manageManHourList[" + i + "].id"] = rows[i].id; //记录Id					
    				data["manageManHourList[" + i + "].type"] = 3;//施工管理
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
        					$("#conMngGrid").datagrid("reload");
    					}else{
    						$.messager.alert("错误", "保存数据失败");
    					}
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
		}
	};
	
}();

function getStartTime(){
	var startTimeInp =  $(this).parents(".datagrid-view").find("#_easyui_textbox_input3");
	return startTimeInp.val();
}
function getEndTime(){
	var endTimeInp =  $(this).parents(".datagrid-view").find("#_easyui_textbox_input4");
	return endTimeInp.val();
}
//是否开启施工工作工时
function isWorkManHour(obj){
	if(obj.checked){
		$("#contWorkManHour")[0].disabled = false;
		isWork=1;
	}else{
		$("#contWorkManHour")[0].disabled = true;	
		isWork=0;
	}
}

//是否开启施工出差工时
function isTripManHour(obj){
	if(obj.checked){
		$("#contTripManHour")[0].disabled = false;
		isTrip = 1;
		$("#handleBar").hide();
	}else{
		$("#contTripManHour")[0].disabled = true;
		isTrip = 0;
		$("#handleBar").show();
	}
}
//自动更新系数
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
		$("#conMngGrid").datagrid('updateRow',{
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
	$("#saveConMng").click();
}

$(function(){
	workManHour.init();
});