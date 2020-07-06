$(function() {

    initData();

});

function initData() {
    $("#cxdm").datagrid({
        method:'GET',
        url:'resources/js/zkwtest/test.json',
        columns:[[
            {field:'id',title:'id',width:100},
            {field: 'name',title:'name',width:100}
        ]]
    });
}