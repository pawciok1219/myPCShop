public with sharing class editRecordController {

    @AuraEnabled(cacheable=true)
    public static PricebookEntry getStandardPriceProduct(String productId){
          Pricebook2 pricebook = [SELECT Id, Name FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1];
          PricebookEntry pricebookentry = [SELECT Id, UnitPrice FROM PricebookEntry WHERE Product2Id =: productId AND Pricebook2Id =: pricebook.Id LIMIT 1];
          return pricebookentry;
   }


   @AuraEnabled
   public static void updateStandardPrice(String pricebookentryId, Decimal price){
         PricebookEntry pricebookentry = [SELECT Id, UnitPrice FROM PricebookEntry WHERE Id =: pricebookentryId LIMIT 1];
         pricebookentry.UnitPrice = price;
         update pricebookentry;
  }

}