({

  init: function(component, event, helper) {
    let idsJson = sessionStorage.getItem('customSearch--recordIds');
    if (!$A.util.isUndefinedOrNull(idsJson)) {
      let ids = JSON.parse(idsJson);
      component.set('v.recordIds', ids);
      component.set('v.numberOfRecords', ids.length);
      if (ids.length==0){
          component.set('v.emptySearch', true);
      }else{
          component.set('v.emptySearch', false);
      }
      sessionStorage.removeItem('customSearch--recordIds');
    }
  },
  
  handleChanged: function(cmp, message, helper) {
    if (message != null && message.getParam('recordData') != null) {
        let objects = message.getParam('recordData').value;
        cmp.set('v.recordIds', objects);
        cmp.set('v.numberOfRecords', objects.length);
        if (objects.length==0){
          cmp.set('v.emptySearch', true);
        }else{
          cmp.set('v.emptySearch', false);
        }
    }
  }

})