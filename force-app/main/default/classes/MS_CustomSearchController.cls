public without sharing class MS_CustomSearchController {
    @AuraEnabled
        public static List<PricebookEntry> searchForIds(String searchText) {
          List<PricebookEntry> results = new List<PricebookEntry>();
          if(searchText.containsAny('%')){
            return results;
          }
          
          String inputSearch = '%'+searchText+'%';
          results = [SELECT Product2.Id, Product2.DisplayUrl, Product2.Family, Product2.Model__c, Product2.Name, Product2.Producer__c, UnitPrice FROM PricebookEntry WHERE Product2.isActive = true AND (
          Product2.Name LIKE :inputSearch OR 
          Product2.Model__c LIKE :inputSearch OR 
          Product2.Producer__c LIKE :inputSearch OR 
          Product2.Family LIKE :inputSearch)];
          return results;
    }


    private static List<Id> parseObjectToListId(List<PricebookEntry> pricebookEntry){
        List<Id> idList = new List<Id>();
        for(PricebookEntry temp : pricebookEntry){
          idList.add(temp.Product2.Id);
        }
        return idList;
    }

    @AuraEnabled
      public static List<PricebookEntry> searchProductsByFilters(String producer, String family, Integer minPrice, Integer maxPrice, List<PricebookEntry> ids){
        List<id> idList = parseObjectToListId(ids);
        List<String> conditions = new List<String>();
        String query = 'SELECT Product2.Id, Product2.DisplayUrl, Product2.Family, Product2.Model__c, Product2.Name, Product2.Producer__c, UnitPrice FROM PricebookEntry ';
        if (String.isNotBlank(producer) && producer != 'None') {
           conditions.add('Product2.Producer__c =  \'' + String.escapeSingleQuotes(producer) + '\'');
        }
        if (String.isNotBlank(family) && family != 'None') {
           conditions.add('Product2.Family =  \'' + String.escapeSingleQuotes(family) + '\'');
        }
           conditions.add(' (UnitPrice >= ' + minPrice + ' AND ' + ' UnitPrice <= ' + maxPrice);
      
        if (conditions.size() > 0) {
          query += ' WHERE ' + conditions[0];
          for (Integer i = 1; i < conditions.size(); i++) {
              query += ' AND ' + conditions[i];
          }
          query += ' AND Product2.Id IN :idList )';
        }
        return Database.query(query);
      }
}