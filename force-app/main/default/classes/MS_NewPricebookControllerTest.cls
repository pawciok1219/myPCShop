@IsTest
public with sharing class MS_NewPricebookControllerTest {

    @TestSetup
    public static void testSetup(){
        Pricebook2 pricebookForFirstCase = new Pricebook2(Name='pricebookForFirstCase',Start_Date__c=Date.parse('30/05/2022'), End_Date__c=Date.parse('30/05/2024'), IsActive=false);
        Pricebook2 pricebookForSecondCase = new Pricebook2(Name='pricebookForSecondCase',Start_Date__c=Date.parse('29/05/2022'), IsActive=false);
        insert pricebookForFirstCase;
        insert pricebookForSecondCase; 
    }

    @IsTest
    public static void shouldChangePricebookToActive1(){
        Pricebook2 pricebookForFirstCase = [SELECT Id, Name, isActive FROM Pricebook2 WHERE Name='pricebookForFirstCase'];
        MS_NewPricebookController.updateActivityPricebookById(pricebookForFirstCase.Id);
        Pricebook2 pricebookAfterUpdate = [SELECT Id, isActive FROM Pricebook2 WHERE Name='pricebookForFirstCase'];
        System.assertEquals(true,pricebookAfterUpdate.isActive);
    }

    @IsTest
    public static void shouldChangePricebookToActive2(){
        Pricebook2 pricebookForSecondCase = [SELECT Id, Name, isActive FROM Pricebook2 WHERE Name='pricebookForSecondCase'];
        MS_NewPricebookController.updateActivityPricebookById(pricebookForSecondCase.Id);
        Pricebook2 pricebookAfterUpdate = [SELECT Id, isActive FROM Pricebook2 WHERE Name='pricebookForSecondCase'];
        System.assertEquals(true,pricebookAfterUpdate.isActive);
    }

}