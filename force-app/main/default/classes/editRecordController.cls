public with sharing class editRecordController {

    @AuraEnabled
    public static Decimal getPriceProduct(String produktId){
       try {

          Pricebook2 pricebook = [SELECT Id, Name FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1];
          PricebookEntry pricebookentry = [SELECT Id, UnitPrice FROM PricebookEntry WHERE Product2Id =: produktId AND Pricebook2Id =: pricebook.Id LIMIT 1];
          
          return pricebookentry.UnitPrice;
           
       } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
       }
   }

}
