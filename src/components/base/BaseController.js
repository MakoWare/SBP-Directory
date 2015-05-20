var BaseController = Class.extend({
    scope: null,

    init:function(scope){
	this.$scope = scope;
	this.defineListeners();
	this.defineScope();
    },

    defineListeners: function(){
	this.$scope.$on('$destroy',this.destroy.bind(this));
    },


    defineScope: function(){
	//OVERRIDE
    },


    destroy:function(event){
	//OVERRIDE
    }
});

BaseController.$inject = ['$scope'];
