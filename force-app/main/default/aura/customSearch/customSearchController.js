({
  handleClick : function(component, event, helper) {
    let searchText = component.get('v.searchText');
    let action = component.get('c.searchForIds');
    action.setParams({searchText: searchText});
    action.setCallback(this, function(response) {
      let state = response.getState();
      if (state === 'SUCCESS') {
        let objects = response.getReturnValue();
        if(objects.length==0){
          let toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
               "title": 'Information',
               "message": $A.get("$Label.c.MS_no_products_found"),
               "type": 'info'
            });
            toastEvent.fire();
            let navEvt = $A.get('e.force:navigateToURL');
            navEvt.setParams({url: '/'});
            navEvt.fire();
            return;
        }
        sessionStorage.setItem('customSearch--recordIds', JSON.stringify(objects));
        sessionStorage.setItem('customFilters--recordIds', JSON.stringify(objects));

        let navEvt = $A.get('e.force:navigateToURL');
        navEvt.setParams({url: '/custom-search-results'});
        navEvt.fire();
      }
    });
    $A.enqueueAction(action);
  }
})