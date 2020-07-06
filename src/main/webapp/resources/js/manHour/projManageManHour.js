/**
 * 项目管理人工时界面js
 */
 
var basePath = $("#basePath").val();//项目根目录
var projectId=$("#projectId").val();
var pbsVersionId = $("#pbsVersionId").val();//pbs版本Id
var editIndex = 0; //正在编辑的行索引
var manHourSumId =""; //总工时id
var price; //项目管理工时单价
var price2 = 0; //项目管理出差工时单价
var price3 = 0; //项目管理工作工时单价
//wbs节点
var wbsNodes;
var wbsNodeId;
var MngTaskNodesArray = [];
var wbsTypeArr = new Array();
var projRole;//人员岗位
var projRoleArr = new Array();
var colArrayMng = new Array();
var gridColumns = new Array();
var showMajorListMng = "";
var isMng = 0;
var isTrip = 0;
var isWork = 0;
var prices ; //价格信息
var pricesArr = new Array(); //价格信息
var staffs ; //人员信息
var staffsArr = new Array(); //人员信息
var projManageManHour = function(){
	
	/**
	 * 页面初始化
	 */
	var initPage = function() {
		//初始化基础数据
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourBaseData?tag=3","",function(obj){
            //wbs
            wbsNodes = obj.task;
            for(var i in wbsNodes){
            	if (wbsNodes[i].text === '项目管理') {
            		wbsNodeId = wbsNodes[i].id;
				}
                MngTaskNodesArray[wbsNodes[i].id] = wbsNodes[i].text;
            }
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
				
		price = pricesArr['项目管理工时'];
		price2 = pricesArr['施工出差工时'];
		price3 = pricesArr['项目管理工作工时'];

        //隐藏列
        $("#checkMajor").html("");
        $("#checkMajor").css("display","none");
        gridColumns.push({field:'SUMMARYID',title:'总工时id',hidden:'true'});

        //动态添加表列
        Utils.ajaxJsonSync(basePath+"/manHour/getMajorInfo",
            "majorType=2",
            function(obj){
                if(null!=obj && obj!=undefined && obj!="" && obj.length>0){
                    for (var i = 0; i < obj.length; i++) {
                        gridColumns.push({ field:obj[i].ID,title:obj[i].MAJORNAME,width:'8%',
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

                        showMajorListMng +="<label style='margin-right:12px;'>" +
                            "<input type='checkbox' class='checkbox_input' " +
                            "  id='"+obj[i].ID+"' name='"+obj[i].MAJORNAME+"' value='"+obj[i].ID+"'>" +
                            "<span style='margin-left:-2px;'>"+obj[i].MAJORNAME+"</span>" +
                            "</label>";

                        var colObj = new Object();
                        colObj.id = obj[i].ID;
                        colObj.isCheck = 0;
                        colArrayMng.push(colObj);
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
                            for (var j = 0; j <colArrayMng.length ; j++) {
                                if(colArrayMng[j].isCheck==1){
                                    var qtyFiled = colArrayMng[j].id;
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
        var checkMajorBtn = "<div style='display:none;' id='isCheckAllMng'>全选</div>" +
            "<a class='iconBtn' title='全选/取消' id='checkAllBtnMng' style='width:65px;margin-left:8px;border-radius:5px;'><span class='btnDesc'>全选/取消</span></a>" +
            "<a class='iconBtn' title='反选' id='invertBtnMng' style='width:40px;margin-left:5px;border-radius:5px;'><span class='btnDesc'>反选</span></a>" +
            "<a class='iconBtn' title='确定' id='okBtnMng' style='width:40px;margin-left:5px;border-radius:5px;'><span class='btnDesc'>确定</span></a>";
        $("#checkMajorMng").html(showMajorListMng+checkMajorBtn);
		//加载总工时
		getSumManHour();
		// 加载数据
		loadDatas();
	};
	
	// 加载页面列表数据
	var loadDatas = function(){
		
		price = pricesArr['项目管理工时'];			
		
		$("#projManageGrid").datagrid({
			url :  $("#basePath").val()+"/manHour/getManHourMore",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			rownumbers:true,
			toolbar:'#projManageGrid_tb',
			queryParams:{manHourSumId:$("#sumHourOpen").val(),versionType:4,manHourType:2},
			columns:[[    
			          {
			        	  field:'VSFID',
			        	  title:'计划派出人员',
			        	  width : 200,
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
                                    filter: function(q, row){
                                        var opts = $(this).combobox('options');
                                        return row[opts.textField].indexOf(q) >= 0;//这里改成>=即可在任意地方匹配
                                    },
                                    data:staffs
			                    }
			                },
			          },
			          {field:'POSITION',title:'岗位',width : 130,align : "center",
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
			          {
			        	  field:'PRICE',
			        	  title:'工时单价',
			        	  width : 80,
			        	  align : "center",
			        	  formatter:function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return "";
			        		  }
			        		  return price;
			        	  }
					  },
					  {field:'ARRIVALTIME',title:'预计到场时间',width : 120,align : "center",
			        	  editor:{type:'datebox',options:{required:true,validType:"date"}}},
			          {field:'LEAVETIME',title:'预计离场时间',width : 120,align : "center",
			        	  editor:{type:'datebox',options:{required:true,validType:["endTime","date"]}}},
			          {
			        	  field:'TRAVELQTYDAY',
			        	  title:'预计服务或出差时长(天)',
			        	  width : 180,
			        	  align : "center",
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
			          {
			        	  field:'RATIO',
			        	  title:'本项目服务比例(%)',
			        	  width : 120,
			        	  align : "center",
			        	  editor:{type:'numberbox',options:{min:0,max:100,required:true}}
					  },
			          {
			        	  field:'TRAVELQTY',
			        	  title:'工时',
			        	  width : 90,
			        	  align : "center",
			        	  formatter:function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return value;
			        		  }
			        		  var rs = "";
			        		  var date1 = row.LEAVETIME;
								var date2 = row.ARRIVALTIME;
								if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
									var day = 1+Utils.GetDateDiff(date1,date2);
									if(day && row.RATIO){
					        			  rs = (8 * day * row.RATIO /100).toFixed(0) ;
					        		  }
								}			        		  
			        		  return rs;
			        	  }
					  },
			          {
			        	  field:'BUDGETCOST',
			        	  title:'预计工时费用(万)',
			        	  width : 120,
			        	  align : "center",
			        	  formatter:function(value,row,index){
			        		  if(row.VSFID == "合计"){
			        			  return value;
			        		  }
			        		  var rs = "";
			        		  var date1 = row.LEAVETIME;
								var date2 = row.ARRIVALTIME;
								if((null!=date1||undefined!=date1)&& (null!=date2||undefined!=date2)){
									var day = 1+Utils.GetDateDiff(date1,date2);
									if(day && row.RATIO){
					        			  rs = (8 * day * row.RATIO /100 * price /10000).toFixed(2) ;
					        		  }
								}
			        		  
			        		  return rs;
			        	  }
					  },
			          {
			        	  field:'REMARK',
			        	  title:'备注',
			        	  width : 200,
			        	  align : "center",
			        	  editor:'text'
					  }
		      ]],
		      onClickRow:function(){
	    		 $(this).datagrid('endEdit', editIndex);
	    		  
		      },
		      onDblClickRow:function(index,field,value){
		    	  if(isMng==0){		    		  
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
		    			        	var tr =  $(this).parents(".datagrid-view").find("#datagrid-row-r1-2-"+index);
		  		    	  			var startDate = tr.find("td[field='ARRIVALTIME']").find(".textbox-value").val();
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
		
		
		$("#projManageGrid2").datagrid({
			url :  $("#basePath").val()+"/manHour/getManHourMore",
			pagination : true,
			singleSelect : true,
			showFooter : true,
			fit : true,
			idField : "ID",
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			rownumbers:true,
			toolbar:'#projManageGrid_tb2',
			queryParams:{manHourSumId:$("#sumHourOpen").val(),versionType:4,manHourType:1},
			columns:[[    
		          {field:'VSFID',
	        	  title:'计划派出人员',
	        	  width : 200,
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
		        	  return price2;
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
								if(day && price2){
				        			  return ((8*day*price2)/10000).toFixed(2);
				        		  }else{
				        			  return 0;
				        		  }	
							}else{
								return 0;
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

        $("#projManageGrid3").datagrid({
            url :  basePath+"/manHour/getMngManhour",
            pagination : true,
            singleSelect : true,
            showFooter : true,
            fit : true,
            idField : "ID",
            loadMsg : '数据加载中,请稍候...',
            checkOnSelect : false,
            rownumbers:true,
            toolbar:'#projManageGrid_tb3',
			pageSize:20,
            queryParams:{
                manHourSumId:$("#manHourSumId").val(),
                versionType:4,
                majorType:2
            },
            frozenColumns : [[
				{field:'WBSNODEID',title:'WBS',hidden:true},
                {field:'PBSNODEID',title:'子项',width : '15%',halign :'center',align:'left',
                    formatter:function(value,row,index){
                        if(value == "合计" || value == "专业占总工时比例"){
                            return value;
                        }else if(value){
                            if(MngTaskNodesArray[value] != undefined){
                                return '<span title=\"' + MngTaskNodesArray[value] + '\" class=\"easyui-tooltip\">' + MngTaskNodesArray[value] + '</span>';
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

            onLoadSuccess:function(data){
                var footer = $(this).datagrid('getFooterRows');
                if(data.total>0&&footer[0].cost !=""&&footer[0].cost>0){
                    if(footer !=null &&  footer.length>1){
                        var footerRow = footer[0];
                        for(var j=0;j<colArrayMng.length;j++){
                            var qtyFiled = colArrayMng[j].id;
                            if(footerRow[qtyFiled]>0){
                                $("#projManageGrid3").datagrid("showColumn",qtyFiled);
                                colArrayMng[j].isCheck=1;
                                $("#"+qtyFiled+"").prop("checked",true);
                            }
                        }
                    }
                }
            },


            onClickRow:function(rowIndex, rowData){
                $(this).datagrid('endEdit', editIndex);
                if($("#projManageGrid3").datagrid('getEditors',editIndex).length < 1){
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
                pbsColum.editor = {
                    type: "combotree",
                    options: {
                        loadFilter: treeConstructor,
                        panelWidth:'200',
                        panelHeight:"auto",
                        panelMaxHeight:256,
                        data: wbsNodes,
                        value: row.PBSNODEID,
                        onBeforeSelect:function(row){
                            if(row.isLeaf === 0 || row.parentId == null){
                                return false;
                            }
                        },
                        onSelect: function(record){
                            wbsName = record.text;
                            row.PBSNODENAME = record.text;
                        }
                    }
                }
            },
            onAfterEdit: function(index, row, changes){
                var rows = $("#projManageGrid3").datagrid("getRows");
                for(var i = 0;i < rows.length;i++){
                    if(i != index){
                        if(row.PBSNODEID == rows[i].PBSNODEID){
                            $.messager.alert('提示','wbs节点和子项联合不能重复！');
                            editIndex = index;
                            $("#projManageGrid3").datagrid('beginEdit', index);
                            break;
                        }
                    }
                }
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



$(function(){
	
	projManageManHour.init();
    // 点击"显示/隐藏专业"
    $("#show_hide_Mng").on("click", function(){
        var title = $.trim($("#btnMng").html());
        if(title=="显示专业"){
            $("#checkMajorMng").css("display","block");
            $("#btnMng").html("隐藏专业");
        }
        if(title=="隐藏专业"){
            $("#checkMajorMng").css("display","none");
            $("#btnMng").html("显示专业");
        }
    });

    var checkbox=document.getElementById('checkMajorMng');//获取div
    var checked=checkbox.getElementsByTagName('input');//获取div下的checkbox

    //确定选中显示列
    $("#okBtnMng").on("click", function(){
        //获取选中的项
        for(var i=0;i<checked.length;i++){
            var obj = checked[i];
            isShowGridColumn(obj);
        }
        $("#checkMajorMng").css("display","none");
        $("#btnMng").html("显示专业");
        //$("#designParentGrid").datagrid('load');
    });

    //全选、不选
    $("#checkAllBtnMng").on("click", function(){
        var title = $.trim($("#isCheckAllMng").html());
        for(var i=0;i<checked.length;i++){
            if(title=='全选'){
                checked[i].checked=true;
            }
            if(title=='不选'){
                checked[i].checked=false;
            }
        }
        if(title=='全选'){
            $("#isCheckAllMng").html("不选");
        }
        if(title=='不选'){
            $("#isCheckAllMng").html("全选");
        }
        //$("#designParentGrid").datagrid('load');
    });
    //反选
    $("#invertBtnMng").on("click", function(){
        for(var i=0;i<checked.length;i++){
            if(checked[i].checked==true){
                checked[i].checked=false;
            }else{
                checked[i].checked=true;
            }
        }
        //$("#designParentGrid").datagrid('load');
    });

	//保存
	$("#saveManHour").click(function() {
        if (editIndex != undefined) {
    		$("#projManageGrid").datagrid('endEdit', editIndex);
    		if($("#projManageGrid").datagrid('getEditors',editIndex).length < 1){
    			rows = $("#projManageGrid").datagrid("getChanges");
    		  	var data = new Object();
    			data.pbsVersionId = $("#pbsVersionId").val();
    			data.manHourSumId = $("#sumHourOpen").val();
    			data.isManageEnabled = $("#sumHourOpen")[0].checked ? 1 : 0;
    			data.manageHour = $("#mngSumHour").val();
    			data.versionType = 4;//项目管理
    			data.manHourType = 2;//管理
    			for ( var i in rows) {
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
    				data["manHourList[" + i + "].travelQtyDay"] = +day;
    				data["manHourList[" + i + "].travelQty"] = (+day * 8 * rows[i].RATIO /100).toFixed(0)
    				data["manHourList[" + i + "].ratio"] = rows[i].RATIO;
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
	    					$("#projManageGrid").datagrid("acceptChanges");
	    					$("#projManageGrid").datagrid("load");
	    					getSumManHour();
    					}else{
    						$.messager.alert("提示", "保存");
    					}
    				},
    				error : function(xhr) {
    					$.messager.alert("错误", "操作失败");
    				}
    			});
    		}else{
    			$.messager.alert("提示","请先填写正确的数据！");
    		}
    		
    	}
    });
	
	//保存
	$("#saveManHour2").click(function() {
        if (editIndex != undefined) {
    		$("#projManageGrid2").datagrid('endEdit', editIndex);
    		if($("#projManageGrid2").datagrid('getEditors',editIndex).length < 1){
    			rows = $("#projManageGrid2").datagrid("getChanges");
    		  	var data = new Object();
    			data.pbsVersionId = $("#pbsVersionId").val();
    			data.manHourSumId = $("#sumHourOpen").val();
    			data.isTripEnabled = $("#sumHourOpen2")[0].checked ? 1 : 0;
    			data.tripHour = $("#mngSumHour2").val();
    			data.versionType = 4;//项目管理
    			data.manHourType = 1;//出差
    			for ( var i in rows) {
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
	    					$("#projManageGrid2").datagrid("acceptChanges");
	    					$("#projManageGrid2").datagrid("load");
	    					getSumManHour();
    					}else{
    						$.messager.alert("提示", "保存");
    					}
    				},
    				error : function(xhr) {
    					$.messager.alert("错误", "操作失败");
    				}
    			});
    		}else{
    			$.messager.alert("提示","请先填写正确的数据！");
    		}
    		
    	}
    });

    //点击“保存项目管理工作工时”
    $("#saveManHour3").click(function () {
        $("#projManageGrid3").datagrid('endEdit',editIndex);
        if($("#projManageGrid3").datagrid('getEditors',editIndex).length<1){
            var rows = [];
        	if (!$("#sumHourOpen3")[0].checked) {
                rows = $("#projManageGrid3").datagrid("getChanges");
			}
            var data = new Object();
            data.pbsversionId = $("#pbsVersionId").val();
            data.projectId = projectId;
            data.manHourSumId=$("#manHourSumId").val();
            data.isWorkEnabled=$("#sumHourOpen3")[0].checked ? 1 : 0;
            data.workHour=$("#mngSumHour3").val();
            data.versionType=4;//项目管理
            data.manHourType=3;//工作工时
            for(var i in rows){
                var rowIndex = $('#projManageGrid3').datagrid('getRowIndex',rows[i]);
                if(rows[i].ID != undefined){
                    data["manageWorkManHourList["+i+"].id"]=rows[i].ID;
                }
                data["manageWorkManHourList["+i+"].rowIndex"] = rowIndex;//记录索引
                data["manageWorkManHourList["+i+"].summaryId"] = rows[i].SUMMARYID;//总工时
                var wbsId = rows[i].WBSNODEID;
                var nodeType = wbsTypeArr[wbsId];
                var comeFrom = 2;
                if(nodeType  === '子项'){
                    comeFrom = 0;
                }

                //项目管理阶段下，无wbs阶段的id
                data["manageWorkManHourList["+i+"].wbsNodeId"] = rows[i].WBSNODEID;//wbs结点
                if(rows[i].PBSNODEID == null || rows[i].PBSNODEID == ""){
                    $.messager.alert("提示", "子项必填");
                    return;
                }

                data["manageWorkManHourList["+i+"].pbsNodeId"] = rows[i].PBSNODEID;//pbs结点
                data["manageWorkManHourList["+i+"].comeFrom"] = comeFrom;

                //专业
                for (var j = 0; j <colArrayMng.length ; j++) {
                    if(colArrayMng[j].isCheck==1){
                        var qtyFiled = colArrayMng[j].id;
                        data["manageWorkManHourList[" + i + "].mngMajorInfoList["+j+"].majorId"]= colArrayMng[j].id;//专业id
                        data["manageWorkManHourList[" + i + "].mngMajorInfoList["+j+"].qty"]= rows[i][qtyFiled];//专业工时
                    }
                }
            }

            $.messager.progress({
                interval:100,
                text:'正在处理中'
            });

            $.ajax({
                url : basePath + "/manHour/saveManageWorkManhour",
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
                        $("#projManageGrid3").datagrid("acceptChanges");
                        $("#projManageGrid3").datagrid("load");
                        getSumManHour();
                        //getSumManHour();
                        editFlag = 1
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

	//勾选填写总工时
	$("#sumHourOpen").click(function(){
		if(this.checked){
			$("#mngSumHour")[0].disabled = false;
			isMng=1;
			$("#handleBar").hide();
		}else{
			$("#mngSumHour")[0].disabled = true;
			isMng=0;
			$("#handleBar").show();
		}
	})
	
	$("#sumHourOpen2").click(function(){
		if(this.checked){
			$("#mngSumHour2")[0].disabled = false;
			isTrip=1;
			$("#handleBar2").hide();
		}else{
			$("#mngSumHour2")[0].disabled = true;
			isTrip=0;
			$("#handleBar2").show();
		}
	})

    $("#sumHourOpen3").click(function(){
        if(this.checked){
            $("#mngSumHour3")[0].disabled = false;
            isWork=1;
            $("#handleBarMng").hide();
            $("#checkMajorMng").css("display","none");
        }else{
            $("#mngSumHour3")[0].disabled = true;
            isWork=0;
            $("#handleBarMng").show();
        }
    });

	//增加
	$("#addMH").click(function(){
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
	})
	
	//增加
	$("#addMH2").click(function(){
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
	})

    // 管理工作工时点击"新增"
    $("#addMng").on("click", function(){
        var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
        table.datagrid("endEdit", editIndex);
        if(table.datagrid('getEditors',editIndex).length > 0){
            return;
        }
        table.datagrid('insertRow', {index:0,row:{
                NAME: "",
				WBSNODEID:wbsNodeId
            }});
        table.datagrid("beginEdit", 0);
        //给当前编辑的行赋值
        editIndex = 0;
    });

	//删除
	$("#deleteMH").click(function(){
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
							}else{
								$.messager.alert("提示","删除失败！");
							}
						},"json")
					}
				}
			});
		}else{
			$.messager.alert("提示","请选择一行数据");
		}
	})
	
	//删除
	$("#deleteMH2").click(function(){
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
							}else{
								$.messager.alert("提示","删除失败！");
							}
						},"json")
					}
				}
			});
		}else{
			$.messager.alert("提示","请选择一行数据");
		}
	})

    // 点击"删除"
    $("#deleteMng").on("click", function(){
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
                        $.post(basePath+"/manHour/deleteManageManHour",
                            "manageId="+rowId,
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

	//复制
	$("#copyMH").click(function(){
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
	})
	
	//复制
	$("#copyMH2").click(function(){
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
			$("#copyId2").val(row.ID);
			$.messager.show({
				title : '提示',
				msg : '复制成功！',
				timeout : 3000,
				showType : 'slide'
			});
		}else{
			$.messager.alert("提示","请选择一行数据");
		}
	})
	
	//粘贴
	$("#pasteMH").click(function(){
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
			$.messager.progress("close");
			if(obj.rs == 0){
				$.messager.show({
					title : '提示',
					msg : '粘贴成功！',
					timeout : 3000,
					showType : 'slide'
				});
				table.datagrid("acceptChanges");
				table.datagrid("load");
			}else{
				$.messager.alert("提示","粘贴成功！！");
			}
		},"json");
	});
	
	//粘贴
	$("#pasteMH2").click(function(){
		var table = $(this).parents(".datagrid-toolbar").next(".datagrid-view").find(".datagrid-f");
		var id = $("#copyId2").val();
		if(id.length < 1){
			$.messager.alert("提示","请先复制一条数据");
			return;
		}
		$.messager.progress({
			interval:100,
			text:'正在处理中'
		});
		$.post(basePath+"/manHour/copyManhour","manHourId="+id,function(obj){
			$.messager.progress("close");
			if(obj.rs == 0){
				$.messager.show({
					title : '提示',
					msg : '粘贴成功！',
					timeout : 3000,
					showType : 'slide'
				});
				table.datagrid("acceptChanges");
				table.datagrid("load");
			}else{
				$.messager.alert("提示","粘贴成功！！");
			}
		},"json");
	});

	//自动生成工作工时
	$("#buildProjectManagement").click(function(){
		generateManageHour();
	});
});

function getSumManHour(){
	
	Utils.ajaxJsonSync(basePath+"/manHour/getManHourSum",
			{pbsVersionId:$("#pbsVersionId").val(),versionType:4},
			function(obj){
                $("#manHourSumId").val(obj.ID);
				$("#sumHourOpen").val(obj.ID);
				/////////////////////////////////////
				if(obj.ISMANAGEENABLED == 1){
					$("#sumHourOpen")[0].checked = true;
					$("#mngSumHour")[0].disabled=false;
					isMng=1;
					$("#handleBar").hide();
				}else{
					$("#sumHourOpen")[0].checked = false;
					$("#mngSumHour")[0].disabled = true;
					isMng=0;
					$("#handleBar").show();
				}
				$("#mngSumHour").val(obj.MANAGEHOUR);
				$("#mngSumHourPrice").val(price);
				$("#mngSumPrice").val(($("#mngSumHour").val() * price/10000).toFixed(2));
				/////////////////////////////////////
				if(obj.ISTRIPENABLED == 1){
					$("#sumHourOpen2")[0].checked = true;
					$("#mngSumHour2")[0].disabled=false;
					isTrip=1;
					$("#handleBar2").hide();
				}else{
					$("#sumHourOpen2")[0].checked = false;
					$("#mngSumHour2")[0].disabled = true;
					isTrip=0;
					$("#handleBar2").show();
				}
				$("#mngSumHour2").val(obj.TRIPHOUR);
				$("#mngSumHourPrice2").val(price2);
				$("#mngSumPrice2").val(($("#mngSumHour2").val() * price2/10000).toFixed(2));
				///////////////////////////////////
            	if (obj.ISWORKENABLED == 1) {
                    $("#sumHourOpen3")[0].checked = true;
                    $("#mngSumHour3")[0].disabled=false;
                    isWork=1;
                    $("#handleBarMng").hide();
                }else {
                    $("#sumHourOpen3")[0].checked = false;
                    $("#mngSumHour3")[0].disabled=true;
                    isWork=0;
                    $("#handleBarMng").show();
				}
            	//////////////////////////////////
                $("#mngSumHour3").val(obj.WORKHOUR);
                //设计工作工时单价
                $("#mngSumHourPrice3").val(price3);
                //总工作工时费用
                $("#mngSumPrice3").val(($("#mngSumHour3").val() * price3/10000).toFixed(2));
		});
}
/**
 * 是否显示专业到表格列上
 * @param obj 当前对象
 */
function isShowGridColumn(obj){
    var colId = $(obj).val();
    var isCheck = 1;
    if(obj.checked){
        $("#projManageGrid3").datagrid("showColumn", colId);
        /*var dg = $('#designParentGrid');//table表id
        var col = dg.datagrid('getColumnOption',colId);//获得该列属性
        col.width = document.body.clientWidth*0.12;//调整该列宽度
        col.halign = 'center';
        col.align = 'left';
        dg.datagrid();*/
    }else{
        $("#projManageGrid3").datagrid("hideColumn", colId);
        isCheck = 0;
    }

    for (var i = 0; i < colArrayMng.length; i++) {
        if(colArrayMng[i].id==colId)
            colArrayMng[i].isCheck = isCheck;
    }
    //$("#designParentGrid").datagrid("reload");
}

function generateManageHour() {
    var rows = $("#projManageGrid3").datagrid("getRows");
    for (var j in MngTaskNodesArray) {
    	if (MngTaskNodesArray[j] === '项目管理') continue;
        if (rows.length !== 0){
            var isSame = false;
            for(var i = 0;i < rows.length;i++){
                if(j === rows[i].PBSNODEID) {
                    isSame = true;
                }
            }
            if (!isSame){
                //新插入一行
                $("#projManageGrid3").datagrid('insertRow',{index: 0,row:{
                        WBSNODEID:wbsNodeId,
                        PBSNODEID:j
                    }});
            }
        }else {
            //新插入一行
            $("#projManageGrid3").datagrid('insertRow',{index: 0,row:{
                    WBSNODEID:wbsNodeId,
                    PBSNODEID:j
                }});
        }
	}
}