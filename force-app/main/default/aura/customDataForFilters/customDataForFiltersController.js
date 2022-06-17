({
    init: function(component, event, helper) {
      var idsJson = sessionStorage.getItem('customFilters--recordIds');
      if (!$A.util.isUndefinedOrNull(idsJson)) {
        let ids = JSON.parse(idsJson);
        component.set('v.recordIds', ids);
        sessionStorage.removeItem('customFilters--recordIds');
      }
    },

    handleLWCEvent : function(component, event, helper) {
      const resultList= event.getParam('products');
      sessionStorage.setItem('customFilters--recordIds', JSON.stringify(component.get('v.recordIds')));
      let payload = {
        recordData: {value: resultList}
      };
      component.find("productsListCommunicate").publish(payload);
    }
})