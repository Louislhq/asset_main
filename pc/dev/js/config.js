requirejs.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: '/dest/js/lib/',
    paths: {
        core: '../core',
        app: '../app',
        jquery:'jquery-2.2.4.min',
        laydate: 'laydate/laydate'
    },
    shim: {
    	deps: [],
    	laydate: {
            exports: 'laydate'
        }
    }

});

require(['laydate'], function(laydate) {
    laydate.path = "/dest/js/lib/laydate/";
})
/*requirejs.onError = function(err){
    console.log(err);
};*/