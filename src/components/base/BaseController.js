var BaseController = Class.extend({
  scope: null,

  init:function(scope){
    this.$scope = scope;
    this.initialize.apply(this,arguments);
    this.defineListeners();
    this.defineScope();
  },

  initialize:function(){
    //OVERRIDE
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
