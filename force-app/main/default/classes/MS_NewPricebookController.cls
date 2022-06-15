public with sharing class MS_NewPricebookController {

    @AuraEnabled
    public static void updateActivityPricebookById(String pricebookId){
        Pricebook2 pricebook = [SELECT Id, Start_Date__c, End_Date__c, isActive FROM Pricebook2 WHERE Id =: pricebookId];

        if(pricebook.End_Date__c != null) {
          if((pricebook.Start_Date__c != null) && (Date.parse(system.today().format()) >= pricebook.Start_Date__c ) && 
          (Date.parse(system.today().format()) <= pricebook.End_Date__c)){
             pricebook.isActive = true;
             update pricebook;}
        }else{
           if((Date.parse(system.today().format()) >= pricebook.Start_Date__c) && (pricebook.Start_Date__c != null)){
             pricebook.isActive = true;
             update pricebook;}
        }
    }

}