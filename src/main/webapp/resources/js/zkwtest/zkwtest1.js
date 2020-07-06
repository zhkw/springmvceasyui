$(function() {

    initData();
    //pageData();

});

function initData() {
    // var data =[{"id":"1","name":"one"}, {"id":"2","name":"two"}];
    $("#cxdm").datagrid({ loadFilter: pagerFilter }).datagrid({
        method:'GET',
        singleSelect:true,
        striped:true,
        height:300,
        url:'resources/js/zkwtest/test.json',
        pagination:true,
        pageSize:5,
        pageList: [5,10,20,30],
        columns:[[
            {field:'id',title:'id',width:100},
            {field: 'name',title:'name',width:100}
        ]]
    });
}

function pagerFilter(data) {
    if (typeof data.length == 'number' && typeof data.splice == 'function') {	// is array
        data = {
            total: data.length,
            rows: data
        }
    }
    var dg = $(this);
    var opts = dg.datagrid('options');
    var pager = dg.datagrid('getPager');
    pager.pagination({
        onSelectPage: function (pageNum, pageSize) {
            opts.pageNumber = pageNum;
            opts.pageSize = pageSize;
            pager.pagination('refresh', {
                pageNumber: pageNum,
                pageSize: pageSize
            });
            dg.datagrid('loadData', data);
        }
    });
    if (!data.originalRows) {
        data.originalRows = (data.rows);
    }
    var start = (opts.pageNumber - 1) * parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.rows = (data.originalRows.slice(start, end));
    return data;
}

function pageData(){
    var p = $('#cxdm').datagrid('getPager');
    $(p).pagination({
        pageSize: 10,                    //每页显示的记录条数，默认10
        pageList: [10,20,50,100],        //可以设置每页记录条数的列表
        beforePageText: '第',            //页数文本框前显示的汉字
        afterPageText: '页    共 {pages} 页',
        displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录'
    });

    alert($('#cxdm').datagrid('getPager').data("pagination").options.pageList)        // 弹出20,20,50,100
    $('#cxdm').datagrid({
        onLoadSuccess : function(data) {
            console.log("111")
        }
    });

    alert($('#cxdm').datagrid('getPager').data("pagination").options.pageList)        // 弹出默认的10,20,30,40,50，并且之前渲染的中文脚本也被替换了
}