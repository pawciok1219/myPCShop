@IsTest
public with sharing class MS_CustomSearchPricebookTest {

    @TestSetup
    public static void testSetup() {
        Pricebook2 pricebookTest = new Pricebook2(Name='pricebookTest',Start_Date__c=Date.parse('30/05/2022'), End_Date__c=Date.parse('30/05/2024'), IsActive=false);
        insert pricebookTest;
    }

    @IsTest
    public static void shouldReturnPricebookFromDatabaseWithConditions() {
        Pricebook2 pricebookTest = [SELECT Id, Name, Start_Date__c, End_Date__c, IsActive FROM Pricebook2 WHERE Name='pricebookTest'];
        List<Pricebook2> pricebookListFromDatabase = MS_CustomSearchPricebook.getPricebook('pricebookTest', false, Date.parse('30/05/2022'), Date.parse('30/05/2024'));
        Pricebook2 pricebookFromDatabse = pricebookListFromDatabase.get(0);
        System.assertEquals(pricebookTest.Id,pricebookFromDatabse.Id);
    }
}
