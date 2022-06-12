@IsTest
public with sharing class MS_ProductCustomerPortalTest {

    @TestSetup
    public static void testSetup() {
        Pricebook2 standartPricebook = new Pricebook2(Id=Test.getStandardPricebookId(), IsActive=true);
        update  standartPricebook;
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Available__c=true,Family='CPU',IsActive=true);
        insert productTest;
        PricebookEntry standartPrice = new PricebookEntry(UnitPrice=1000,Product2Id=productTest.Id, Pricebook2Id=standartPricebook.Id, IsActive=true);
        insert standartPrice;
        Pricebook2 customPB = new Pricebook2(Name='Custom Pricebook', IsActive=true);
        insert customPB;
        PricebookEntry customPrice = new PricebookEntry(Pricebook2Id=customPB.Id, Product2Id = productTest.Id, UnitPrice=20, IsActive=true);
        insert customPrice;
    }

    @IsTest
    public static void shouldReturnOneLatestProduct(){
        List<AggregateResult> numberOfLatestProducts = MS_ProductCustomerPortal.getNumberOfRecords();
        Integer x = (Integer) numberOfLatestProducts[0].get('totalRecords');
        System.assertEquals(1,x);
    }

    @IsTest
    public static void shouldReturnIntelProduct(){
        List<PricebookEntry> products = MS_ProductCustomerPortal.getLatestProducts(0);
        PricebookEntry psr = products[0];
        Product2 product = [SELECT Producer__c FROM Product2 WHERE Id = :psr.Product2Id];
        System.assertEquals('Intel',product.Producer__c);
    }
}