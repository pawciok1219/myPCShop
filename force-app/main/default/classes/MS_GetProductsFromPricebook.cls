public with sharing class MS_GetProductsFromPricebook {
    @AuraEnabled(cacheable = true)
    public static List<PricebookEntry> getProducts(String recordId){
        return [SELECT Id, Product2Id, Pricebook2Id, Product2.Name, UnitPrice FROM PricebookEntry WHERE Pricebook2Id =: recordId];
    }
}