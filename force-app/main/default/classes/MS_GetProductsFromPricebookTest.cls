@IsTest
public with sharing class MS_GetProductsFromPricebookTest {
    @TestSetup
    public static void testSetup() {
        Pricebook2 standartPricebook = new Pricebook2(Id=Test.getStandardPricebookId(), IsActive=true);
        update  standartPricebook;
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Available__c=true,Family='CPU');
        insert productTest;
        PricebookEntry standartPrice = new PricebookEntry(UnitPrice=1000,Product2Id=productTest.Id, Pricebook2Id=standartPricebook.Id, IsActive=true);
        insert standartPrice;
        Pricebook2 customPB = new Pricebook2(Name='Custom Pricebook', IsActive=true);
        insert customPB;
        PricebookEntry customPrice = new PricebookEntry(Pricebook2Id=customPB.Id, Product2Id = productTest.Id, UnitPrice=20, IsActive=true);
        insert customPrice;
    }

    @IsTest
    public static void shouldReturnPricebookEntryFromDatabase() {
        Product2 productTest = [SELECT Id, ProductCode FROM Product2 WHERE ProductCode='G88E'];
        Pricebook2 customPB = [SELECT Id From Pricebook2 WHERE Name='Custom Pricebook'];
        PricebookEntry pricebookEntryTest = [SELECT Id FROM PricebookEntry WHERE Product2Id =: productTest.Id AND Pricebook2Id =: customPB.Id];
        List<PricebookEntry> pricebookentryListFromDatabase = MS_GetProductsFromPricebook.getProducts(customPB.Id);
        PricebookEntry pricebookentryFromDatabse = pricebookentryListFromDatabase.get(0);
        System.assertEquals(pricebookEntryTest.Id, pricebookentryFromDatabse.Id);
    }

}